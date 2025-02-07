import asyncio
import signal
import threading
import time
import datetime
from flask import Flask, request
from flask_cors import CORS
from pymongo import MongoClient
from stats import get_stats
from werkzeug.serving import make_server

client = MongoClient("mongodb://root:root@localhost:27018/admin")
db = client["metrics"]
logs = db["logs"]
stop_event = threading.Event()
server = Flask(__name__)
CORS(server)


@server.get("/stats/now")
def get_current_stats_request():
  return get_stats()


@server.delete("/stats/clear")
def delete_stats_request():
  logs.delete_many({})
  return {}


@server.get("/stats")
def get_stats_request():
  view = request.args.get("view")
  views = ["10s", "30s", "60s", "60m", "24h"]
  times = [10, 30, 60, 60 * 60, 60 * 60 * 24]
  default_view = views[0]

  if view not in views:
    view = default_view
  view_time = times[views.index(view)]

  stats = list(
    logs.find({"timestamp": {"$gt": int(time.time()) - view_time}},
              projection={"_id": 0})
    .sort("created_at", 1))
  return stats


async def logging():
  day = 60 * 60 * 24

  index_name = "created_at_ttl"
  try:
    logs.drop_index(index_name)
  except:
    pass
  logs.create_index("created_at", expireAfterSeconds=day, name=index_name)

  while not stop_event.is_set():
    stats = get_stats()
    stats["timestamp"] = int(time.time())
    stats["created_at"] = datetime.datetime.now(datetime.timezone.utc)
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
