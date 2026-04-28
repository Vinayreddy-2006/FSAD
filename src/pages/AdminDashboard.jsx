import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../api/api';

const getStatusClass = (status = '') => {
  const normalized = status.toLowerCase();
  if (normalized === 'approved' || normalized === 'active') return 'badge-approved';
  if (normalized === 'delivered' || normalized === 'completed') return 'badge-delivered';
  if (normalized === 'rejected') return 'badge-rejected';
  return 'badge-pending';
};

const isPendingStatus = (status = '') => status.toLowerCase() === 'pending';

const tryJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState(() => window.location.hash || '#dashboard');
  const [allDonations, setAllDonations] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allDrives, setAllDrives] = useState([]);
  const [title, setTitle] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
  });

  const loadData = async () => {
    const [donations, requests, users, drives] = await Promise.all([
      fetch(`${BASE_URL}/donations`).then((res) => res.json()),
      fetch(`${BASE_URL}/requests`).then((res) => res.json()),
      fetch(`${BASE_URL}/users`).then((res) => res.json()),
      fetch(`${BASE_URL}/drives`).then((res) => res.json()),
    ]);

    setAllDonations(donations);
    setAllRequests(requests);
    setAllUsers(users);
    setAllDrives(drives);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveSection(window.location.hash || '#dashboard');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const createDrive = async () => {
    if (!title.trim()) return;

    await fetch(`${BASE_URL}/drives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),
        description: 'Relief Drive',
        status: 'ACTIVE',
      }),
    });

    setTitle('');
    loadData();
  };

  const addUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.role) return;

    await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userForm,
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
      }),
    });

    setUserForm({ name: '', email: '', role: '' });
    loadData();
  };

  const updateResourceStatus = async (resource, id, status) => {
    const upperStatus = status.toUpperCase();
    const lowerAction = status.toLowerCase();
    const collection = resource === 'requests' ? allRequests : allDonations;
    const existingItem = collection.find((item) => String(item.id) === String(id));
    const mergedPayload = existingItem
      ? {
          ...existingItem,
          status: upperStatus,
        }
      : { id, status: upperStatus };

    const attempts = [
      {
        url: `${BASE_URL}/${resource}/${id}/${lowerAction}`,
        options: { method: 'PUT' },
      },
      {
        url: `${BASE_URL}/${resource}/${id}`,
        options: {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedPayload),
        },
      },
      {
        url: `${BASE_URL}/${resource}/${id}`,
        options: {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedPayload),
        },
      },
      {
        url: `${BASE_URL}/${resource}`,
        options: {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedPayload),
        },
      },
      {
        url: `${BASE_URL}/${resource}`,
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedPayload),
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

    throw lastError || new Error(`Unable to update ${resource} status`);
  };

  const approveRequest = async (id) => {
    try {
      await updateResourceStatus('requests', id, 'APPROVED');
      await loadData();
    } catch (error) {
      console.error('Failed to approve request', error);
      alert('Unable to approve the request. Please check the backend endpoint.');
    }
  };

  const rejectRequest = async (id) => {
    try {
      await updateResourceStatus('requests', id, 'REJECTED');
      await loadData();
    } catch (error) {
      console.error('Failed to reject request', error);
      alert('Unable to reject the request. Please check the backend endpoint.');
    }
  };

  const approveDonation = async (id) => {
    try {
      await updateResourceStatus('donations', id, 'APPROVED');
      await loadData();
    } catch (error) {
      console.error('Failed to approve donation', error);
      alert('Unable to approve the donation. Please check the backend endpoint.');
    }
  };

  const rejectDonation = async (id) => {
    try {
      await updateResourceStatus('donations', id, 'REJECTED');
      await loadData();
    } catch (error) {
      console.error('Failed to reject donation', error);
      alert('Unable to reject the donation. Please check the backend endpoint.');
    }
  };

  const insights = useMemo(
    () => ({
      pendingRequests: allRequests.filter((request) => request.status === 'PENDING').length,
      pendingDonations: allDonations.filter((donation) => donation.status === 'PENDING').length,
      activeDrives: allDrives.filter((drive) => drive.status === 'ACTIVE').length,
    }),
    [allDonations, allDrives, allRequests]
  );

  const renderDashboardOverview = () => (
    <>
      <div id="dashboard" className="mb-4">
        <h2 className="dashboard-title">Admin Dashboard</h2>
        <p className="section-subtitle">Review platform activity, manage drives, and process approvals from one place.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>Total Users</h4>
            <div className="value">{allUsers.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>Total Requests</h4>
            <div className="value">{allRequests.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>Total Donations</h4>
            <div className="value">{allDonations.length}</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderInsightsSection = () => (
    <div id="platform-insights">
      <div className="mb-4">
        <h2 className="dashboard-title">Platform Insights</h2>
        <p className="section-subtitle">Track pending activity and active relief operations.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>Pending Requests</h4>
            <div className="value">{insights.pendingRequests}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>Pending Donations</h4>
            <div className="value">{insights.pendingDonations}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-content">
            <h4>Active Drives</h4>
            <div className="value">{insights.activeDrives}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDrivesSection = () => (
    <div id="create-drive" className="section">
      <h3 className="section-title">Drive Management</h3>
      <p className="section-subtitle">Create new drives and keep an eye on currently active campaigns.</p>

      <div className="admin-drive-layout">
        <div className="admin-drive-panel">
          <div className="form-group admin-drive-form">
            <label htmlFor="driveTitle">Drive Title</label>
            <input
              id="driveTitle"
              placeholder="Flood Relief"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <button onClick={createDrive} className="btn-primary">
            Create Drive
          </button>
        </div>

        <div className="admin-drive-panel">
          {allDrives.length === 0 ? (
            <p>No drives available yet.</p>
          ) : (
            <ul className="item-list">
              {allDrives.map((drive) => (
                <li key={drive.id} className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">{drive.title || 'Untitled Drive'}</div>
                    <div className="list-item-meta">{drive.description || 'Relief coordination drive'}</div>
                  </div>
                  <span className={`badge ${getStatusClass(drive.status)}`}>{drive.status || 'ACTIVE'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  const renderMessagesSection = () => (
    <div id="donor-messages" className="section">
      <h3 className="section-title">User Management</h3>
      <p className="section-subtitle">Add a user and review everyone already registered in the platform.</p>

      <div className="form-group">
        <label htmlFor="userName">Name</label>
        <input
          id="userName"
          placeholder="User name"
          value={userForm.name}
          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="userEmail">Email</label>
        <input
          id="userEmail"
          placeholder="user@example.com"
          value={userForm.email}
          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="userRole">Role</label>
        <select
          id="userRole"
          value={userForm.role}
          onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
        >
          <option value="">Select Role</option>
          <option value="ADMIN">Admin</option>
          <option value="DONOR">Donor</option>
          <option value="RECIPIENT">Recipient</option>
          <option value="LOGISTICS">Logistics</option>
        </select>
      </div>

      <button onClick={addUser} className="btn-primary">
        Add User
      </button>

      <div className="mt-3">
        {allUsers.length === 0 ? (
          <p>No users available yet.</p>
        ) : (
          <ul className="item-list">
            {allUsers.map((user) => (
              <li key={user.id || user.email} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">{user.name || 'Unnamed User'}</div>
                  <div className="list-item-meta">{user.email}</div>
                </div>
                <span className="badge badge-info">{user.role || 'USER'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderRequestsSection = () => (
    <div id="pending-requests" className="section">
      <h3 className="section-title">Request Review</h3>
      <p className="section-subtitle">Approve or reject incoming recipient requests from the admin portal.</p>

      {allRequests.length === 0 ? (
        <p>No requests pending.</p>
      ) : (
        <ul className="item-list">
          {allRequests.map((request) => (
            <li key={request.id} className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">{request.item || request.items || 'Requested Item'}</div>
                <div className="list-item-meta">
                  Location: {request.location || 'Not provided'}
                </div>
              </div>
              <div className="list-item-actions">
                <span className={`badge ${getStatusClass(request.status)}`}>{request.status}</span>
                {isPendingStatus(request.status) && (
                  <>
                    <button onClick={() => approveRequest(request.id)} className="btn-success">
                      Approve
                    </button>
                    <button onClick={() => rejectRequest(request.id)} className="btn-danger">
                      Reject
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderDonationsSection = () => (
    <div id="pending-donations" className="section">
      <h3 className="section-title">Donation Review</h3>
      <p className="section-subtitle">Handle incoming donations inside the admin portal with the earlier dashboard-style list view.</p>

      {allDonations.length === 0 ? (
        <p>No donations available yet.</p>
      ) : (
        <ul className="item-list">
          {allDonations.map((donation) => (
            <li key={donation.id} className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">{donation.item || donation.items || 'Donation Item'}</div>
                <div className="list-item-meta">Quantity: {donation.quantity || 0}</div>
              </div>
              <div className="list-item-actions">
                <span className={`badge ${getStatusClass(donation.status)}`}>{donation.status}</span>
                {isPendingStatus(donation.status) && (
                  <>
                    <button onClick={() => approveDonation(donation.id)} className="btn-success">
                      Approve
                    </button>
                    <button onClick={() => rejectDonation(donation.id)} className="btn-danger">
                      Reject
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="main-content">
      {activeSection === '#dashboard' && renderDashboardOverview()}
      {activeSection === '#platform-insights' && renderInsightsSection()}
      {activeSection === '#create-drive' && renderDrivesSection()}
      {activeSection === '#donor-messages' && renderMessagesSection()}
      {activeSection === '#pending-requests' && renderRequestsSection()}
      {activeSection === '#pending-donations' && renderDonationsSection()}
    </div>
  );
};

export default AdminDashboard;
