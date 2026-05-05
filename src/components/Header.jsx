import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { role, logout } = useContext(AuthContext);
  return (
    <header>
      <div className="header-container">
        <Link to="/" className="logo logo-brand">
          <span className="logo-mark">{'\u2764'}</span>
          <span className="brand-text">ReliefConnect</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          {role ? (
            <>
              <span className="header-role-pill">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
              <button
                onClick={logout}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: '0.3rem 0.6rem', textDecoration: 'none' }}>
                Login
              </Link>
              <Link to="/register" style={{ padding: '0.3rem 0.6rem', textDecoration: 'none' }}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
