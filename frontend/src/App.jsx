import './App.css';
import 'remixicon/fonts/remixicon.css'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StaffDashboard from './components/StaffDashboard';
import ResetPassword from './components/ResetPassword.jsx';

// Routes ke andar:



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/reset" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
