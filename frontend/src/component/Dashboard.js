// frontend/src/component/Dashboard.js
import React from 'react';
import useDashboardData from '../hooks/useDashboardData'; // 引入自定义 Hook
import './Dashboard.css';

const Dashboard = ({ profileName, role, handleLogout }) => {
  const {
    logs,
    count,
    selectedPlatforms,
    togglePlatform,
    isRunning,
    toggleReceiving,
    windowWidth,
  } = useDashboardData();

  const showAdminButton = role === 'admin';

  return (
    <div className="dashboard">
      <div className="profile">
        <img src="/profile.jpg" alt="Profile" />
        <div className="profile-info">
          <h3>{profileName}</h3>
          <p>综合私域获客专家Pro</p>
          <p>服务器登录成功: 已连接24服务器</p>
          <p>当前服务器token: 2B8900D0E1162E88</p>
        </div>
        <div className="token-count">
          <span>已接收</span>
          <span className="count">{count}</span>
        </div>
      </div>

      <div className="toggle-buttons">
        {['Soul', '小红书', '微信', '微博', '抖音'].map((platform) => (
          <button
            key={platform}
            className={`toggle-btn ${selectedPlatforms.includes(platform) ? 'active' : ''}`}
            onClick={() => togglePlatform(platform)}
          >
            {platform}
          </button>
        ))}
      </div>

      <div className="status-buttons">
        <button className="status-btn active">数据准备: 正常</button>
        <button className="status-btn active">服务器连接: 正常</button>
        <button className="status-btn active">数据接收: 成功</button>
      </div>

      <div className="log-section">
        <h4>获客列表</h4>
        <ul>
          {logs
            .slice(0, windowWidth <= 768 ? 8 : logs.length)
            .map((log, index) => (
              <li key={index}>{log}</li>
            ))}
        </ul>
      </div>

      <button className="fetch-btn" onClick={toggleReceiving}>
        {isRunning ? '停止接收' : '开始接收'}
      </button>

      {showAdminButton && (
        <button className="admin-btn" onClick={handleLogout}>
          管理员登出
        </button>
      )}
    </div>
  );
};

export default Dashboard;