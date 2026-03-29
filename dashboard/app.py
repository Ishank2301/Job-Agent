"""
Job Agent — Monitoring Dashboard
Real-time view of applications, job matches, and agent status.
"""

import json
import os
import streamlit as st
import pandas as pd
from datetime import datetime

st.set_page_config(page_title="Job Agent Dashboard", page_icon="🤖", layout="wide")
# Change the padding from the given reference link
st.markdown(
    """
<style>
.stat-card { background: #f8f9fa; border-left: 4px solid #1a73e8;
             padding: 1rem; border-radius: 8px; margin: 0.25rem 0; }
.status-sent { color: #0d652d; font-weight: 500; }
.status-dry { color: #1a73e8; font-weight: 500; }
.status-failed { color: #c5221f; font-weight: 500; }
.status-skipped { color: #b06000; font-weight: 500; }
</style>
""",
    unsafe_allow_html=True,
)


def load_applications():
    try:
        with open("data/applications/applications.json") as f:
            return json.load(f)
    except Exception:
        return []


def load_jobs():
    try:
        with open("data/jobs/jobs.json") as f:
            return json.load(f)
    except Exception:
        return []


# ── Header ────────────────────────────────────────────────────────────────────
st.markdown("# 🤖 Job Application Agent")
st.markdown("*Fully automated job hunting — sit back and relax*")
st.divider()

# Sidebar controls
with st.sidebar:
    st.markdown("## ⚙️ Controls")
    if st.button("▶️ Run Agent Now", use_container_width=True, type="primary"):
        with st.spinner("Running agent..."):
            try:
                import sys

                sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
                from graph.job_agent import run_agent

                summary = run_agent()
                st.success(
                    f"Done! Sent {summary.get('run_applications_sent', 0)} applications"
                )
            except Exception as e:
                st.error(f"Error: {e}")

    st.divider()
    st.markdown("### 🔧 Settings")
    from config.settings import settings

    st.info(f"**Mode:** {'🧪 Dry Run' if settings.DRY_RUN else '🚀 Live'}")
    st.info(f"**LLM:** {settings.OLLAMA_MODEL}")
    st.info(f"**Daily limit:** {settings.MAX_EMAILS_PER_DAY} emails")
    st.markdown("**Target roles:**")
    for t in settings.JOB_TITLES:
        st.markdown(f"- {t}")

    st.divider()
    if st.button("🔄 Refresh Data", use_container_width=True):
        st.rerun()

# Load data
apps = load_applications()
jobs = load_jobs()

# ── Stats Row ──────────────────────────────────────────────────────────────────
col1, col2, col3, col4 = st.columns(4)
today = datetime.now().strftime("%Y-%m-%d")
today_apps = [a for a in apps if a.get("applied_at", "").startswith(today)]
sent_all = [a for a in apps if a.get("status") in ("sent", "dry_run")]

with col1:
    st.metric("Total Applications", len(apps), delta=f"+{len(today_apps)} today")
with col2:
    st.metric("Emails Sent/Queued", len(sent_all))
with col3:
    st.metric("Jobs in DB", len(jobs))
with col4:
    failed = sum(1 for a in apps if a.get("status") == "failed")
    st.metric("Failed", failed)

st.divider()

# ── Applications Table ─────────────────────────────────────────────────────────
col_left, col_right = st.columns([2, 1])

with col_left:
    st.markdown("### 📋 Applications")
    if apps:
        df = pd.DataFrame(apps)
        df["applied_at"] = pd.to_datetime(df["applied_at"]).dt.strftime("%m-%d %H:%M")
        df = df[
            ["company", "job_title", "status", "recruiter_email", "applied_at"]
        ].tail(30)
        df.columns = ["Company", "Role", "Status", "Recruiter Email", "Applied At"]
        df = df.sort_values("Applied At", ascending=False)

        def color_status(val):
            colors = {
                "sent": "color: green",
                "dry_run": "color: #1a73e8",
                "failed": "color: red",
                "skipped_limit": "color: orange",
                "skipped_no_recruiter": "color: #b06000",
            }
            return colors.get(val, "")

        st.dataframe(
            df.style.applymap(color_status, subset=["Status"]),
            use_container_width=True,
            height=400,
        )
    else:
        st.info("No applications yet. Run the agent to start!")

with col_right:
    st.markdown("### 📊 Status Breakdown")
    if apps:
        status_counts = {}
        for a in apps:
            s = a.get("status", "unknown")
            status_counts[s] = status_counts.get(s, 0) + 1

        for status, count in sorted(status_counts.items(), key=lambda x: -x[1]):
            emoji = {
                "sent": "✅",
                "dry_run": "🧪",
                "failed": "❌",
                "skipped_limit": "⏸️",
                "skipped_no_recruiter": "🔍",
            }.get(status, "⚪")
            st.markdown(f"{emoji} **{status}**: {count}")
    else:
        st.info("No data yet.")

st.divider()

# ── Jobs in DB ────────────────────────────────────────────────────────────────
st.markdown("### 🔍 Jobs Database")
if jobs:
    df_jobs = pd.DataFrame(jobs)
    cols = ["title", "company", "location", "source", "status", "scraped_at"]
    cols = [c for c in cols if c in df_jobs.columns]
    df_jobs = df_jobs[cols].head(50)
    df_jobs.columns = [c.title().replace("_", " ") for c in cols]
    st.dataframe(df_jobs, use_container_width=True, height=300)
else:
    st.info("No jobs scraped yet.")

st.divider()
st.caption(
    f"Last refreshed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Job Agent v1.0"
)
