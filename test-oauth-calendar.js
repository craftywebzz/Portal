const { createCalendarEventOAuth } = require('./src/lib/services/googleOAuthCalendar');

(async () => {
  const event = {
    title: "OAuth Test Meeting",
    description: "Testing Google Calendar OAuth2 integration",
    date: new Date().toISOString().split('T')[0],
    start_time: "10:00",
    duration_minutes: 30,
    location: "Online",
    attendees: ["mehtaoashe2006@gmail.com"]
  };
  const result = await createCalendarEventOAuth(event);
})();