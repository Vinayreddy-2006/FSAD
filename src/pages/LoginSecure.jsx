import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUsers } from '../api/api';

const ROLES = [
  { name: 'admin', title: 'Admin', subtitle: 'Admin', desc: 'Manage drives and platform activity', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { name: 'donor', title: 'Donor', subtitle: 'Donor', desc: 'Contribute items to active drives', gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)' },
  { name: 'recipient', title: 'Recipient', subtitle: 'Recipient', desc: 'Request aid and track support', gradient: 'linear-gradient(135deg,#4ade80,#16a34a)' },
  { name: 'logistics', title: 'Logistics', subtitle: 'Logistics', desc: 'Coordinate delivery progress', gradient: 'linear-gradient(135deg,#fb923c,#ea580c)' },
];

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getLoginErrorMessage = (error) => {
  if (error === 'not-found') return 'No registered account was found for this email. Please sign up first.';
  if (error === 'invalid-password') return 'Incorrect password. Please try again.';
  if (error === 'role-mismatch') return 'This email is registered under a different role. Please choose the correct role.';
  return 'Unable to sign in with these details.';
};

const LoginSecure = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('donor');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const hasAnyUser = registeredUsers.length > 0;

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
    }
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setRegisteredUsers(
          data.map((user) => ({
            ...user,
            role: user.role?.toLowerCase() || user.role,
          }))
        );
      } catch {
        setErrors({ form: 'Unable to load registered users. Please check that the backend server is running.' });
      } finally {
        setUsersLoaded(true);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (usersLoaded && !hasAnyUser) {
      navigate('/register');
    }
  }, [hasAnyUser, navigate, usersLoaded]);

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
      setErrors({ form: getLoginErrorMessage(res.error) });
      return;
    }

    localStorage.setItem('rememberedEmail', cleanEmail);

    setTimeout(() => {
      navigate(`/${res.role}`);
    }, 0);
  };

  return (
    <div className="login-container">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="text-center">ReliefConnect</h2>
            <p className="text-center login-subtitle">Sign in with a registered account to continue</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-highlight">
              <strong>Registered users only</strong>
              <span>
                {hasAnyUser
                  ? `${registeredUsers.length} account${registeredUsers.length > 1 ? 's are' : ' is'} available. Use the same role selected during registration.`
                  : 'No accounts exist yet. Create an account before trying to log in.'}
              </span>
            </div>

            {!hasAnyUser && (
              <div className="error-text login-form-alert">
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <div className="error-text">{errors.password}</div>}
            </div>

            <div>
              <h3 className="section-title login-section-title">Select your role</h3>
              <div className="role-grid" role="radiogroup" aria-label="Select your role">
                {ROLES.map((roleOption) => (
                  <button
                    type="button"
                    key={roleOption.name}
                    className={`role-card ${selectedRole === roleOption.name ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(roleOption.name)}
                    style={{ '--role-gradient': roleOption.gradient }}
                    aria-pressed={selectedRole === roleOption.name}
                    role="radio"
                  >
                    <div className="role-card-title">{roleOption.title}</div>
                    <div className="role-card-subtitle">{roleOption.subtitle}</div>
                    <div className="role-desc">{roleOption.desc}</div>
                  </button>
                ))}
              </div>
              {errors.role && <div className="error-text">{errors.role}</div>}
            </div>

            <div className="login-actions">
              <button className="btn-primary" type="submit" disabled={loading || !hasAnyUser || !usersLoaded}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEmail('');
                  setPassword('');
                  setErrors({});
                }}
              >
                Clear
              </button>
            </div>

            <div className="login-links-row">
              <span />
              <a href="#" className="link-muted" onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>

            {errors.form && <div className="error-text login-form-alert">{errors.form}</div>}

            <div className="login-signup">
              <p>Don't have an account? <Link to="/register" className="link-muted">Sign up</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSecure;
