import { NextResponse } from 'next/server';
import { GoogleCalendarService, EmailService } from '@/lib/services/googleCalendar';

const googleCalendarService = new GoogleCalendarService();
const emailService = new EmailService();

export async function GET() {
  try {
    // Test calendar event
    const testEvent = {
      title: "Test Meeting",
      description: "This is a test meeting to verify calendar integration",
      date: new Date().toISOString().split('T')[0],
      start_time: "10:00",
      duration_minutes: 30,
      location: "Test Location",
      attendees: [process.env.SMTP_USER] // Send to the configured email
    };

    // Create calendar event
    const calendarEvent = await googleCalendarService.createCalendarEvent(testEvent);
    
    // Send test email
    await emailService.sendMeetingInvitation(testEvent, [process.env.SMTP_USER]);

    return NextResponse.json({
      success: true,
      message: "Test completed successfully",
      calendar_event: calendarEvent
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 