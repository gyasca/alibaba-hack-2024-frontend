import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import {
  EventAvailable,
} from "@mui/icons-material";
import { styled } from "@mui/system";

function AdminPanelLanding() {
  const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    boxShadow:
      "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
    borderRadius: "10px",
    backgroundColor: "#F0F4F8", // Light blue background
    width: "100%",
    textAlign: "center",
    letterSpacing: "3px"
  }));
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%", // This ensures the Box takes full height of its container
        width: "100%", // This ensures the Box takes full width of its container
        mt: -5
      }}
    >
      <Typography
        variant="h3"
        sx={{ marginBottom: "2rem", textAlign: "center" }}
      >
        Welcome to HealthBuddy Admin Panel
      </Typography>
      <StyledPaper elevation={0} fullWidth sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <EventAvailable sx={{ mr: 1 }} />
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            weekday: "long",
          })}
        </Typography>
      </StyledPaper>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Button
            component={Link}
            to="/admin/users"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: "100px", fontSize: "1.2rem" }}
          >
            Manage Users
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            component={Link}
            to="/admin/bookings"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: "100px", fontSize: "1.2rem" }}
          >
            Manage Bookings
          </Button>
        </Grid>
        {/* <Grid item xs={12} sm={6} md={4}>
          <Button
            component={Link}
            to="/admin/competencies"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: '100px', fontSize: '1.2rem' }}
          >
            Manage Competencies
          </Button>
        </Grid> */}
        <Grid item xs={12} sm={6} md={4}>
          <Button
            component={Link}
            to="/admin/forum"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: "100px", fontSize: "1.2rem" }}
          >
            Manage Forum
          </Button>
        </Grid>
        {/* <Grid item xs={12} sm={6} md={4}>
          <Button
            component={Link}
            to="/admin/modules"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: '100px', fontSize: '1.2rem' }}
          >
            Manage Modules
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            component={Link}
            to="/admin/competencies"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: '100px', fontSize: '1.2rem' }}
          >
            Manage Competencies
          </Button>
        </Grid> */}
      </Grid>
    </Box>
  );
}

export default AdminPanelLanding;
