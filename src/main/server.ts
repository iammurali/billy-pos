import express from 'express';
import cors from 'cors';
import http from 'http';
import WebSocket from 'ws';
import { getMenuItems, saveOrder, getAllOrders, getOrderById, updateOrderStatus } from './db';

function createExpressApp(): { app: express.Express, server: http.Server } {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

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

  app.get('/api/health', (_req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'healthy' });
  });

  // API endpoint for menu items
  app.get('/api/menu-items', async (_req: express.Request, res: express.Response) => {
    try {
      console.log("API: Fetching menu items");
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
        order_number: orderData.id,
        invoice_number: null,
        sent_to_kitchen: true,
        sent_for_billing: false,
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

      // Notify all connected clients about the new order
      broadcastOrderUpdate(wss, orderId.toString());

    } catch (error: any) {
      console.error('Error processing order data:', error);
      res.status(400).json({ error: 'Bad request', message: error.message });
    }
  });

  // WebSocket handling
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message: string) => {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'getTables':
          // Implement logic to get tables from your database
          const tables = [
            { number: 1, guests: 2, status: 'Occupied' },
            { number: 2, guests: 4, status: 'Empty' },
            // ... more tables
          ];
          ws.send(JSON.stringify({ type: 'tables', tables }));
          break;

        case 'getOrderItems':
          const order = await getOrderById(data.orderNumber);
          if (order) {
            ws.send(JSON.stringify({
              type: 'orderItems',
              orderNumber: data.orderNumber,
              items: order.items
            }));
          }
          break;

        case 'getMenuItems':
          const menuItems = getMenuItems();
          ws.send(JSON.stringify({ type: 'menuItems', items: menuItems }));
          break;

        case 'addToOrder':
          // Implement logic to add item to order
          // This might involve updating the order in the database
          break;

        case 'sendToKitchen':
          await updateOrderStatus(data.orderNumber, true, false);
          broadcastOrderUpdate(wss, data.orderNumber);
          break;

        case 'finalizeBill':
          await updateOrderStatus(data.orderNumber, true, true);
          broadcastOrderUpdate(wss, data.orderNumber);
          break;

        case 'getOrderQueue':
          const orders = await getAllOrders();
          ws.send(JSON.stringify({ type: 'orderQueue', orders }));
          break;
      }
    });
  });

  return { app, server };
}

function broadcastOrderUpdate(wss: WebSocket.Server, orderNumber: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'orderUpdate',
        orderNumber: orderNumber
      }));
    }
  });
}

function startExpressServer(server: http.Server): void {
  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

export { createExpressApp, startExpressServer };
