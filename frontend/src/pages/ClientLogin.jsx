import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./clientLogin.css";

export default function ClientLogin() {
  window.__ZYPHER_THEME__ = "client";

  useEffect(() => {
    document.body.classList.add("zy-auth-enter", "zy-client-auth");
    return () => document.body.classList.remove("zy-auth-enter", "zy-client-auth");
  }, []);

  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const location = useLocation();
  const isDev = location.pathname === "/dev";

  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState(false);
  const [showPass, setShowPass] = useState(false);

  /* ===== MATRIX BACKGROUND ===== */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
      console.log("CLIENT CANVAS SIZE:", canvas.width, canvas.height);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
      ctx.fillStyle = "rgba(0,255,255,0.35)";
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ===== SUBMIT ===== */
  
  const submit = async () => {
    setError(false);

    // DEV MODE — force client auth
    if (["localhost", "www.zypheragents.com", "zypheragents.com"].includes(window.location.hostname)) {
      localStorage.setItem("zy_client_authed", "1");
      navigate("/dashboard");
      return;
    }

    setError(true);
  };


  return (
    <>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} className="matrix-canvas" />

      <div className="dev-login-overlay client-auth">
        <button className="dev-login-close" aria-label="Close" onClick={() => navigate("/")}>×</button>
<div className="dev-login-card">
          <h1>ZYPHER</h1>
          <span className="subtitle">Client Access</span>

          <div className="pass-wrapper">
            <input
              type={showPass ? "text" : "password"}
              placeholder="ENTER PASSKEY"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
            />
            <span className="pass-eye" onClick={() => setShowPass(v => !v)}>
              {showPass ? "◉" : "◎"}
            </span>
          </div>
          {error && <div className="error">ACCESS DENIED</div>}

          <button className="enter-btn" onClick={submit}>
            ENTER
          </button>
        </div>
      </div>
    </>
  );
}