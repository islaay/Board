// /src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import App from './App';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router } from 'react-router-dom';  // React Router 임포트

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>  {/* 전체 앱을 Router로 감싸야 합니다 */}
      <App />
    </Router>
  </React.StrictMode>
);