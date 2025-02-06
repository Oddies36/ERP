import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/authentication/login';
import './App.css';
import NewUser from './pages/authentication/newUser';
import Homepage from './pages/homepage/homepage';
import ProtectedRoute from './components/protectedRoutes';
import ClientList from './pages/clients/clientList';
import NewClient from './pages/clients/newClient';
import ArticleList from './pages/articles/articleList';
import NewArticle from './pages/articles/newArticle';
import FactureList from './pages/factures/factureList';
import NewFacture from './pages/factures/newFacture';
import EditFacture from './pages/factures/editFacture';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/creation-user" element={<NewUser />} />
        <Route path="/home" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
        <Route path="/clients/nouveau" element={<ProtectedRoute><NewClient /></ProtectedRoute>} />
        <Route path="/articles" element={<ProtectedRoute><ArticleList /></ProtectedRoute>} />
        <Route path="/articles/nouveau" element={<ProtectedRoute><NewArticle /></ProtectedRoute>} />
        <Route path="/factures" element={<ProtectedRoute><FactureList /></ProtectedRoute>} />
        <Route path="/factures/nouveau" element={<ProtectedRoute><NewFacture /></ProtectedRoute>} />
        <Route path="/factures/:numeroFacture/:clientID" element={<ProtectedRoute><EditFacture /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;