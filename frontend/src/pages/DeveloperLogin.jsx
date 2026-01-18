import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./developerLogin.css";

export default function DeveloperLogin() {

  useEffect(() => {
    document.body.classList.add("zy-auth-enter");
    return () => document.body.classList.remove("zy-auth-enter");
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
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
      ctx.fillStyle = "#ff3c3c";
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

    if (window.location.port === "5173") {
      navigate("/dev");
      return;
    }

    try {
      const res = await fetch("/.netlify/functions/dev-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey })
      });
      const data = await res.json();
      if (data.ok) navigate("/dev");
      else setError(true);
    } catch {
      setError(true);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} className="matrix-canvas" />

      <div className="dev-login-overlay">
        <button className="dev-login-close" aria-label="Close" onClick={() => navigate("/")}>×</button>
<div className="dev-login-card">
          <h1>ZYPHER</h1>
          <span className="subtitle">Developer Terminal</span>

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