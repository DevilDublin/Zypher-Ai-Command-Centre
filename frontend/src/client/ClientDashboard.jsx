
import { useState, useEffect, useRef } from 'react'
import { useAnalytics } from "../lib/useAnalytics";
import { socket } from "../lib/socket";
import { socketState } from "../lib/socketStore";

export default function App() {

  const analytics = useAnalytics();

  
  const [isOnline, setIsOnline] = useState(false);
  const [mode, setMode] = useState("TEST");

  
  
  
    const injectorLocked = mode !== "CAMPAIGN";
const injectorCanOpen = mode === "CAMPAIGN";
const [injectorOpen, setInjectorOpen] = useState(false);

  
  const [provisionResult, setProvisionResult] = useState(null);

const [injector, setInjector] = useState({
  clientName: "",
  company: "",
  clientEmail: "",
  phone: "",

  telephony: {
    provider: "twilio",
    apiKey: "",
    fromNumber: ""
  },

  email: {
    provider: "gmail",
    gmailUser: "",
    gmailPass: ""
  },

  calendar: {
    provider: "google",
    googleEmail: ""
  },

  agent: {
    niche: "",
    skin: "default",
    customPrompt: ""
  }
});
  const slugBase = injector.clientName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 24);


const handleStartCall = () => {
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
        <div
          className={`injector-tab ${injectorOpen ? "open" : ""} ${injectorLocked ? "locked" : ""}`}
          onClick={() => {
            if (injectorLocked && !injectorOpen) {
              addNotification("Injector locked — switch to CAMPAIGN");
              return;
            }
            setInjectorOpen(!injectorOpen);
          }}
        ></div>

        <div className={`injector-panel ${injectorOpen ? "open" : ""} ${injectorLocked ? "locked" : ""}`}>
          <h2>Client Injector</h2>
          <div className="inner-glass injector-body">
                              <div className="injector-section">
                <h3>Client</h3>
                <input className="injector-input" placeholder="Client name" value={injector.clientName} onChange={e => setInjector({ ...injector, clientName: e.target.value })} />
                  {slugBase && (
                    <div className="injector-hint zy-glowText" style={{marginTop:"6px"}}>
                      Client ID: {slugBase}_****
                    </div>
                  )}

                <input className="injector-input" placeholder="Company" value={injector.company} onChange={e => setInjector({ ...injector, company: e.target.value })} />
                <input className="injector-input" placeholder="Email" value={injector.clientEmail} onChange={e => setInjector({ ...injector, clientEmail: e.target.value })} />
                <input className="injector-input" placeholder="Phone" value={injector.phone} onChange={e => setInjector({ ...injector, phone: e.target.value })} />
              </div>

              
                
<div className="injector-section">
  <h3>Infrastructure</h3>

  <div className="infra-group">
    <div className="injector-label">Telephony</div>
    <div className="injector-hint zy-glowText">Where Zypher sends and receives phone calls</div>
    <select
      className="injector-select"
      value={injector.telephony.provider}
      onChange={e => setInjector({
        ...injector,
        telephony: { ...injector.telephony, provider: e.target.value }
      })}
    >
      <option value="twilio">Twilio</option>
      <option value="vonage">Vonage</option>
      <option value="sip">SIP Trunk</option>
      <option value="none">Disabled</option>
    </select>

    {injector.telephony.provider === "twilio" && (
      <div className="infra-credentials">
        <input className="injector-input" placeholder="Twilio API Key"
          value={injector.telephony.apiKey}
          onChange={e => setInjector({ ...injector, telephony: { ...injector.telephony, apiKey: e.target.value }})}
        />
        <input className="injector-input" placeholder="Twilio From Number"
          value={injector.telephony.fromNumber}
          onChange={e => setInjector({ ...injector, telephony: { ...injector.telephony, fromNumber: e.target.value }})}
        />
      </div>
    )}

    {injector.telephony.provider === "vonage" && (
      <div className="infra-credentials">
        <input className="injector-input" placeholder="Vonage API Key" />
        <input className="injector-input" placeholder="Vonage Application ID" />
      </div>
    )}

    {injector.telephony.provider === "sip" && (
      <div className="infra-credentials">
        <input className="injector-input" placeholder="SIP URI" />
        <input className="injector-input" placeholder="SIP Username" />
        <input className="injector-input" type="password" placeholder="SIP Password" />
      </div>
    )}

    {injector.telephony.provider === "none" && (
      <div className="infra-credentials zy-glowText">Telephony disabled</div>
    )}
  </div>

  <div className="infra-group">
    <div className="injector-label">Email</div>
    <div className="injector-hint zy-glowText">Used to send confirmations and follow-ups</div>
    <select
      className="injector-select"
      value={injector.email.provider}
      onChange={e => setInjector({
        ...injector,
        email: { ...injector.email, provider: e.target.value }
      })}
    >
      <option value="gmail">Gmail</option>
      <option value="smtp">SMTP</option>
      <option value="sendgrid">SendGrid</option>
      <option value="none">Disabled</option>
    </select>

    {injector.email.provider === "gmail" && (
      <div className="infra-credentials">
        <input className="injector-input" placeholder="Gmail address"
          value={injector.email.gmailUser}
          onChange={e => setInjector({ ...injector, email: { ...injector.email, gmailUser: e.target.value }})}
        />
        <input className="injector-input" type="password" placeholder="Gmail App Password"
          value={injector.email.gmailPass}
          onChange={e => setInjector({ ...injector, email: { ...injector.email, gmailPass: e.target.value }})}
        />
      </div>
    )}

    {injector.email.provider === "sendgrid" && (
      <div className="infra-credentials">
        <input className="injector-input" placeholder="SendGrid API Key" />
        <input className="injector-input" placeholder="From Address" />
      </div>
    )}

    {injector.email.provider === "smtp" && (
      <div className="infra-credentials">
        <input className="injector-input" placeholder="SMTP Host" />
        <input className="injector-input" placeholder="SMTP Port" />
        <input className="injector-input" placeholder="SMTP Username" />
        <input className="injector-input" type="password" placeholder="SMTP Password" />
      </div>
    )}

    {injector.email.provider === "none" && (
      <div className="infra-credentials zy-glowText">Email disabled</div>
    )}
  </div>

  <div className="infra-group">
    <div className="injector-label">Calendar</div>
    <div className="injector-hint zy-glowText">Where appointments are booked</div>
    <select
      className="injector-select"
      value={injector.calendar.provider}
      onChange={e => setInjector({
        ...injector,
        calendar: { ...injector.calendar, provider: e.target.value }
      })}
    >
      <option value="google">Google Calendar</option>
      <option value="calendly">Calendly</option>
      <option value="outlook">Outlook</option>
      <option value="none">Disabled</option>
    </select>

    {injector.calendar.provider === "google" && (
      <input className="injector-input" placeholder="Google Calendar Account"
        value={injector.calendar.googleEmail}
        onChange={e => setInjector({ ...injector, calendar: { ...injector.calendar, googleEmail: e.target.value }})}
      />
    )}

    {injector.calendar.provider === "calendly" && (
      <input className="injector-input" placeholder="Calendly Access Token" />
    )}

    {injector.calendar.provider === "outlook" && (
      <div className="infra-credentials">
        <input className="injector-input" placeholder="Azure Tenant ID" />
        <input className="injector-input" placeholder="Client ID" />
      </div>
    )}

    {injector.calendar.provider === "none" && (
      <div className="infra-credentials zy-glowText">Calendar disabled</div>
    )}
  </div>

  <div className="infra-topology">
    <div className="injector-label">Live System Topology</div>
    <div className="injector-hint zy-glowText">How Zypher is currently wired</div>
    <div className="infra-map zy-glowText">
      Telephony: {injector.telephony.provider || "none"}<br/>
      Email: {injector.email.provider || "none"}<br/>
      Calendar: {injector.calendar.provider || "none"}<br/>
      Mode: {mode}
    </div>
  </div>
</div>
<div className="injector-section">
                <h3>Agent</h3>

                <div className="injector-label">Role (what it does)
                    <div className="injector-hint zy-glowText" style={{marginTop:"8px", opacity:0.85}}>
                      Telephony: Twilio<br/>
                      Calendar: Google Calendar<br/>
                      Email: Gmail<br/>
                      Mode: {mode}
                    </div>
</div>
                <select className="injector-select" value={injector.niche} onChange={e => setInjector({ ...injector, niche: e.target.value })}>
                  <option value="">Select role…</option>
                  <option value="inbound_receptionist_outbound_setter">Inbound receptionist + outbound appointment setter</option>
                  <option value="intake_lead_qualifier">Intake agent + lead qualifier</option>
                  <option value="receptionist_scheduler">Receptionist + appointment scheduler</option>
                  <option value="inbound_capture_outbound_quote_followup">Inbound lead capture + outbound quote follow-up</option>
                  <option value="outbound_coldcaller_lead_qualifier">Outbound cold caller + lead qualifier</option>
                  <option value="inbound_receptionist_missed_call_recovery">Inbound receptionist + missed-call recovery</option>
                  <option value="support_faq_agent">Support & FAQ agent</option>
                  <option value="frontline_receptionist_general">Frontline receptionist (general)</option>
                </select>

                <div className="injector-label" style={{marginTop:"10px"}}>Skin (industry look/voice)</div>
                <select className="injector-select" value={injector.skin} onChange={e => setInjector({ ...injector, skin: e.target.value })}>
                  <option value="default">Default</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="law_firm">Law Firm</option>
                  <option value="medical_clinic">Medical / Clinic</option>
                  <option value="insurance">Insurance</option>
                  <option value="marketing_agency">Marketing Agency</option>
                  <option value="solar_trades">Solar / Trades</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="custom">Custom…</option>
                </select>

                {injector.skin === "custom" && (
                  <div className="injector-custom">
                    <div className="injector-label">Custom prompt (AI will generate the script)</div>
                    <textarea
                      className="injector-textarea"
                      rows={5}
                      placeholder='Describe the business + what you want Zypher to do. Example: "We are a Harley dealership. Answer inbound calls, qualify riders, and book test rides + service appointments…"'
                      value={injector.customPrompt}
                      onChange={e => setInjector({ ...injector, customPrompt: e.target.value })}
                    />
                    <button
                      className="btn"
                      onClick={() => console.log("GENERATE_SCRIPT_REQUEST", { skin: injector.skin, role: injector.niche, prompt: injector.customPrompt })}
                      disabled={!injector.customPrompt.trim()}
                      style={{ marginTop: "10px", opacity: injector.customPrompt.trim() ? 1 : 0.4 }}
                    >
                      Generate Script (preview)
                    </button>
                  </div>
                )}
              </div>

              <div className="injector-section">
                <h3>Deployment</h3>

                <div className="injector-hint">
                  Injector is LIVE. TEST mode is sandboxed.
                </div>

                <button
                  className="btn primary"
                  disabled={injectorLocked}
                  style={{ marginTop: "10px", opacity: injectorLocked ? 0.25 : 1 }}
                  onClick={() => {
  if (injectorLocked) {
    addNotification("Injector locked — switch to CAMPAIGN");
    return;
  }
  
if (!BACKEND_URL) return;

fetch(`${BACKEND_URL}/provision`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-env": "CAMPAIGN"
  },
  body: JSON.stringify(injector)
})
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      addNotification("Provision failed");
      return;
    }
    setProvisionResult(data);
    addNotification("Client provisioned");
  })
  .catch(() => addNotification("Provision error"));

}}
                >
                  Provision Client
                </button>

                <pre className="injector-preview">
                  {JSON.stringify(injector, null, 2)}

{provisionResult && (
  <div className="injector-result">
    <div className="zy-glowText">Client ID: {provisionResult.clientId}</div>
    <div className="zy-glowText">Password: {provisionResult.password}</div>
  </div>
)}
                </pre>
              </div>
</div>

          </div>
        </div>


  )
}