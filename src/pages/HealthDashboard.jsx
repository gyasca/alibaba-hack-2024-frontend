import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  IconButton,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import {
  ChevronRight,
  Settings,
  Camera,
  Clock,
  Heart,
  Search,
  Bell,
  User,
  Home,
  Activity,
  Calendar,
} from "lucide-react";
import { UserContext } from "../main";
import { Link } from "react-router-dom";
import AdminPageTitle from "../components/AdminPageTitle";
import http from "../http";
import useUser from "../context/useUser";

const HealthDashboard = () => {
  // Assuming UserContext provides user data
  const { user } = useContext(UserContext);
  const { jwtUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const [scanHistory, setScanHistory] = useState([]);

  const user_id = jwtUser();

  const { conditionCountRefresh } = useContext(UserContext);

  useEffect(() => {
    const fetchScanHistory = async (userId) => {
      setIsLoading(true);
      try {
        const response = await http.get("/history/oha/get-history", {
          params: { user_id: user_id },
        });

        if (response.status === 200 && response.data.history.length === 0) {
          console.warn("No history records found");
          setScanHistory([]); // Ensure the UI still renders
          return;
        }

        // Get the last 3 scans
        const recentScans = response.data.history.slice(-3).reverse();

        setScanHistory(recentScans); // Directly use the history data without bounding boxes
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.warn("No records found for this user.");
          setScanHistory([]);
        } else {
          setError("Failed to fetch oral health history");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchScanHistory();
  }, [user_id, conditionCountRefresh]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NavBar */}
      {/* <Box className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <Box className="max-w-7xl mx-auto px-4">
          <Box className="flex justify-between h-16">
            <Box className="flex items-center">
              <Typography variant="h6" color="primary">
                HealthTrack
              </Typography>
              <Box className="hidden md:flex items-center space-x-8 ml-10">
                <Button
                  variant="text"
                  color="inherit"
                  startIcon={<Home />}
                  href="#"
                >
                  Dashboard
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  startIcon={<Activity />}
                  href="#"
                >
                  Analytics
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  startIcon={<Calendar />}
                  href="#"
                >
                  Schedule
                </Button>
              </Box>
            </Box>
            <Box className="flex items-center space-x-4">
              <IconButton>
                <Search size={20} />
              </IconButton>
              <IconButton>
                <Bell size={20} />
              </IconButton>
              <IconButton>
                <User size={20} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box> */}

      {/* Main Dashboard Content */}
      <Box className="pt-5 pb-8">
        <Box sx={{ width: "95%", margin: "0 auto", pt: 0, pb: 0 }}>
          <Box className="flex justify-between items-center mb-8">
            <Box>
              <Typography variant="h5" className="font-semibold">
                Health Dashboard
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Welcome back, {user?.username}
              </Typography>
            </Box>
            <Settings className="text-gray-400" />
          </Box>

          <Box className="mb-8">
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="font-medium">
                Daily Overview
              </Typography>
              <Typography variant="body2" color="primary">
                Today
              </Typography>
            </Box>

            <Grid container spacing={4} mb={6}>
              <Grid item xs={3} className="text-center">
                <Box className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-2 flex items-center justify-center">
                  <Typography variant="h6" className="font-semibold">
                    85%
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Food Analysis
                </Typography>
              </Grid>
              <Grid item xs={3} className="text-center">
                <Box className="w-16 h-16 rounded-full bg-blue-100 mx-auto mb-2 flex items-center justify-center">
                  <Typography variant="h6" className="font-semibold">
                    92%
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Activity Score
                </Typography>
              </Grid>
              <Grid item xs={3} className="text-center">
                <Box className="w-16 h-16 rounded-full bg-purple-100 mx-auto mb-2 flex items-center justify-center">
                  <Typography variant="h6" className="font-semibold">
                    78%
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Health Index
                </Typography>
              </Grid>
              {/* /oral-health/analyse */}
              <Grid item xs={3} className="text-center">
                {scanHistory.length > 0 ? (
                  // Sort scanHistory to ensure the latest scan comes last
                  (scanHistory.sort(
                    (a, b) =>
                      new Date(b.analysis_date) - new Date(a.analysis_date)
                  ),
                  (
                    <Box
                      key={scanHistory[0].analysis_date} // Use the first item now that the array is sorted
                      sx={{ mb: 2 }}
                    >
                      <Box className="w-16 h-16 rounded-full bg-purple-100 mx-auto mb-2 flex items-center justify-center">
                        <Typography variant="h6" className="font-semibold">
                          {scanHistory[0].predictions.length}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="textSecondary">
                        Oral Conditions
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-2 flex items-center justify-center">
                    <Typography variant="h6" className="font-semibold">
                      0
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    backgroundColor: "blue.500",
                    color: "white",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Box className="flex items-center justify-between mb-2">
                    <Box className="flex items-center gap-2">
                      <Camera size={20} />
                      <Typography variant="body2">Food Tracker</Typography>
                    </Box>
                    <ChevronRight size={20} />
                  </Box>
                  <Typography variant="body1" className="font-bold mb-1">
                    1,840 kcal
                  </Typography>
                  <Typography variant="body2">93% accuracy</Typography>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper
                  sx={{
                    backgroundColor: "purple.500",
                    color: "white",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Box className="flex items-center justify-between mb-2">
                    <Box className="flex items-center gap-2">
                      <Clock size={20} />
                      <Typography variant="body2">Skin Analysis</Typography>
                    </Box>
                    <ChevronRight size={20} />
                  </Box>
                  <Typography variant="h6" className="font-semibold mb-1">
                    Healthy
                  </Typography>
                  <Typography variant="body2">Last scan: 2h ago</Typography>
                  <Typography variant="body2">No issues</Typography>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper
                  sx={{
                    backgroundColor: "red.500",
                    color: "white",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Box className="flex items-center justify-between mb-2">
                    <Box className="flex items-center gap-2">
                      <Heart size={20} />
                      <Typography variant="body2">Disease Risk</Typography>
                    </Box>
                    <ChevronRight size={20} />
                  </Box>
                  <Typography variant="h6" className="font-semibold mb-1">
                    Bloood Pressure: 120/80
                  </Typography>
                  <Typography variant="body2">Normal range</Typography>
                  <Typography variant="body2">95% accuracy</Typography>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper
                  sx={{
                    backgroundColor: "green.500",
                    color: "white",
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 3, // Added shadow for depth
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start", // Align content to the start for better spacing
                    overflow: "hidden", // Prevents overflow for the scrollable content
                  }}
                >
                  <Box className="flex items-center justify-between mb-4 w-full">
                    <Box className="flex items-center gap-3">
                      <span className="w-5 h-5">🦷</span>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="white"
                      >
                        Oral Health
                      </Typography>
                    </Box>
                    <ChevronRight size={20} color="white" />
                  </Box>

                  <Typography
                    variant="h6"
                    className="font-semibold mb-1"
                    color="white"
                  >
                    Health Status: Good
                  </Typography>

                  <Typography variant="h5" color="white" mb={2}>
                    Recent Scans
                  </Typography>

                  <Box
                    sx={{
                      maxHeight: "250px", // Makes the scan list scrollable
                      overflowY: "auto",
                      width: "100%",
                      mb: 2,
                    }}
                  >
                    {scanHistory.length > 0 ? (
                      scanHistory.map((scan, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="body1" color="white">
                            Scan Date:{" "}
                            {new Date(scan.analysis_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body1" color="white">
                            Detected Conditions: {scan.predictions.length}
                          </Typography>
                          <hr
                            style={{
                              borderColor: "#fff",
                              borderWidth: 1,
                              margin: "10px 0",
                            }}
                          />
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body1" color="white">
                        No scan history available.
                      </Typography>
                    )}
                  </Box>

                  <Button
                    component={Link}
                    variant="contained"
                    sx={{
                      backgroundColor: "white",
                      "&:hover": {
                        backgroundColor: "#167324", // Lighter background on hover
                      },
                      size: "large",
                      width: "100%",
                    }}
                    to="/oral-health/analyse"
                  >
                    Check Oral Health
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="font-medium">
                Recent Activity
              </Typography>
              <Typography variant="body2" color="primary">
                View All
              </Typography>
            </Box>

            <Box className="space-y-4">
              {[
                { activity: "Food Analysis", time: "2h ago" },
                { activity: "Skin Scan", time: "4h ago" },
                { activity: "Blood Pressure", time: "1d ago" },
              ].map((item, index) => (
                <Box key={index} className="flex justify-between items-center">
                  <Box>
                    <Typography variant="body2" className="font-medium">
                      {item.activity}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.time}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="success.main">
                    Completed
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default HealthDashboard;
