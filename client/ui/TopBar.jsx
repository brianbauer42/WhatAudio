import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function TopBar() {
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <header className="topbar">
      <Link to="/" className="wordmark">
        What<span>Audio</span>
      </Link>
      <nav className="nav">
        {isLoggedIn && <NavLink to="/share">Share</NavLink>}
        <NavLink to="/contact">Contact</NavLink>
        {isLoggedIn ? (
          <>
            <span className="user">{user.displayName}</span>
            <button type="button" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
