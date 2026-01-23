import React, { useState } from "react";
import NeonNav from "../components/NeonNav";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;

    setSending(true);

    try {
      const res = await fetch(`${BACKEND_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, message }),
      });

      if (!res.ok) {
        throw new Error("Contact submit failed");
      }

      // silent success
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch (err) {
      console.error("Contact submit error:", err);
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

        <form className="contact-form" onSubmit={handleSubmit}>
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
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
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

          <button className="contact-send" type="submit" disabled={sending}>
            {sending ? "SENDING..." : "SEND MESSAGE"}
          </button>
        </form>
      </main>
    </div>
  );
}
