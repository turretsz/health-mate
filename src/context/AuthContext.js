// Lightweight auth context with HTTP API + local fallback.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SESSION_KEY = 'hm_session';
const USERS_KEY = 'hm_users';
const DATA_KEYS = ['hm_water_logs', 'hm_sleep_logs', 'hm_activity_logs'];
const seedUsers = [
  { id: 1, name: 'Lan', email: 'lan@example.com', password: '123456', gender: 'female', birthDate: '1995-01-01', plan: 'Free' },
  { id: 2, name: 'Minh', email: 'minh@example.com', password: '123456', gender: 'male', birthDate: '1992-02-02', plan: 'Pro' },
  { id: 3, name: 'An', email: 'an@example.com', password: '123456', gender: 'female', birthDate: '1998-03-03', plan: 'Free' },
  { id: 4, name: 'Admin', email: 'ad@admin.com', password: 'admin123', gender: 'male', birthDate: '1990-01-01', plan: 'Pro', role: 'admin' },
];

const AuthContext = createContext(null);

// Mock persistence in localStorage to allow using auth without a backend.
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const ensureSeeded = (list) => {
  const merged = [...list];
  seedUsers.forEach((seed) => {
    if (!merged.find((u) => u.email === seed.email)) merged.push(seed);
  });
  return merged;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        setUser(null);
      }
    }
    try {
      const saved = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      if (Array.isArray(saved) && saved.length) {
        setUsers(saved);
      } else {
        setUsers(seedUsers);
        localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
      }
    } catch (e) {
      setUsers(seedUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    }
  }, []);

  const persistSession = (sessionUser) => {
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  };

  const persistUsers = (list) => {
    setUsers(list);
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  };

  const openAuth = (nextMode = 'login') => {
    setMode(nextMode);
    setIsOpen(true);
  };

  const closeAuth = () => setIsOpen(false);

  const register = async ({ name, gender, birthDate, email, password }) => {
    await delay();
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.find((u) => u.email === normalizedEmail);
    if (exists) throw new Error('Email đã tồn tại.');
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      gender,
      birthDate,
      email: normalizedEmail,
      password,
      plan: 'Free',
      role: 'user',
    };
    const nextUsers = [...users, newUser];
    persistUsers(nextUsers);
    persistSession({ id: newUser.id, name: newUser.name, email: newUser.email, plan: newUser.plan, role: newUser.role });
  };

  const login = async ({ email, password }) => {
    await delay();
    const normalizedEmail = email.trim().toLowerCase();
    const match = users.find((u) => u.email === normalizedEmail && u.password === password);
    if (!match) throw new Error('Sai email hoặc mật khẩu.');
    persistSession({ id: match.id, name: match.name, email: match.email, plan: match.plan, role: match.role });
  };

  const socialLogin = async (provider) => {
    await delay();
    if (!['google', 'facebook'].includes(provider)) {
      throw new Error('Nhà cung cấp không được hỗ trợ.');
    }
    const pseudo = {
      id: Date.now(),
      name: `${provider}-user`,
      email: `${provider}-${Date.now()}@example.com`,
      plan: 'Free',
      role: 'user',
    };
    const nextUsers = [...users, pseudo];
    persistUsers(nextUsers);
    persistSession(pseudo);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    DATA_KEYS.forEach((k) => localStorage.removeItem(k));
    setUser(null);
    // Reset app state on logout
    window.location.href = '/';
  };

  const updateProfile = async (updates) => {
    await delay();
    if (!user) throw new Error('Chưa đăng nhập');
    if (updates.email) {
      const normalizedEmail = updates.email.trim().toLowerCase();
      const exists = users.find((u) => u.email === normalizedEmail && u.id !== user.id);
      if (exists) throw new Error('Email đã được sử dụng.');
      updates.email = normalizedEmail;
    }
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === user.id ? { ...u, ...updates } : u));
      persistUsers(next);
      const updated = next.find((u) => u.id === user.id);
      persistSession({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        plan: updated.plan,
        role: updated.role,
        gender: updated.gender,
        birthDate: updated.birthDate,
      });
      return next;
    });
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    await delay();
    if (!user) throw new Error('Chưa đăng nhập');
    const match = users.find((u) => u.id === user.id);
    if (!match || match.password !== currentPassword) throw new Error('Mật khẩu hiện tại không đúng.');
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === user.id ? { ...u, password: newPassword } : u));
      persistUsers(next);
      return next;
    });
  };

  const setUserPlan = (userId, plan) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, plan } : u));
      persistUsers(next);
      if (user?.id === userId) {
        persistSession({ ...user, plan });
      }
      return next;
    });
  };

  const deleteUser = (userId) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      persistUsers(next);
      if (user?.id === userId) {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      }
      return next;
    });
  };

  const value = useMemo(
    () => ({
      user,
      isOpen,
      mode,
      openAuth,
      closeAuth,
      login,
      register,
      socialLogin,
      logout,
      setMode,
      users,
      setUserPlan,
      deleteUser,
      updateProfile,
      changePassword,
    }),
    [user, isOpen, mode, users],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
