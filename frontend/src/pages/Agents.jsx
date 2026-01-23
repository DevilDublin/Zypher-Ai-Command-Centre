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

      <main className="public-page-content" >
        <h1>ZYPHER AGENTS</h1>

        <section>

{/* OUTBOUND */}
<div style={demoRowClean}>
  <div style={audioBox}>
    <button
      onClick={() => toggle("outbound", outboundRef)}
      style={{ ...audioButton, boxShadow: active === "outbound" ? "0 0 30px rgba(0,255,255,0.6)" : "none" }}
    >
      {active === "outbound" ? "■ STOP OUTBOUND DEMO" : "▶ PLAY OUTBOUND DEMO"}
    </button>
    <h3 style={{ color: "#7ffcff", marginTop: "1.6rem" }}>Outbound Sales Voice</h3>
    <p style={demoText}>Confident outbound sales delivery.</p>
    <audio ref={outboundRef} src="/src/assets/demos/outbound_sales_demo.mp3" />
  </div>

  <img src={commandCentre} alt="Command Centre Demo" style={{ maxWidth: "520px", borderRadius: "14px" }} />
</div>

  {/* INBOUND */}
<div style={demoRowClean}>
  <div style={audioBox}>
    <button
      onClick={() => toggle("inbound", inboundRef)}
      style={{ ...audioButton, boxShadow: active === "inbound" ? "0 0 30px rgba(0,255,255,0.6)" : "none" }}
    >
      {active === "inbound" ? "■ STOP INBOUND DEMO" : "▶ PLAY INBOUND DEMO"}
    </button>
    <h3 style={{ color: "#7ffcff", marginTop: "1.6rem" }}>Inbound Reception Voice</h3>
    <p style={demoText}>Calm, premium reception handling.</p>
    <audio ref={inboundRef} src="/src/assets/demos/inbound_support_demo.mp3" />
  </div>

  <img src={clientDashboard} alt="Client Dashboard Demo" style={{ maxWidth: "520px", borderRadius: "14px" }} />
</div>

</section>
      </main>
    </div>
  );
}
