# 🤖 Job Application Agent

> A fully automated job hunting agent that scrapes jobs, tailors your resume, finds recruiter contacts, and sends personalized cold emails — **you do nothing**.



## 🧠 How It Works

```
Every day at 9 AM (automated):
    ↓
1. Scrape LinkedIn + Naukri + Internshala for new jobs
    ↓
2. Score each job for match quality (keyword overlap)
    ↓
3. Find recruiter name + email for each company
    ↓
4. Tailor your resume to the specific JD (Ollama LLM)
    ↓
5. Write a personalized cold email / referral request (Ollama LLM)
    ↓
6. Send via Gmail + log everything
    ↓
7. Dashboard shows all activity
```

---

## ⚡ Quick Start

### 1. Install
```bash
git clone https://github.com/your-username/job-agent.git
cd job-agent
python -m venv venv && source venv/activate
pip install -r requirements.txt
```

### 2. Set up Ollama (local LLM)
```bash
# Install Ollama: https://ollama.ai
ollama pull llama3
ollama serve   # runs at localhost:11434
```

### 3. Configure
```bash
cp .env.example .env
# Edit .env with your details:
# - Gmail address + App Password
# - Your target job titles
# - Your target locations
```

### 4. Add your resume
```
Edit: data/resumes/base_resume.txt
Replace the template with YOUR actual information.
The agent tailors this for each job automatically.
```

### 5. Test first (dry run — no emails sent)
```bash
python main.py --dry
```

### 6. Go live
```bash
python main.py --live
```

### 7. Monitor
```bash
python main.py --dashboard
# Opens at http://localhost:8501
```

### 8. Automate (runs daily)
```bash
python main.py --daemon
```

---

## 📁 Project Structure

```
job-agent/
├── main.py                      # Entry point (run / daemon / dashboard)
├── graph/
│   └── job_agent.py             # LangGraph 7-node orchestration
├── tools/
│   ├── scraper.py               # LinkedIn + Naukri + Internshala scraper
│   ├── resume_tailor.py         # LLM resume tailoring + job scoring
│   ├── recruiter_finder.py      # Recruiter email discovery
│   └── email_sender.py          # Gmail sender + application logger
├── config/
│   └── settings.py              # All settings from .env
├── utils/
│   └── logger.py                # Structured logging
├── dashboard/
│   └── app.py                   # Streamlit monitoring dashboard
├── data/
│   ├── resumes/
│   │   ├── base_resume.txt      # YOUR RESUME — fill this in
│   │   └── tailored/            # Auto-generated tailored resumes
│   ├── jobs/jobs.json           # Jobs database
│   └── applications/            # Applications log
└── .github/workflows/
    └── run_agent.yml            # GitHub Actions — runs daily automatically
```

---

## ⚠️ IMPORTANT: Gmail App Password

You need a **Gmail App Password**, not your regular password:
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and generate a password
3. Put it in `.env` as `GMAIL_APP_PASSWORD`

---

## 🔐 GitHub Actions Setup (fully automated in cloud)

Push your code to GitHub and add these secrets in **Settings → Secrets → Actions**:

| Secret | Value |
|---|---|
| `GMAIL_ADDRESS` | your Gmail address |
| `GMAIL_APP_PASSWORD` | Gmail app password |
| `OLLAMA_HOST` | Your Ollama server URL |
| `JOB_TITLES` | ML Engineer,Data Scientist |
| `JOB_LOCATIONS` | Bangalore,Remote |

The agent runs **automatically every weekday at 9 AM IST** via GitHub Actions.

---

## 🛡️ Safety Features

- `DRY_RUN=true` by default — test before sending real emails
- `MAX_EMAILS_PER_DAY=10` — never spam
- Blacklist companies you don't want to apply to
- All applications logged with timestamps
- Already-applied jobs are never re-applied to
- Failed recruiter searches are skipped gracefully

---

## 📊 Dashboard

```bash
python main.py --dashboard
```

Shows:
- Total applications sent
- Status breakdown (sent / dry_run / failed / skipped)
- Jobs database
- Recruiter emails found
- Daily activity

---

## 📜 License
MIT
