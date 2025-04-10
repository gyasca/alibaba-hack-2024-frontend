import React, { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  Drawer,
  Stack,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import LoginIcon from "@mui/icons-material/Login";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SchoolIcon from "@mui/icons-material/School";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import GradeIcon from "@mui/icons-material/Grade";
import { Link } from "react-router-dom";
import { UserContext } from "../main";
import { NavbarProfile } from "./NavbarProfile";
import AdminNavList from "./AdminNavList";

export function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const { user, isAdminPage } = useContext(UserContext);
  const [foodMenuAnchor, setFoodMenuAnchor] = useState(null);

  const handleFoodMenuOpen = (event) => {
    setFoodMenuAnchor(event.currentTarget);
  };

  const handleFoodMenuClose = () => {
    setFoodMenuAnchor(null);
  };

  return (
    <>
      {!isAdminPage && (
        <Container
          maxWidth="xl"
          sx={{
            marginTop: ["1rem", "2rem"],
            position: "sticky",
            top: ["1rem", "2rem"],
            zIndex: 999,
          }}
        >
          <AppBar position="sticky" sx={{ borderRadius: "0.5rem" }}>
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
                  LinkComponent={Link}
                  to="/"
                  sx={{
                    padding: "0px",
                    margin: "0px",
                  }}
                >
                  <Box
                    component="img"
                    sx={{
                      height: 50,
                      width: 50,
                      padding: "10px",
                      borderRadius: "15px",
                      maxHeight: { xs: 233, md: 167 },
                      maxWidth: { xs: 350, md: 250 },
                    }}
                    alt="NYPSIT"
                    src="/healthbuddylogo.png"
                  />
                </Button>
                <Button
                  color="inherit"
                  variant="text"
                  LinkComponent={Link}
                  to="/"
                  sx={{
                    marginRight: "1rem",
                    fontFamily: "'Righteous', cursive",
                    textTransform: "none",
                    fontSize: "20px",
                    padding: "0",
                  }}
                >
                  HEALTHBUDDY
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
                  <Button
                    startIcon={<HomeIcon />}
                    LinkComponent={Link}
                    variant="text"
                    color="inherit"
                    to="/"
                  >
                    Home
                  </Button>
                </Stack>

                {user && (
                  <>
                    <Stack
                      spacing={2}
                      direction="row"
                      sx={{ display: ["none", "none", "flex"] }}
                    >
                      <Button
                        startIcon={<DashboardIcon />}
                        LinkComponent={Link}
                        variant="text"
                        color="inherit"
                        to="/dashboard"
                      >
                        Health Dashboard
                      </Button>
                    </Stack>

                    {/* Food Dropdown */}
                    <Stack
                      spacing={2}
                      direction="row"
                      sx={{ display: ["none", "none", "flex"] }}
                    >
                      <Button
                        startIcon={<DashboardIcon />}
                        color="inherit"
                        onClick={handleFoodMenuOpen}
                        variant="text"
                      >
                        Food
                      </Button>
                      <Menu
                        anchorEl={foodMenuAnchor}
                        open={Boolean(foodMenuAnchor)}
                        onClose={handleFoodMenuClose}
                      >
                        <MenuItem
                          component={Link}
                          to="/food"
                          onClick={handleFoodMenuClose}
                        >
                          Food Scan
                        </MenuItem>
                        <MenuItem
                          component={Link}
                          to="/chatbot"
                          onClick={handleFoodMenuClose}
                        >
                          Food Chatbot
                        </MenuItem>
                        <MenuItem
                          component={Link}
                          to="/food/metrics"
                          onClick={handleFoodMenuClose}
                        >
                          Food Metrics
                        </MenuItem>
                      </Menu>
                    </Stack>

                    {/* Other Links */}
                    <Stack
                      spacing={2}
                      direction="row"
                      sx={{ display: ["none", "none", "flex"] }}
                    >
                      <Button
                        startIcon={<DashboardIcon />}
                        LinkComponent={Link}
                        variant="text"
                        color="inherit"
                        to="/acne-health/analyse"
                      >
                        Skincare Analysis
                      </Button>
                      <Button
                        startIcon={<DashboardIcon />}
                        LinkComponent={Link}
                        variant="text"
                        color="inherit"
                        to="/disease-prediction/analyse"
                      >
                        Disease Prediction
                      </Button>
                      <Button
                        startIcon={<DashboardIcon />}
                        LinkComponent={Link}
                        variant="text"
                        color="inherit"
                        to="/oral-health/analyse"
                      >
                        Oral Health
                      </Button>
                    </Stack>
                  </>
                )}
              </Box>
              {!user && (
                <Button
                  LinkComponent={Link}
                  variant="text"
                  color="inherit"
                  to="/login"
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
              )}
              {user && <NavbarProfile />}
            </Toolbar>
          </AppBar>
        </Container>
      )}

      {isAdminPage && (
        <AppBar position="sticky" sx={{ zIndex: 999, borderRadius: "0px" }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                sx={{ marginRight: "1rem", display: ["flex", "flex", "none"] }}
                onClick={() => setIsAdminDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
              <Button
                LinkComponent={Link}
                to="/"
                sx={{
                  padding: "0px",
                  margin: "0px",
                }}
              >
                <Box
                  component="img"
                  sx={{
                    height: 50,
                    width: 50,
                    padding: "10px",
                    borderRadius: "15px",
                    maxHeight: { xs: 233, md: 167 },
                    maxWidth: { xs: 350, md: 250 },
                  }}
                  alt="NYPSIT"
                  src="/healthbuddylogo.png"
                />
              </Button>
              <Button
                color="inherit"
                variant="text"
                LinkComponent={Link}
                to="/"
                sx={{
                  marginRight: "1rem",
                  fontFamily: "'Righteous', cursive",
                  textTransform: "none",
                  fontSize: "20px",
                  padding: "0",
                }}
              >
                HEALTHBUDDY
              </Button>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ marginRight: "1rem" }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{ marginRight: "1rem" }}
              >
                Admin Panel
              </Typography>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ marginRight: "1rem" }}
              />

              <Button
                startIcon={<LogoutIcon />}
                LinkComponent={Link}
                variant="text"
                color="inherit"
                to="/"
              >
                Exit Admin Panel
              </Button>
            </Box>
            {user && <NavbarProfile />}
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        anchor={"left"}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <List sx={{ width: "250px" }}>
          <ListItem key={"Home"}>
            <Typography fontWeight={700}>Health Buddy</Typography>
          </ListItem>
          <Divider sx={{ marginBottom: 1 }} />
          <ListItem key={"Home"} disablePadding>
            <ListItemButton
              component={Link}
              to="/"
              onClick={() => setIsDrawerOpen(false)}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={"Home"} />
            </ListItemButton>
          </ListItem>

          {user && (
            <>
              <ListItem key={"Health Dashboard"} disablePadding>
                <ListItemButton
                  component={Link}
                  to="/dashboard"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <ListItemIcon>
                    <AccountTreeIcon />
                  </ListItemIcon>
                  <ListItemText primary={"Health Dashboard"} />
                </ListItemButton>
              </ListItem>

              <ListItem key={"Portal"} disablePadding>
                <ListItemButton
                  component={Link}
                  to="/studentportal"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText primary={"Portal"} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
      <Drawer
        anchor={"left"}
        open={isAdminDrawerOpen}
        onClose={() => setIsAdminDrawerOpen(false)}
        variant="temporary"
      >
        <List sx={{ width: "250px" }}>
          <ListItem key={"Home"}>
            <Typography fontWeight={700}>Admin Navigation</Typography>
          </ListItem>
          <Divider sx={{ marginBottom: 1 }} />
          <AdminNavList />
        </List>
      </Drawer>
    </>
  );
}
