// Public Architecture page
// Shell only — structure first, visuals later

import NeonNav from "../components/NeonNav";

export default function Architecture() {
  return (
    <div className="public-page">
      {/* Persistent top navigation */}
      <NeonNav />

      {/* Page content */}
      <main className="public-page-content">
        <h1>System Architecture</h1>

        <p>
          Zypher is built as a modular, deterministic AI system designed
          for production voice automation.
        </p>

        {/* Placeholder sections */}
        <section>
          <h2>High-Level Flow</h2>
          <p>Inbound / Outbound → Voice Runtime → AI Core → Adapters</p>
        </section>

        <section>
          <h2>Core Components</h2>
          <p>AI Core · Voice Runtime · Adapter Layer</p>
        </section>

        <section>
          <h2>Environments</h2>
          <p>TEST and CAMPAIGN modes are fully isolated.</p>
        </section>
      </main>
    </div>
  );
}
