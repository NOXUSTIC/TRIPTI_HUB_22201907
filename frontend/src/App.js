import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import MonthConfiguration from './components/MonthConfiguration';
import ResetMonthsCaptcha from './components/ResetMonthsCaptcha';

function App() {
  useEffect(() => {
    const handleError = (event) => {
      if (event.message === 'ResizeObserver loop completed with undelivered notifications.') {
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="/admin-portal" element={<AdminPortal />} />
        <Route path="/month-configuration" element={<MonthConfiguration />} />
        <Route path="/reset-months-captcha" element={<ResetMonthsCaptcha />} />
      </Routes>
    </Router>
  );
}

export default App;
