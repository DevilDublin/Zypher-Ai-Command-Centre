import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./developerLogin.css";

export default function DeveloperLogin() {
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    const res = await fetch("/auth/dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });

    if (res.ok) {
      navigate("/dev");
    } else {
      setError(true);
    }
  };

  return (
    
<div className="zypher-auth-overlay">
  <div className="zypher-auth-panel">
 className="dev-login-screen fade-in">
      <div className="dev-login-card">
        <h1>DEVELOPER TERMINAL</h1>

        <input
          type="password"
          placeholder="Enter access key"
          value={key}
          onChange={e => setKey(e.target.value)}
        />

        {error && <div className="error">ACCESS DENIED</div></div>}

        <button onClick={submit}>ENTER</button>
      </div>
    </div>
  );
}
