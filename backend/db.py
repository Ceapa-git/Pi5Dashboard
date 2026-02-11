import sqlite3
import json
import time
import threading


class Database:
    def __init__(self, path="dashboard.db", commit_every=5):
        self.path = path
        self.commit_every = commit_every
        self.initialized = False
        self._log_count = 0
        self.lock = threading.Lock()

    def setup(self):
        self.connection = sqlite3.connect(
            self.path, check_same_thread=False, timeout=30
        )
        self.connection.execute("PRAGMA journal_mode=WAL;")
        self.connection.execute("PRAGMA synchronous=NORMAL;")

        with self.lock:
            cur = self.connection.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS metrics (
                    ts REAL NOT NULL,
                    data TEXT NOT NULL
                )
            """)
            self.connection.commit()
            cur.close()

        self.initialized = True

    def log(self, stats: dict, ts=None):
        if not self.initialized:
            return
        if ts is None:
            ts = int(time.time())

        with self.lock:
            cur = self.connection.cursor()
            cur.execute(
                "INSERT INTO metrics (ts, data) VALUES (?, ?)", (ts, json.dumps(stats))
            )
            cur.close()

            self._log_count += 1
            if self._log_count % self.commit_every == 0:
                self.connection.commit()

    def get_last(self, seconds: int):
        if not self.initialized:
            return []

        cutoff = int(time.time()) - seconds

        with self.lock:
            cur = self.connection.cursor()
            cur.execute(
                "SELECT ts, data FROM metrics WHERE ts >= ? ORDER BY ts DESC LIMIT ?",
                (cutoff, seconds),
            )
            rows = cur.fetchall()
            cur.close()

        rows.reverse()
        return [{"ts": ts, "data": json.loads(data)} for ts, data in rows]

    def cleanup_old(self, seconds=86400):
        if not self.initialized:
            return
        with self.lock:
            cur = self.connection.cursor()
            cur.execute(
                "DELETE FROM metrics WHERE ts < strftime('%s','now') - ?", (seconds,)
            )
            cur.close()
            self.connection.commit()

    def close(self):
        if not self.initialized:
            return
        with self.lock:
            self.connection.commit()
            self.connection.close()
