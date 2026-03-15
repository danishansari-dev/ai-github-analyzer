import os
import time
import requests
import re
from typing import Dict, List, Any, Optional
from github import Github, GithubException, UnknownObjectException, RateLimitExceededException
from dotenv import load_dotenv

# Load all environment variables from .env file
load_dotenv()

class GitHubService:
    """
    Service to interact with the GitHub API using PyGithub.
    This service handles profile fetching, repositories, and README content.
    """

    def __init__(self):
        # We use a GITHUB_TOKEN for higher rate limits and personal access
        self.token = os.getenv("GITHUB_TOKEN")
        if not self.token:
            print("Warning: GITHUB_TOKEN not found in environment variables. Rate limits will be severely restricted.")
        
        self.g = Github(self.token)

    def get_user_profile(self, username: str) -> Dict[str, Any]:
        """
        Fetches basic profile information for a GitHub user.
        @param username - The GitHub username to fetch
        @returns A dictionary containing profile details
        @throws ValueError if the user is not found
        """
        try:
            time.sleep(0.5)  # 0.5s delay between requests as requested
            user = self.g.get_user(username)
            return {
                "name": user.name,
                "bio": user.bio,
                "avatar_url": user.avatar_url,
                "public_repos": user.public_repos,
                "followers": user.followers,
                "following": user.following,
                "html_url": user.html_url,
                "github_user_id": user.id
            }
        except UnknownObjectException:
            # Raise ValueError as per user request for "user not found"
            raise ValueError(f"User '{username}' not found.")
        except RateLimitExceededException:
            raise Exception("GitHub API rate limit exceeded. Please try again later.")
        except GithubException as e:
            raise Exception(f"GitHub API error: {str(e)}")
        except Exception as e:
            raise Exception(f"Network or unexpected error while fetching profile: {str(e)}")

    def get_user_repos(self, username: str) -> List[Dict[str, Any]]:
        """
        Fetches and sorts the top repositories for a user.
        Sorts initially by stars to limit API calls, fetches commit counts for the top 10,
        calculates a combined score (stars * 2 + commits), and returns the top 5.
        @param username - The GitHub username
        @returns List of top 5 repository dictionaries
        """
        try:
            time.sleep(0.5)
            user = self.g.get_user(username)
            # GitHub API doesn't allow direct star sorting on user.get_repos()
            # We fetch all (within reason) and sort locally
            repos = user.get_repos()
            
            safe_repos = []
            if repos:
                for repo in repos:
                    try:
                        # Evaluating a property forces the API to fetch repo details,
                        # triggering a 451 DMCA exception if the repo is blocked.
                        _ = repo.stargazers_count
                        safe_repos.append(repo)
                    except Exception as e:
                        print(f"Skipping repo due to error (possibly DMCA 451): {e}")
                        continue

            # Sort by stargazers_count descending and take top 10
            sorted_repos = sorted(safe_repos, key=lambda x: x.stargazers_count, reverse=True)[:10]
            
            repo_list = []
            sorted_repos = sorted_repos or []
            for repo in sorted_repos:
                total_commits = 1
                try:
                    headers = {}
                    if self.token:
                        headers["Authorization"] = f"token {self.token}"
                    req_url = f"https://api.github.com/repos/{username}/{repo.name}/commits?per_page=1"
                    res = requests.head(req_url, headers=headers, timeout=5)
                    link_header = res.headers.get("Link")
                    if link_header:
                        match = re.search(r'page=(\d+)>; rel="last"', link_header)
                        if match:
                            total_commits = int(match.group(1))
                except Exception as e:
                    print(f"Failed to fetch commit count for {repo.name}: {e}")

                topics = []
                try:
                    topics = repo.get_topics() or []
                except Exception:
                    pass

                repo_list.append({
                    "name": repo.name,
                    "description": repo.description,
                    "language": repo.language,
                    "stargazers_count": repo.stargazers_count,
                    "total_commits": total_commits,
                    "html_url": repo.html_url,
                    "topics": topics,
                    "combined_score": (repo.stargazers_count * 2) + total_commits
                })
                
            # Sort by the new combined score descending
            repo_list.sort(key=lambda x: x["combined_score"], reverse=True)
            
            # Return top 5
            return repo_list[:5]
        except UnknownObjectException:
            raise ValueError(f"User '{username}' not found.")
        except RateLimitExceededException:
            raise Exception("GitHub API rate limit exceeded.")
        except Exception as e:
            raise Exception(f"Error fetching repositories: {str(e)}")

    def get_repo_readme(self, username: str, repo_name: str) -> str:
        """
        Gets the README content for a specific repository.
        @param username - The owner of the repository
        @param repo_name - The name of the repository
        @returns README content as a plain text string, or empty string if not found
        """
        try:
            time.sleep(0.5)
            repo = self.g.get_repo(f"{username}/{repo_name}")
            readme_content = repo.get_readme()
            # Decoded content is returned as a plain text string
            return readme_content.decoded_content.decode('utf-8')
        except UnknownObjectException:
            # Return empty string if README doesn't exist as per requirements
            return ""
        except RateLimitExceededException:
            raise Exception("GitHub API rate limit exceeded.")
        except Exception as e:
            # Return empty string or handle specifically? Req says return empty string for not exist
            # but we should still handle other errors if needed.
            return ""

    def get_language_breakdown(self, username: str) -> Dict[str, int]:
        """
        Aggregates the total bytes of each language used across all of a user's repositories.
        @param username - The GitHub username
        @returns a dictionary where keys are languages and values are byte counts
        """
        try:
            time.sleep(0.5)
            user = self.g.get_user(username)
            repos = user.get_repos()
            
            language_breakdown = {}
            if repos:
                for repo in repos:
                    try:
                        time.sleep(0.1) # Minimal additional delay for nested calls
                        languages = repo.get_languages() or {}
                        for lang, bytes_count in languages.items():
                            language_breakdown[lang] = language_breakdown.get(lang, 0) + bytes_count
                    except Exception as e:
                        print(f"Skipping repo language fetch due to error: {e}")
                        continue
            
            return language_breakdown
        except UnknownObjectException:
            raise ValueError(f"User '{username}' not found.")
        except Exception as e:
            raise Exception(f"Error calculating language breakdown: {str(e)}")

    def get_top_repos_with_readme(self, username: str) -> List[Dict[str, Any]]:
        """
        Combines repository info and README content for the top 3 starred repositories.
        @param username - The GitHub username
        @returns List of top 3 repositories with their README content
        """
        # Get top 10 repos first
        top_repos = self.get_user_repos(username) or []
        # Take the top 3
        top_3 = top_repos[:3]
        
        for repo in top_3:
            # Fetch and attach readme content
            repo["readme"] = self.get_repo_readme(username, repo["name"])

        return top_3

    def get_user_badges(self, username: str) -> list:
        """
        Checks which GitHub achievement badges a user has unlocked.
        Uses HEAD requests against the user's profile achievements tab
        to avoid downloading full HTML bodies.
        @param username - The GitHub username to check
        @returns List of unlocked badge slug strings
        """
        # All known GitHub achievement slugs as of 2024
        achievement_slugs = [
            "pull-shark", "starstruck", "pair-extraordinaire",
            "galaxy-brain", "yolo", "quickdraw",
            "arctic-code-vault-contributor", "public-sponsor",
            "heart-on-your-sleeve", "open-sourcerer"
        ]

        unlocked = []
        headers = {}
        if self.token:
            headers["Authorization"] = f"token {self.token}"

        for slug in achievement_slugs:
            try:
                url = f"https://github.com/{username}?tab=achievements&achievement={slug}"
                res = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
                if res.status_code == 200:
                    unlocked.append(slug)
            except Exception:
                # Skip individual badge check failures silently
                pass

        return unlocked

    async def get_readme_skills(self, username: str) -> List[str]:
        """Fetch and parse README for additional skill/language mentions."""
        # implementation details here...
        # (keeping existing method, just finding place to insert new one)
        pass

    def get_readme_contact_info(self, username: str) -> dict:
        """
        Extract contact info and social links from profile README.
        Only extracting from public README - user chose to make this public.
        """
        import re
        contact = {}
        try:
            repo = self.g.get_repo(f"{username}/{username}")
            content = repo.get_contents("README.md")
            readme_text = content.decoded_content.decode('utf-8', errors='ignore')

            # --- Phone extraction ---
            phone_patterns = [
                r'\+\d{1,3}[\s\-]?\d{5,10}[\s\-]?\d{0,5}',
                r'\+\d{1,3}[\s\-]\(?\d{3}\)?[\s\-]\d{3}[\s\-]\d{4}',
                r'\b[6-9]\d{9}\b',
            ]
            for pattern in phone_patterns:
                matches = re.findall(pattern, readme_text)
                for match in matches:
                    digits = re.sub(r'\D', '', match)
                    if 10 <= len(digits) <= 13:
                        contact['phone'] = match.strip()
                        break
                if contact.get('phone'):
                    break

            # --- Email extraction ---
            email_pattern = r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
            emails = re.findall(email_pattern, readme_text)
            if emails:
                contact['readme_email'] = emails[0]

            # --- Social/profile URL extraction from markdown links ---
            # Matches both [label](url) and bare URLs
            url_pattern = r'https?://[^\s\)\]\"\'<>]+'
            all_urls = re.findall(url_pattern, readme_text)

            social_url_map = {
                'linkedin.com/in/': 'linkedin',
                'linkedin.com/pub/': 'linkedin',
                'twitter.com/': 'twitter',
                'x.com/': 'twitter',
                'leetcode.com/u/': 'leetcode',
                'leetcode.com/': 'leetcode',
                'kaggle.com/': 'kaggle',
                'codeforces.com/profile/': 'codeforces',
                'codechef.com/users/': 'codechef',
                'hackerrank.com/': 'hackerrank',
                'stackoverflow.com/users/': 'stackoverflow',
                'dev.to/': 'devto',
                'medium.com/': 'medium',
                'hashnode.dev': 'hashnode',
                'youtube.com/': 'youtube',
                'instagram.com/': 'instagram',
                'discord.gg/': 'discord',
                'discord.com/': 'discord',
                'telegram.me/': 'telegram',
                't.me/': 'telegram',
                'portfolio': 'portfolio',
            }

            for url in all_urls:
                url_clean = url.rstrip('.,)')
                url_lower = url_clean.lower()

                # Skip GitHub links (already have those)
                if 'github.com' in url_lower:
                    continue

                for pattern, platform in social_url_map.items():
                    if pattern in url_lower:
                        # Don't overwrite if already found from GitHub API
                        if platform not in contact:
                            contact[platform] = url_clean
                        break

        except Exception:
            pass

        return contact

    def get_social_links(self, user) -> Dict[str, str]:
        """Extract all available social/contact links from GitHub profile."""
        links = {}
        
        # Direct GitHub User object fields
        if user.blog:
            url = user.blog if user.blog.startswith('http') else f'https://{user.blog}'
            links['website'] = url
        
        if user.twitter_username:
            links['twitter'] = f'https://twitter.com/{user.twitter_username}'
        
        if user.email:
            links['email'] = f'mailto:{user.email}'
        
        # GitHub Social Accounts API (newer API - handles LinkedIn, YouTube, etc.)
        try:
            social_accounts = user.get_social_accounts()
            for account in social_accounts:
                provider = account.provider.lower()  # 'linkedin', 'youtube', 'twitch', etc.
                links[provider] = account.url
        except Exception:
            pass
        
        # Always include GitHub profile itself
        links['github'] = user.html_url
        
        return links

    def get_readme_skills(self, username: str) -> List[str]:
        """Fetch username/username README and extract programming language mentions."""
        try:
            time.sleep(0.5)
            repo = self.g.get_repo(f"{username}/{username}")
            content = repo.get_contents("README.md")
            readme_text = content.decoded_content.decode('utf-8', errors='ignore').lower()
            
            # Match against known language names
            known_languages = [
                "javascript", "typescript", "python", "java", "c++", "c#", "go",
                "rust", "ruby", "php", "swift", "kotlin", "dart", "scala", "r",
                "react", "vue", "angular", "svelte", "node.js", "django", "flask",
                "fastapi", "docker", "kubernetes", "mongodb", "postgresql", "mysql",
                "redis", "firebase", "aws", "pytorch", "tensorflow", "next.js",
                "tailwind", "graphql", "linux", "bash", "shell", "html", "css",
            ]
            
            found = []
            for lang in known_languages:
                if lang in readme_text and lang not in found:
                    found.append(lang.title())
            
            return found[:10]  # max 10 from README
        except Exception:
            return []
