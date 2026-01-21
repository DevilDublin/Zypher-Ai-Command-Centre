import { buildICS } from './adapters/calendar/ics.js';
import { getAdapters } from "./adapters/core/router.js";

export async function leadHandler2(req, res) {
  const lead = req.body;

  const clientId = req.headers["x-client-id"] || "default_client";
  const environment = req.headers["x-env"] || "LIVE";

  console.log("LEAD2:", JSON.stringify(lead, null, 2));
  console.log("CLIENT:", clientId, "ENV:", environment);

  const runtimeEnv = req.headers["x-env"] || "TEST";
  const adapters = getAdapters({ environment: runtimeEnv });

  try {

      if (!lead.start || !lead.end) {
        console.error("❌ LEAD missing start/end:", lead);
        return res.status(400).json({ error: "Missing booking time" });
      }



      // 2) Create calendar booking using AI time
      const booking = await adapters.calendar.createBooking(clientId, {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        niche: lead.niche,
        start: lead.start,
        end: lead.end,
        timezone: lead.timezone || "Europe/London"
      });

        const calendarUrl = booking.htmlLink;

      const startPretty = new Date(lead.start).toLocaleString("en-GB", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit"
      });

    adapters.email.sendEmail(clientId, {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Zypher booking — ${lead.name} (${lead.niche})`,
      text: `New Zypher booking

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || "N/A"}
Niche: ${lead.niche}

Time:
${startPretty}

Calendar:
${booking.htmlLink}`
    });

      // 3) Client confirmation email
      adapters.email.sendEmail(clientId, {
        from: `Zypher Agents <${process.env.EMAIL_USER}>`,
        to: lead.email,
        
subject: "Your Zypher consultation is confirmed",
text: `Hi ${lead.name},

Your meeting has been successfully scheduled.

Add it to your calendar:
${booking.htmlLink}

The video meeting link will be shared with you before the meeting.

If you need to make any changes, just reply to this email.

Zypher
`,
      });





      console.log("✅ LEAD2 booked:", booking.htmlLink, booking.meetLink);
    console.log("LEAD2 routed via adapters");
  } catch (err) {
    console.error("LEAD2 adapter error:", err);
  }

  res.json({ ok: true });
}