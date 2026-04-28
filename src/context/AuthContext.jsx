import React, { createContext, useCallback, useState } from 'react';
import { createUser, getUsers } from '../api/api';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const normalizeRole = (role = '') => role.toLowerCase();
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123';

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem('reliefconnect_role'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('reliefconnect_email'));
  const [users, setUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [authError, setAuthError] = useState('');

  const refreshUsers = useCallback(async ({ force = false, ensureAdmin = false } = {}) => {
    if (usersLoaded && !force) {
      return users;
    }

    try {
      setAuthError('');
      let allUsers = await getUsers();

      if (ensureAdmin && !allUsers.some((user) => normalizeRole(user.role) === 'admin')) {
        await createUser({
          name: 'Administrator',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'ADMIN',
        });
        allUsers = await getUsers();
      }

      setUsers(allUsers);
      setUsersLoaded(true);
      return allUsers;
    } catch (error) {
      setUsersLoaded(true);
      setAuthError('Unable to connect to the backend server.');
      console.error('Failed to load users', error);
      throw error;
    }
  }, [users, usersLoaded]);

  const login = async ({ email, password, expectedRole }) => {
    const normalizedEmail = normalizeEmail(email);
    const allUsers = await refreshUsers({ ensureAdmin: true });
    const matchedUser = allUsers.find((user) => normalizeEmail(user.email) === normalizedEmail);

    if (!matchedUser) {
      return { success: false, error: 'not-found' };
    }

    if (matchedUser.password !== password) {
      return { success: false, error: 'invalid-password' };
    }

    const matchedRole = normalizeRole(matchedUser.role);
    if (expectedRole && matchedRole !== expectedRole) {
      return { success: false, error: 'role-mismatch', role: matchedRole };
    }

    setRole(matchedRole);
    setUserEmail(matchedUser.email);
    localStorage.setItem('reliefconnect_role', matchedRole);
    localStorage.setItem('reliefconnect_email', matchedUser.email);

    return { success: true, role: matchedRole };
  };

  const logout = () => {
    setRole(null);
    setUserEmail(null);
    localStorage.removeItem('reliefconnect_role');
    localStorage.removeItem('reliefconnect_email');
    window.location.hash = '';
  };

  const register = async ({ name, email, password, role: requestedRole, adminPassword }) => {
    const normalizedEmail = normalizeEmail(email);
    const allUsers = await refreshUsers({ ensureAdmin: true });
    const existing = allUsers.find((user) => normalizeEmail(user.email) === normalizedEmail);

    if (existing) {
      return { success: false, error: 'exists' };
    }

    if (requestedRole === 'admin') {
      const alreadyAdmin = allUsers.find((user) => normalizeRole(user.role) === 'admin');
      if (alreadyAdmin) {
        return { success: false, error: 'admin-exists' };
      }
      if (normalizedEmail !== ADMIN_EMAIL) {
        return { success: false, error: 'admin-email-invalid' };
      }
      if (adminPassword !== ADMIN_PASSWORD) {
        return { success: false, error: 'admin-password-invalid' };
      }
    }

    await createUser({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: requestedRole.toUpperCase(),
    });

    await refreshUsers({ force: true });

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{ role, userEmail, users, usersLoaded, authError, refreshUsers, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};
