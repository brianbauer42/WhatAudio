import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './state/AuthContext.jsx';
import { PlayerProvider } from './state/PlayerContext.jsx';
import TopBar from './ui/TopBar.jsx';
import PlayerBar from './ui/PlayerBar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Share from './pages/Share.jsx';
import Contact from './pages/Contact.jsx';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/share" element={<Share />} />
          <Route path="/admin" element={<Navigate to="/share" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <PlayerBar />
      </PlayerProvider>
    </AuthProvider>
  );
}
