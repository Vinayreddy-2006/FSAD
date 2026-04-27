import React, { createContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    const ensureDefaultAdminAccount = async () => {
      try {
        const allUsers = await getUsers();
        const adminUser = allUsers.find((user) => normalizeRole(user.role) === 'admin');

        if (!adminUser) {
          await createUser({
            name: 'Administrator',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'ADMIN',
          });
        }
      } catch (error) {
        console.error('Failed to ensure default admin account', error);
      }
    };

    ensureDefaultAdminAccount();
  }, []);

  const login = async ({ email, password, expectedRole }) => {
    const normalizedEmail = normalizeEmail(email);
    const allUsers = await getUsers();
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
    const allUsers = await getUsers();
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

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ role, userEmail, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
