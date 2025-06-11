// frontend/src/hooks/useDashboardData.js
import { useState, useEffect } from 'react';

const useDashboardData = () => {
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['小红书', '微信']);
  const [isRunning, setIsRunning] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  // 控制日志生成
  useEffect(() => {
    let interval;
    if (isRunning && selectedPlatforms.length > 0) {
      interval = setInterval(() => {
        setLogs((prevLogs) => {
          const newLog = generateLog();
          const updatedLogs = [...prevLogs, newLog].slice(-8);
          setCount((preCount) => preCount + 1);
          return updatedLogs;
        });
      }, 100);
    } else if (isRunning && selectedPlatforms.length === 0) {
      setIsRunning(false);
      alert('请至少选择一个平台');
    }
    return () => clearInterval(interval);
  }, [isRunning, selectedPlatforms]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 开始/停止接收
  const toggleReceiving = () => {
    if (selectedPlatforms.length === 0) {
      alert('请至少选择一个平台');
      return;
    }
    setIsRunning(!isRunning);
  };

  return {
    logs,
    count,
    selectedPlatforms,
    togglePlatform,
    isRunning,
    toggleReceiving,
    windowWidth,
  };
};
export default useDashboardData;