import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = "http://localhost:8081/api";

const DonorDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedDrive, setSelectedDrive] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    items: '',
    quantity: ''
  });

  const [myDonations, setMyDonations] = useState([]);
  const [allDrives, setAllDrives] = useState([]);

  // 🔥 LOAD DATA FROM BACKEND (FIXED)
  useEffect(() => {
    fetch(`${BASE_URL}/donations`)
      .then(res => res.json())
      .then(data => {
        console.log("DONATIONS 👉", data);
        setMyDonations(data);
      });

    fetch(`${BASE_URL}/drives`)
      .then(res => res.json())
      .then(data => {
        console.log("DRIVES 👉", data);   // 🔥 DEBUG
        setAllDrives(data);               // ✅ IMPORTANT FIX
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 SUBMIT TO BACKEND
  const submit = async () => {
    if (!form.items || !form.quantity) {
      alert("Fill all fields ❗");
      return;
    }

    const newDonation = {
      item: form.items,
      quantity: parseInt(form.quantity),
      status: "PENDING"
    };

    await fetch(`${BASE_URL}/donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDonation),
    });

    alert("Donation Submitted ✅");

    // reload donations
    const res = await fetch(`${BASE_URL}/donations`);
    const data = await res.json();
    setMyDonations(data);

    setShowForm(false);
    setForm({ items: '', quantity: '' });
  };

  // 🔥 STATS
  const stats = {
    total: myDonations.length,
    pending: myDonations.filter(d => d.status === "PENDING").length,
    completed: myDonations.filter(d => d.status === "DELIVERED").length
  };

  return (
    <div className="main-content">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="dashboard-title">Donor Dashboard</h2>
          <p className="section-subtitle">Manage your contributions and track their journey.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Pledge Donation'}
          </button>

          <button onClick={() => { logout(); navigate('/login'); }} className="btn-danger">
            Log out
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Donations</h4>
          <div className="value">{stats.total}</div>
        </div>

        <div className="stat-card">
          <h4>Pending</h4>
          <div className="value">{stats.pending}</div>
        </div>

        <div className="stat-card">
          <h4>Completed</h4>
          <div className="value">{stats.completed}</div>
        </div>
      </div>

      {/* DONATIONS */}
      <div className="section">
        <h3 className="section-title">My Donations</h3>

        {myDonations.length === 0 && <p>No donations yet.</p>}

        <ul className="item-list">
          {myDonations.map((d) => (
            <li key={d.id} className="list-item">
              <div style={{ color: "white" }}>
                <strong>{d.item || "No Item"}</strong>
                <div>Qty: {d.quantity}</div>
              </div>
              <span className="badge">{d.status}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DRIVES (FIXED 🔥) */}
      <div className="section">
        <h3 className="section-title">Active Drives</h3>

        {allDrives.length === 0 && <p>No drives available ❌</p>}

        <ul className="item-list">
          {allDrives.map((d) => (
            <li key={d.id} className="list-item">
              <div style={{ color: "white", fontWeight: "bold" }}>
                {d.title || d.name || "No Title"}   {/* 🔥 FIX */}
              </div>

              <span className="badge">
                {d.status || "No Status"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="section">
          <h3>Pledge Donation</h3>

          <input
            name="items"
            placeholder="Item"
            value={form.items}
            onChange={handleChange}
          />

          <input
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
          />

          <button onClick={submit} className="btn-primary">
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;