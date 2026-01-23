import { Link } from "react-router-dom";

export default function NeonNav() {
  return (
    <nav className="neon-nav">
      <div className="nav-logo">ZYPHER</div>

      <div className="nav-links">
        <Link to="/about">ABOUT</Link>
        <Link to="/architecture">ARCHITECTURE</Link>
        <Link to="/agents">AGENTS</Link>
        <Link to="/pricing">PRICING</Link>
        <Link to="/contact">CONTACT</Link>
      </div>
    </nav>
  );
}