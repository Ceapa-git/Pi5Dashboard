"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  MenuItem,
  Select,
  FormControl,
  Box,
} from "@mui/material";
import { useTimeRange } from "@/context/TimeRangeContext";
import styles from "./TopBar.module.css";

const TopBar = () => {
  const { timeRange, setTimeRange } = useTimeRange();

  const options = [
    { value: "10s", text: "10 seconds" },
    { value: "30s", text: "30 seconds" },
    { value: "60s", text: "1 minute" },
    { value: "60m", text: "1 hour" },
    { value: "24h", text: "1 day" },
  ];

  return (
    <AppBar position="static" className={styles.topbar}>
      <Toolbar className={styles.toolbar}>
        <Typography variant="h6" component="div">
          RaspberryPi5 Dashboard
        </Typography>
        <Box className={styles.selectContainer}>
          <Typography variant="body1" sx={{ color: "white" }}>
            Show last:
          </Typography>
          <FormControl sx={{ minWidth: "140px" }}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{
                color: "white",
                width: "140px",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "lightgray",
                },
                "& .MuiSvgIcon-root": { color: "white" },
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
