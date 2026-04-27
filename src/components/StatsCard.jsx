import React from 'react';

const StatsCard = ({ title, value, icon }) => (
  <div className="stat-card">
    <div className="stat-card-content">
      <h4>{title}</h4>
      <div className="value">{value}</div>
    </div>
    {icon && <div className="stat-card-icon">{icon}</div>}
  </div>
);

export default StatsCard;
