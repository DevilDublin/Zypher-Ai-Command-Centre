import { initSocketListeners } from "./lib/socketListeners";
initSocketListeners();
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import '@fontsource/space-grotesk'
import '@fontsource/orbitron'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

import { initSocketRuntime } from "./runtime/socketRuntime";
initSocketRuntime();
