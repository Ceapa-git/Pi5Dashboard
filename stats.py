import psutil
import subprocess
import glob

# DISK_MOUNTS = {
#     "sd_card": "/",
#     "ssd": "/mnt/storage",
# }
# DISK_DEVICES = {
#     "sd_card": "mmcblk0",
#     "ssd": "sda",
# }

DISK_MOUNTS = {
    "primary": "/",
    "ssd": "/mnt/ssd",
}
DISK_DEVICES = {
    "primary": "nvme1n1p2",
    "ssd": "nvme0n1p1",
}


def disk_usage():
    usage = {}

    for name, mount in DISK_MOUNTS.items():
        try:
            du = psutil.disk_usage(mount)
            usage[name] = {
                "total": du.total,
                "used": du.used,
                "free": du.free,
                "percent": du.percent,
            }
        except FileNotFoundError:
            usage[name] = None
        except PermissionError:
            usage[name] = None

    return usage


def disk_io():
    io = {}
    counters = psutil.disk_io_counters(perdisk=True)

    for name, device in DISK_DEVICES.items():
        stats = counters.get(device)

        if stats is None:
            io[name] = None
            continue

        io[name] = {
            "read_bytes": stats.read_bytes,
            "write_bytes": stats.write_bytes,
            "read_count": stats.read_count,
            "write_count": stats.write_count,
        }

    return io


def network_traffic():
    net_io = psutil.net_io_counters()

    return {
        "total_sent": net_io.bytes_sent,
        "total_received": net_io.bytes_recv,
        "packets_sent": net_io.packets_sent,
        "packets_received": net_io.packets_recv,
    }


def get_temperature():
    try:
        output = subprocess.check_output(["vcgencmd", "measure_temp"]).decode("utf-8")
        temp = float(output.replace("temp=", "").replace("'C\n", ""))
        return temp
    except Exception as e:
        return f"Error: {e}"


def get_fan_speed():
    try:
        hwmon_path = glob.glob("/sys/class/hwmon/hwmon*/fan1_input")[0]
        with open(hwmon_path, "r") as f:
            fan_speed = int(f.read().strip())
        return fan_speed
    except Exception as e:
        return f"Error: {e}"


def get_cpu_usage():
    return psutil.cpu_percent(percpu=True)


def get_memory_usage():
    mem = psutil.virtual_memory()
    return {
        "total": mem.total,
        "used": mem.used,
        "free": mem.available,
        "percent": mem.percent,
    }


def get_stats():
    return {
        "disk_usage": disk_usage(),
        "disk_io": disk_io(),
        "network_traffic": network_traffic(),
        "temperature": get_temperature(),
        "fan_speed": get_fan_speed(),
        "cpu_usage": get_cpu_usage(),
        "memory_usage": get_memory_usage(),
    }
