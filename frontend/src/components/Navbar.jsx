import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">🏥</div>
          <div className="brand-text">
            <span className="brand-name">Aumovio</span>
            <span className="brand-sub">HCP CRM</span>
          </div>
        </div>

        <div className="navbar-actions">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">AI Ready</span>
          </div>
          <div className="user-profile">
            <div className="avatar">A</div>
            <div className="user-info">
              <span className="user-name">Akash</span>
              <span className="user-role">Field Rep</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;