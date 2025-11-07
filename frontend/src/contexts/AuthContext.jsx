import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Simple JWT decoder (client-side only, no verification)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage on mount
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        const identity = decoded.identity || decoded.sub || {};
        setUser({
          email: identity.email || decoded.email,
          role: identity.role || decoded.role,
        });
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = decodeJWT(token);
    if (decoded) {
      const identity = decoded.identity || decoded.sub || {};
      setUser({
        email: identity.email || decoded.email,
        role: identity.role || decoded.role,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    // Only send token if it's valid (can be decoded)
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        // Check if token is expired
        const exp = decoded.exp;
        if (exp && exp * 1000 > Date.now()) {
          return { Authorization: `Bearer ${token}` };
        } else {
          // Token expired, remove it
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        // Invalid token, remove it
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    return {};
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

