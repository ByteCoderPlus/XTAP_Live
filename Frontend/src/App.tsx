import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import BenchDirectory from './pages/BenchDirectory';
import Requirements from './pages/Requirements';
import Matching from './pages/Matching';
import Dashboard from './pages/Dashboard';
import InterviewTracker from './pages/InterviewTracker';
import SoftBlockManager from './pages/SoftBlockManager';
import WeeklyATP from './pages/WeeklyATP';
import ResourceDetail from './pages/ResourceDetail';
import RequirementDetail from './pages/RequirementDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Navigate to="/dashboard" replace /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/bench" element={<Layout><BenchDirectory /></Layout>} />
        <Route path="/resource/:id" element={<Layout><ResourceDetail /></Layout>} />
        <Route path="/requirements" element={<Layout><Requirements /></Layout>} />
        <Route path="/requirement/:id" element={<Layout><RequirementDetail /></Layout>} />
        <Route path="/matching" element={<Layout><Matching /></Layout>} />
        <Route path="/interviews" element={<Layout><InterviewTracker /></Layout>} />
        <Route path="/soft-blocks" element={<Layout><SoftBlockManager /></Layout>} />
        <Route path="/weekly-atp" element={<Layout><WeeklyATP /></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
