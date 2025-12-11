// src/components/Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './styles/Header.css';

const navLinks = [
  { to: '/dashboard', label: 'Nhật ký' },
  { to: '/health-tracker', label: 'BMI' },
  { to: '/bmr', label: 'BMR & TDEE' },
  { to: '/heart-rate', label: 'Nhịp tim' },
];

const Header = ({ theme = 'dark', toggleTheme }) => {
  const { user, openAuth, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="header glass-bar">
      <div className="page-width header-inner">
        <Link to="/" className="logo-link" aria-label="Trang chủ">
          <div className="logo">
            <span className="logo-icon">HM</span>
            <div className="logo-text">
              <span className="brand-name">HealthMate</span>
              <span className="brand-sub">Studio sức khỏe</span>
            </div>
          </div>
        </Link>

        <nav className="nav">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${pathname === item.to ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Đổi giao diện"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          {user ? (
            <div className="user-chip">
              <span className="user-avatar" aria-hidden>👤</span>
              <Link to="/profile" className="user-name">{user.name}</Link>
              <button className="logout-btn" onClick={logout}>Thoát</button>
            </div>
          ) : (
            <button className="login-button" onClick={() => openAuth('login')}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
