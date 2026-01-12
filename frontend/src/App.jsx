import { useState, useEffect, useRef } from 'react'
import { useAnalytics } from "./lib/useAnalytics";
import { socket } from "./lib/socket";

export default function App() {

  const analytics = useAnalytics();

  
  const [isOnline, setIsOnline] = useState(false);
  const [mode, setMode] = useState("TEST");

  const handleStartCall = () => {
    socket.emit("call_start", { mode });
    addNotification("Call started (" + mode + ")");
  };

  const handleStopCall = () => {
    socket.emit("call_stop");
    addNotification("Call stopped");
  };

const [notifications, setNotifications] = useState([]);

  const [transcript, setTranscript] = useState([]);
  const [flow, setFlow] = useState([]);


  const addNotification = (text) => {
    const id = Date.now() + Math.random();

    // Insert at top, keep max 3
    setNotifications(n => [{ id, text, dying: false }, ...n].slice(0, 3));

    // After 3s start fade
    setTimeout(() => {
      setNotifications(n =>
        n.map(m => m.id === id ? { ...m, dying: true } : m)
      );
    }, 3000);

    // After fade remove
    setTimeout(() => {
      setNotifications(n => n.filter(m => m.id !== id));
    }, 3400);
  };

    useEffect(() => {
      const onConnect = () => setIsOnline(true);
      const onDisconnect = () => setIsOnline(false);
      const onNotify = (msg) => addNotification(msg);
      const onUser = t => setTranscript(x => [...x, { role: "user", text: t }]);
      const onAssistant = t => setTranscript(x => [...x, { role: "assistant", text: t }]);
      const onFlow = e => setFlow(x => [...x.slice(-20), e]);

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("notify", onNotify);
      socket.on("transcript:user", onUser);
      socket.on("transcript:assistant", onAssistant);
      socket.on("flow:event", onFlow);

      if (socket.connected) setIsOnline(true);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("notify", onNotify);
        socket.off("transcript:user", onUser);
        socket.off("transcript:assistant", onAssistant);
        socket.off("flow:event", onFlow);
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
          {transcript.length === 0 ? "Waiting for call…" : transcript.map((m,i)=>(<div key={i}><b>{m.role}:</b> {m.text}</div>))}
        </div>

        <div className="panel">
          <h2>Niche Selector</h2>

          
<div className="inner-glass" style={{ position: "relative", overflow: "hidden" }}>


    {/* RADAR LANES */}
    <div className="radar-lanes">
      {[
        ["default","real_estate","dental"],
        ["solar","car_insurance","gym"],
        ["plumbing","legal","ecommerce"]
      ,
          ["cold_calling"]
        ].map((lane, i) => (
        <div key={i.text} className="radar-lane">
          <div className="radar-track">
            {lane.map(n => (
              <button
                key={n.text}
                className="btn primary radar-niche"
                onClick={() => socket.emit("niche:select", n)}
              >
                {n.replace("_"," ")}
              </button>
            ))}
            {lane.map(n => (
              <button
                key={n + "-dup"}
                className="btn primary radar-niche"
                onClick={() => socket.emit("niche:select", n)}
              >
                {n.replace("_"," ")}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  {/* DIRECTION DOCK */}
  <div style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    gap: "12px",
    padding: "14px",
    background: "linear-gradient(to top, rgba(20,0,40,0.9), rgba(20,0,40,0))"
  }}>
    <button className="btn toggle" style={{ flex: 1 }} onClick={() => socket.emit("niche:direction", "inbound")}>INBOUND</button>
    <button className="btn toggle mode-campaign" style={{ flex: 1 }} onClick={() => socket.emit("niche:direction", "outbound")}>OUTBOUND</button>
  </div>

</div>

        </div>

        <div className="panel panel-notifications">
          <h2>Notifications</h2>
          {notifications.length === 0 ? (
            <p><span className="zy-glowText">System ready.</span></p>
          ) : (
            notifications.map((msg) => (
  <p key={msg.id} className={`notification-item ${msg.dying ? "dying" : ""}`}><span className="zy-glowText">{msg.text}</span></p>
            ))
          )}
        </div>

          <div className="panel panel-small">
            <h2>Call Flow</h2>
            <div className="inner-glass">
                {flow.length === 0
                  ? "Waiting…"
                  : flow.map((e, i) => <div key={i}>• {e}</div>)}
              </div>
          </div>

          <div className="panel panel-small">
            <h2>Lead Stats</h2>
            <div className="inner-glass"></div>
          </div>
      </div>
    </div>
  )
}