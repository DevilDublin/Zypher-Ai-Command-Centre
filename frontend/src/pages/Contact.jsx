// Public Contact page
// Shell only — form wiring and backend integration later

import NeonNav from "../components/NeonNav";

export default function Contact() {
  return (
    <div className="public-page">
      {/* Persistent top navigation */}
      <NeonNav />

      {/* Page content */}
      <main className="public-page-content">
        <h1>Contact</h1>

        <p>
          Get in touch to request access, partnerships, or technical onboarding.
        </p>

        {/* Placeholder contact blocks */}
        <section>
          <h2>Email</h2>
          <p>contact@zypher.ai</p>
        </section>

        <section>
          <h2>Sales / Partnerships</h2>
          <p>sales@zypher.ai</p>
        </section>

        <section>
          <h2>Developer Access</h2>
          <p>Request developer access to integrate or provision clients.</p>
        </section>
      </main>
    </div>
  );
}
