// API routes for project member management
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client that can bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET /api/projects/[id]/members - Get project members
export async function GET(request, { params }) {
  try {
    const { id: projectId } = params;
    console.log('Fetching members for project:', projectId);

    // First get the project UUID if numeric ID is provided
    let projectUuid = projectId;
    if (/^\d+$/.test(projectId)) {
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('numeric_id', parseInt(projectId, 10))
        .single();

      if (projectError) {
        console.error('Error finding project:', projectError);
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      projectUuid = project.id;
    }

    const { data: members, error } = await supabaseAdmin
      .from('project_members')
      .select(`
        id,
        role,
        is_active,
        user_id,
        joined_at,
        user:profiles(id, full_name, avatar_url, github_username)
      `)
      .eq('project_id', projectUuid)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // Transform the data
    const transformedMembers = members.map(member => ({
      id: member.id,
      userId: member.user_id,
      role: member.role,
      name: member.user.full_name,
      avatar: member.user.avatar_url || `https://i.pravatar.cc/150?u=${member.user.id}`,
      githubUsername: member.user.github_username,
      joinedAt: member.joined_at
    }));

    return NextResponse.json({
      success: true,
      data: transformedMembers,
      count: transformedMembers.length
    });

  } catch (error) {
    console.error('Error fetching project members:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch project members',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/members - Add member to project
export async function POST(request, { params }) {
  try {
    const { id: projectId } = params;
    const body = await request.json();
    
    console.log('Received request to add member:', {
      projectId,
      body
    });

    const { userId, role = 'member' } = body;

    if (!userId) {
      console.error('Missing userId in request');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // First, get the project to ensure it exists and get its UUID
    console.log('Looking up project with ID:', projectId);
    let projectUuid = projectId;
    
    // Handle numeric IDs
    if (/^\d+$/.test(projectId)) {
      console.log('ID is numeric, searching by numeric_id');
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('numeric_id', parseInt(projectId, 10))
        .single();

      if (projectError) {
        console.error('Project lookup error:', projectError);
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      projectUuid = project.id;
    }

    console.log('Using project UUID:', projectUuid);

    // Check if member already exists
    const { data: existingMembers, error: checkError } = await supabaseAdmin
      .from('project_members')
      .select('id, is_active')
      .eq('project_id', projectUuid)
      .eq('user_id', userId);

    if (checkError) {
      console.error('Error checking existing member:', checkError);
      return NextResponse.json(
        { error: 'Error checking existing member', details: checkError.message },
        { status: 500 }
      );
    }

    const existingMember = existingMembers?.[0];

    if (existingMember) {
      if (existingMember.is_active) {
        return NextResponse.json(
          { error: 'User is already a member of this project' },
          { status: 400 }
        );
      } else {
        // Reactivate the member
        const { error: updateError } = await supabaseAdmin
          .from('project_members')
          .update({ 
            is_active: true,
            role: role,
            left_at: null
          })
          .eq('id', existingMember.id);

        if (updateError) {
          console.error('Error reactivating member:', updateError);
          return NextResponse.json(
            { error: 'Error reactivating member', details: updateError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ 
          success: true,
          message: 'Member reactivated successfully'
        });
      }
    }

    // Add new member
    const { error: insertError } = await supabaseAdmin
      .from('project_members')
      .insert({
        project_id: projectUuid,
        user_id: userId,
        role: role,
        is_active: true
      });

    if (insertError) {
      console.error('Error creating member:', insertError);
      return NextResponse.json(
        { error: 'Error creating member', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Member added successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/projects/[id]/members:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/members - Remove member from project
export async function DELETE(request, { params }) {
  try {
    const { id: projectId } = params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Get project UUID if numeric ID is provided
    let projectUuid = projectId;
    if (/^\d+$/.test(projectId)) {
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('numeric_id', parseInt(projectId, 10))
        .single();

      if (projectError) {
        console.error('Error finding project:', projectError);
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      projectUuid = project.id;
    }

    // Remove member (set is_active to false)
    const { error } = await supabaseAdmin
      .from('project_members')
      .update({ 
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('project_id', projectUuid);

    if (error) {
      console.error('Error removing member:', error);
      return NextResponse.json(
        { error: 'Error removing member', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed from project successfully'
    });

  } catch (error) {
    console.error('Error removing project member:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to remove member from project',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
