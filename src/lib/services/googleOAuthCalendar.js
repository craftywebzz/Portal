import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import open from 'open';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

function loadCredentials() {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  return JSON.parse(content);
}

async function authorize() {
  const credentials = loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }

  // If not, get a new token
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });
  await open(authUrl);

  // Ask user for the code
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = await new Promise(resolve => {
    rl.question('Enter the code from that page here: ', answer => {
      rl.close();
      resolve(answer);
    });
  });
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  // Store the token to disk for later program executions
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  return oAuth2Client;
}

export async function createCalendarEventOAuth(eventData) {
  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });
  const event = {
    summary: eventData.title,
    description: eventData.description,
    start: {
      dateTime: `${eventData.date}T${eventData.start_time}:00`,
      timeZone: 'UTC',
    },
    end: {
      dateTime: eventData.end_time
        ? `${eventData.date}T${eventData.end_time}:00`
        : `${eventData.date}T${addMinutes(eventData.start_time, eventData.duration_minutes || 60)}:00`,
      timeZone: 'UTC',
    },
    location: eventData.location,
    attendees: eventData.attendees?.map(email => ({ email })) || [],
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
}

function addMinutes(timeStr, minutes) {
  const [hours, mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
} 