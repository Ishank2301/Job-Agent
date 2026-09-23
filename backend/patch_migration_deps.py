with open("backend/alembic/versions/0005_reconcile_scraped_at.py", "r") as f:
    content = f.read()

# Down revision needs to be the latest one (1c997fece94d), not 0004_profiles
content = content.replace("down_revision = '0004_profiles'", "down_revision = '1c997fece94d'")

with open("backend/alembic/versions/0005_reconcile_scraped_at.py", "w") as f:
    f.write(content)
