import os
import time
import requests
import re
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor
from github import Github, GithubException, UnknownObjectException, RateLimitExceededException
from dotenv import load_dotenv

# Load local .env only outside Vercel — never ship secrets via uploaded .env files
if os.getenv("VERCEL") != "1":
    load_dotenv()

class GitHubService:
    """
    Service to interact with the GitHub API using PyGithub.
    This service handles profile fetching, repositories, and README content.
    """

    def __init__(self):
        # We use a GITHUB_TOKEN for higher rate limits and personal access.
        # Strip whitespace — Vercel/CLI env injection can leave trailing \r\n.
        raw = os.getenv("GITHUB_TOKEN")
        self.token = raw.strip() if raw else None
        if not self.token:
            print("Warning: GITHUB_TOKEN not found in environment variables. Rate limits will be severely restricted.")
            self.g = Github()
        else:
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

            # Tricky logic: We define a helper task function to run in a thread pool.
            # This allows us to fetch commits and topics concurrently for all top 10 repos.
            # We catch exceptions per-repository so that one bad API call doesn't ruin the whole analysis.
            def fetch_repo_details(repo) -> Dict[str, Any]:
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
                    # Why the log exists: to help debug transient GitHub API network errors
                    print(f"Failed to fetch commit count for {repo.name}: {e}")

                topics = []
                try:
                    topics = repo.get_topics() or []
                except Exception:
                    pass

                return {
                    "name": repo.name,
                    "description": repo.description,
                    "language": repo.language,
                    "stargazers_count": repo.stargazers_count,
                    "total_commits": total_commits,
                    "html_url": repo.html_url,
                    "topics": topics,
                    "combined_score": (repo.stargazers_count * 2) + total_commits
                }

            # Parallelizing network calls to cut down total response latency for multiple repos
            with ThreadPoolExecutor(max_workers=10) as executor:
                results = executor.map(fetch_repo_details, sorted_repos)
                for r in results:
                    repo_list.append(r)
                
            # Sort by the new combined score descending
            repo_list.sort(key=lambda x: x.get("combined_score", 0), reverse=True)
            
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

    def get_top_repos_with_readme(self, username: str, top_repos: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """
        Combines repository info and README content for the top 3 starred repositories.
        Why it exists: We need the project readmes to let LLM analyze individual complexity and achievements.
        Tricky logic: Accepts pre-fetched repos to avoid redundant fetching, and uses ThreadPoolExecutor
        to download the top 3 READMEs concurrently.
        @param username - The GitHub username
        @param top_repos - Pre-fetched list of repositories (optional)
        @returns List of top 3 repositories with their README content
        """
        if top_repos is None:
            # Fallback if no pre-fetched repos list is supplied
            top_repos = self.get_user_repos(username) or []
        
        # Take the top 3
        top_3 = top_repos[:3]
        
        def fetch_readme(repo):
            repo["readme"] = self.get_repo_readme(username, repo["name"])
            return repo

        # Concurrently fetch READMEs for the top 3 repos to reduce latency
        with ThreadPoolExecutor(max_workers=3) as executor:
            top_3 = list(executor.map(fetch_readme, top_3))

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

        # Tricky logic: We define a nested function to process each badge independently in parallel.
        # This prevents a single timeout/error from delaying the other achievement checks.
        # Why it exists: 10 sequential HTTP requests take too long (>5s) and trigger Vercel/client timeout.
        def check_badge(slug: str) -> Optional[str]:
            try:
                url = f"https://github.com/{username}?tab=achievements&achievement={slug}"
                res = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
                if res.status_code == 200:
                    return slug
            except Exception:
                # Ignore individual failures (such as network hiccups) to keep execution resilient
                pass
            return None

        with ThreadPoolExecutor(max_workers=10) as executor:
            results = executor.map(check_badge, achievement_slugs)
            for r in results:
                if r is not None:
                    unlocked.append(r)

        return unlocked


    def get_profile_readme(self, username: str) -> str:
        """
        Fetches the profile README.md text for a user.
        Why it exists: Separating README fetching from parsing enables fetching it once
        and running all other README-based processing completely in-memory.
        @param username - The GitHub username
        @returns Plain text content of the user's profile README, or empty string if not found
        """
        try:
            time.sleep(0.5)
            # Fetching the special profile repository username/username
            repo = self.g.get_repo(f"{username}/{username}")
            content = repo.get_contents("README.md")
            return content.decoded_content.decode('utf-8', errors='ignore')
        except Exception:
            # Return empty string if repository or README doesn't exist
            return ""

    def get_readme_contact_info(self, username: str, readme_text: Optional[str] = None) -> dict:
        """
        Extract contact info and social links from profile README.
        Only extracting from public README - user chose to make this public.
        @param username - The GitHub username
        @param readme_text - Pre-fetched profile README text (optional)
        @returns Dictionary of extracted social and contact links
        """
        import re
        contact = {}
        try:
            if readme_text is None:
                readme_text = self.get_profile_readme(username)
            if not readme_text:
                return contact


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
            # More permissive URL extraction — handles markdown badges and wrapped links
            url_pattern = r'https?://(?:www\.)?[^\s\)\]\"\'<>,;]+'
            all_urls = re.findall(url_pattern, readme_text)

            # Also extract URLs from markdown image-link patterns like [![...](...)](/url)
            markdown_link_pattern = r'\[(?:[^\]]*)\]\((https?://[^\)]+)\)'
            markdown_urls = re.findall(markdown_link_pattern, readme_text)
            all_urls = list(set(all_urls + markdown_urls))

            print(f"[readme_contact] All URLs found in README: {all_urls[:20]}")

            social_url_map = {
                'linkedin.com/in/': 'linkedin',
                'linkedin.com/pub/': 'linkedin',
                'twitter.com/': 'twitter',
                'x.com/': 'twitter',
                'leetcode.com': 'leetcode',
                'kaggle.com': 'kaggle',
                'codeforces.com/profile/': 'codeforces',
                'codechef.com/users/': 'codechef',
                'hackerrank.com': 'hackerrank',
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
            
            print(f"[readme_contact] Final contact dict: {contact}")

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

    def get_readme_skills(self, username: str, readme_text: Optional[str] = None) -> list:
        """
        Fetch username/username README and extract ALL technology mentions.
        @param username - The GitHub username
        @param readme_text - Pre-fetched profile README text (optional)
        @returns List of detected technology skill names
        """
        try:
            if readme_text is None:
                readme_text = self.get_profile_readme(username)
            if not readme_text:
                return []
            readme_text = readme_text.lower()

            # Comprehensive tech map: search term → display name
            tech_map = {
                # Languages
                "python": "Python",
                "java": "Java",
                "javascript": "JavaScript",
                "typescript": "TypeScript",
                "c++": "C++",
                "c#": "C#",
                "golang": "Go",
                " go ": "Go",
                "rust": "Rust",
                "ruby": "Ruby",
                "php": "PHP",
                "swift": "Swift",
                "kotlin": "Kotlin",
                "dart": "Dart",
                "scala": "Scala",
                " r ": "R",
                "matlab": "MATLAB",
                "bash": "Bash",
                "bash script": "Bash",
                "shell": "Shell",
                "powershell": "PowerShell",
                "sql": "SQL",
                "lua": "Lua",
                "perl": "Perl",
                "haskell": "Haskell",
                "elixir": "Elixir",
                "groovy": "Groovy",
                # Frontend
                "react": "React",
                "vue": "Vue",
                "angular": "Angular",
                "svelte": "Svelte",
                "next.js": "Next.js",
                "nextjs": "Next.js",
                "nuxt": "Nuxt.js",
                "tailwind": "Tailwind",
                "bootstrap": "Bootstrap",
                "vite": "Vite",
                "webpack": "Webpack",
                "html": "HTML",
                "css": "CSS",
                "sass": "SCSS",
                "scss": "SCSS",
                "electron": "Electron",
                # Backend
                "node.js": "Node.js",
                "nodejs": "Node.js",
                "express": "Express",
                "django": "Django",
                "flask": "Flask",
                "fastapi": "FastAPI",
                "spring": "Spring",
                "spring boot": "Spring",
                "laravel": "Laravel",
                "rails": "Rails",
                "graphql": "GraphQL",
                "rest api": "REST API",
                # Data Science & ML
                "pytorch": "PyTorch",
                "tensorflow": "TensorFlow",
                "scikit-learn": "Scikit-learn",
                "sklearn": "Scikit-learn",
                "scikit learn": "Scikit-learn",
                "opencv": "OpenCV",
                "numpy": "NumPy",
                "pandas": "Pandas",
                "matplotlib": "Matplotlib",
                "plotly": "Plotly",
                "seaborn": "Seaborn",
                "keras": "Keras",
                "hugging face": "HuggingFace",
                "langchain": "LangChain",
                "jupyter": "Jupyter",
                "power bi": "Power BI",
                "tableau": "Tableau",
                # Cloud & DevOps
                "docker": "Docker",
                "kubernetes": "Kubernetes",
                "aws": "AWS",
                "amazon web services": "AWS",
                "google cloud": "GCP",
                "gcp": "GCP",
                "azure": "Azure",
                "github actions": "GitHub Actions",
                "jenkins": "Jenkins",
                "ansible": "Ansible",
                "terraform": "Terraform",
                "linux": "Linux",
                "ubuntu": "Ubuntu",
                "nginx": "Nginx",
                "apache": "Apache",
                # Databases
                "mongodb": "MongoDB",
                "postgresql": "PostgreSQL",
                "postgres": "PostgreSQL",
                "mysql": "MySQL",
                "redis": "Redis",
                "firebase": "Firebase",
                "sqlite": "SQLite",
                "cassandra": "Cassandra",
                "elasticsearch": "Elasticsearch",
                # Tools
                "git": "Git",
                "postman": "Postman",
                "figma": "Figma",
                "unity": "Unity",
                "godot": "Godot",
                "solidity": "Solidity",
            }

            found = []
            seen_display = set()

            for search_term, display_name in tech_map.items():
                # Avoid duplicate display names
                if display_name in seen_display:
                    continue
                
                # Use regex word boundaries (negative lookbehind/lookahead for alphanumerics)
                # to avoid matching "rust" in "trust", "go" in "good", "r" in "for"
                escaped_term = re.escape(search_term.strip())
                pattern = rf"(?<![a-zA-Z0-9_]){escaped_term}(?![a-zA-Z0-9_])"
                
                if re.search(pattern, readme_text):
                    found.append(display_name)
                    seen_display.add(display_name)

            print(f"[readme_skills] Found {len(found)} skills: {found}")
            return found  # Return ALL found, no cap

        except Exception as e:
            print(f"[readme_skills] Error: {e}")
            return []
