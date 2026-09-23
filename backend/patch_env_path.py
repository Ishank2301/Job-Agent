with open("backend/alembic/env.py", "r") as f:
    content = f.read()

target = "from app.core.config import settings"
replacement = """import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app.core.config import settings"""

if target in content and "sys.path.insert" not in content:
    new_content = content.replace(target, replacement)
    with open("backend/alembic/env.py", "w") as f:
        f.write(new_content)
    print("Patched env.py path")
