import psutil
import subprocess
import glob


def disk_usage():
  disk_usage = psutil.disk_usage("/")
  return {
    "total": disk_usage.total,
    "used": disk_usage.used,
    "free": disk_usage.free,
    "percent": disk_usage.percent,
  }


def disk_io():
  io_counters = psutil.disk_io_counters()
  return {
    "read": io_counters.read_bytes,
    "write": io_counters.write_bytes,
    "read_count": io_counters.read_count,
    "write_count": io_counters.write_count,
  }


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
  return psutil.cpu_percent()


def get_memory_usage():
  mem = psutil.virtual_memory()
  return {
    "total": mem.total,
    "used": mem.used,
    "free": mem.available,
    "percent": mem.percent
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
