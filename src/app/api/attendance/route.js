// API routes for attendance management
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/attendance - Get attendance records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const meeting_id = searchParams.get('meeting_id');

    if (!meeting_id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Verify user is authorized
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to view attendance' },
        { status: 401 }
      );
    }

    // Check if user is meeting creator or admin
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('created_by')
      .eq('id', meeting_id)
      .single();

    if (meetingError) {
      console.error('Meeting error:', meetingError);
      return NextResponse.json(
        { error: 'Failed to fetch meeting details' },
        { status: 500 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Check if user is authorized to view attendance
    if (!meeting || (meeting.created_by !== user.id && !profile?.is_admin)) {
      return NextResponse.json(
        { error: 'Unauthorized to view attendance' },
        { status: 403 }
      );
    }

    // Fetch attendance records
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('meeting_id', meeting_id);

    if (attendanceError) {
      console.error('Attendance error:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      );
    }

    return NextResponse.json(attendance);

  } catch (error) {
    console.error('Error in GET /api/attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/attendance - Mark attendance
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
    if (!body.meeting_id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    // Check if meeting exists and attendance is open
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, attendance_open, attendance_code, date')
      .eq('id', body.meeting_id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    if (!meeting.attendance_open) {
      return NextResponse.json(
        { error: 'Attendance is not open for this meeting' },
        { status: 400 }
      );
    }

    // Verify attendance code if provided
    if (meeting.attendance_code && body.attendance_code !== meeting.attendance_code) {
      return NextResponse.json(
        { error: 'Invalid attendance code' },
        { status: 400 }
      );
    }

    // Check if user is invited to the meeting
    const { data: invite } = await supabase
      .from('meeting_invites')
      .select('id')
      .eq('meeting_id', body.meeting_id)
      .eq('user_id', user.id)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: 'You are not invited to this meeting' },
        { status: 403 }
      );
    }

    // Mark attendance (upsert to handle duplicate submissions)
    const attendanceData = {
      meeting_id: body.meeting_id,
      user_id: user.id,
      status: body.status || 'present',
      marked_by: user.id,
      arrival_time: new Date().toISOString(),
      notes: body.notes
    };

    const { data: attendance, error } = await supabase
      .from('attendance')
      .upsert(attendanceData, {
        onConflict: 'meeting_id,user_id'
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
