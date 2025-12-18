import React, { useState, useEffect } from 'react';
import HomeHeader from '../components/HomeHeader';
import HomeMid from '../components/HomeMid';
import HomeMain from '../components/HomeMain';
import Homefooter from '../components/Homefooter';
import StaffLogin from '../components/StaffLogin';
import ElectricianLogin from '../components/ElectricianLogin';
import AdminLogin from '../components/AdminLogin';
import StaffDashboard from '../components/StaffDashboard';
import ElectricianDashboard from '../components/ElectricianDashboard';
import AdminDashboard from '../components/AdminDashboard';
import "./Home.css";

const Home = function Home() {
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [showElectricianLogin, setShowElectricianLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showStaffDashboard, setShowStaffDashboard] = useState(false);
  const [showElectricianDashboard, setShowElectricianDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'staff') {
        setShowStaffDashboard(true);
      } else if (userData.role === 'electrician') {
        setShowElectricianDashboard(true);
      } else if (userData.role === 'admin') {
        setShowAdminDashboard(true);
      }
    }
  }, []);

  const handleStaffLoginClick = () => {
    setShowStaffLogin(true);
  };

  const handleElectricianLoginClick = () => {
    setShowElectricianLogin(true);
  };

  const handleAdminLoginClick = () => {
    setShowAdminLogin(true);
  };

  const handleBackClick = () => {
    setShowStaffLogin(false);
    setShowElectricianLogin(false);
    setShowAdminLogin(false);
  };

  const handleStaffLoginSuccess = () => {
    setShowStaffLogin(false);
    setShowStaffDashboard(true);
  };

  const handleElectricianLoginSuccess = () => {
    setShowElectricianLogin(false);
    setShowElectricianDashboard(true);
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    setShowAdminDashboard(true);
  };

  const handleStaffLogout = () => {
    setShowStaffDashboard(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleElectricianLogout = () => {
    setShowElectricianDashboard(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleAdminLogout = () => {
    setShowAdminDashboard(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isDashboardActive = showStaffDashboard || showElectricianDashboard || showAdminDashboard;

  return (
    <>
      {!isDashboardActive && <HomeHeader />}
      {!isDashboardActive && <HomeMid />}

      {showStaffDashboard ? (
        <StaffDashboard onLogout={handleStaffLogout} />
      ) : showElectricianDashboard ? (
        <ElectricianDashboard onLogout={handleElectricianLogout} />
      ) : showAdminDashboard ? (
        <AdminDashboard onLogout={handleAdminLogout} />
      ) : showStaffLogin ? (
        <StaffLogin
          onBackClick={handleBackClick}
          onLoginSuccess={handleStaffLoginSuccess}
        />
      ) : showElectricianLogin ? (
        <ElectricianLogin
          onBackClick={handleBackClick}
          onLoginSuccess={handleElectricianLoginSuccess}
        />
      ) : showAdminLogin ? (
        <AdminLogin
          onBackClick={handleBackClick}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      ) : (
        <HomeMain
          onStaffLoginClick={handleStaffLoginClick}
          onElectricianLoginClick={handleElectricianLoginClick}
          onAdminLoginClick={handleAdminLoginClick}
        />
      )}

      {!isDashboardActive && <Homefooter />}
    </>
  );
};

export default Home;
