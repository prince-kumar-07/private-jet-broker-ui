import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import ColdStart from './components/ColdStart';
import { wakeServer } from './lib/server';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/Toast';
import { Layout, RequireAuth } from './components/Layout';
import Home from './pages/Home';
import Fleet from './pages/Fleet';
import { Login, Register, VerifyEmail } from './pages/Auth';
import NewRequest from './pages/NewRequest';
import Contact from './pages/Contact';
import MyRequests from './pages/MyRequests';
import { AdminDashboard, AdminRequest } from './pages/Admin';

const NotFound = () => (
  <div className="grid min-h-screen place-items-center text-center">
    <div><h1 className="gold-text font-display text-7xl">404</h1><p className="mt-3 text-white/60">This destination is off the map.</p><Link to="/" className="btn-gold mt-8">Back home</Link></div>
  </div>
);

export default function App() {
  useEffect(() => { wakeServer(); }, []);
  return (
    <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="request" element={<NewRequest />} />
            <Route path="contact" element={<Contact />} />
            <Route path="my-requests" element={<RequireAuth role="user"><MyRequests /></RequireAuth>} />
            <Route path="admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
            <Route path="admin/requests/:id" element={<RequireAuth role="admin"><AdminRequest /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
      </ToastProvider>
      <ColdStart />
    </BrowserRouter>
    </MotionConfig>
  );
}
