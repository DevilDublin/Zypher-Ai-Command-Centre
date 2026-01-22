// Public Agents page
// Shell only — content and visuals will be refined later

import NeonNav from "../components/NeonNav";

export default function Agents() {
  return (
    <div className="public-page">
      {/* Persistent top navigation */}
      <NeonNav />

      {/* Page content */}
      <main className="public-page-content">
        <h1>Zypher Agents</h1>

        <p>
          Zypher agents are purpose-built AI voice operators designed
          for specific business workflows.
        </p>

        {/* Placeholder agent sections */}
        <section>
          <h2>Outbound Sales Agent</h2>
          <p>Cold calls, objection handling, and calendar booking.</p>
        </section>

        <section>
          <h2>Inbound Reception Agent</h2>
          <p>Call answering, lead qualification, and routing.</p>
        </section>

        <section>
          <h2>Follow-up Agent</h2>
          <p>Missed-call recovery and re-engagement.</p>
        </section>
      </main>
    </div>
  );
}
