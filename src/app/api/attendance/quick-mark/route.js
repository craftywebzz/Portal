import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.attendance_code) {
      return NextResponse.json(
        { error: 'Attendance code is required' },
        { status: 400 }
      );
    }

    // Find meeting with matching attendance code
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, attendance_open, attendance_code, date')
      .eq('attendance_code', body.attendance_code)
      .eq('attendance_open', true)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Invalid or expired attendance code' },
        { status: 404 }
      );
    }

    // Check if user is invited to the meeting
    const { data: invite } = await supabase
      .from('meeting_invites')
      .select('id')
      .eq('meeting_id', meeting.id)
      .eq('user_id', user.id)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: 'You are not invited to this meeting' },
        { status: 403 }
      );
    }

    // Check if attendance is already marked
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('meeting_id', meeting.id)
      .eq('user_id', user.id)
      .single();

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already marked for this meeting' },
        { status: 400 }
      );
    }

    // Mark attendance
    const { data: attendance, error } = await supabase
      .from('attendance')
      .insert({
        meeting_id: meeting.id,
        user_id: user.id,
        status: 'present',
        marked_by: user.id,
        arrival_time: new Date().toISOString()
      })
      .select(`
        *,
        meeting:meetings(id, title, date),
        user:profiles(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: attendance,
      message: 'Attendance marked successfully'
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to mark attendance',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 