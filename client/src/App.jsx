import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import AdminDashboard from './pages/AdminDashboard'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to="/admin-dashboard" replace />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;