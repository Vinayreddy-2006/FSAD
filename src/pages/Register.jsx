import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ROLES = [
  { name: 'admin', label: 'Admin' },
  { name: 'donor', label: 'Donor' },
  { name: 'recipient', label: 'Recipient' },
  { name: 'logistics', label: 'Logistics' },
];

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = 'admin@gmail.com';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const next = {};
    if (!name.trim()) next.name = 'Enter your full name.';
    if (!validateEmail(cleanEmail)) next.email = 'Enter a valid email.';
    if (!password || password.length < 6) next.password = 'Password must be at least 6 characters.';
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.';
    if (!role) next.role = 'Choose a role.';
    if (role === 'admin' && cleanEmail !== ADMIN_EMAIL) {
      next.email = `Only ${ADMIN_EMAIL} may register as admin.`;
    }
    if (role === 'admin' && !adminPassword) {
      next.adminPassword = 'Admin master password is required.';
    }

    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await register({
        name,
        email: cleanEmail,
        password,
        role,
        adminPassword,
      });

      if (!result.success) {
        if (result.error === 'exists') {
          setErrors({ form: 'Email already registered' });
        } else if (result.error === 'admin-exists') {
          setErrors({ form: 'An admin account already exists. Only one admin is allowed.' });
        } else if (result.error === 'admin-email-invalid') {
          setErrors({ form: `Admin must use email: ${ADMIN_EMAIL}` });
        } else if (result.error === 'admin-password-invalid') {
          setErrors({ form: 'Incorrect admin master password.' });
        } else {
          setErrors({ form: 'Registration failed. Please check backend.' });
        }
        return;
      }

      navigate('/login');
    } catch {
      setErrors({ form: 'Registration failed. Please check backend.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="text-center">Create an account</h2>
        <p className="text-center" style={{ color: 'var(--text-light)' }}>
          Register to get started
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((roleOption) => (
                <option key={roleOption.name} value={roleOption.name}>
                  {roleOption.label}
                </option>
              ))}
            </select>
            {errors.role && <div className="error-text">{errors.role}</div>}
          </div>

          {role === 'admin' && (
            <div className="form-group">
              <label>Admin Master Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin master password"
              />
              {errors.adminPassword && <div className="error-text">{errors.adminPassword}</div>}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>

          {errors.form && (
            <div className="error-text" style={{ textAlign: 'center' }}>
              {errors.form}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
