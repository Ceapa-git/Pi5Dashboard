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
import { useState, useEffect } from "react";
import styles from "./TopBar.module.css";

const TopBar = () => {
  const [timeRange, setTimeRange] = useState("10s");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = [
    { id: 1, value: "10s", text: "10 seconds" },
    { id: 2, value: "30s", text: "30 seconds" },
    { id: 3, value: "60s", text: "1 minute" },
    { id: 4, value: "60m", text: "1 hour" },
    { id: 5, value: "24h", text: "1 day" },
  ];

  if (!mounted) return null;

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
                <MenuItem key={option.id} value={option.value}>
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
