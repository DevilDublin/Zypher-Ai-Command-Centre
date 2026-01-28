import { Link } from "react-router-dom";

export default function NeonNav() {
  return (
    <nav className="neon-nav">
      <Link to="/" className="nav-logo">ZYPHER</Link>

      <div className="nav-links">
        <Link to="/about">ABOUT</Link>
        <Link to="/architecture">APEX</Link>
        <Link to="/agents">AGENTS</Link>
        <Link to="/pricing">PRICING</Link>
        <Link to="/contact">CONTACT</Link>
      </div>
    </nav>
  );
}