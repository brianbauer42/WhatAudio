import { NavLink } from 'react-router-dom';

export default function MenuSlider(props) {
  const closeMenu = () => props.toggleMenu();
  const logout = () => {
    props.handleLogout();
    props.toggleMenu();
  };

  return (
    <div className={props.showMenu ? 'menuContainer menuShow' : 'menuContainer menuHide'}>
      <i
        className="fa fa-times fa-lg colorClick closeMenuButton"
        onClick={closeMenu}
      />

      {props.isLoggedIn() ? (
        <div className="menuContent">
          <NavLink className="colorClick" to="/" onClick={closeMenu}>Playlist</NavLink>
          <br />
          <NavLink className="colorClick" to="/admin" onClick={closeMenu}>Admin Panel</NavLink>
          <br />
          <NavLink className="colorClick" to="/contact" onClick={closeMenu}>Contact</NavLink>
          <br />
          <NavLink className="colorClick" to="/" onClick={logout}>Logout</NavLink>
        </div>
      ) : (
        <div className="menuContent">
          <NavLink className="colorClick" to="/" onClick={closeMenu}>Playlist</NavLink>
          <br />
          <NavLink className="colorClick" to="/contact" onClick={closeMenu}>Contact</NavLink>
          <br />
          <NavLink className="colorClick" to="/register" onClick={closeMenu}>Register</NavLink>
          <br />
          <NavLink className="colorClick" to="/login" onClick={closeMenu}>Login</NavLink>
        </div>
      )}
    </div>
  );
}
