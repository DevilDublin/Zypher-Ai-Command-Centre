import { useState, useEffect, useRef } from "react";
import "./developerLogin.css";

export default function DeveloperLogin() {
  const canvasRef = useRef(null);
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState(false);

  const [placeholder, setPlaceholder] = useState("");
  const fullText = "ENTER PASSKEY";
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (passkey.length > 0) return;

    let i = 0;
    const interval = setInterval(() => {
      setPlaceholder(fullText.slice(0, i) + "▍");
      i++;
      if (i > fullText.length) {
        setPlaceholder(fullText);
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);


  // === MATRIX / HIEROGLYPH RAIN ===
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "𓂀𓁶𓆣𓋹𓍿𓊹ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      const speedBoost = passkey.length > 0 ? 1.6 : 1;
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ffff";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speedBoost;
      }
    };

    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const submit = async () => {
    setError(false);
    try {
      const res = await fetch("/.netlify/functions/dev-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey })
      });
      const data = await res.json();
      if (data.ok) window.location.href = "/dev";
      else setError(true);
    } catch {
      setError(true);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="matrix-canvas" />

      <div className="dev-login-overlay">
        <button
          className="close-btn"
          onClick={() => (window.location.href = "/")}
        >
          ✕
        </button>

        <div className="dev-login-card">
          <h1>ZYPHER</h1>
          <span className="subtitle">Developer Terminal</span>

          <input
            type="password"
            placeholder={placeholder}
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
          />

          {error && <div className="error">ACCESS DENIED</div>}

          <button className="enter-btn" onClick={submit}>
            ENTER
          </button>
        </div>
      </div>
    </>
  );
}
