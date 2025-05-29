import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const isFormData = data instanceof FormData;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      if (isFormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
      const res = await axios.put('/api/auth/me', data, config);
      setUser(res.data);
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => logout());
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);