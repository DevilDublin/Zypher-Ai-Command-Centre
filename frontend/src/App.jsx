import { useState, useEffect } from 'react'
import { useAnalytics } from "./lib/useAnalytics";
import { socket } from "./lib/socket";

export default function App() {

  const analytics = useAnalytics();

  const [isOnline, setIsOnline] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const handleStartCall = () => {
    socket.emit("call_start", { mode });
  };

  const handleStopCall = () => {
    socket.emit("call_stop");
  };

  const [mode, setMode] = useState("TEST");

  useEffect(() => {
    const onConnect = () => setIsOnline(true);
    const onDisconnect = () => setIsOnline(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    
    const onNotify = (msg) => {
      setNotifications(prev => [...prev, msg]);
    };
    socket.on("notify", onNotify);


    if (socket.connected) setIsOnline(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("notify", onNotify);
    };
  }, []);

  const total = analytics?.total ?? 0;
  const processed = analytics?.processed ?? 0;
  const remaining = analytics?.remaining ?? 0;
  return (
    <div className="app">
      <header className="header">
        <h1>ZYPHER COMMAND CENTRE</h1>
        <span className={`status `}>{isOnline ? "ONLINE" : "OFFLINE"}</span>
      </header>

      <div className="grid">
        <div className="panel">
          <h2>System Control</h2>
          <div className="controls">
            <button className="btn primary" onClick={handleStartCall}>START CALL</button>
            <button className="btn danger" onClick={handleStopCall}>STOP</button>
            <button className={`btn toggle ${mode === "CAMPAIGN" ? "mode-campaign" : "mode-test"}`} onClick={() => { const next = mode === "TEST" ? "CAMPAIGN" : "TEST"; setMode(next); socket.emit("mode:update", next); }}>MODE: {mode}</button>
          </div>
        </div>

        <div className="panel">
          <h2>Campaign Analytics</h2>
          <p><span className="zy-glowText">Total Calls: {total}</span></p>
          <p><span className="zy-glowText">Processed: {processed}</span></p>
          <p><span className="zy-glowText">Remaining: {remaining}</span></p>
        </div>

        <div className="panel">
          <h2>System Status</h2>
          <p><span data-system-status className="zy-glowText">Backend: {isOnline ? "Connected" : "Disconnected"}</span></p>
          <p><span className="zy-glowText">Mode: TEST</span></p>
        </div>

        <div className="panel">
          <h2>Live Transcript</h2>
          <div className="inner-glass">Waiting for call…</div>
        </div>

        <div className="panel">
          <h2>Niche Selector</h2>
          <div className="inner-glass" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

            <div style={{ overflowY: "auto", maxHeight: "260px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {["default","real_estate","dental","solar","car_insurance","gym","plumbing","legal","ecommerce"].map(n => (
                <button
                  key={n}
                  className="btn primary"
                  style={{ textTransform: "capitalize" }}
                  onClick={() => socket.emit("niche:select", n)}
                >
                  {n.replace("_"," ")}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
              <button className="btn toggle" onClick={() => socket.emit("niche:direction", "inbound")}>INBOUND</button>
              <button className="btn toggle mode-campaign" onClick={() => socket.emit("niche:direction", "outbound")}>OUTBOUND</button>
            </div>

          </div>
        </div>

        <div className="panel panel-notifications">
          <h2>Notifications</h2>
          {notifications.length === 0 ? (
            <p><span className="zy-glowText">System ready.</span></p>
          ) : (
            notifications.map((msg, i) => (
              <p key={i}><span className="zy-glowText">{msg}</span></p>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
