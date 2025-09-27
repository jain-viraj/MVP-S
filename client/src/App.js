import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Timetables from './pages/Timetables/Timetables';
import TimetableDetail from './pages/Timetables/TimetableDetail';
import CreateTimetable from './pages/Timetables/CreateTimetable';
import Classrooms from './pages/Classrooms/Classrooms';
import Subjects from './pages/Subjects/Subjects';
import Faculties from './pages/Faculties/Faculties';
import Students from './pages/Students/Students';
import Profile from './pages/Profile/Profile';
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timetables" element={<Timetables />} />
        <Route path="/timetables/create" element={<CreateTimetable />} />
        <Route path="/timetables/:id" element={<TimetableDetail />} />
        <Route path="/classrooms" element={<Classrooms />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/faculties" element={<Faculties />} />
        <Route path="/students" element={<Students />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
