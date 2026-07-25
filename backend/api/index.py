import sys
from pathlib import Path

# Make backend package imports (routers, services, models) resolve on Vercel
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from main import app  # noqa: E402

__all__ = ["app"]
