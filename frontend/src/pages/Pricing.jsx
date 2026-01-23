import NeonNav from "../components/NeonNav";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();
  // HARD_SCROLL_UNLOCK — pricing must scroll like a normal page
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const app = document.querySelector(".app");

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      appOverflow: app?.style.overflow,
      appMaxHeight: app?.style.maxHeight,
    };

    html.style.overflow = "auto";
    body.style.overflow = "auto";
    body.style.height = "auto";

    if (app) {
      app.style.overflow = "visible";
      app.style.maxHeight = "none";
    }

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;

      if (app) {
        app.style.overflow = prev.appOverflow;
        app.style.maxHeight = prev.appMaxHeight;
      }
    };
  }, []);

  // SCROLL_UNLOCK_EFFECT
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      rootOverflow: root?.style.overflow,
      rootMaxHeight: root?.style.maxHeight,
    };

    html.style.overflow = "auto";
    body.style.overflow = "auto";
    if (root) {
      root.style.overflow = "auto";
      root.style.maxHeight = "none";
    }

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      if (root) {
        root.style.overflow = prev.rootOverflow;
        root.style.maxHeight = prev.rootMaxHeight;
      }
    };
  }, []);

  return (
    <div
    className="public-page pricing-page"
    
  >
      <NeonNav />

      <main className="public-page-content">
        <style>{`
          /* PRICING_SCROLL_CONTAINER */
          .pricing-page {
            position: fixed;
            top: 64px; /* navbar height */
            left: 0;
            right: 0;
            bottom: 0;
            overflow-y: auto;
            overflow-x: hidden;
            padding-bottom: 80px;
          }

          .pricing-page::-webkit-scrollbar {
            width: 10px;
          }

          .pricing-page::-webkit-scrollbar-thumb {
            background: linear-gradient(
              180deg,
              #28d7ff,
              #7ffcff
            );
            border-radius: 999px;
            box-shadow: 0 0 12px rgba(40,215,255,0.6);
          }
        
          /* PRICING_SCROLL_FIX */
          .pricing-page {
            overflow-y: auto !important;
            min-height: 100vh;
          }

          .pricing-page .public-page-content {
            overflow: visible !important;
          }


          .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 2.8rem;
            margin-top: 3.5rem;
          }

          .pricing-card {
            background: rgba(0,0,0,0.45);
            border: 1px solid rgba(0,255,255,0.25);
            border-radius: 18px;
            padding: 2.4rem 2.2rem 2.6rem;
            backdrop-filter: blur(12px);
            position: relative;
          }

          .pricing-card h3 {
            letter-spacing: 0.28em;
            font-size: 0.85rem;
            color: #7ffcff;
            margin-bottom: 1.4rem;
            text-shadow: 0 0 12px rgba(127,252,255,0.55);
          }

          .price {
            font-size: 2.2rem;
            color: #ffffff;
            margin-bottom: 0.4rem;
          }

          .price-sub {
            font-size: 0.75rem;
            letter-spacing: 0.12em;
            opacity: 0.7;
            margin-bottom: 1.6rem;
          }

          .pricing-card ul {
            list-style: none;
            padding: 0;
            margin: 0 0 1.8rem;
          }

          .pricing-card li {
            font-size: 0.82rem;
            line-height: 1.9;
            opacity: 0.85;
          }

          .pricing-note {
            font-size: 0.7rem;
            letter-spacing: 0.1em;
            opacity: 0.6;
            margin-top: 1.2rem;
          }
        `}</style>

        <h1>Pricing</h1>

        <p>
          Zypher pricing is designed for production deployment — not experiments.
          Every plan includes live AI voice execution, deterministic control, and
          full operational observability. No usage ambiguity. No opaque limits.
        </p>

        <section className="pricing-grid">
          <div className="pricing-card">
            <h3>CORE</h3>
            <div className="price">£1,000</div>
            <div className="price-sub">one-time setup</div>

            <ul>
              <li>AI call handling</li>
              <li>Live dashboard</li>
              <li>Inbound or outbound workflows</li>
              <li>Production runtime</li>
            </ul>

            <div className="price">£500 / month</div>
            <div className="price-sub">retainer</div>

            <div className="pricing-note">
              Or £350 billed monthly over 10 months
            </div>
          </div>

          <div className="pricing-card">
            <h3>GROWTH</h3>
            <div className="price">£1,000</div>
            <div className="price-sub">one-time setup</div>

            <ul>
              <li>Everything in Core</li>
              <li>Lead ingestion & routing</li>
              <li>AI-driven qualification</li>
              <li>Campaign execution</li>
            </ul>

            <div className="price">£500 / month</div>
            <div className="price-sub">+ £300 per 15k leads</div>

            <div className="pricing-note">
              Or £350 / month + lead volume
            </div>
</div>

          <div className="pricing-card">
            <h3>SCALE</h3>
            <div className="price">£4,500</div>
            <div className="price-sub">one-time setup</div>

            <ul>
              <li>Inbound marketing integration</li>
              <li>Landing pages</li>
              <li>Lead capture pipelines</li>
              <li>Coach / high-touch workflows</li>
            </ul>

            <div className="price">£2,500 / month</div>
            <div className="price-sub">retainer</div>

            <div className="pricing-note">
              Or £1,750 billed monthly over 10 months
            </div>
          </div>
        

</section>

        <div style={{ marginTop: "3.5rem", textAlign: "center" }}>
          <a href="/contact" className="neon-contact" style={{
            padding: "0.9rem 2.6rem",
            border: "1px solid #7ffcff",
            color: "#7ffcff",
            textDecoration: "none",
            fontFamily: "Orbitron, sans-serif",
            letterSpacing: "0.14em",
          }}>
            CONTACT US
          </a>
        </div>


        

</main>
    </div>
  );
}
