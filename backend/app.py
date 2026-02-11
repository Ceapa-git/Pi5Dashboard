from db import Database
from stats import get_stats
import signal
import asyncio
import threading
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import time

db = Database()
stop_event = threading.Event()
logger_thread = None

app = FastAPI(title="Pi5 Dashboard Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def logging():
    loop = 0
    while not stop_event.is_set():
        try:
            db.log(get_stats())
            loop += 1
            if loop >= 100:
                db.cleanup_old()
                loop = 0
        except Exception as e:
            print(f"[logger] exception: {e}")

        now = time.time()
        await asyncio.sleep(max(0, (int(now) + 1) - now))


def run_logging():
    asyncio.run(logging())


@app.get("/api/stats/{seconds}")
async def get_stats_endpoint(seconds: int):
    data = db.get_last(seconds)
    return JSONResponse(content=data)


def shutdown_server(_signum, _frame):
    print("\nShutting down gracefully...")
    stop_event.set()
    if logger_thread is not None:
        logger_thread.join()
    db.close()
    print("Shutdown complete.")


if __name__ == "__main__":
    signal.signal(signal.SIGINT, shutdown_server)
    signal.signal(signal.SIGTERM, shutdown_server)

    db.setup()

    logger_thread = threading.Thread(target=run_logging, daemon=True)
    logger_thread.start()

    uvicorn.run(app, host="0.0.0.0", port=8000)
