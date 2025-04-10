import React, { useContext, useEffect } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  AppBar,
  Toolbar,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link } from "react-router-dom";
import { UserContext } from "../main";

const useStyles = makeStyles((theme) => ({
  hero: {
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "70vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
  healthBuddyBackground: {
    position: "absolute",
    left: 0,
    width: "100%",
    height: "75vh",
    backgroundImage: `url('/healthbuddybackground3.jpg')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: -1, // Place behind content
    maskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 50%, transparent 100%)", // Weakened top gradient
    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 50%, transparent 100%)", // Webkit version
  },
  content: {
    backgroundColor: "none", // Modern card style background
    borderRadius: "20px", // Rounded corners
    padding: theme.spacing(6), // Padding
    maxWidth: "800px", // Maximum width of the card
    // boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", // Soft shadow for the card
    zIndex: 1, // Ensure content is above background
    marginLeft: "auto", // Align content to the right
    marginRight: theme.spacing(3),
    textAlign: "center", // Center text in the card
    color: "black"
  },
  features: {
    padding: theme.spacing(8, 0),
  },
  featureItem: {
    textAlign: "center",
    padding: theme.spacing(4),
  },
  appBar: {
    backgroundColor: "#333",
  },
  toolbar: {
    justifyContent: "space-between",
  },
  logo: {
    fontWeight: "bold",
    fontSize: "1.5rem",
  },
}));

const LandingPage = () => {
  const classes = useStyles();
  const { user } = useContext(UserContext);

  useEffect(() => {
    document.title = "HealthBuddy";
  }, []);

  return (
    <>
      {/* Hero Section with background gradient */}
      <Box className={classes.hero}>
        <Box className={classes.healthBuddyBackground} /> {/* HealthBuddy background with gradient */}
        <Box className={classes.content}>
          <Typography variant="h2" sx={{
            fontSize: { xs: "36px", md: "48px", lg: "64px" },
            fontWeight: 600,
            lineHeight: 1.2,
            mb: 2
          }}>
            Welcome to
            <br />
            Health Buddy
          </Typography>
          <Typography sx={{
            fontSize: "20px",
            color: "#636b2a",
            mb: 1
          }}>
            Your ultimate AI health tracker
          </Typography>
          <Typography sx={{
            fontSize: "15px",
            color: "#888",
            mb: 4
          }}>
            By Ryan, Azrel, Charmain, Gregory(Team Lead)
          </Typography>
          <Button
            component={Link}
            to={user ? "/dashboard" : "/login"}
            variant="contained"
            sx={{
              backgroundColor: "#69B550",
              borderRadius: "25px",
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "#558F40"
              }
            }}
          >
            {user ? "ENTER HEALTH DASHBOARD" : "Get Started - Login to HealthBuddy"}
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" className={classes.features}>
        {/* Paper with negative margin to move it up */}
        <Paper 
          elevation={3} 
          className={classes.featureItem} 
          style={{ 
            padding: '20px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px',
            marginTop: '-120px', // Adjust the negative margin to move the paper up
          }}
        >
          <Grid item>
            <Typography variant="h6" component="h3">
              Easy, quick diagnosis
            </Typography>
            <Typography variant="body1">
              AI powered diagnosis for early detection of potential conditions
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h6" component="h3">
              Seamless health tracking
            </Typography>
            <Typography variant="body1">
              All-in-one app to track different physical health aspects
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h6" component="h3">
              4 Key physical health components
            </Typography>
            <Typography variant="body1">
              Oral Health, Disease risk, Diet & Nutrition, Dermatology
            </Typography>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default LandingPage;
