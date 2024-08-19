import './styles/globals.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from '@/components/theme-provider'

import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ManageMenu from './pages/manage-menu'
import Reports from './pages/reports'
import { Expenses } from './pages/expenses'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/manage-menu" element={<ManageMenu />} />
            <Route path='/reports' element={<Reports />} />
            <Route path='/expenses' element={<Expenses />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
)
