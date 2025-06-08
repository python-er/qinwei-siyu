import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [profileName, setProfileName] = useState('加载中...');
  const [isRunning, setIsRunning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('user');
  const [username, setUsername] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [selectedPlatforms, setSelectedPlatforms] = useState(['小红书', '微信']);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // 跟踪窗口宽度

  // 处理登录输入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const ngrokUrl = 'http://localhost:5007';

  // 登录
  const handleLogin = async () => {
    const response = await fetch(`/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
      credentials: 'include',
    });
    const data = await response.json();
    if (response.ok) {
      setIsAuthenticated(true);
      setRole(data.role);
      setUsername(loginData.username);
      setLoginData({ username: '', password: '' });
      await fetchProfileName();
    } else {
      alert(data.message);
    }
  };

  // 登出
  const handleLogout = async () => {
    const response = await fetch(`/logout`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      setIsAuthenticated(false);
      setRole('user');
      setUsername('');
      setProfileName('加载中...');
    }
  };

  // 获取标题名字
  const fetchProfileName = async () => {
    try {
      const response = await fetch(`/api/profile-name`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProfileName(data.name);
      } else if (response.status === 302) {
        setProfileName('需要登录');
      } else {
        throw new Error('获取数据失败');
      }
    } catch (error) {
      console.error('Error fetching profile name:', error);
      setProfileName('错误: 无法加载');
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProfileName();
  }, [isAuthenticated]);

  // 切换平台选中状态
  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  // 随机生成日志数据，使用实时时间戳
  const generateLog = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const ids = [7552, 5661, 8510, 6312, 7272, 8372, 6739, 7931, 3136, 6766, 5316, 6933];
    const statuses = ['发送指令成功'];
    const allPlatforms = ['Soul', '小红书', '微信', '微博'];
    const availablePlatforms = selectedPlatforms.length > 0 ? selectedPlatforms : allPlatforms;

    const id = ids[Math.floor(Math.random() * ids.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const platform = availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)];
    const platformStr = [platform];

    return `${timestamp} ${id} - ${status} - 来自[${platformStr}]`;
  };

  // 控制日志生成，添加平台选中检查
  useEffect(() => {
    let interval;
    if (isRunning && isAuthenticated && selectedPlatforms.length > 0) {
      interval = setInterval(() => {
        setLogs((prevLogs) => {
          const newLog = generateLog();
          const updatedLogs = [...prevLogs, newLog].slice(-8);
          setCount((preCount) => preCount + 1);
          return updatedLogs;
        });
      }, 100);
    } else if (isRunning && isAuthenticated && selectedPlatforms.length === 0) {
      setIsRunning(false);
      alert('请至少选择一个平台');
    }
    return () => clearInterval(interval);
  }, [isRunning, isAuthenticated, selectedPlatforms]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 开始/停止接收
  const toggleReceiving = () => {
    if (isAuthenticated) {
      if (selectedPlatforms.length === 0) {
        alert('请至少选择一个平台');
        return;
      }
      setIsRunning(!isRunning);
    } else {
      alert('请先登录');
    }
  };

  // 权限控制：仅管理员可见的按钮
  const showAdminButton = role === 'admin';

  return (
    <div className="container">
      <main>
        {!isAuthenticated ? (
          <div className="login-section">
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleInputChange}
              placeholder="用户名"
            />
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleInputChange}
              placeholder="密码"
            />
            <button onClick={handleLogin}>登录</button>
          </div>
        ) : (
          <>
            <div className="profile">
              <img src="/static/profile.jpg" alt="Profile" />
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
                  .slice(0, windowWidth <= 768 ? 8 : logs.length) // 手机显示10条，PC显示全部
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
          </>
        )}
      </main>
    </div>
  );
}

export default App;