from stats import get_stats
from flask import Flask

app = Flask(__name__)


@app.get("/stats/now")
def hello_world():
    return get_stats()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
