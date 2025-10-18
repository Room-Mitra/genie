import { useNavigate } from 'react-router-dom';
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? { token } : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const delay = 10 * 60 * 1000; // 10 minutes
    let tokenExpiryChecker = setInterval(() => {
      const token = localStorage.getItem('token');
      try {
        const decodedToken = jwtDecode(token);
        const expirationTime = decodedToken.exp;

        // Convert Unix timestamp to a Date object
        const expirationDate = new Date(expirationTime * 1000); // Multiply by 1000 to convert seconds to milliseconds

        if (expirationDate < new Date()) {
          logout();
          navigate('/logout');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }, delay);
    return () => {
      clearInterval(tokenExpiryChecker);
    };
  }, [navigate]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setAuth({ token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hotelId');
    localStorage.removeItem('username');
    setAuth(null);
  };

  const isAuthenticated = !!auth?.token;

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
