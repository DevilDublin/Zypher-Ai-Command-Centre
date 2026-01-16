import { initSocketListeners } from "./lib/socketListeners";
initSocketListeners();
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import RouterApp from './RouterApp'
import './styles.css'
import '@fontsource/space-grotesk'
import '@fontsource/orbitron'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
<React.StrictMode>
    <RouterApp />
  </React.StrictMode>
</BrowserRouter>
)

import { initSocketRuntime } from "./runtime/socketRuntime";
initSocketRuntime();
