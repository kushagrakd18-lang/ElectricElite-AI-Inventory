import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ContentAI from './pages/ContentAI';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import DataManager from './pages/DataManager';
import LoginModal from './components/LoginModal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('electric_elite_auth') === 'true'
  );

  if (!isAuthenticated) {
    return <LoginModal onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-bg-primary text-text-primary flex">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main View Area */}
        <div className="flex-1 pl-64 min-h-screen flex flex-col transition-all duration-300">
          {/* Sticky Header */}
          <Header />

          {/* Scrolling View Surface */}
          <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/ai-tools" element={<ContentAI />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/data-manager" element={<DataManager />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
