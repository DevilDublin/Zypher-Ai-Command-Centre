import { useEffect } from "react";
// Public Architecture page
// Architecture explained through a single interactive system diagram


export default function Architecture() {
  return (
    <div className="public-page architecture-page">

      <main className="public-page-content">
        <h1>Apex</h1>

        <p>
          Zypher is engineered as a modular, deterministic AI system purpose-built
          for live, production-grade voice automation. The platform is designed
          around explicit system boundaries, predictable execution, and strict
          separation between core logic and external side effects.
          <br /><br />
          Rather than relying on opaque workflows or tightly coupled integrations,
          Zypher executes all voice interactions through a clearly defined
          end-to-end pipeline. Each stage in this pipeline is observable,
          independently testable, and engineered to operate reliably under
          real-world production load.
        </p>

        {/* Interactive architecture pipeline */}
        <section className="architecture-pipeline">
          <div className="pipeline-block">
            <div className="pipeline-header">
              End-to-End Execution Pipeline
            </div>

            <div className="pipeline-column">
              <h3>Ingress</h3>
              <ul>
                <li>Inbound calls</li>
                <li>Outbound campaigns</li>
                <li>Session initialisation</li>
              </ul>
            </div>

            <div className="pipeline-column">
              <h3>Voice Runtime</h3>
              <ul>
                <li>Real-time audio</li>
                <li>Turn handling</li>
                <li>Call lifecycle</li>
              </ul>
            </div>

            <div className="pipeline-column">
              <h3>AI Core</h3>
              <ul>
                <li>Reasoning</li>
                <li>Decision-making</li>
                <li>Tool selection</li>
              </ul>
            </div>

            <div className="pipeline-column">
              <h3>Adapters</h3>
              <ul>
                <li>Calendar</li>
                <li>Email</li>
                <li>CRM & Telephony</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}



