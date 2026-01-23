
const neonGlow = {
  color: "#7ffcff",
  textShadow: `
    0 0 6px rgba(127,252,255,0.55),
    0 0 14px rgba(127,252,255,0.45),
    0 0 28px rgba(127,252,255,0.35)
  `,
};

import { useRef, useState, useEffect } from "react";
import NeonNav from "../components/NeonNav";

import commandCentre from "../assets/demos/command-centre-demo.png";
import clientDashboard from "../assets/demos/client-dashboard-demo.png";

const audioBox = {
  width: "260px",
  padding: "0",
  borderRadius: "0",
  border: "none",
  background: "transparent",
  boxShadow: "none",
};

const audioButton = {
  width: "100%",
  background: "transparent",
  border: "1px solid rgba(0,255,255,0.5)",
  color: "#7ffcff",
  padding: "1rem",
  letterSpacing: "0.18em",
  cursor: "pointer",
};


const demoRowClean = {
  display: "flex",
  gap: "4rem",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "6rem",
};

const demoMediaRow = {
  display: "flex",
  alignItems: "center",
  gap: "2.6rem",
  width: "100vw",
  marginRight: "-8vw",
  paddingRight: "8vw"
};

const demoDesc = {
  flex: 1,
  width: "100%",
  paddingRight: "4rem",
  color: "#cfdfe3",
  fontSize: "0.76rem",
  lineHeight: "1.5",
  display: "flex",
  alignItems: "center"
};

const demoText = {
  opacity: 0.75,
  maxWidth: "420px",
};

