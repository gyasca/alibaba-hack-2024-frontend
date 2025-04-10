import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Avatar,
  Tab,
  Tabs,
  Container,
} from "@mui/material";
import http from "../http";

function InfoBox({ title, value, boolean }) {
  return (
    <Box>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="body1" color={boolean ? "primary" : "textPrimary"}>
        {value}
      </Typography>
    </Box>
  );
}

function SpecificUserDetails() {
  const [specificUser, setSpecificUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await http.get(`/user/${userId}`);
      setSpecificUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!specificUser) {
    return <Typography>User not found</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 2 }}>
        User Profile
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="user details tabs"
              variant="fullWidth"
            >
              <Tab label="Profile" value="1" />
              <Tab label="Additional Info" value="2" />
            </Tabs>
          </Paper>
          {activeTab === "1" && (
            <Box>
              <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  User Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <InfoBox title="Name" value={specificUser.name} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoBox title="Email" value={specificUser.email} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoBox title="Role" value={specificUser.role} />
                  </Grid>
                  {specificUser.role === "student" && (
                    <>
                      <Grid item xs={6}>
                        <InfoBox
                          title="Admin Number"
                          value={specificUser.adminNumber}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <InfoBox title="Course" value={specificUser.course} />
                      </Grid>
                      <Grid item xs={6}>
                        <InfoBox
                          title="Year Joined"
                          value={specificUser.yearJoined}
                        />
                      </Grid>
                    </>
                  )}
                  {specificUser.role === "staff" && (
                    <>
                      <Grid item xs={6}>
                        <InfoBox
                          title="Staff ID"
                          value={specificUser.staffId}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <InfoBox
                          title="Department"
                          value={specificUser.department}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <InfoBox
                          title="Position"
                          value={specificUser.position}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}
          {activeTab === "2" && (
            <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              {/* Add any additional information here */}
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
            <Avatar
              alt="profilephoto"
              src={specificUser.profilePictureFilePath}
              sx={{ width: 200, height: 200, margin: "0 auto 16px auto" }}
            />
            <Typography variant="h6" gutterBottom>
              {specificUser.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {specificUser.email}
            </Typography>
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate(`/admin/users/edit/${userId}`)}
                sx={{ width: "100%", mb: 1 }}
              >
                Edit User
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/users")}
                sx={{ width: "100%" }}
              >
                Back to User List
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default SpecificUserDetails;
