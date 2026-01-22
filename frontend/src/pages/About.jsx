// Public About page
// Shell only — content and styling will be refined later

import NeonNav from "../components/NeonNav";

export default function About() {
  return (
    <div className="public-page about-page">
      {/* Persistent top navigation */}
      <NeonNav />

      {/* Page content */}
      <main className="public-page-content">
        <h1>About Zypher</h1>
        <p>
          Zypher is an AI-powered voice automation platform built for
          production-grade calling workflows.
        </p>
      
          <section className="about-section mission-section">
            <h2>Our Mission</h2>
            <p>
              Zypher exists to replace <strong>brittle call centres</strong> and
              <strong> static scripts</strong> with
              <strong> autonomous voice agents</strong> that operate with
              <strong> precision</strong>, <strong>control</strong>, and
              <strong> scale</strong>.
              <br /><br />
              We build systems that <strong>think in real time</strong>, adapt to
              live conversations, and execute
              <strong> reliably in production</strong> — not demos, not
              experiments.
            </p>
          </section>

          <section className="about-pillars">
            <div className="pillar">
              <h3>Autonomy</h3>
              <p>
                Zypher agents operate independently, running full outbound and
                inbound campaigns without constant human supervision.
              </p>
            </div>

            <div className="pillar">
              <h3>Control</h3>
              <p>
                Every decision is observable, overridable, and tied to a
                deterministic system state — no black boxes.
              </p>
            </div>

            <div className="pillar">
              <h3>Reliability</h3>
              <p>
                Built as a production system first. Fault-tolerant, measurable,
                and designed to run at scale.
              </p>
            </div>
          </section>
</main>
    </div>
  );
}
