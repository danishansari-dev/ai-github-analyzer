# 🤖 AI GitHub Analyzer

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=vercel)](https://ai-github-analyzer.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/danishansari-dev/ai-github-analyzer)

An **AI-powered development analytics tool** that transforms your GitHub profile into a professional technical report. It analyzes your repositories, code, and contributions to evaluate your tech stack, calculate job role fit scores, and generate resume-ready bullet points.

---


## 📸 Screenshots

![AI GitHub Analyzer Preview](https://via.placeholder.com/1200x600?text=AI+GitHub+Analyzer+Dashboard)
*Note: Coming soon - Replace with actual screenshots of your application.*

---

## 🚀 What You Get

1.  **🔍 Deep Portfolio Analysis**: Automatically identifies your primary tech stack, frameworks, and domains. Get a clear overview of your strengths and identify potential gaps in your profile.
2.  **📊 Job Role Fit Score**: Receives an AI-driven quantitative assessment across 5 key industry roles:
    *   **ML Engineer**
    *   **Backend Developer**
    *   **Frontend Developer**
    *   **MLOps Engineer**
    *   **Full Stack Developer**
3.  **📝 AI-Generated Resume Bullets**: Stop struggling with wording! Get professionally crafted, action-oriented bullet points based on your *actual* GitHub contributions, ready to copy-paste directly into your resume.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS (Deployed on **Vercel**) |
| **Backend** | FastAPI, Python (Deployed on **Railway**) |
| **AI Engine** | LLaMA 3.3 70B via **Groq API** |
| **Data Source** | GitHub REST API via **PyGithub** |

---

## ⚙️ Local Setup

Follow these steps to run the project locally on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/danishansari-dev/ai-github-analyzer.git
cd ai-github-analyzer
```

### 2. Backend Setup
```bash
cd backend
# Create a virtual environment
python -m venv venv
# Activate the virtual environment (Windows)
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
GITHUB_TOKEN=your_github_personal_access_token
GROQ_API_KEY=your_groq_api_key
```

Run the backend server:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

You will need the following API keys to run the application:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GITHUB_TOKEN` | Yes | A GitHub Personal Access Token (PAT) to fetch repository data. |
| `GROQ_API_KEY` | Yes | API key from Groq Cloud to power the LLaMA 3.3 70B model. |

---

## 👤 Author

Developed with ❤️ by **[Mohammad Danish Ansari](https://github.com/danishansari-dev)**
*   Final year B.Tech student in **Data Science & AI** at **IIIT Dharwad.**
*   Interested in building AI-powered developer tools and scalable backends.

---

## 📄 License

This project is open-source and available under the MIT License.
