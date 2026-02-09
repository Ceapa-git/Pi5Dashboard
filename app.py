from db import Database
from stats import get_stats
import time
import signal
import asyncio
import threading

db = Database()
stop_event = threading.Event()


async def logging():
    while not stop_event.is_set():
        db.log(get_stats())
        await asyncio.sleep(1)


def run_logging():
    asyncio.run(logging())


def shutdown_server(_signum, _frame):
    print("\nShutting down gracefully...")
    stop_event.set()
    logger.join()
    print(db.get_last(86400))
    db.close()


if __name__ == "__main__":
    signal.signal(signal.SIGINT, shutdown_server)
    signal.signal(signal.SIGTERM, shutdown_server)

    db.setup()
    db.clean()
    db.close()
    db = Database()
    db.setup()

    logger = threading.Thread(target=run_logging, daemon=True)
    logger.start()

    logger.join()
