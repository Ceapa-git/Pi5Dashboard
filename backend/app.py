import asyncio
import signal
import threading
from flask import Flask
from pymongo import MongoClient
from stats import get_stats
from werkzeug.serving import make_server

server = Flask(__name__)

stop_event = threading.Event()


@server.get("/stats/now")
def get_current_stats():
    return get_stats()


async def logging():
    client = MongoClient("mongodb://root:root@localhost:27018/admin")
    db = client["metrics"]
    logs = db["logs"]

    while not stop_event.is_set():
        stats = get_stats()
        logs.insert_one(stats)
        await asyncio.sleep(1)


def run_logging():
    asyncio.run(logging())


class FlaskServerThread(threading.Thread):
    def __init__(self, app):
        super().__init__()
        self.server = make_server("0.0.0.0", 5000, app)
        self.ctx = app.app_context()
        self.ctx.push()

    def run(self):
        print("Starting Flask server...")
        self.server.serve_forever()

    def shutdown(self):
        print("Stopping Flask server...")
        self.server.shutdown()


def shutdown_server(_signum, _frame):
    print("\nShutting down gracefully...")
    stop_event.set()
    logger.join()
    flask_thread.shutdown()
    flask_thread.join()
    print("Shutdown complete.")


if __name__ == "__main__":
    signal.signal(signal.SIGINT, shutdown_server)
    signal.signal(signal.SIGTERM, shutdown_server)

    logger = threading.Thread(target=run_logging, daemon=True)
    logger.start()

    flask_thread = FlaskServerThread(server)
    flask_thread.start()

    flask_thread.join()
