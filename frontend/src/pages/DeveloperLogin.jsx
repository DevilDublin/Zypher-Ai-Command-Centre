import { useState } from "react";
import "./developerLogin.css";

export default function DeveloperLogin() {
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState(false);

  const submit = async () => {
    setError(false);

    const res = await fetch("/.netlify/functions/dev-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey })
    });

    const data = await res.json();

    if (data.ok === true) {
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
          value={passkey}
          onChange={e => setPasskey(e.target.value)}
        />

        {error && <div className="error">ACCESS DENIED</div>}

        <button onClick={submit}>ENTER</button>
      </div>
    </div>
  );
}
