import React, { useState, useEffect } from 'react';

const BASE_URL = "http://localhost:8081/api";

const RecipientDashboard = () => {

  const [selectedDrive, setSelectedDrive] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    items: '',
    quantity: '',
    urgency: 'medium',
    description: '',
    location: ''
  });

  const [allDrives, setAllDrives] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  // 🔥 LOAD DATA FROM BACKEND
  const loadData = async () => {
    try {
      const drivesRes = await fetch(`${BASE_URL}/drives`);
      const drivesData = await drivesRes.json();
      setAllDrives(drivesData);

      const reqRes = await fetch(`${BASE_URL}/requests`);
      const reqData = await reqRes.json();
      setMyRequests(reqData);

    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 SUBMIT TO BACKEND
  const submit = async () => {

    if (!selectedDrive) {
      alert("Please select a drive ❗");
      return;
    }

    if (!form.items || !form.quantity) {
      alert("Fill all required fields ❗");
      return;
    }

    const newRequest = {
      item: form.items,
      quantity: parseInt(form.quantity),
      location: form.location,
      priority: form.urgency.toUpperCase(),
      status: "PENDING",

      // 🔥 FIX: ensure number
      drive: {
        id: parseInt(selectedDrive)
      }
    };

    console.log("Sending:", newRequest);

    try {
      const res = await fetch(`${BASE_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRequest)
      });

      if (!res.ok) {
        throw new Error("Failed to save request");
      }

      alert("Request Submitted ✅");

      await loadData(); // 🔥 refresh properly

      setShowForm(false);
      setForm({
        items: '',
        quantity: '',
        urgency: 'medium',
        description: '',
        location: ''
      });
      setSelectedDrive('');

    } catch (err) {
      console.error(err);
      alert("Error saving request ❌");
    }
  };

  // 📊 STATS
  const stats = {
    total: myRequests.length,
    pending: myRequests.filter(r => r.status === "PENDING").length,
    approved: myRequests.filter(r => r.status === "APPROVED").length
  };

  return (
    <div className="main-content">

      <div className="flex justify-between items-center mb-4">
        <h2 className="dashboard-title">Recipient Dashboard</h2>

        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + Request Relief Items
        </button>
      </div>

      {/* 📊 STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Requests</h4>
          <div className="value">{stats.total}</div>
        </div>

        <div className="stat-card">
          <h4>Pending</h4>
          <div className="value">{stats.pending}</div>
        </div>

        <div className="stat-card">
          <h4>Approved</h4>
          <div className="value">{stats.approved}</div>
        </div>
      </div>

      {/* 📦 REQUEST LIST */}
      <div className="section">
        <h3 className="section-title">Request Tracker</h3>

        {myRequests.length === 0 && <p>No requests yet.</p>}

        <ul className="item-list">
          {myRequests.map((r) => (
            <li key={r.id} className="list-item">
              <div>
                <strong>{r.item}</strong>
                <div>Qty: {r.quantity}</div>
                <div>Location: {r.location}</div>

                {/* 🔥 FIXED DISPLAY */}
                <div>
                  Drive: {r.drive ? r.drive.title : "No Drive"}
                </div>
              </div>

              <span className="badge">{r.status}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 📝 FORM */}
      {showForm && (
        <div className="section">
          <h3>Request Items</h3>

          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
          >
            <option value="">Select Drive</option>
            {allDrives.map(d => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>

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

          <input
            name="location"
            placeholder="Location"
            value={form.location}
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

export default RecipientDashboard;