export default function Agents() {
  useEffect(() => {
    const prevHtml = document.documentElement.style.overscrollBehaviorY;
    const prevBody = document.body.style.overscrollBehaviorY;

    document.documentElement.style.overscrollBehaviorY = "auto";
    document.body.style.overscrollBehaviorY = "auto";

    return () => {
      document.documentElement.style.overscrollBehaviorY = prevHtml;
      document.body.style.overscrollBehaviorY = prevBody;
    };
  }, []);

const outboundRef = useRef(null);
  const inboundRef = useRef(null);
  const [active, setActive] = useState(null);

  const stopAll = () => {
    outboundRef.current?.pause();
    inboundRef.current?.pause();
    if (outboundRef.current) outboundRef.current.currentTime = 0;
    if (inboundRef.current) inboundRef.current.currentTime = 0;
    setActive(null);
  };

  const toggle = (key, ref) => {
    if (active === key) {
      stopAll();
      return;
    }
    stopAll();
    ref.current?.play();
    setActive(key);
  };

  return (
    <div
  className="public-page agents-page"
  
  onWheel={(e) => {
    e.currentTarget.scrollTop += e.deltaY;
  }}
 >
      <NeonNav />

        <main className="public-page-content">


<h1>ZYPHER AGENTS</h1>





<p
  style={{
    maxWidth: "1020px",
    margin: "2.8rem auto 5.8rem",
    textAlign: "center",
    fontFamily: "Orbitron, sans-serif",
    fontSize: "1.05rem",
    lineHeight: "2",
    letterSpacing: "0.04em",
    wordSpacing: "0.12em",
    opacity: 0.95,
    wordBreak: "normal",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  }}
>
  <span style={{
    color: "#7ffcff",
    textShadow:
      "0 0 10px rgba(127,252,255,0.6),\
       0 0 22px rgba(127,252,255,0.45),\
       0 0 42px rgba(127,252,255,0.25)"
  }}>
    Zypher Agents
  </span>
  {" "}are built for teams who need{" "}
  <span style={{
    color: "#7ffcff",
    textShadow:
      "0 0 8px rgba(127,252,255,0.55),\
       0 0 18px rgba(127,252,255,0.35)"
  }}>
    production-grade AI voice systems
  </span>
  {" "}that actually hold up in the real world — on real calls, with real customers, under real operational pressure.
  These live agents handle
  <span style={{
    color: "#7ffcff",
    textShadow:
      "0 0 8px rgba(127,252,255,0.55),\
       0 0 18px rgba(127,252,255,0.35)"
  }}>
    {" "}inbound reception{" "}
  </span>
  and
  <span style={{
    color: "#7ffcff",
    textShadow:
      "0 0 8px rgba(127,252,255,0.55),\
       0 0 18px rgba(127,252,255,0.35)"
  }}>
    {" "}outbound sales conversations
  </span>
  {" "}end-to-end — from qualification and scheduling to decision-making and execution, without scripts or shortcuts.
  <br /><br />
  Under the hood, every interaction runs on Zypher’s
  <span style={{
    color: "#7ffcff",
    textShadow:
      "0 0 12px rgba(127,252,255,0.65),\
       0 0 26px rgba(127,252,255,0.45),\
       0 0 52px rgba(127,252,255,0.25)"
  }}>
    {" "}deterministic AI core
  </span>,
  <span style={{
    color: "#7ffcff",
    textShadow:
      "0 0 12px rgba(127,252,255,0.65),\
       0 0 26px rgba(127,252,255,0.45)"
  }}>
    {" "}low-latency voice runtime
  </span>, and
  <span style={{
    color: "#7ffcff",
    textShadow:
      "0 0 12px rgba(127,252,255,0.65),\
       0 0 26px rgba(127,252,255,0.45)"
  }}>
    {" "}adapter-driven system control
  </span>
  {" "}— giving businesses reliability, observability, and full control across every call.
</p>








<h2
  style={{
    margin: "7rem 0 2.8rem",
    textAlign: "center",
    fontFamily: "Orbitron, sans-serif",
    letterSpacing: "0.28em",
    fontSize: "2.1rem",
    lineHeight: "1.35",
    color: "#7ffcff",
    textShadow: "0 0 18px rgba(127,252,255,0.65)",
  }}
>
  OUR WORK
</h2>

<div
  style={{
    width: "140px",
    height: "2px",
    margin: "0 auto 5rem",
    background: "linear-gradient(90deg, transparent, #7ffcff, transparent)",
    boxShadow: "0 0 14px rgba(127,252,255,0.6)",
  }}
/>




        <section>

{/* OUTBOUND */}
<div style={demoRowClean}>
  <div style={audioBox}>
    <h3 style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.12em",  color: "#7ffcff", marginTop: "1.6rem" }}>Outbound Sales Voice</h3>

      <div
        style={{
          width: "120px",
          height: "2px",
          marginBottom: "1.6rem",
          background: "linear-gradient(90deg, transparent, #7ffcff, transparent)",
          boxShadow: "0 0 14px rgba(127,252,255,0.6)",
        }}
      />

    <button
      onClick={() => toggle("outbound", outboundRef)}
      style={{ ...audioButton, boxShadow: active === "outbound" ? "0 0 30px rgba(0,255,255,0.6)" : "none" }}
    >
      {active === "outbound" ? "■ STOP OUTBOUND DEMO" : "▶ PLAY OUTBOUND DEMO"}
    </button>
    <p style={demoText}>Confident outbound sales delivery.</p>
    <audio ref={outboundRef} src="/src/assets/demos/outbound_sales_demo.mp3" />
  </div>

  <div style={demoMediaRow}>
  <img src={commandCentre} alt="Command Centre Demo" style={{ maxWidth: "520px", borderRadius: "14px", filter: "drop-shadow(0 0 8px rgba(127,252,255,0.45)) drop-shadow(0 0 18px rgba(127,252,255,0.30)) drop-shadow(0 0 36px rgba(127,252,255,0.18))" }} />
  <div style={demoDesc}>
    <p>
        The <span style={{ color: "#7ffcff", textShadow: "0 0 8px rgba(127,252,255,0.6), 0 0 18px rgba(127,252,255,0.35)" }}>Command Centre</span>{" "}
        gives real-time control of{" "}
        <span style={{ color: "#7ffcff", textShadow: "0 0 8px rgba(127,252,255,0.55), 0 0 18px rgba(127,252,255,0.30)" }}>outbound voice</span>,
        exposing call state, flow, and outcomes in a single view.
      </p>
  </div>
</div>
</div>

  {/* INBOUND */}
<div style={demoRowClean}>
  <div style={audioBox}>
    <h3 style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.12em",  color: "#7ffcff", marginTop: "1.6rem" }}>Inbound Reception Voice</h3>

      <div
        style={{
          width: "120px",
          height: "2px",
          marginBottom: "1.6rem",
          background: "linear-gradient(90deg, transparent, #7ffcff, transparent)",
          boxShadow: "0 0 14px rgba(127,252,255,0.6)",
        }}
      />

    <button
      onClick={() => toggle("inbound", inboundRef)}
      style={{ ...audioButton, boxShadow: active === "inbound" ? "0 0 30px rgba(0,255,255,0.6)" : "none" }}
    >
      {active === "inbound" ? "■ STOP INBOUND DEMO" : "▶ PLAY INBOUND DEMO"}
    </button>
    <p style={demoText}>Calm, premium reception handling.</p>
    <audio ref={inboundRef} src="/src/assets/demos/inbound_support_demo.mp3" />
  </div>

  <div style={demoMediaRow}>
  <img src={clientDashboard} alt="Client Dashboard Demo" style={{ maxWidth: "520px", borderRadius: "14px", filter: "drop-shadow(0 0 8px rgba(127,252,255,0.45)) drop-shadow(0 0 18px rgba(127,252,255,0.30)) drop-shadow(0 0 36px rgba(127,252,255,0.18))" }} />
  <div style={demoDesc}>
    <p>
      The <span style={{ color: "#7ffcff", textShadow: "0 0 8px rgba(127,252,255,0.6), 0 0 18px rgba(127,252,255,0.35)" }}>Client Dashboard</span>{" "}
      surfaces{" "}
      <span style={{ color: "#7ffcff", textShadow: "0 0 8px rgba(127,252,255,0.55), 0 0 18px rgba(127,252,255,0.30)" }}>live reception</span>{" "}
      activity, health, and bookings — keeping operations calm and observable.
    </p>
  </div>
</div>
</div>

</section>
      </main>
    </div>
  );
}