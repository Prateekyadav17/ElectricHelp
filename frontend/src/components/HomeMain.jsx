import React from 'react';
import "./HomeMain.css";

const HomeMain = ({ onStaffLoginClick, onElectricianLoginClick, onAdminLoginClick }) => {
  return (
    <>
      <div className="Main-container">
        <div className="Main-card" onClick={onStaffLoginClick}>
          <div className="Main-logo">
            <img src="src/assets/staff-logo.png" alt="Staff Logo" />
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
            <img src="src/assets/electrician-logo.png" alt="Electrician Logo" />
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
            <img className="admin-logo" src="src/assets/admin-logo.png" alt="Admin Logo" />
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
