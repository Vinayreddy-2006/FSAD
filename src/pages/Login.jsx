import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUsers } from '../api/api';

const ROLES = [
  { name: 'admin', icon: 'Admin', desc: 'Manage and oversee drives', gradient: 'linear-gradient(135deg,#a78bfa,#9333ea)' },
  { name: 'donor', icon: 'Donor', desc: 'Contribute items', gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)' },
  { name: 'recipient', icon: 'Recipient', desc: 'Request relief', gradient: 'linear-gradient(135deg,#4ade80,#16a34a)' },
  { name: 'logistics', icon: 'Logistics', desc: 'Coordinate delivery', gradient: 'linear-gradient(135deg,#fb923c,#ea580c)' },
];

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('donor');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [hasAnyUser, setHasAnyUser] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const all = await getUsers();
        setHasAnyUser(all.length > 0);
        if (all.length === 0) {
          navigate('/register');
        }
      } catch {
        setErrors({ form: 'Unable to load users. Please check that the backend server is running.' });
      } finally {
        setUsersLoaded(true);
      }
    };

    loadUsers();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const next = {};
    if (!validateEmail(cleanEmail)) next.email = 'Please enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    if (!selectedRole) next.role = 'Choose a role.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const res = await login({ email: cleanEmail, password, expectedRole: selectedRole });
    setLoading(false);

    if (!res.success) {
      setErrors({ form: 'Invalid credentials' });
      return;
    }

    if (remember) {
      localStorage.setItem('rememberedEmail', cleanEmail);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    setTimeout(() => {
      navigate(`/${res.role}`);
    }, 0);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="text-center">ReliefConnect</h2>
        <p className="text-center" style={{ color: 'var(--text-light)' }}>Sign in to your account to continue</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {!hasAnyUser && usersLoaded && (
            <div className="error-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              No accounts found. Please register first.
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={errors.email ? 'true' : 'false'}
            />
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
                placeholder="Enter your password"
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <div>
            <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Select your role</h3>
            <div className="role-grid">
              {ROLES.map((roleOption) => (
                <button
                  type="button"
                  key={roleOption.name}
                  className={`role-card ${selectedRole === roleOption.name ? 'selected' : ''}`}
                  onClick={() => setSelectedRole(roleOption.name)}
                  style={{ background: roleOption.gradient }}
                  aria-pressed={selectedRole === roleOption.name}
                  role="radio"
                >
                  <div className="role-icon">{roleOption.icon}</div>
                  <div className="role-name">{roleOption.name}</div>
                  <div className="role-desc">{roleOption.desc}</div>
                </button>
              ))}
            </div>
            {errors.role && <div className="error-text">{errors.role}</div>}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <button className="btn-primary" type="submit" disabled={loading || !hasAnyUser || !usersLoaded}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => { setEmail(''); setPassword(''); setErrors({}); }}>
              Clear
            </button>
          </div>

          <div className="remember-me" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label htmlFor="remember" style={{ fontSize: '0.9rem' }}>Remember my email</label>
          </div>

          <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
            <a href="#" className="link-muted" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>

          {errors.form && <div className="error-text" style={{ textAlign: 'center', marginTop: '0.75rem' }}>{errors.form}</div>}

          <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-light)' }}>
            <p>Don't have an account? <Link to="/register" className="link-muted">Sign up</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
