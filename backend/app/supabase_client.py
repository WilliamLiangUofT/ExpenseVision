"""Supabase client singleton for database access."""
from supabase import Client, create_client

from backend.app.config import SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL


_client: Client | None = None

def get_supabase() -> Client:
    """Return Supabase client (uses service role for server-side)."""
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
            )
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client
