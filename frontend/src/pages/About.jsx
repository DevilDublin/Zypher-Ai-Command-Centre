// Public About page
// Shell only — content and styling will be refined later

import NeonNav from "../components/NeonNav";

export default function About() {
  return (
    <div className="public-page">
      {/* Persistent top navigation */}
      <NeonNav />

      {/* Page content */}
      <main className="public-page-content">
        <h1>About Zypher</h1>
        <p>
          Zypher is an AI-powered voice automation platform built for
          production-grade calling workflows.
        </p>
      </main>
    </div>
  );
}
