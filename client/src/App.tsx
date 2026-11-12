import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {Navbar} from './components/common/Navbar';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import RoleBenchmarks from './pages/CareerResearch';
import GapAnalysis from './pages/GapAnalysis';
import Roadmap from './pages/Roadmap';
import MockInterview from './pages/MockInterview';

export default function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-main">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/benchmarks" element={<RoleBenchmarks />} />
        <Route path="/analysis" element={<GapAnalysis />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/interview" element={<MockInterview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
