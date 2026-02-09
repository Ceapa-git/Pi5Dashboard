import sqlite3
import json
import time


class Database:
    def __init__(self, path="dashboard.db", commit_every=5):
        self.path = path
        self.commit_every = commit_every
        self.initialized = False

    def setup(self):
        self.connection = sqlite3.connect(self.path, check_same_thread=False)
        self.cursor = self.connection.cursor()
        self.commit_every = self.commit_every
        self._log_count = 0

        self.cursor.execute("PRAGMA journal_mode=WAL;")
        self.cursor.execute("PRAGMA synchronous=NORMAL;")

        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS metrics (
                ts REAL NOT NULL,
                data TEXT NOT NULL
            )
        """)
        self.connection.commit()
        self.initialized = True

    def log(self, stats: dict, ts=None):
        if self.initialized is not True:
            return
        if ts is None:
            ts = time.time()

        self.cursor.execute(
            "INSERT INTO metrics (ts, data) VALUES (?, ?)", (ts, json.dumps(stats))
        )

        self._log_count += 1
        if self._log_count % self.commit_every == 0:
            self.connection.commit()

    def get_last(self, seconds: int):
        if self.initialized is not True:
            return []
        self.connection.commit()

        cutoff = time.time() - seconds

        self.cursor.execute(
            "SELECT ts, data FROM metrics WHERE ts >= ? ORDER BY ts ASC",
            (cutoff,),
        )

        rows = self.cursor.fetchall()

        return [
            {
                "ts": ts,
                "data": json.loads(data),
            }
            for ts, data in rows
        ]

    def cleanup_old(self, seconds=86400):
        if self.initialized is not True:
            return
        self.cursor.execute(
            "DELETE FROM metrics WHERE ts < strftime('%s','now') - ?", (seconds,)
        )

    def commit(self):
        if self.initialized is not True:
            return
        self.connection.commit()

    def close(self):
        if self.initialized is not True:
            return
        self.connection.commit()
        self.connection.close()
