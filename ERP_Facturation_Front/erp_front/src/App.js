import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/authentication/login';
import './App.css';
import NewUser from './pages/authentication/newUser';
import Homepage from './pages/homepage/homepage';
import ProtectedRoute from './components/protectedRoutes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/creation-user" element={<NewUser />} />
        <Route path="/home" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;