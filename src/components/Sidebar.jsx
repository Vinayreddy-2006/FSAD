import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { role, logout } = useContext(AuthContext);
  const [activeHash, setActiveHash] = useState(() => window.location.hash || '');

  const menuItems = {
    admin: [
      { label: 'Messages', icon: '\uD83D\uDCAC', href: '/admin#donor-messages' },
      { label: 'Drives', icon: '\uD83D\uDE9A', href: '/admin#create-drive' },
      { label: 'Insights', icon: '\uD83D\uDCC8', href: '/admin#platform-insights' },
      { label: 'Donations', icon: '\uD83C\uDF81', href: '/admin#pending-donations' },
      { label: 'Requests', icon: '\uD83D\uDCE6', href: '/admin#pending-requests' },
    ],
    donor: [],
    recipient: [],
    logistics: [],
  };

  const items = menuItems[role] || [];

  useEffect(() => {
    const onHashChange = () => setActiveHash(window.location.hash || '');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        <h1 className="sidebar-brand sidebar-brand-title">
          <span className="logo-mark">{'\u2764'}</span>
          <span className="brand-text">ReliefConnect</span>
        </h1>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`sidebar-link ${item.href.includes(activeHash) ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-role-card">
          <div className="sidebar-role-label">Role</div>
          <div className="sidebar-role-value">{role}</div>
        </div>
        <button onClick={logout} className="sidebar-logout-button">
          <span>{'\uD83D\uDEAA'}</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
