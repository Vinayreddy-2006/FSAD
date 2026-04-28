import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ROLES = [
  { name: 'admin', label: 'Admin', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { name: 'donor', label: 'Donor', gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)' },
  { name: 'recipient', label: 'Recipient', gradient: 'linear-gradient(135deg,#4ade80,#16a34a)' },
  { name: 'logistics', label: 'Logistics', gradient: 'linear-gradient(135deg,#fb923c,#ea580c)' },
];

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const hasUppercase = (value) => /[A-Z]/.test(value);
const hasNumber = (value) => /\d/.test(value);
const hasSpecial = (value) => /[^A-Za-z0-9]/.test(value);

const getPasswordStrength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (hasUppercase(value)) score += 1;
  if (hasNumber(value)) score += 1;
  if (hasSpecial(value)) score += 1;

  if (score <= 1) return { label: 'Weak', tone: 'danger' };
  if (score <= 3) return { label: 'Medium', tone: 'warning' };
  return { label: 'Strong', tone: 'success' };
};

const RegisterEnhanced = () => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [role, setRole] = useState('donor');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = 'admin@gmail.com';
  const cleanEmail = email.trim().toLowerCase();
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};

    if (!name.trim()) next.name = 'Enter your full name.';
    if (!validateEmail(cleanEmail)) next.email = 'Enter a valid email.';
    if (!password || password.length < 8 || !hasUppercase(password) || !hasNumber(password)) {
      next.password = 'Use at least 8 characters, including 1 uppercase letter and 1 number.';
    }
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.';
    if (!role) next.role = 'Choose a role.';
    if (!agreeToTerms) next.terms = 'You must accept the terms to continue.';
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
      const registerResult = await register({
        name,
        email: cleanEmail,
        password,
        role,
        adminPassword,
      });

      if (!registerResult.success) {
        if (registerResult.error === 'exists') {
          setErrors({ form: 'Email already registered' });
        } else if (registerResult.error === 'admin-exists') {
          setErrors({ form: 'An admin account already exists. Only one admin is allowed.' });
        } else if (registerResult.error === 'admin-email-invalid') {
          setErrors({ form: `Admin must use email: ${ADMIN_EMAIL}` });
        } else if (registerResult.error === 'admin-password-invalid') {
          setErrors({ form: 'Incorrect admin master password.' });
        } else {
          setErrors({ form: 'Registration failed. Please try again.' });
        }
        return;
      }

      const loginResult = await login({ email: cleanEmail, password });
      if (loginResult.success) {
        setTimeout(() => navigate(`/${loginResult.role}`), 0);
      } else {
        navigate('/login');
      }
    } catch (error) {
      setErrors({
        form: error.message || 'Registration failed. Please check that the backend server is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="text-center">Create an account</h2>
        <p className="text-center" style={{ color: 'var(--text-light)' }}>Register before you log in</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-highlight">
            <strong>Safer account creation</strong>
            <span>Your email, role, and password are validated before the account is created.</span>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <div className="error-text">{errors.password}</div>}
            {!errors.password && password && (
              <div className={`helper-text helper-${passwordStrength.tone}`}>
                Password strength: {passwordStrength.label}
              </div>
            )}
          </div>

          <div className="form-group password-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>

          <div className="form-group">
            <label>Role</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {ROLES.map((roleOption) => {
                if (roleOption.name === 'admin' && cleanEmail !== ADMIN_EMAIL) {
                  return null;
                }
                return (
                  <button
                    key={roleOption.name}
                    type="button"
                    className={`role-card ${role === roleOption.name ? 'selected' : ''}`}
                    onClick={() => setRole(roleOption.name)}
                    style={{ minWidth: 100, '--role-gradient': roleOption.gradient }}
                    role="radio"
                    aria-pressed={role === roleOption.name}
                  >
                    <span className="role-card-title">{roleOption.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.role && <div className="error-text">{errors.role}</div>}
          </div>

          {role === 'admin' && (
            <div className="form-group password-group">
              <label htmlFor="adminPassword">Admin Master Password</label>
              <div className="password-input-wrapper">
                <input
                  id="adminPassword"
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin master password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowAdminPassword((prev) => !prev)}
                  aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                >
                  {showAdminPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.adminPassword && <div className="error-text">{errors.adminPassword}</div>}
            </div>
          )}

          <div className="auth-checkbox-row">
            <input
              id="terms"
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />
            <label htmlFor="terms">I agree to use only my own registered account and keep my credentials private.</label>
          </div>
          {errors.terms && <div className="error-text">{errors.terms}</div>}

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setAdminPassword('');
                setAgreeToTerms(false);
                setErrors({});
              }}
            >
              Clear
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-light)' }}>
            <p>Already have an account? <Link to="/login" className="link-muted">Sign in</Link></p>
          </div>

          {errors.form && <div className="error-text" style={{ textAlign: 'center', marginTop: '0.75rem' }}>{errors.form}</div>}
        </form>
      </div>
    </div>
  );
};

export default RegisterEnhanced;
