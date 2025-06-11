import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './component/Login';
import './component/Login.css'
import Dashboard from './component/Dashboard';

function App() {
  const [profileName, setProfileName] = useState('加载中...');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('user');
  const [username, setUsername] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // 跟踪窗口宽度

  // 获取标题名字
// 修改 fetchProfileName 方法，接受 username 参数
const fetchProfileName = async (username) => {
  if (!username) {
    setProfileName('未知用户');
    return;
  }

  // http://localhost:8000

  try {
    const response = await fetch(`/api/profile-name?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      setProfileName(data.name);
    } else {
      setProfileName('无法获取名称');
    }
  } catch (error) {
    console.error('Error fetching profile name:', error);
    setProfileName('错误: 无法加载');
  }
};

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setRole(data.role);
    setUsername(data.username);
  };

  useEffect(() => {
    if (isAuthenticated) fetchProfileName(username);
  }, [isAuthenticated,username]);



  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // 权限控制：仅管理员可见的按钮
  const showAdminButton = role === 'admin';

  return (
    <div className="container">
      <main>
        {!isAuthenticated ? (
          <Login onLogin={handleLogin}/>
        ) : (
          <Dashboard
            profileName={profileName}
            role={role}
          />
        )}
      </main>
    </div>
  );
}

export default App;