
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * 应用入口点
 * 负责将 React 根组件渲染到 HTML 的 id="root" 节点中
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);