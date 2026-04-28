import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../api/api';

const formatDateTime = (isoValue) => {
  if (!isoValue) return 'N/A';
  const dt = new Date(isoValue);
  if (Number.isNaN(dt.getTime())) return 'N/A';
  return dt.toLocaleString();
};

const normalizeStatus = (status = '') => status.toUpperCase();

const tryJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const LogisticsDashboard = () => {
  const [allDonations, setAllDonations] = useState([]);
  const [search, setSearch] = useState('');

  const refreshData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/donations`);
      const data = await response.json();
      setAllDonations(data);
    } catch (error) {
      console.error('Failed to load logistics donations', error);
      setAllDonations([]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const approvedDonations = useMemo(
    () => allDonations.filter((donation) => normalizeStatus(donation.status) === 'APPROVED'),
    [allDonations]
  );

  const inTransitDonations = useMemo(
    () => allDonations.filter((donation) => normalizeStatus(donation.status) === 'IN_TRANSIT'),
    [allDonations]
  );

  const deliveredDonations = useMemo(
    () => allDonations.filter((donation) => normalizeStatus(donation.status) === 'DELIVERED'),
    [allDonations]
  );

  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = (value) => String(value || '').toLowerCase().includes(normalizedSearch);

  const visibleApprovedDonations = useMemo(
    () =>
      approvedDonations.filter(
        (donation) =>
          matchesSearch(donation.items || donation.item) ||
          matchesSearch(donation.pickup) ||
          matchesSearch(donation.location)
      ),
    [approvedDonations, normalizedSearch]
  );

  const visibleInTransitDonations = useMemo(
    () =>
      inTransitDonations.filter(
        (donation) =>
          matchesSearch(donation.items || donation.item) ||
          matchesSearch(donation.pickup) ||
          matchesSearch(donation.location)
      ),
    [inTransitDonations, normalizedSearch]
  );

  const stats = {
    total: allDonations.length,
    assigned: approvedDonations.length,
    inTransit: inTransitDonations.length,
    completed: deliveredDonations.length,
  };

  const updateDonationStatus = async (donation, nextStatus, extraFields = {}) => {
    const payload = {
      ...donation,
      status: nextStatus,
      ...extraFields,
    };

    const attempts = [
      {
        url: `${BASE_URL}/donations/${donation.id}`,
        options: {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      },
      {
        url: `${BASE_URL}/donations/${donation.id}`,
        options: {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      },
      {
        url: `${BASE_URL}/donations`,
        options: {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      },
    ];

    let lastError = null;

    for (const attempt of attempts) {
      try {
        const response = await fetch(attempt.url, attempt.options);
        if (response.ok) {
          return true;
        }
        const errorData = await tryJson(response);
        lastError = new Error(errorData?.message || `Failed with status ${response.status}`);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to update donation status');
  };

  const markInTransit = async (donation) => {
    try {
      await updateDonationStatus(donation, 'IN_TRANSIT', {
        logisticsStartedAt: new Date().toISOString(),
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to mark donation in transit', error);
      alert('Unable to start delivery for this donation.');
    }
  };

  const markDelivered = async (donation) => {
    try {
      await updateDonationStatus(donation, 'DELIVERED', {
        deliveredAt: new Date().toISOString(),
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to mark donation delivered', error);
      alert('Unable to mark this donation as delivered.');
    }
  };

  const startAllVisible = async () => {
    for (const donation of visibleApprovedDonations) {
      // Keep order predictable and avoid overloading the backend.
      // eslint-disable-next-line no-await-in-loop
      await markInTransit(donation);
    }
  };

  const deliverAllVisible = async () => {
    for (const donation of visibleInTransitDonations) {
      // Keep order predictable and avoid overloading the backend.
      // eslint-disable-next-line no-await-in-loop
      await markDelivered(donation);
    }
  };

  return (
    <div className="main-content">
      <div className="mb-6">
        <h2 className="dashboard-title">Logistics Dashboard</h2>
        <p className="section-subtitle">Manage pickup and delivery tasks</p>
      </div>

      <div className="section" style={{ marginBottom: '1.25rem' }}>
        <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item or location"
            style={{ maxWidth: '420px' }}
          />
          <button onClick={refreshData} className="btn-secondary">
            Refresh
          </button>
          {search && (
            <button onClick={() => setSearch('')} className="btn-secondary">
              Clear Search
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>Total Tasks</h4>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card-icon">BOX</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>Assigned</h4>
            <div className="value">{stats.assigned}</div>
          </div>
          <div className="stat-card-icon">PIN</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>In Transit</h4>
            <div className="value">{stats.inTransit}</div>
          </div>
          <div className="stat-card-icon">VAN</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>Completed</h4>
            <div className="value">{stats.completed}</div>
          </div>
          <div className="stat-card-icon">DONE</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}
      >
        <div className="section">
          <h3 className="section-title">Pickup Tasks</h3>
          <p className="section-subtitle">Collect approved donations from donors</p>
          {visibleApprovedDonations.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>No pending pickups</p>
          )}
          <ul className="item-list">
            {visibleApprovedDonations.map((donation) => (
              <li key={donation.id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">{donation.items || donation.item}</div>
                  <div className="list-item-meta">
                    Qty: {donation.quantity || 'N/A'} | From: {donation.pickup || 'TBD'} | To: {donation.location || 'TBD'}
                  </div>
                </div>
                <div className="list-item-actions">
                  <span className="badge badge-pending">assigned</span>
                  <button className="btn-primary" onClick={() => markInTransit(donation)}>
                    Start
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {visibleApprovedDonations.length > 1 && (
            <button
              onClick={startAllVisible}
              className="btn-primary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Start All Visible
            </button>
          )}
        </div>

        <div className="section">
          <h3 className="section-title">Delivery Tasks</h3>
          <p className="section-subtitle">Deliver items to recipients</p>
          {visibleInTransitDonations.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>No items in transit</p>
          )}
          <ul className="item-list">
            {visibleInTransitDonations.map((donation) => (
              <li key={donation.id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">{donation.items || donation.item || 'Item'}</div>
                  <div className="list-item-meta">
                    To: {donation.location || 'TBD'} | Started: {formatDateTime(donation.logisticsStartedAt)}
                  </div>
                </div>
                <div className="list-item-actions">
                  <span className="badge badge-info">in-transit</span>
                  <button className="btn-success" onClick={() => markDelivered(donation)}>
                    Delivered
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {visibleInTransitDonations.length > 1 && (
            <button
              onClick={deliverAllVisible}
              className="btn-success"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Mark All Visible Delivered
            </button>
          )}
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Completed Deliveries</h3>
        {deliveredDonations.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>No completed deliveries yet</p>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Item</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Quantity</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Recipient Location</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Delivered At</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveredDonations.map((donation) => (
                <tr key={donation.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>{donation.items || donation.item}</td>
                  <td style={{ padding: '0.75rem' }}>{donation.quantity || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{donation.location || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{formatDateTime(donation.deliveredAt)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-success">delivered</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;
