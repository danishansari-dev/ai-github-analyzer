import os
import json
import logging
from typing import Dict, List, Any
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LLMService:
    """
    Service to interact with the Groq API for analyzing GitHub profiles.
    Used for its high speed and reliable JSON output capabilities.
    """

    def __init__(self):
        # GROQ_API_KEY is used for high-performance Llama 3 analysis
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            logging.warning("Warning: GROQ_API_KEY not found in environment variables.")

        # Initialize Groq client
        self.client = Groq(api_key=self.api_key)

    def _parse_json_response(self, response_text: str) -> Any:
        """
        Strips any residual markdown fencing and parses JSON.
        Even with response_mime_type set, this acts as a safety net.
        @param response_text - Raw text from the Gemini API
        @returns Parsed Python object (dict or list)
        """
        text = response_text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)

    def _call_groq_with_retry(self, system_prompt: str, user_prompt: str) -> Any:
        """
        Helper method to call Groq and parse the JSON response.
        Retries exactly once if JSON parsing fails to ensure robustness.
        @param system_prompt - Instructions for the model's behavior
        @param user_prompt - The specific data to analyze
        @returns Parsed Python object (dict or list)
        """
        response_text = ""
        for attempt in range(2):
            try:
                # Using Groq's chat completion with JSON mode for structured output
                response = self.client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    max_tokens=2000
                )

                response_text = response.choices[0].message.content
                print(f"  [groq] Raw response (first 200 chars): {response_text[:200]}")
                return self._parse_json_response(response_text)

            except json.JSONDecodeError as e:
                logging.warning(f"JSON parsing failed on attempt {attempt + 1}: {e}")
                if attempt == 1:
                    raise Exception(f"Failed to parse JSON from Groq after retry. Response: {response_text[:500]}")
            except Exception as e:
                raise Exception(f"Groq API error: {str(e)}")


    def analyze_stack(self, profile_data: Dict[str, Any], repos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes a developer's stack and profile based on GitHub data.
        @param profile_data - The user profile details from GitHub
        @param repos - A list of the user's top repositories
        @returns A dictionary with the analyzed primary stack, domains, summary, strengths, and gaps
        """
        print("Starting analyze_stack...")

        system_prompt = "You are a senior developer recruiter analyzing a GitHub profile. Return ONLY valid JSON, no explanation, no markdown backticks."

        name = profile_data.get('name', 'Developer')
        bio = profile_data.get('bio', 'No bio provided')
        public_repos = profile_data.get('public_repos', 0)

        repos = repos or []
        repos_summary = []
        for r in repos:
            desc = r.get('description') or 'No description'
            lang = r.get('language') or 'Unknown'
            repos_summary.append(f"- {r.get('name')}: {desc} (Language: {lang})")

        repos_str = "\n".join(repos_summary)

        user_prompt = f"""Analyze this GitHub profile and return a JSON object with exactly these keys:
- primary_stack: array of top 5 technologies used (languages + frameworks)
- domains: array of engineering domains detected (e.g. Machine Learning, Web Dev, MLOps, DevOps)
- profile_summary: 2-sentence human-readable summary of this developer
- strengths: array of exactly 3 specific strengths based on their repos
- gaps: array of exactly 2 notable gaps (missing tests, docs, diversity of projects, etc.)

Profile: {name}, {bio}, {public_repos} public repos.
Top repos:
{repos_str}"""

        result = self._call_groq_with_retry(system_prompt, user_prompt)
        print("analyze_stack done")
        return result


    def analyze_role_fit(self, stack_data: Dict[str, Any], repos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Scores a developer's fit for 5 specific engineering roles.
        @param stack_data - The analyzed stack data (from analyze_stack)
        @param repos - A list of the user's top repositories
        @returns A dictionary containing scores and the top role match
        """
        print("Starting analyze_role_fit...")

        system_prompt = "You are a technical recruiter. Return ONLY valid JSON."

        stack_data = stack_data or {}
        summary = stack_data.get('profile_summary', '')
        primary_stack = ", ".join(stack_data.get('primary_stack') or [])
        domains = ", ".join(stack_data.get('domains') or [])

        repos = repos or []
        repos_summary = []
        for r in repos:
            desc = r.get('description') or 'No description'
            repos_summary.append(f"- {r.get('name')}: {desc}")

        repos_str = "\n".join(repos_summary)

        user_prompt = f"""Score this developer for these 5 roles on a scale of 0-100 based on their GitHub profile.
Be strict and realistic - most developers score 40-70 range.
Return JSON with exactly these keys:
- scores: object with keys: ml_engineer, backend_developer, frontend_developer, mlops_engineer, full_stack_developer. Each value is integer 0-100.
- top_role: the key with highest score
- top_role_label: human readable name of top role
- reasoning: 2-sentence explanation of why they fit the top role

Developer profile summary: {summary}
Primary stack: {primary_stack}
Domains: {domains}
Repos:
{repos_str}"""

        result = self._call_groq_with_retry(system_prompt, user_prompt)
        print("analyze_role_fit done")
        return result


    def generate_resume_bullets(self, repos_with_readmes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generates resume bullet points for a developer's projects.
        @param repos_with_readmes - A list of repos that include a 'readme' field
        @returns A list of dictionaries representing projects and their resume bullets
        """
        print("Starting generate_resume_bullets...")

        system_prompt = "You are an expert technical resume writer. Return ONLY valid JSON."

        repos_with_readmes = repos_with_readmes or []
        projects_data = []
        for r in repos_with_readmes:
            name = r.get('name', 'Unknown')
            desc = r.get('description') or 'No description'
            lang = r.get('language') or 'Unknown'
            stars = r.get('stargazers_count', 0)
            url = r.get('html_url', '')

            readme = r.get('readme', '')
            readme_excerpt = readme[:500] if readme else 'No README provided'

            projects_data.append({
                "name": name,
                "description": desc,
                "language": lang,
                "stars": stars,
                "readme_excerpt": readme_excerpt,
                "url": url
            })

        projects_str = json.dumps(projects_data, indent=2)

        user_prompt = f"""Generate resume bullet points for each of these GitHub projects.
For each project return 2-3 bullet points following these strict rules:
- Start with a strong action verb (Built, Developed, Deployed, Trained, Designed, Implemented, Engineered)
- Mention the specific tech stack
- Include at least one metric (accuracy %, dataset size, users, latency, etc.) - infer from context if not explicit
- Keep each bullet under 160 characters
- Do NOT use vague words like 'various', 'multiple', 'several'

Return JSON array where each item has:
- project_name: string
- repo_url: string  
- bullets: array of bullet point strings

Projects data:
{projects_str}"""

        result = self._call_groq_with_retry(system_prompt, user_prompt)
        print("generate_resume_bullets done")
        return result
    def analyze_all(self, profile_data: Dict[str, Any], repos: List[Dict[str, Any]], repos_with_readmes: List[Dict[str, Any]], roast: bool = False) -> Dict[str, Any]:
        """
        Combines stack analysis, role fit, and resume bullet generation into ONE API call.
        This reduces 3 API round trips to 1, significantly cutting down latency.
        
        @param profile_data - The user profile details from GitHub
        @param repos - A list of the user's top repositories
        @param repos_with_readmes - A list of repos that include a 'readme' field
        @param roast - When True, generates a comedy roast instead of a professional summary
        @returns A dictionary containing 'stack', 'role_fit', and 'resume_bullets'
        """
        print(f"Starting unified analyze_all call (roast={roast})...")

        system_prompt = "You are a senior technical recruiter and resume expert. Return ONLY valid JSON."

        # Prepare context data
        name = profile_data.get('name', 'Developer')
        bio = profile_data.get('bio', 'No bio provided')
        public_repos = profile_data.get('public_repos', 0)

        repos = repos or []
        repos_summary = []
        for r in repos:
            desc = r.get('description') or 'No description'
            lang = r.get('language') or 'Unknown'
            repos_summary.append(f"- {r.get('name')}: {desc} (Language: {lang})")
        repos_str = "\n".join(repos_summary)

        repos_with_readmes = repos_with_readmes or []
        projects_data = []
        for r in repos_with_readmes:
            projects_data.append({
                "name": r.get('name', 'Unknown'),
                "description": r.get('description') or 'No description',
                "language": r.get('language') or 'Unknown',
                "stars": r.get('stargazers_count', 0),
                "readme_excerpt": (r.get('readme', '')[:500] if r.get('readme') else 'No README provided'),
                "repo_url": r.get('html_url', '')
            })
        projects_str = json.dumps(projects_data, indent=2)

        # Roast mode overrides the summary and strengths instructions
        if roast:
            summary_instruction = """- profile_summary: Write a brutally honest, funny, sarcastic roast of this developer's GitHub profile.
     Reference their actual repos and embarrassing patterns like: too many unfinished projects,
     only tutorial repos, no README files, last commit was 6 months ago, etc.
     Be like a comedy roast — mean but funny. Keep it to 3 sentences. Must reference specific repo names."""
            strengths_instruction = """- strengths: array of exactly 3 funny roast observations about their code habits.
     These should be sarcastic one-liners referencing specific repos or patterns.
     Example: 'Has 12 repos named "test-project" — commitment to naming things is truly inspiring'"""
        else:
            summary_instruction = """- profile_summary: Write a 2-sentence profile summary that is specific to THIS developer only.
     Mention at least 2 actual project names from their repos.
     Include one specific technical achievement with numbers if possible.
     Do NOT use generic phrases like 'demonstrates expertise', 'a range of',
     'strong background', 'passionate developer', or 'various technologies'.
     The summary should be so specific that it could not apply to any other developer."""
            strengths_instruction = """- strengths: array of exactly 4 specific, evidence-based strengths.
     Each strength MUST:
     - Reference a specific project or repo by name
     - Mention the exact technology used
     - Include a measurable outcome or complexity indicator
     Example: 'Built bone fracture CNN classifier using PyTorch achieving 90%+ accuracy'
     NOT: 'Strong in Machine Learning' (too vague, rejected)"""

        user_prompt = f"""Perform a comprehensive analysis of this GitHub developer profile and return ONE JSON object with exactly these four keys: 'overall_score', 'stack', 'role_fit', 'resume_bullets'.

1. OVERALL SCORE ('overall_score' key):
   - Integer between 0 and 100 representing the overall quality of the profile based on:
     - Code quality signals (README presence, descriptions, topics) — 25pts
     - Activity (recent commits, contribution frequency) — 25pts
     - Project diversity and complexity — 25pts
     - Community signals (stars earned, forks, contributions to others) — 25pts

2. STACK ANALYSIS ('stack' key):
   - developer_type: one of these exact values based on their repos:
     ML Researcher, Data Engineer, Full Stack Builder, Frontend Craftsman, Backend Architect, DevOps Engineer, Open Source Contributor, Student Hacker, Polyglot Developer, AI Engineer, Systems Programmer
   - profile_tag: a creative 2-4 word personality label for this developer.
     Examples: "The Silent Builder", "Data Whisperer", "Bug Slayer", "Stack Agnostic", "The Notebook Ninja". Make it specific to their repos, not generic.
   - primary_stack: array of top 5 technologies used (languages + frameworks).
     IMPORTANT: Detect the actual programming languages, frameworks and libraries the developer uses — NOT file formats or tools.
     For example: if repos contain .ipynb files, the language is Python not Jupyter Notebook.
     If repos use requirements.txt with torch, include PyTorch.
     Read the README files and repo descriptions to find actual frameworks used.
     Never include: Jupyter Notebook, Google Colab, VS Code, Git as stack items.
     Always prefer: Python, PyTorch, TensorFlow, FastAPI, React, Node.js etc.
2. STACK ANALYSIS ('stack' key) continues...
   - domains: array of engineering domains detected
   {summary_instruction}
   {strengths_instruction}

3. ROLE FIT ('role_fit' key):

   - Score this developer for EVERY possible tech career role that exists.
   - Include ALL of these categories and their sub-roles:
     AI/ML: ml_engineer, data_scientist, data_analyst, nlp_engineer, computer_vision_engineer, ai_researcher, mlops_engineer, prompt_engineer, ai_product_manager
     Web: frontend_developer, backend_developer, full_stack_developer, web3_developer, wordpress_developer, jamstack_developer
     Mobile: ios_developer, android_developer, react_native_developer, flutter_developer, cross_platform_developer
     DevOps/Cloud: devops_engineer, cloud_engineer, site_reliability_engineer, platform_engineer, kubernetes_engineer, aws_specialist, azure_specialist, gcp_specialist, infrastructure_engineer
     Data: data_engineer, database_administrator, business_intelligence_engineer, big_data_engineer, etl_developer, analytics_engineer
     Security: security_engineer, penetration_tester, security_analyst, devsecops_engineer, cryptography_engineer
     Systems: embedded_developer, firmware_engineer, systems_programmer, os_developer, hardware_engineer, iot_developer
     Specialized: game_developer, ar_vr_developer, blockchain_developer, smart_contract_developer, robotics_engineer, quantum_computing_engineer, compiler_engineer, graphics_engineer
     Research: research_engineer, research_scientist, phd_researcher, academic_researcher
     Product/Design: technical_product_manager, developer_advocate, solutions_architect, technical_writer, ui_ux_engineer

   - Give realistic scores that reflect actual evidence.
     Scores must NOT all end in 0 or 5 — use specific numbers like 73, 67, 84.
     Base scores strictly on actual repo evidence:
     - Every ML project adds evidence for ml_engineer, data_scientist
     - Every deployed project adds evidence for devops, cloud roles
     - Test files in repos add evidence for quality-focused roles
     - No evidence for a role = score below 25, do not include it
     Be strict. A developer cannot be 80% ML Engineer AND 70% Data Scientist
     AND 50% Data Engineer simultaneously unless they have strong evidence for all.
   - Return object with:
     - scores: object with ALL keys above and their integer scores
     - top_role: key of highest score
     - top_role_label: human readable name
     - top_3_roles: array of top 3 {{'role': key, 'label': name, 'score': score}}
     - reasoning: Write exactly 2 sentences maximum. Be direct and specific. No italic formatting. Reference top role and top project only.

4. RESUME BULLETS ('resume_bullets' key):
   - Generate 2-3 bullets for each project in the provided projects data.
   - Start with action verbs, mention stack, include a metric (infer if needed).
   - Return as array of objects with: project_name, repo_url, bullets (array of strings).

Developer Profile: {name}, {bio}, {public_repos} repos.
Repositories:
{repos_str}

Projects for Resume:
{projects_str}"""

        # We use await asyncio.to_thread in the router, but here we call the sync helper
        result = self._call_groq_with_retry(system_prompt, user_prompt)
        
        # Enforce that array fields are empty lists instead of None
        if result:
            if "stack" in result and getattr(result["stack"], "get", None):
                result["stack"]["primary_stack"] = result["stack"].get("primary_stack") or []
                result["stack"]["domains"] = result["stack"].get("domains") or []
                if roast:
                    result["stack"]["roast_lines"] = result["stack"].get("roast_lines") or []
                else:
                    result["stack"]["strengths"] = result["stack"].get("strengths") or []
            if "resume_bullets" in result:
                result["resume_bullets"] = result.get("resume_bullets") or []

        print("analyze_all done")
        return result

