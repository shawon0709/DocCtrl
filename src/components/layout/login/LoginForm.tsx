import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { Button, Form, Input } from 'antd';
import { useIsSmallScreen } from '@/components/helpers/ResizeHelper';

const LoginForm: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [isValidUserId, setIsValidUserId] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFirstTimeVisitor, setIsFirstTimeVisitor] = useState(false);
  const isSmallScreen = useIsSmallScreen();

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setIsFirstTimeVisitor(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    setIsValidUserId(true);
  };

  const handleLogin = async () => {
    const response = await fetch('/api/loginSSAPI');
    const userIds = await response.json();

    console.log('Fetched userIds:', userIds);

    if (Array.isArray(userIds) && userIds.includes(userId)) {
      console.log('Login successful');
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginTime', Date.now().toString());
    } else {
      setIsValidUserId(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  useEffect(() => {
    const isLoggedInCached = localStorage.getItem('isLoggedIn');
    const loginTimeCached = localStorage.getItem('loginTime');
    if (isLoggedInCached && loginTimeCached) {
      const timeElapsed = Date.now() - parseInt(loginTimeCached, 10);
      const isSessionValid = timeElapsed < 3600000;
      setIsLoggedIn(isSessionValid);
      if (!isSessionValid) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
      }
    }
  }, []);

  if (isLoggedIn) {
    return <AdminLayout />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className={`flex ${isSmallScreen ? 'w-full p-1 m-2' : 'w-2/3 gap-4 p-6'} border rounded-sm shadow-lg`}>
        {!isSmallScreen && (
          <div className="w-1/2 login-bg-custom rounded-sm flex justify-center items-center">
            <div className="text-white text-center p-6 rounded-lg">
              <h3 className="text-1xl md:text-2xl lg:text-3xl">Nice to see you {isFirstTimeVisitor ? "" : " again"}</h3>
              <h1 className="text-1xl md:text-3xl lg:text-4xl">WELCOME {isFirstTimeVisitor ? "" : " BACK"}</h1>
            </div>
          </div>
        )}
        <div className={`${isSmallScreen ? 'w-full' : 'w-1/2'} bg-white flex justify-center items-center`}>
          <Form
            name="login-form"
            layout="vertical"
            onFinish={handleLogin}
            className="w-full"
          >
            <div className="logo flex items-center justify-start text-5xl duration-200 ease-linear mb-6">
              <span className="fancy">TMJV</span>
            </div>
            <h2 className="text-2xl font-semibold mb-1 mt-5">User ID</h2>
            <Form.Item name="userId">
              <Input
                value={userId}
                onChange={handleUserIdChange}
                onKeyDown={handleKeyPress}
                className={`border p-2 w-full mb-4 ${isValidUserId ? '' : 'border-red-500'}`}
                placeholder="Enter your User ID"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-500 text-white py-1 px-4 mt-2 rounded hover:bg-blue-600"
              >
                Login
              </Button>
            </Form.Item>
            <Form.Item>
              <p className="text-sm text-gray-700">
                Not a user? <a href="#" className="text-blue-500 hover:text-blue-700">Request Admin</a>
              </p>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
