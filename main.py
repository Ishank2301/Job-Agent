"""
Main entry point for the Job Application Agent.
Run modes:
  python main.py          — run once immediately
  python main.py --daemon — run on schedule (cron)
  python main.py --dry    — dry run (no emails sent)
  python main.py --dashboard — launch Streamlit dashboard
"""
import sys
import argparse
from datetime import datetime
from utils.logger import get_logger
from config.settings import settings

logger = get_logger("main")


def run_once(dry_run: bool = None):
    """Run the agent once immediately."""
    if dry_run is not None:
        settings.DRY_RUN = dry_run

    logger.info(f"Starting Job Agent at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"Mode: {'DRY RUN (no emails sent)' if settings.DRY_RUN else '🚀 LIVE (emails WILL be sent)'}")

    from graph.job_agent import run_agent
    summary = run_agent()
    return summary


def run_daemon():
    """Run the agent on a schedule (daily)."""
    try:
        import schedule
        import time
    except ImportError:
        logger.error("Install schedule: pip install schedule")
        sys.exit(1)

    def job():
        logger.info(f"\n⏰ Scheduled run at {datetime.now()}")
        run_once()

    # Run immediately once
    job()

    # Then schedule daily at 9 AM
    schedule.every().day.at("09:00").do(job)
    logger.info("Daemon started. Running daily at 09:00. Press Ctrl+C to stop.")

    while True:
        schedule.run_pending()
        import time as t
        t.sleep(60)


def launch_dashboard():
    """Launch the Streamlit monitoring dashboard."""
    import subprocess
    subprocess.run(["streamlit", "run", "dashboard/app.py"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Job Application Agent")
    parser.add_argument("--daemon", action="store_true", help="Run on schedule")
    parser.add_argument("--dry", action="store_true", help="Dry run (no emails)")
    parser.add_argument("--live", action="store_true", help="Live run (sends emails)")
    parser.add_argument("--dashboard", action="store_true", help="Launch dashboard")
    args = parser.parse_args()

    if args.dashboard:
        launch_dashboard()
    elif args.daemon:
        run_daemon()
    elif args.live:
        run_once(dry_run=False)
    else:
        run_once(dry_run=True if not args.live else False)
