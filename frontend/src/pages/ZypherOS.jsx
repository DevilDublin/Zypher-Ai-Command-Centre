import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import DeveloperLogin from "./DeveloperLogin";
import "./ZypherOS.css";

export default function ZypherOS() {
  
  // ===============================
    // ===============================
  // ===============================
  // ZY_SCROLL_TYPE_ENGINE
  // Container-driven cinematic scroll
  // ===============================
  useEffect(() => {
      // TEMP: animations disabled
      return;

    const scroller = document.querySelector(".scroll-doc");
    const doc = document.querySelector(".scroll-doc");
    if (!scroller || !doc) return;

    const items = Array.from(doc.querySelectorAll("[data-zy-type]"));

    const spans = items.map(el => {
      const text = el.textContent;
      el.textContent = "";
      el.style.setProperty("--zy-chars", text.length);

      const span = document.createElement("span");
      span.className = "zy-type-inner";
      span.textContent = text;
      el.appendChild(span);
      return span;
    });

    let viewH = scroller.clientHeight;

    const recalc = () => {
      viewH = scroller.clientHeight;
    };

    window.addEventListener("resize", recalc);

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollTop = scroller.scrollTop;

      const p = Math.min(
        Math.max(scrollTop / maxScroll, 0),
        1
      );
doc.style.setProperty("--zy-progress", p);

        const clip = `inset(0 ${Math.max(0, 100 - p * 100)}% 0 0)`;
              spans.forEach(span => {
        const el = span.parentElement;
        const rect = el.getBoundingClientRect();
        const revealWindow = viewH * 0.6;                  const elTop = rect.top;
          const revealStart = viewH * 0.85;
          const revealEnd = -viewH * 0.15;

          const localP = Math.min(
            Math.max((revealStart - elTop) / (revealStart - revealEnd), 0),
            1
          );

          span.style.clipPath =
            `inset(0 ${Math.max(0, 100 - localP * 100)}% 0 0)`;
      });

        ticking = false;
      });
    };

    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recalc);
    };
  }, []);

;


useEffect(() => {
    const els = document.querySelectorAll(".zy-anim");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("zy-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    els.forEach(el => {
        // Skip scroll-driven section — scroll owns reveal
        if (el.closest(".scroll-doc")) return;
        observer.observe(el);
      });

    return () => observer.disconnect();
  }, []);

  const nav = useNavigate();
  const { pathname } = useLocation();
  const showLogin = pathname === "/developer";

  useEffect(() => {
    if (pathname !== "/developer") return;

    const intent = sessionStorage.getItem("zy_dev_intent");
    if (intent !== "1") {
      nav("/", { replace: true });
      return;
    }

    sessionStorage.removeItem("zy_dev_intent");
  }, [pathname, nav]);

  return (
    <>
      <div className="zypher-os">
        <div className="os-noise" />
        <div className="os-vignette" />

        <div className="os-core">
          <div className="os-logo zypher-title">ZYPHER</div>

          <div className="os-actions">
            <button className="os-btn client" onClick={() => { sessionStorage.setItem("zy_dev_intent","client"); nav("/developer"); }}>
              <span data-text="CLIENT ACCESS">CLIENT ACCESS</span>
            </button>

            <button
              className="os-btn dev"
              onClick={() => {
                sessionStorage.setItem("zy_dev_intent","dev"); nav("\/developer");
              }}
            >
              <span data-text="DEVELOPER TERMINAL">
                DEVELOPER TERMINAL
              </span>
            </button>
          </div>
        </div>

        <div className="scroll-doc">
          
<section className="zy-section zy-explain" data-panel>
  <h2 className="zy-title zy-anim" data-zy-type>What is Zypher?</h2>

  <p className="zy-lead zy-anim" data-zy-type>
    Zypher is an AI-powered voice and booking system designed to run your
    business conversations autonomously — from inbound calls to calendar bookings.
  </p>

  <div className="zy-voice-demo zy-anim">
    <button className="zy-voice-btn" onclick="this.classList.toggle('playing'); const a=this.querySelector('audio'); a.paused ? a.play() : a.pause();">
      <span className="pulse"></span>
      <span className="label">PLAY ZYPHER VOICE</span>
      <audio src="/audio/zypher-voice-demo.mp3"></audio>
    </button>
  </div>

  <div className="zy-timeline">
    <div className="zy-node zy-anim">
      <span className="zy-dot"></span>
      <h3 data-zy-type>Autonomous Voice</h3>
      <p data-zy-type>Handles inbound and outbound calls with natural AI speech.</p>
    </div>

    <div className="zy-node zy-anim">
      <span className="zy-dot"></span>
      <h3 data-zy-type>Live Qualification</h3>
      <p data-zy-type>Understands intent, context, and lead quality in real time.</p>
    </div>

    <div className="zy-node zy-anim">
      <span className="zy-dot"></span>
      <h3 data-zy-type>Calendar Intelligence</h3>
      <p data-zy-type>Books, reschedules, and confirms without human input.</p>
    </div>
  </div>

</section>

<section className="zy-section" data-panel>
  <h2 className="zy-title zy-anim">Architecture</h2>
  <p className="zy-lead zy-anim">
    Modular AI agents, adapter-driven infrastructure, and deterministic test modes.
<div className="zy-arch-grid">
  <div>
    <h3>AI Agents</h3>
    <p>Specialised voice agents for intake, qualification, and booking.</p>
  </div>
  <div>
    <h3>Adapter Layer</h3>
    <p>Calendar, CRM, telephony, and email adapters with TEST and LIVE modes.</p>
  </div>
  <div>
    <h3>Deterministic Runs</h3>
    <p>Offline verification via recorded VSC outputs before production use.</p>
  </div>
</div>

  </p>
</section>

<section className="zy-section" data-panel>
  <h2 className="zy-title zy-anim">Use Cases</h2>
  <ul className="zy-list">
    <li className="zy-anim"><strong>Inbound Reception</strong><br/>AI answers, greets, routes, and captures intent.</li>
    <li className="zy-anim"><strong>Outbound Qualification</strong><br/>Automated calls with live intent scoring.</li>
    <li className="zy-anim"><strong>Calendar Booking</strong><br/>Real-time availability, booking, rescheduling.</li>
  </ul>
</section>

<section className="zy-section" data-panel>
  <h2 className="zy-title zy-anim">Technology Stack</h2>
  <p className="zy-lead zy-anim">
    OpenAI Realtime Voice, Node.js adapters, Google Calendar, Twilio, Stripe.
  </p>
</section>

<section className="zy-section zy-end" data-panel>
  <h2 className="zy-title zy-anim">Zypher is your AI operator</h2>
</section>


        </div>

        {showLogin && (
          <div className="os-overlay">
            <DeveloperLogin />
          </div>
        )}
      </div>
    </>
  );
}