import React from 'react';
import "./HomeMain.css";

// Vite-safe asset imports
import staffLogo from '../assets/staff-logo.png';
import electricianLogo from '../assets/electrician-logo.png';
import adminLogo from '../assets/admin-logo.png';

const HomeMain = ({ onStaffLoginClick, onElectricianLoginClick, onAdminLoginClick }) => {
  return (
    <>
      <div className="Main-container">
        <div className="Main-card" onClick={onStaffLoginClick}>
          <div className="Main-logo">
            <img src={staffLogo} alt="Staff Logo" />
          </div>
          <div className="Main-text">
            <h1>Staff</h1>
            <p>Submit and track maintenance complaints quickly and instantly.</p>
          </div>
          <div className="Main-buttons">
            <button className="MainLogin-button">Login</button>
          </div>
        </div>

        <div className="Main-card" onClick={onElectricianLoginClick}>
          <div className="Main-logo">
            <img src={electricianLogo} alt="Electrician Logo" />
          </div>
          <div className="Main-text">
            <h1>Electrician</h1>
            <p>View assigned tasks, update statuses, and resolve issues efficiently.</p>
          </div>
          <div className="Main-buttons">
            <button className="MainLogin-button">Login</button>
          </div>
        </div>

        <div className="Main-card" onClick={onAdminLoginClick}>
          <div className="Main-logo">
            <img className="admin-logo" src={adminLogo} alt="Admin Logo" />
          </div>
          <div className="Main-text">
            <h1>Admin</h1>
            <p>Oversee workflows, manage users, and monitor system performance.</p>
          </div>
          <div className="Main-buttons">
            <button className="MainLogin-button">Login</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeMain;
