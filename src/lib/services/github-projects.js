import { GitHubService } from '@/lib/github';

export class GitHubProjectsService {
  constructor() {
    this.githubService = new GitHubService();
    this.organization = 'nst-sdc';
    this.rateLimitRemaining = 60;
    this.rateLimitReset = new Date(Date.now() + 3600000); // 1 hour from now
  }

  updateRateLimit(headers) {
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    
    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }
    if (reset) {
      this.rateLimitReset = new Date(parseInt(reset, 10) * 1000);
    }
  }

  isRateLimited() {
    return this.rateLimitRemaining <= 0 && new Date() < this.rateLimitReset;
  }

  async fetchOrganizationRepositories() {
    try {
      if (this.isRateLimited()) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }

      // Test API access first
      const apiTest = await this.githubService.testApiAccess();

      if (!apiTest.orgAccess) {
        throw new Error('Unable to access organization data. Please check token permissions.');
      }

      const response = await fetch(
        `https://api.github.com/orgs/${this.organization}/repos?sort=updated&direction=desc`,
        {
          headers: this.githubService.getHeaders()
        }
      );

      this.updateRateLimit(response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API Error Response:', errorText);
        
        if (response.status === 404) {
          throw new Error('Organization not found');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Please check your GitHub token permissions.');
        }
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      const repositories = await response.json();
      return repositories.map(repo => ({
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || '',
        tags: repo.topics || [],
        techStack: repo.language ? [repo.language] : [],
        status: repo.archived ? 'archived' : 'active',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        owner: repo.owner.login,
        repoUrl: repo.html_url,
        defaultBranch: repo.default_branch,
        openIssuesCount: repo.open_issues_count,
        lastUpdated: repo.updated_at,
        createdAt: repo.created_at,
        isGitHubProject: true,
        topics: repo.topics || [],
        language: repo.language,
        archived: repo.archived,
        visibility: repo.visibility
      }));
    } catch (error) {
      console.error('Error fetching organization repositories:', error);
      throw error;
    }
  }

  async fetchRepositoryContributors(repoName) {
    try {
      if (this.isRateLimited()) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }

      const response = await fetch(
        `https://api.github.com/repos/${this.organization}/${repoName}/contributors`,
        {
          headers: this.githubService.getHeaders()
        }
      );

      this.updateRateLimit(response.headers);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Please check your GitHub token permissions.');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const contributors = await response.json();
      return contributors.map(contributor => ({
        id: contributor.id.toString(),
        username: contributor.login,
        avatar: contributor.avatar_url,
        contributions: contributor.contributions,
        profileUrl: contributor.html_url
      }));
    } catch (error) {
      console.error('Error fetching repository contributors:', error);
      throw error;
    }
  }

  async fetchRepositoryDetails(repoName) {
    try {
      if (this.isRateLimited()) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }

      const [repoResponse, contributorsResponse] = await Promise.all([
        fetch(
          `https://api.github.com/repos/${this.organization}/${repoName}`,
          {
            headers: this.githubService.getHeaders()
          }
        ),
        fetch(
          `https://api.github.com/repos/${this.organization}/${repoName}/contributors`,
          {
            headers: this.githubService.getHeaders()
          }
        )
      ]);

      this.updateRateLimit(repoResponse.headers);
      this.updateRateLimit(contributorsResponse.headers);

      if (!repoResponse.ok) {
        if (repoResponse.status === 404) {
          throw new Error('Repository not found');
        }
        if (repoResponse.status === 403) {
          throw new Error('Access denied. Please check your GitHub token permissions.');
        }
        throw new Error(`GitHub API error: ${repoResponse.status}`);
      }

      if (!contributorsResponse.ok) {
        console.warn('Failed to fetch contributors:', contributorsResponse.status);
      }

      const [repo, contributors] = await Promise.all([
        repoResponse.json(),
        contributorsResponse.ok ? contributorsResponse.json() : []
      ]);

      return {
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || '',
        tags: repo.topics || [],
        techStack: repo.language ? [repo.language] : [],
        status: repo.archived ? 'archived' : 'active',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        owner: repo.owner.login,
        repoUrl: repo.html_url,
        defaultBranch: repo.default_branch,
        openIssuesCount: repo.open_issues_count,
        lastUpdated: repo.updated_at,
        createdAt: repo.created_at,
        isGitHubProject: true,
        topics: repo.topics || [],
        language: repo.language,
        archived: repo.archived,
        visibility: repo.visibility,
        contributors: contributors.map(contributor => ({
          id: contributor.id.toString(),
          username: contributor.login,
          avatar: contributor.avatar_url,
          contributions: contributor.contributions,
          profileUrl: contributor.html_url
        }))
      };
    } catch (error) {
      console.error('Error fetching repository details:', error);
      throw error;
    }
  }
} 