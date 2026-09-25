import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (path, body) => {
    const d = await api(path, { method: 'POST', body });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const value = {
    user,
    loading,
    login: (email, password) => authenticate('/auth/login', { email, password }),
    register: (form) => api('/auth/register', { method: 'POST', body: form }),
    verifyEmail: (email, code) => authenticate('/auth/verify-email', { email, code }),
    resendOtp: (email) => api('/auth/resend-otp', { method: 'POST', body: { email } }),
    logout: () => { setToken(null); setUser(null); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
