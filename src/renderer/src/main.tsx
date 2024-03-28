import './styles/globals.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from '@/components/theme-provider'

import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ManageMenu from './pages/manage-menu'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/manage-menu" element={<ManageMenu />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
)
