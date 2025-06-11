// frontend/src/components/Login.js
import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '', profile_name: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  // 登录逻辑
  const handleLogin = async () => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
      credentials: 'include',
    });
    const data = await response.json();
    if (response.ok) {
      onLogin(data);
    } else {
      alert(data.message || '登录失败');
    }
  };

  // 注册逻辑
  const handleRegister = async () => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
      credentials: 'include',
    });
    const data = await response.json();
    if (response.ok) {
      alert('注册成功，正在跳转...');
      onLogin({ role: 'user', username: registerData.username }); // 模拟登录
    } else {
      alert(data.message || '注册失败');
    }
  };

  return (
    <div className="login-container">
      {!isRegistering ? (
        <>
          <h2>登录</h2>
          <input
            type="text"
            name="username"
            placeholder="用户名"
            value={loginData.username}
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
          />
          <input
            type="password"
            name="password"
            placeholder="密码"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          <button onClick={handleLogin}>登录</button>
          <p onClick={() => setIsRegistering(true)}>没有账号？去注册</p>
        </>
      ) : (
        <>
          <h2>注册</h2>
          <input
            type="text"
            name="username"
            placeholder="用户名"
            value={registerData.username}
            onChange={(e) =>
              setRegisterData({ ...registerData, username: e.target.value })
            }
          />
          <input
            type="password"
            name="password"
            placeholder="密码"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
          />
          <input
            type="text"
            name="profile_name"
            placeholder="昵称"
            value={registerData.profile_name}
            onChange={(e) =>
              setRegisterData({ ...registerData, profile_name: e.target.value })
            }
          />
          <button onClick={handleRegister}>注册</button>
          <p onClick={() => setIsRegistering(false)}>已有账号？去登录</p>
        </>
      )}
    </div>
  );
};

export default Login;