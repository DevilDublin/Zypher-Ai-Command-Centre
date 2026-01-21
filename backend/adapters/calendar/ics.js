export function buildICS({ title, description, start, end }) {
  const dt = d => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Zypher Agents//EN
BEGIN:VEVENT
UID:${Date.now()}@zypheragents.com
DTSTAMP:${dt(new Date())}
DTSTART:${dt(start)}
DTEND:${dt(end)}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
}
