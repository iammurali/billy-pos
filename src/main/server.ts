import express from 'express';
import cors from 'cors';
import { getMenuItems, saveOrder } from './db';
import { networkInterfaces } from 'os';

function createExpressApp(): express.Express {
  const app = express();
  app.use(cors());

  app.use((req, _res, next) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      console.log('Raw request body:', data);
      try {
        req.body = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
      next();
    });
  });

  app.get('/api/health', (req: express.Request, res: express.Response) => {
    console.log(req, 'health req')
    res.status(200).json({ status: 'healthy' });
  });

  // API endpoint for menu items
  app.get('/api/menu-items', async (_req: express.Request, res: express.Response) => {
    try {
      console.log("API")
      const menuItems: any = getMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/billing', async (req: express.Request, res: express.Response) => {
    try {
      console.log("API: Received billing request");
      const orderData = req.body;

      if (!orderData || typeof orderData !== 'object') {
        throw new Error('Invalid order data: not an object');
      }

      if (!orderData.id) {
        throw new Error('Invalid order data: missing orderNumber');
      }

      // Save the order to the database
      const orderId = saveOrder({
        total_amount: orderData.totalAmount,
        order_number: orderData.id, // Use the order number from the mobile app
        invoice_number: null, // Set to null as we're not using it at this stage
        sent_to_kitchen: true,
        sent_for_billing: false, // Set to false as it hasn't been added to billing yet
        items: orderData.items.map((item: any) => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          price: item.price
        }))
      });

      console.log('Order saved with ID:', orderId);
      res.status(200).json({
        message: 'Order received and saved',
        orderId: orderId
      });
    } catch (error: any) {
      console.error('Error processing order data:', error);
      res.status(400).json({ error: 'Bad request', message: error.message });
    }
  });


  return app;
}



function getIpaddress() {
  const nets: any = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return null
}

function startExpressServer(app: express.Express): void {
  const PORT = 3000;
  const ipAddress = getIpaddress() || '0.0.0.0'
  app.listen(PORT, ipAddress, () => {
    console.log(`Server running on http://${ipAddress}:${PORT}`);
  });
}

export { createExpressApp, startExpressServer };
