import React, { useState } from "react";
import NeonNav from "../components/NeonNav";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function Contact() {
  const [name, setName] = useState("");
    const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  const [intent, setIntent] = useState("");
  const [intentOpen, setIntentOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const INTENT_OPTIONS = [
    { value: "demo", label: "Request demo / access" },
    { value: "partnership", label: "Partnership enquiry" },
    { value: "support", label: "Technical support" },
    { value: "other", label: "Other" },
  ];

  async function sendContact() {
    console.log("🔥 sendContact fired");
    console.log("🌐 BACKEND_URL =", BACKEND_URL);
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, message, intent }),
      });
      if (!res.ok) throw new Error("contact failed");
    } catch (err) {
      console.error("Contact error:", err);
    } finally {
      setSending(false);
    }
  }



  return (
    <div className="public-page contact-page">
      <NeonNav />

      <main className="public-page-content contact-container">
        <h1>CONTACT</h1>

        <p className="contact-subtitle">
          Get in touch to request access, partnerships, or technical onboarding.
        </p>

        <div className="contact-form">
          <div className="contact-field">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

            <div className="contact-field">
              <label>What are you contacting us about?</label>

              <div
                className={`contact-select ${intentOpen ? "open" : ""}`}
                onClick={() => setIntentOpen(o => !o)}
              >
                {intent ? INTENT_OPTIONS.find(o => o.value === intent)?.label : "Select your topic"}
                <span className="contact-select-arrow" />
              </div>

              {intentOpen && (
                <div className="contact-select-menu">
                  {INTENT_OPTIONS.map(opt => (
                    <div
                      key={opt.value}
                      className={`contact-select-option ${opt.value === intent ? "active" : ""}`}
                      onClick={() => {
                        setIntent(opt.value);
                        setIntentOpen(false);
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>


          <div className="contact-field">
            <label>Company (optional)</label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>

          <div className="contact-field">
            <label>Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>

            <button
              type="button"
              className="contact-send"
              onClick={sendContact}
              disabled={sending}
            >
              {sending ? "SENDING..." : "SEND MESSAGE"}
            </button>

        </div>
      </main>
    </div>
  );
}
