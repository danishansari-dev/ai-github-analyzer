# 🤖 AI GitHub Analyzer

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=vercel)](https://ai-github-analyzer.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/danishansari-dev/ai-github-analyzer)

An **AI-powered developer analytics platform** that transforms any GitHub profile into a comprehensive technical report. Enter a username and get a full-stack analysis — tech stack breakdown, career role fit scores across **50+ roles**, resume-ready bullet points, an animated skills orbit, and shareable profile cards — all generated in real time by **LLaMA 3.3 70B**.

---

## 📸 Screenshots

![AI GitHub Analyzer — Home Page](https://raw.githubusercontent.com/danishansari-dev/ai-github-analyzer/refs/heads/main/Screenshot.png)

![AI GitHub Analyzer — Results Dashboard](https://raw.githubusercontent.com/danishansari-dev/ai-github-analyzer/refs/heads/main/Screenshot-2.png)

---

## ✨ Key Features

### 🔍 Deep Portfolio Analysis
- Automatically identifies your primary tech stack, frameworks, and domains from repositories **and** your profile README.
- Extracts skills from badge images, markdown lists, and code patterns in `username/username` README.
- Detects a **developer archetype** (e.g. *"AI Engineer"*, *"Full Stack Builder"*, *"The Notebook Ninja"*) and assigns a creative profile tag.

### 📊 Career Role Fit Scoring (50+ Roles)
AI-driven quantitative scoring across **10 categories** and **50+ career roles**, including:

| Category | Example Roles |
| :--- | :--- |
| **AI / ML** | ML Engineer, Data Scientist, NLP Engineer, Computer Vision Engineer, AI Researcher |
| **Web** | Frontend Developer, Backend Developer, Full Stack Developer, Web3 Developer |
| **Mobile** | iOS Developer, Android Developer, Flutter Developer, React Native Developer |
| **DevOps / Cloud** | DevOps Engineer, Cloud Engineer, SRE, Platform Engineer, Kubernetes Engineer |
| **Data** | Data Engineer, Database Administrator, BI Engineer, Analytics Engineer |
| **Security** | Security Engineer, Penetration Tester, DevSecOps Engineer |
| **Systems** | Embedded Developer, Firmware Engineer, Systems Programmer, IoT Developer |
| **Specialized** | Game Developer, AR/VR Developer, Blockchain Developer, Robotics Engineer |
| **Research** | Research Engineer, Research Scientist, PhD Researcher |
| **Product / Design** | Technical Product Manager, Developer Advocate, Solutions Architect |

### 📝 AI-Generated Resume Bullets
- Professionally crafted, action-oriented bullet points generated from your **actual** project READMEs.
- Follows strict resume writing rules: strong action verbs, specific tech stack mentions, and quantified metrics.
- Ready to copy-paste directly into your resume.

### 🔥 Roast Mode
- Toggle **Roast Mode** on the home page for a brutally honest, comedy-roast-style analysis.
- The AI references your actual repo names and coding patterns for personalized roasts.

### 🌐 Social & Contact Links
- Extracts social profiles (LinkedIn, Twitter/X, LeetCode, Kaggle, Portfolio, etc.) from both the **GitHub API** and your **profile README**.
- Displays phone, email, and 16+ platform links directly on the results card.

### 🏆 GitHub Achievements & Stats
- Detects unlocked GitHub badges (Pull Shark, Starstruck, Arctic Code Vault Contributor, etc.).
- Displays followers, following, public repo count, and top 5 repositories ranked by a combined score of stars and commits.

### 🎨 Animated Skills Orbit
- An interactive, orbiting visualization of your detected tech stack using the **Motion** (Framer Motion) animation library.
- Skills float in concentric rings with smooth rotation and hover effects.

### 🔗 Shareable Profile Card
- Generate a downloadable PNG snapshot of your analysis card using **html-to-image**.
- Dynamic Open Graph meta tags for rich social previews when sharing result URLs.

### ⚡ Smart Caching & Live Counters
- In-memory cache with 60-minute TTL avoids redundant GitHub + LLM calls on page refreshes.
- Persistent analysis and visitor counters powered by **Upstash Redis** that survive redeployments.

---

## 🏗️ Architecture

```
┌──────────────────────────┐        ┌──────────────────────────────────┐
│     React Frontend       │        │         FastAPI Backend           │
│  (Vite + Tailwind CSS)   │───────▶│                                  │
│   Deployed on Vercel     │  REST  │    Deployed on Vercel Functions   │
└──────────────────────────┘        │                                  │
                                    │  ┌────────────┐ ┌─────────────┐  │
                                    │  │  GitHub     │ │  LLM        │  │
                                    │  │  Service    │ │  Service    │  │
                                    │  │ (PyGithub)  │ │ (Groq SDK)  │  │
                                    │  └──────┬─────┘ └──────┬──────┘  │
                                    │         │              │         │
                                    │  ┌──────▼──────────────▼──────┐  │
                                    │  │    Cache Service            │  │
                                    │  │  (In-memory + Upstash Redis)│  │
                                    │  └────────────────────────────┘  │
                                    └──────────────────────────────────┘
                                              │              │
                                    ┌─────────▼──┐   ┌───────▼────────┐
                                    │ GitHub API  │   │  Groq Cloud    │
                                    │ (REST)      │   │ (LLaMA 3.3    │
                                    │             │   │  70B Versatile)│
                                    └─────────────┘   └────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Motion (Framer Motion), React Router 7, Lucide Icons |
| **Backend** | FastAPI, Python, Pydantic, Uvicorn |
| **AI Engine** | LLaMA 3.3 70B Versatile via **Groq** SDK |
| **Data Source** | GitHub REST API via **PyGithub** |
| **Caching** | In-memory (TTL) + **Upstash Redis** (persistent counters) |
| **Image Export** | html-to-image |
| **Deployment** | Vercel (frontend + backend as serverless functions) |

---

## 📂 Project Structure

```
ai-github-analyzer/
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS, OG endpoint
│   ├── requirements.txt         # Python dependencies
│   ├── vercel.json              # Vercel serverless function config
│   ├── .env.example             # Environment variable template
│   ├── api/                     # Vercel serverless entry
│   ├── routers/
│   │   └── analyze.py           # /api/analyze, /api/stats, /api/health endpoints
│   ├── services/
│   │   ├── github_service.py    # GitHub API interactions (profile, repos, badges, README parsing)
│   │   ├── llm_service.py       # Groq LLM calls (unified analyze_all prompt)
│   │   └── cache_service.py     # In-memory cache + Upstash Redis counters
│   └── models/
│       └── schemas.py           # Pydantic response models
├── frontend/
│   ├── index.html               # HTML entry with OG meta tags
│   ├── package.json             # Node dependencies
│   ├── vite.config.js           # Vite build config with API proxy
│   ├── vercel.json              # SPA rewrite rules
│   └── src/
│       ├── App.jsx              # Root router + visitor tracking
│       ├── pages/
│       │   ├── Home.jsx         # Landing page with search, roast toggle, counters
│       │   └── Results.jsx      # Results dashboard with all analysis cards
│       └── components/
│           ├── ProfileCard.jsx      # User profile card with social links
│           ├── RoleScoreCard.jsx    # Career role fit scores visualization
│           ├── OrbitingSkills.jsx   # Animated orbiting tech stack
│           ├── RepoShowcase.jsx     # Top repositories display
│           ├── ResumeBullets.jsx    # Resume bullet points section
│           ├── GitHubStats.jsx      # GitHub stats and badges
│           ├── ScoreRing.jsx        # Circular score progress ring
│           ├── SpotlightCard.jsx    # Spotlight hover effect card
│           ├── LoadingScreen.jsx    # Animated loading screen
│           └── ConfettiBackground.jsx # Confetti particle effects
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (for higher API rate limits)
- A [Groq API Key](https://console.groq.com/) (to power the LLaMA 3.3 70B model)
- *(Optional)* An [Upstash Redis](https://console.upstash.com/) database (for persistent counters)

### 1. Clone the Repository

```bash
git clone https://github.com/danishansari-dev/ai-github-analyzer.git
cd ai-github-analyzer
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory (see `.env.example`):

```env
GITHUB_TOKEN=ghp_your_github_token_here
GROQ_API_KEY=gsk_your_groq_key_here

# Optional — persistent counters (without these, counters reset on restart)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

Start the backend server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000` with interactive docs at `/docs`.

### 3. Frontend Setup

Open a **new terminal** and navigate to the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token (PAT) for fetching repository data with higher rate limits. |
| `GROQ_API_KEY` | Yes | API key from [Groq Cloud](https://console.groq.com/) to power the LLaMA 3.3 70B model. |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST URL for persistent analysis/visitor counters. |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis REST token. |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analyze/{username}` | Full profile analysis (supports `?mode=roast` query param) |
| `GET` | `/api/stats` | Returns total profiles analyzed and visitor counts |
| `POST` | `/api/track-visit` | Increments the unique visitor counter |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/og/{username}` | Dynamic Open Graph HTML for social sharing |

---

## 🚀 Deployment

Both the frontend and backend are deployed as separate Vercel projects:

- **Frontend**: Standard Vite build → Vercel static hosting with SPA rewrites.
- **Backend**: FastAPI running as a Vercel Serverless Function (Python runtime, 300s max duration).

Set all environment variables in your Vercel project settings under **Settings → Environment Variables**.

---

## 👤 Author

Developed with ❤️ by **[Mohammad Danish Ansari](https://github.com/danishansari-dev)**

- Final year B.Tech student in **Data Science & AI** at **IIIT Dharwad**.
- Interested in building AI-powered developer tools and scalable backends.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
