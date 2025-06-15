import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function GET() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Get authenticated user's repositories
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      direction: 'desc',
      per_page: 100
    });

    // Transform the data to match our project format
    const transformedRepos = repos.map(repo => ({
      id: repo.id.toString(),
      name: repo.name,
      description: repo.description,
      github_repo_url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      last_updated: repo.updated_at,
      language: repo.language,
      tags: [repo.language].filter(Boolean),
      status: 'active',
      is_github_project: true
    }));

    return NextResponse.json(transformedRepos);
  } catch (error) {
    console.error('GitHub API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repositories' },
      { status: 500 }
    );
  }
} 