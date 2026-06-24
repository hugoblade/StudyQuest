import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, User, Award, LayoutDashboard, BookOpen, Trophy } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Brain size={28} color="#F59E0B" />
        <span>StudyQuest</span>
      </div>
      <div className="nav-links">
        <Link to="/"><LayoutDashboard size={20} /> Dashboard</Link>
        <Link to="/quiz"><BookOpen size={20} /> Quiz</Link>
        <Link to="/study-logger"><BookOpen size={20} /> Study Logger</Link>
        <Link to="/leaderboard"><Trophy size={20} /> Leaderboard</Link>
        <Link to="/profile"><User size={20} /> Profile</Link>
        {currentUser?.isAdmin && <Link to="/admin"><Award size={20} /> Admin</Link>}
        <button onClick={handleLogout} className="logout-btn"><LogOut size={20} /> Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;