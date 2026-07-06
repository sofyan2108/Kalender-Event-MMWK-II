import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.hide().catch(err => console.error("Error hiding status bar", err));
    }
  }, []);

  return (
    <AuthProvider>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{ 
          duration: 2500 
        }}
        containerStyle={{
          top: 'calc(env(safe-area-inset-top, 20px) + 10px)'
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
