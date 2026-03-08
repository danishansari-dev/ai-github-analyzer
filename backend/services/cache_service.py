import time
import os
import logging
from typing import Any, Dict, Optional
from upstash_redis import Redis

class CacheService:
    # This service exists to temporarily house expensive LLM analytics and 
    # API data in server RAM, bypassing the necessity to re-ping Anthropic 
    # or GitHub if a user refreshes the page or re-searches the same profile within an hour.
    # Counters (analysis_count, visitor_count) are persisted in Upstash Redis
    # so they survive Railway redeploys, unlike the previous JSON file approach.
    
    def __init__(self):
        # In-memory cache for analysis results (still RAM-based, intentionally ephemeral)
        self.cache: Dict[str, Dict[str, Any]] = {}
        
        # We set hard expiration to 60 minutes equivalent in seconds
        self.expiration_seconds = 60 * 60

        # Initialize Upstash Redis for persistent counters.
        # Falls back to in-memory counters if Redis credentials are missing,
        # so local development still works without Upstash.
        redis_url = os.getenv("UPSTASH_REDIS_REST_URL")
        redis_token = os.getenv("UPSTASH_REDIS_REST_TOKEN")

        if redis_url and redis_token:
            self.redis = Redis(url=redis_url, token=redis_token)
            logging.info("Upstash Redis connected for persistent counters")
        else:
            self.redis = None
            logging.warning("UPSTASH_REDIS credentials not found — counters will reset on restart")

    def increment_count(self) -> None:
        """
        Bumps the analysis counter after every successful profile analysis.
        Uses Redis INCR for atomic, persistent incrementing.
        """
        if self.redis:
            self.redis.incr("analysis_count")
        # No fallback needed — if Redis is down, we just skip the count

    def get_count(self) -> int:
        """
        Returns the total number of analyses performed.
        @returns The analysis count as an integer
        """
        if self.redis:
            try:
                val = self.redis.get("analysis_count")
                return int(val) if val else 0
            except Exception:
                return 0
        return 0

    def increment_visitor(self) -> None:
        """
        Atomically increments the global visitor counter in Redis.
        Called once per frontend session from App.jsx.
        """
        if self.redis:
            self.redis.incr("visitor_count")

    def get_visitor_count(self) -> int:
        """
        Retrieves the exact number of unique visitors from Redis.
        @returns The visitor count as an integer
        """
        if self.redis:
            try:
                val = self.redis.get("visitor_count")
                return int(val) if val else 0
            except Exception:
                return 0
        return 0

    def set(self, username: str, data: Any) -> None:
        """
        Registers a new dataset footprint into the ephemeral memory map.
        @param username - The string-based alias parsed from the GitHub endpoint
        @param data - The full JSON analysis dict object assembled from all tasks
        """
        # We inject the current epoch numerical representation alongside the actual data,
        # otherwise we'd have absolutely no frame of reference to validate staleness later.
        self.cache[username] = {
            "timestamp": time.time(),
            "data": data
        }

    def get(self, username: str) -> Optional[Any]:
        """
        Intercepts and evaluates an incoming request for a memorized entity block.
        @param username - The string-based alias to match against registered entries
        @returns The unmutated historical analysis dict payload, or None if evicted/unfound
        """
        entry = self.cache.get(username)
        if not entry:
            return None

        # Tricky logic: Rather than spinning up a costly daemon thread to prune RAM iteratively,
        # we execute lazy disposal checks sequentially during 'read' attempts. 
        # time.time() compares relative seconds against the stored epoch.
        if time.time() - entry["timestamp"] > self.expiration_seconds:
            # We explicitly invoke deletion right now to drop references, enabling
            # Python's intrinsic garbage collection to formally free up the memory block.
            self.clear(username)
            return None

        return entry["data"]

    def clear(self, username: str) -> None:
        """
        Force-removes an instantiated user object from the state.
        @param username - The exact matched alias acting as the deletion target
        """
        if username in self.cache:
            del self.cache[username]
