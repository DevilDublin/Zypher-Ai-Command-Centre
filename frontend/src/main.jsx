import { initSocketListeners } from "./lib/socketListeners";
initSocketListeners();
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import RouterApp from './RouterApp'
import './styles.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/orbitron/600.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
<React.StrictMode>
    <RouterApp />
  </React.StrictMode>
</BrowserRouter>
)

import { initSocketRuntime } from "./runtime/socketRuntime";
initSocketRuntime();
