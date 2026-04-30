import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('etharaai_token');
      if (token) {
        try {
          // Verify token and get fresh user data
          const res = await api.get('/users/me');
          setUser(res.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('etharaai_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('etharaai_token', res.data.token);
    const userData = res.data.user;
    if (userData && userData.id && !userData._id) {
      userData._id = userData.id;
    }
    setUser(userData);
    return res.data;
  };

  const signup = async (name, email, password, role, adminSecret) => {
    const res = await api.post('/auth/signup', { name, email, password, role, adminSecret });
    localStorage.setItem('etharaai_token', res.data.token);
    const userData = res.data.user;
    if (userData && userData.id && !userData._id) {
      userData._id = userData.id;
    }
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('etharaai_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
