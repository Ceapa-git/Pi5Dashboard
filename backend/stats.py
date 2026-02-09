import psutil
import subprocess
import glob
import os
import time

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

PMIC_RAILS = [
    ("3V7_WL_SW", 0, 8),
    ("3V3_SYS", 1, 9),
    ("1V8_SYS", 2, 10),
    ("DDR_VDD2", 3, 11),
    ("DDR_VDDQ", 4, 12),
    ("1V1_SYS", 5, 13),
    ("0V8_SW", 6, 14),
    ("VDD_CORE", 7, 15),
    ("0V8_AON", 16, 19),
    ("3V3_DAC", 17, 20),
    ("3V3_ADC", 18, 21),
    ("HDMI", 22, 23),
]


# DISK


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
        except Exception:
            usage[name] = {"total": 0, "used": 0, "free": 0, "percent": 0.0}
    return usage


def disk_io():
    io = {}
    counters = psutil.disk_io_counters(perdisk=True)
    for name, device in DISK_DEVICES.items():
        stats = counters.get(device)
        if stats is None:
            io[name] = {
                "read_bytes": 0,
                "write_bytes": 0,
                "read_count": 0,
                "write_count": 0,
            }
            continue
        io[name] = {
            "read_bytes": stats.read_bytes,
            "write_bytes": stats.write_bytes,
            "read_count": stats.read_count,
            "write_count": stats.write_count,
        }
    return io


# NETWORK


def network_traffic():
    net_io = psutil.net_io_counters()
    return {
        "total_sent": net_io.bytes_sent,
        "total_received": net_io.bytes_recv,
        "packets_sent": net_io.packets_sent,
        "packets_received": net_io.packets_recv,
    }


# THERMAL


def get_temperatures():
    temps = {}
    try:
        for name, entries in psutil.sensors_temperatures().items():
            temps[name] = [t.current for t in entries]
    except Exception:
        pass
    return temps


def get_fan_speed():
    try:
        hwmon_path = glob.glob("/sys/class/hwmon/hwmon*/fan1_input")[0]
        with open(hwmon_path, "r") as f:
            fan_speed = int(f.read().strip())
        return fan_speed
    except Exception:
        return 0


# CPU/MEMORY


def get_cpu_usage():
    return psutil.cpu_percent(percpu=True)


def get_cpu_freq():
    try:
        freq = psutil.cpu_freq()
        return {"current": freq.current, "min": freq.min, "max": freq.max}
    except Exception:
        return {"current": 0.0, "min": 0.0, "max": 0.0}


def get_memory_usage():
    mem = psutil.virtual_memory()
    return {
        "total": mem.total,
        "used": mem.used,
        "free": mem.available,
        "percent": mem.percent,
    }


def get_load_avg():
    try:
        one, five, fifteen = os.getloadavg()
        return {"1m": one, "5m": five, "15m": fifteen}
    except OSError:
        return {"1m": 0.0, "5m": 0.0, "15m": 0.0}


def get_uptime():
    seconds = int(time.time() - psutil.boot_time())
    return {
        "seconds": seconds,
        "human": f"{seconds // 86400}d {(seconds % 86400) // 3600}h {(seconds % 3600) // 60}m {(seconds % 60)}s",
    }


# POWER


def read_pmic_channel(channel: int, kind: str):
    try:
        output = subprocess.check_output(
            ["vcgencmd", "pmic_read_adc", f"CH{channel}"]
        ).decode()
        for line in output.splitlines():
            if f"{kind}({channel})" in line:
                value = line.split("=")[1].strip()
                if kind == "current":
                    return float(value.replace("A", ""))
                elif kind == "volt":
                    return float(value.replace("V", ""))
    except Exception:
        return 0.0
    return 0.0


def get_power_rails():
    readings = []
    total_power = 0.0
    for name, ch_current, ch_voltage in PMIC_RAILS:
        current = read_pmic_channel(ch_current, "current")
        voltage = read_pmic_channel(ch_voltage, "volt")
        power = voltage * current
        readings.append(
            {
                "rail": name,
                "voltage": round(voltage, 3),
                "current": round(current, 3),
                "power": round(power, 3),
            }
        )
        total_power += power
    return {"total_power": round(total_power, 3), "rails": readings}


def get_stats():
    return {
        "uptime": get_uptime(),
        "load_avg": get_load_avg(),
        "cpu": {
            "usage_per_core": get_cpu_usage(),
            "freq": get_cpu_freq(),
        },
        "memory": get_memory_usage(),
        "disk": {
            "usage": disk_usage(),
            "io_total": disk_io(),
        },
        "network": {
            "total": network_traffic(),
        },
        "thermal": {
            "temperatures": get_temperatures(),
            "fan_rpm": get_fan_speed(),
        },
        "power": get_power_rails(),
    }
