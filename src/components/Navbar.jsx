import { useState, useContext } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  IconButton,
  Stack,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import LoginIcon from "@mui/icons-material/Login";
import { Link } from "react-router-dom";
import { UserContext } from "../main";
import { NavbarProfile } from "./NavbarProfile";

export function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, isAdminPage } = useContext(UserContext);

  const navItems = [
    { label: "Home", icon: <HomeIcon />, path: "/" },
    { label: "Health Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "Skincare", icon: <DashboardIcon />, path: "/acne-health/analyse" },
    { label: "Disease Prediction", icon: <DashboardIcon />, path: "/disease-prediction/analyse" },
    { label: "Oral Health", icon: <DashboardIcon />, path: "/oral-health/analyse" },

  ];


  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          marginTop: ["1rem", "2rem"],
          position: "sticky",
          top: ["1rem", "2rem"],
          zIndex: 999,
        }}
      >
        <Box
          sx={{
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              // background:
              //   "linear-gradient(to right, rgba(0,0,0,0.2), transparent, rgba(0,0,0,0.2))",
              pointerEvents: "none",
            },
          }}
        >
          <AppBar
            position="sticky"
            sx={{ borderRadius: "10rem", backgroundColor: "primary", color: "black" }}
          >
            <Toolbar>
              <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                <IconButton
                  color="inherit"
                  sx={{
                    marginRight: "1rem",
                    display: ["flex", "flex", "none"],
                  }}
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
                <Button
                  color="black"
                  variant="text"
                  component={Link}
                  to="/"
                  sx={{
                    marginRight: "1rem",
                    fontFamily: "'caveat brush'",
                    textTransform: "none",
                    fontSize: "18px",
                    padding: "0",
                    "& img": { maxHeight: "40px" },
                  }}
                >
                  <img src="/healthbuddylogo.png" alt="Logo" />
                </Button>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    marginRight: "1rem",
                    display: ["none", "none", "flex"],
                  }}
                />
                <Stack
                  spacing={2}
                  direction="row"
                  sx={{ display: ["none", "none", "flex"] }}
                >
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      startIcon={item.icon}
                      component={Link}
                      to={item.path}
                      variant="text"
                      color="inherit"
                      sx={{
                        backgroundColor:
                          location.pathname === item.path
                            ? "rgb(170, 255, 114)"
                            : "transparent",
                        color:
                          location.pathname === item.path
                            ? "rgb(0, 0, 0)"
                            : "rgb(48, 59, 18)",
                        borderRadius: "50px",
                        padding: "6px 12px",
                        fontWeight:
                          location.pathname === item.path ? "bold" : "normal",
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Stack>
              </Box>
              {!user ? (
                <Button
                  component={Link}
                  variant="text"
                  color="inherit"
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{ borderRadius: "50px" }}
                >
                  Login
                </Button>
              ) : (
                <NavbarProfile />
              )}
            </Toolbar>
          </AppBar>
        </Box>

        {/* Drawer for mobile navigation */}
        <Drawer
          anchor="left"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              borderRadius: "0", // Ensures no border radius on the Drawer paper
              backgroundColor: "black",
            },
          }}
        >
          <List sx={{ width: "250px", borderRadius: "0" }}>
            <ListItem>
              <Typography fontWeight={700}>Navigation Menu</Typography>
            </ListItem>
            <Divider sx={{ marginBottom: 1 }} />
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setIsDrawerOpen(false)}
                  sx={{
                    backgroundColor:
                      location.pathname === item.path
                        ? "rgb(170, 255, 139)"
                        : "transparent",
                    color:
                      location.pathname === item.path
                        ? "rgb(0, 0, 0)"
                        : "rgb(150, 255, 100)",
                    m: location.pathname === item.path ? 2 : 1,
                    borderRadius: location.pathname === item.path ? "50px" : 0,
                    padding: location.pathname === item.path ? 2 : "auto",
                    "&:hover": {
                      backgroundColor: "rgb(180, 255, 196)",
                      color: "black",
                      borderRadius: "50px",
                      m: 1,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        location.pathname === item.path
                          ? "rgb(0, 0, 0)"
                          : "rgb(150, 255, 100)",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Container>
    </>
  );
}
