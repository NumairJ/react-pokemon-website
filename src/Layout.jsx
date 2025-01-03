import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <nav>
        <ul className="nav justify-content-center">
          <li className="nav-item">
            <Link className="nav-link" to="/">Master Pokedex</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/Team-Builder">Pokemon Team Builder</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
};

export default Layout;
