import { google } from 'googleapis';
import nodemailer from 'nodemailer';

export class GoogleCalendarService {
  constructor() {
    this.calendar = google.calendar('v3');
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
  }

  async createCalendarEvent(meeting) {
    try {
      const auth = await this.auth.getClient();
      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: meeting.title,
        description: meeting.description,
        start: {
          dateTime: `${meeting.date}T${meeting.start_time}:00Z`,
          timeZone: 'UTC',
        },
        end: {
          dateTime: meeting.end_time 
            ? `${meeting.date}T${meeting.end_time}:00Z`
            : `${meeting.date}T${this.addMinutes(meeting.start_time, meeting.duration_minutes || 60)}:00Z`,
          timeZone: 'UTC',
        },
        location: meeting.location,
        attendees: [{ email: "mehtaoashe2006@gmail.com" }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all',
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}

// Email service for sending notifications
export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendMeetingInvitation(meeting, attendees) {
    try {
      const emailContent = `
        <h2>Meeting Invitation: ${meeting.title}</h2>
        <p><strong>Date:</strong> ${meeting.date}</p>
        <p><strong>Time:</strong> ${meeting.start_time}</p>
        <p><strong>Location:</strong> ${meeting.location}</p>
        <p><strong>Description:</strong> ${meeting.description || 'No description provided'}</p>
        ${meeting.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${meeting.meeting_link}">${meeting.meeting_link}</a></p>` : ''}
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: attendees.join(', '),
        subject: `Meeting Invitation: ${meeting.title}`,
        html: emailContent,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending meeting invitation:', error);
      throw error;
    }
  }
} 