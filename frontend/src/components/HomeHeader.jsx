import React from 'react';
import "./HomeHeader.css";

// Vite-safe asset import
import electricHelpLogo from '../assets/electricHelp--logo.png';

const HomeHeader = () => {
  return (
    <>
      <nav className="head">
        <div className="nav1">
          <img src={electricHelpLogo} alt="ElectricHelp Logo" />
          <h1 className="Header-title">ElectricHelp</h1>
        </div>
      </nav>
    </>
  );
};

export default HomeHeader;
