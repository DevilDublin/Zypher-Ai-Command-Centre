import { useState, useEffect, useRef } from 'react'
import { useAnalytics } from "./lib/useAnalytics";
import { socket } from "./lib/socket";
import { socketState } from "./lib/socketStore";

export default function App() {

  const analytics = useAnalytics();

  
  const [isOnline, setIsOnline] = useState(false);
  const [mode, setMode] = useState("TEST");

  
  const [injectorOpen, setInjectorOpen] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [injector, setInjector] = useState({
    clientName: "",
    phone: "",
    email: "",
    company: "",
    twilioSid: "",
    twilioToken: "",
    twilioFrom: "",
    openaiKey: "",
    calendarEmail: "",
    mode: "TEST",
    niche: "",
    direction: "inbound",
    skin: "default",
    customPrompt: ""
  });

const handleStartCall = () => {
console.log("📤 FRONTEND EMIT call_start", { mode });
    socket.emit("call_start", {
  mode,
  niche: "campaign_calling",
  direction: "outbound"
});
    addNotification("Call started (" + mode + ")");
  };

  const handleStopCall = () => {
    socket.emit("call_stop");
    addNotification("Call stopped");
  };

const [notifications, setNotifications] = useState([]);

  const [transcript, setTranscript] = useState([]);
  const [flow, setFlow] = useState([]);
  const [leadPipeline, setLeadPipeline] = useState({});
  const campaignStartRef = useRef(null);


  
  async function deployAgent() {
    try {
      setDeployResult(null);

      const res = await if (!BACKEND_URL) return;

fetch(`${BACKEND_URL}/provision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-env": mode
        },
        body: JSON.stringify({
          clientName: injector.clientName,
          company: injector.company,
          email: injector.email,
          phone: injector.phone,
          niche: injector.niche,
          skin: injector.skin,
          direction: injector.direction
        })
      });

      const data = await res.json();
      if (!data.ok) throw new Error("Provision failed");

      setDeployResult(data);
      addNotification("Client provisioned: " + data.clientId);
    } catch (e) {
      console.error(e);
      addNotification("Provision failed");
    }
  }
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
      
const onFlow = e => {
        console.debug("[flow:event]", e);
  setFlow(x => {
  const id = Date.now() + Math.random();
  const item = { ...e, __id: id };

  // add new
  const next = [...x.slice(-12), item];

  // auto-expire
  setTimeout(() => {
    setFlow(y => y.filter(v => v.__id !== id));
  }, 6500);

  return next;
});

  if (!e?.lead?.phone) return;

  setLeadPipeline(p => {
    const phone = e.lead.phone;
    const cur = p[phone] || { new: true, contacted: false, qualified: false, booked: false };

    if (e.event === "transcript:user") cur.contacted = true;
    if (e.event === "AI_PREDICTION" && e.confidence > 0.6) cur.qualified = true;
    if (e.event === "submit_lead") cur.booked = true;

    return { ...p, [phone]: cur };
  });
};


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
  const now = Date.now();
  const elapsedMs = campaignStartRef.current ? (now - campaignStartRef.current) : 0;
  const elapsedMinutes = elapsedMs > 0 ? (elapsedMs / 60000) : 0;
  const burnRate = elapsedMinutes > 0 ? (processed / elapsedMinutes) : 0;
  const etaMinutes = burnRate > 0 ? (remaining / burnRate) : 0;
  const leads = Object.values(leadPipeline);
    const countNew = socketState.pipeline.new;
    const countContacted = socketState.pipeline.contacted;
    const countQualified = socketState.pipeline.qualified;
    const countBooked = socketState.pipeline.booked;

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
            <button className={`btn toggle ${mode === "CAMPAIGN" ? "mode-campaign" : "mode-test"}`} onClick={() => {
                const next = mode === "TEST" ? "CAMPAIGN" : "TEST";
                setMode(next);
                socket.emit("mode:update", next);
                if (next === "CAMPAIGN") {
                  campaignStartRef.current = Date.now();
                } else {
                  campaignStartRef.current = null;
                }
              }}>MODE: {mode}</button>
          </div>


        </div>

          <div className="panel campaign-autopilot">
            <h2>Campaign Autopilot</h2>
            <div className="inner-glass autopilot">
              <div className="autopilot-metric">
                <span>Burn Rate</span>
                <strong>{burnRate.toFixed(1)} / min</strong>
              </div>

              <div className="autopilot-metric">
                <span>ETA</span>
                <strong>{etaMinutes > 0 ? Math.round(etaMinutes) : "—"} min</strong>
              </div>

              <div className="autopilot-state">
                {isOnline ? (flow.length > 0 ? "Campaign running" : "System idle") : "Backend offline"}
              </div>

              <div className="autopilot-advice">
                {!isOnline ? "Reconnect backend before launching." : mode === "TEST" ? "Switch to CAMPAIGN to burn real leads." : flow.length === 0 ? "Press START CALL to begin." : "Campaign healthy — Zypher is operating."}
              </div>
            </div>
          </div>

        <div className="panel panel-system-status">
            <h2>System Status</h2>
          <p><span data-system-status className="zy-glowText">Backend: {isOnline ? "Connected" : "Disconnected"}</span></p>
          <p><span className="zy-glowText">Mode: TEST</span></p>
        </div>

        <div className="panel neural-core">
          <h2>Neural Core</h2>

          <div className="neural-status">
            <span>ZYPHER CORE</span>
            <span className={isOnline ? "online" : "offline"}>
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          <div className="neural-topology">
            <div className="node core"></div>

            <div className="node n1"></div>
            <div className="node n2"></div>
            <div className="node n3"></div>
            <div className="node n4"></div>
            <div className="node n5"></div>
            <div className="node n6"></div>

            <div className="link l1"></div>
            <div className="link l2"></div>
            <div className="link l3"></div>
            <div className="link l4"></div>
            <div className="link l5"></div>
            <div className="link l6"></div>
          </div>

          <div className="neural-console">
            <div>VOICE ENGINE: {isOnline ? "ACTIVE" : "IDLE"}</div>
            <div>NEURAL FLOW: STABLE</div>
            <div>SIGNAL: CLEAN</div>
          </div>
        </div>

        <div className="panel">
          <h2>Niche Selector</h2>

          
<div className="inner-glass" style={{ position: "relative", overflow: "hidden" }}>


    {/* RADAR LANES */}
    <div className="radar-lanes">
      {[
  { type: "scroll", items: ["real_estate","dental","cold_calling"] },
  { type: "scroll", items: ["solar","car_insurance","gym","plumbing","legal","ecommerce"] },
  { type: "static", items: ["default"] }
].map((lane, i) => (
        <div key={i} className={`radar-lane ${lane.type === "static" ? "radar-static" : ""}`}>
          <div className="radar-track">
            {lane.items.map(n => (
              <button
                key={n}
                className="btn primary radar-niche"
                onClick={() => socket.emit("niche:select", n)}
              >
                {n.replace(/_/g," ")}
              </button>
            ))}
            {lane.type === "scroll" && lane.items.map(n => (
              <button
                key={n + "-dup"}
                className="btn primary radar-niche"
                onClick={() => socket.emit("niche:select", n)}
              >
                {n.replace(/_/g," ")}
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
            <div className="inner-glass callflow-console">
                {flow.length === 0
                  ? <div className="callflow-empty"><span className="zy-glowText waiting">Waiting…</span></div>
                  : flow.map((e, i) => (
  <div key={i} className="callflow-line">
    <span className="zy-glowText">{e.event || String(e)}</span>
  </div>
))}
              </div>
          </div>

          <div className="panel panel-small">
            <h2>Lead Pipeline</h2>
            
<div className="inner-glass lead-pipeline">
  <div className="pipeline-row">
    <span>New <span className='pipeline-metric'>{countNew} (100.00%)</span></span>
    <div className="bar"><div style={{ width: `${countNew ? (countNew / countNew) * 100 : 0}%` }}></div></div>
  </div>
  <div className="pipeline-row">
    <span>Contacted <span className='pipeline-metric'>{countContacted} ({(countContacted / Math.max(countNew,1) * 100).toFixed(2)}%)</span></span>
    <div className="bar"><div style={{ width: `${countContacted / Math.max(countNew,1) * 100}%` }}></div></div>
  </div>
  <div className="pipeline-row">
    <span>Qualified <span className='pipeline-metric'>{countQualified} ({(countQualified / Math.max(countNew,1) * 100).toFixed(2)}%)</span></span>
    <div className="bar"><div style={{ width: `${countQualified / Math.max(countNew,1) * 100}%` }}></div></div>
  </div>
  <div className="pipeline-row">
    <span>Booked <span className='pipeline-metric'>{countBooked} ({(countBooked / Math.max(countNew,1) * 100).toFixed(2)}%)</span></span>
    <div className="bar"><div style={{ width: `${countBooked / Math.max(countNew,1) * 100}%` }}></div></div>
  </div>
</div>

          </div>
      </div>

        {/* === CLIENT INJECTOR === */}
        {/* === CLIENT INJECTOR === */}
        <div
          className={`injector-tab ${injectorOpen ? "open" : ""}`}
          onClick={() => setInjectorOpen(!injectorOpen)}
        ></div>

        <div className={`injector-panel ${injectorOpen ? "open" : ""}`}>
          <h2>Client Injector</h2>
          <div className="inner-glass injector-body">
                <div className="injector-section">
                  <h3>Client</h3>
                  <input placeholder="Client Name" value={injector.clientName} onChange={e => setInjector({...injector, clientName: e.target.value})} />
                  <input placeholder="Company" value={injector.company} onChange={e => setInjector({...injector, company: e.target.value})} />
                  <input placeholder="Email" value={injector.email} onChange={e => setInjector({...injector, email: e.target.value})} />
                  <input placeholder="Phone" value={injector.phone} onChange={e => setInjector({...injector, phone: e.target.value})} />
                </div>

                <div className="injector-section">
                  <h3>Infrastructure</h3>
                  <input placeholder="Twilio SID" value={injector.twilioSid} onChange={e => setInjector({...injector, twilioSid: e.target.value})} />
                  <input placeholder="Twilio Auth Token" type="password" value={injector.twilioToken} onChange={e => setInjector({...injector, twilioToken: e.target.value})} />
                  <input placeholder="Twilio From Number" value={injector.twilioFrom} onChange={e => setInjector({...injector, twilioFrom: e.target.value})} />
                  <input placeholder="OpenAI API Key" type="password" value={injector.openaiKey} onChange={e => setInjector({...injector, openaiKey: e.target.value})} />
                  <input placeholder="Calendar Email" value={injector.calendarEmail} onChange={e => setInjector({...injector, calendarEmail: e.target.value})} />
                </div>

                <div className="injector-section">
                  <h3>Agent</h3>
                  

                  
<select>
  <option value="">Select Role</option>
  <option value="front_desk">Front Desk (Receptionist)</option>
  <option value="lead_capture">Lead Capture</option>
  <option value="appointment_scheduler">Appointment Scheduler</option>
  <option value="lead_qualifier">Lead Qualifier</option>
  <option value="cold_outreach">Cold Outreach</option>
  <option value="missed_call">Missed Call Recovery</option>
  <option value="support">Customer Support</option>
</select>

<select>
  <option value="">Brand Skin</option>
  <option value="real_estate">Real Estate</option>
  <option value="insurance">Insurance</option>
  <option value="medical">Medical</option>
  <option value="legal">Legal</option>
  <option value="solar">Solar</option>
  <option value="ecommerce">E-commerce</option>
  <option value="custom">Custom</option>
</select>


                  <select value={injector.direction} onChange={e => setInjector({...injector, direction: e.target.value})}>
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                  </select>
                </div>

                
<div className="injector-section">
  <h3>Deployment</h3>
  <button
    className="btn primary"
    disabled={mode !== "CAMPAIGN"}
    style={{ opacity: mode !== "CAMPAIGN" ? 0.4 : 1 }}
    onClick={deployAgent}
  >
    Deploy Agent
  </button>
</div>

          </div>
        </div>






    </div>
  )
}