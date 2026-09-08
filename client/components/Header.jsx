import SearchBox from './SearchBox.jsx';

export default function Header(props) {
  return (
    <div className="headerContainer">
      <h1
        className="openMenuButton colorClick"
        onClick={(event) => {
          event.preventDefault();
          props.toggleMenu();
        }}
      >
        ☰
      </h1>
      <div className="bannerContainer">
        <h1 className="banner">∞</h1>
      </div>
      <SearchBox setPosts={props.setPosts} />
    </div>
  );
}
