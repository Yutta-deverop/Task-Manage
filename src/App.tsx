import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TaskCore } from './pages/TaskCore';
import { CalendarView } from './pages/CalendarView';
import { FocusTimer } from './pages/FocusTimer';
import { MatrixAnalyzer } from './pages/MatrixAnalyzer';
import { LogArchiver } from './pages/LogArchiver';
import { Settings } from './pages/Settings';

export default function App() {
  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TaskCore />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/focus" element={<FocusTimer />} />
          <Route path="/matrix" element={<MatrixAnalyzer />} />
          <Route path="/archive" element={<LogArchiver />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}
