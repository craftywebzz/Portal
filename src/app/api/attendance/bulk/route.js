import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { meeting_id, attendance } = await request.json();

    if (!meeting_id || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Verify user is authorized (meeting creator or admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is meeting creator or admin
    const { data: meeting } = await supabase
      .from('meetings')
      .select('created_by')
      .eq('id', meeting_id)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!meeting || (meeting.created_by !== user.id && !profile?.is_admin)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Prepare attendance records
    const attendanceRecords = attendance.map(record => ({
      meeting_id: meeting_id,
      user_id: record.user_id,
      status: record.status,
      marked_at: new Date().toISOString(),
      marked_by: user.id
    }));

    // Delete existing attendance records for this meeting
    const { error: deleteError } = await supabase
      .from('attendance')
      .delete()
      .eq('meeting_id', meeting_id);

    if (deleteError) {
      console.error('Error deleting existing attendance:', deleteError);
      return NextResponse.json(
        { error: 'Failed to update attendance' },
        { status: 500 }
      );
    }

    // Insert new attendance records
    const { error: insertError } = await supabase
      .from('attendance')
      .insert(attendanceRecords);

    if (insertError) {
      console.error('Error inserting attendance:', insertError);
      return NextResponse.json(
        { error: 'Failed to save attendance' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Attendance marked successfully',
      count: attendanceRecords.length
    });
  } catch (error) {
    console.error('Error in attendance bulk save:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 