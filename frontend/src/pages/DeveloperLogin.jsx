import { useState } from "react";
import "./developerLogin.css";

export default function DeveloperLogin() {
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);

  const submit = async () => {
    const res = await fetch("/api/dev-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });

    if (res.ok) {
      window.location.href = "/dev";
    } else {
      setError(true);
    }
  };

  return (
    <div className="dev-login-overlay">
      <div className="dev-login-card">
        <h1>ZYPHER</h1>
        <p>Developer Terminal</p>

        <input
          type="password"
          placeholder="Enter passkey"
          value={key}
          onChange={e => setKey(e.target.value)}
        />

        {error && <div className="error">ACCESS DENIED</div>}

        <button onClick={submit}>ENTER</button>
      </div>
    </div>
  );
}
