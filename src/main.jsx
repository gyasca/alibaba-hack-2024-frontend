// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Import pages
import AdminRoutes from "./pages/admin/AdminRoutes";
import UserRoutes from "./pages/UserRoutes";

import Identify from "./pages/foodmodel/Identify";
import AddDI from "./pages/foodmodel/AddDI";
import Scans from "./pages/foodmodel/Scans";
import FoodMetrics from "./pages/foodmodel/FoodMetrics";

import ChatBot from "./pages/chatbot/ChatBot";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { Navbar } from "./components/Navbar";
import { Box } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { jwtDecode } from "jwt-decode";
import http from "./http";
import { Footer } from "./components/Footer";

// OAuth Google
import { GoogleOAuthProvider } from "@react-oauth/google";
// End of OAuth Google

// import directus instance (made possilbe by npm i @directus/sdk)
// import directus from './directus';

let fonts = [
  "Poppins",
  "Nunito",
  "Roboto",
  '"Segoe UI"',
  '"Helvetica Neue"',
  "Arial",
  "sans-serif",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Righteous"',
].join(",");

// Theme for the website, configure it here
let theme = createTheme({
  palette: {
    primary: {
      main: "#5ca904",
      light: "#fc5353",
    },
    secondary: {
      main: grey[500],
    },
    blue: {
      main: "#0083CA",
    },
    yellow: {
      main: "#faf2e9",
      dark: "#c49451",
    },
    white: {
      main: "#ffffff",
    },
  },
  typography: {
    fontFamily: fonts,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  components: {
    MuiTypography: {
      defaultProps: {
        fontFamily: fonts,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "30px", // Adjust border radius as needed
          // boxShadow: '1px 1px 1px 1px rgba(1, 1, 1, 0.2)', // Custom elevation style
        },
      },
    },
    // Global styles for all components
    // DataGrid specific styling
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          border: "1px solid rgba(0, 0, 0, 0.12)",
          overflow: "hidden", // This ensures content doesn't overflow the rounded corners
          "& .MuiDataGrid-columnsContainer, & .MuiDataGrid-cell": {
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          },
          "& .MuiDataGrid-iconSeparator": {
            display: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
          },
          "& .MuiDataGrid-row:last-child .MuiDataGrid-cell": {
            borderBottom: "none",
          },
        },
      },
    },
    // MuiButtonBase: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: "30px",
    //     },
    //   },
    // },
    // MuiCard: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: "30px",
    //     },
    //   },
    // },
    // MuiTextField: {
    //   styleOverrides: {
    //     root: {
    //       '& .MuiOutlinedInput-root': {
    //         borderRadius: "30px",
    //       },
    //     },
    //   },
    // },
  },
  shape: {
    borderRadius: 10, // This sets a default border radius for components that respect this theme property
  },
});

theme = responsiveFontSizes(theme);

// Global context to store and change stuff on the fly
export const UserContext = React.createContext(null);

function MainApp() {
  const location = useLocation();
  // User global context to store the contents of the JWT token
  const [user, setUser] = useState(null);
  // Global context to store if the current page is an admin page
  const [isAdminPage, setIsAdminPage] = useState(false);

  const [userLoading, setUserLoading] = useState(true);

  const [conditionCountRefresh, setConditionCountRefresh] = useState(null);

  // Active page global context to store the current page (For navbar item highlight)
  const [activePage, setActivePage] = useState(null);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const decoded = jwtDecode(token);
          const response = await http.get(`/user/${decoded.userId}`);
          console.log("User data from API response:", response.data);
          setUser(response.data);
          // console.log(user);
        } else {
          console.log("Token not ready or not available");
        }
      } catch (error) {
        setUser(null);
        console.error("Error fetching user details:", error);
      } finally {
        setUserLoading(false);
      }
    };

    checkLoggedInUser();
  }, [setUser]);

  const updateUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode(token);
        const response = await http.get(`/user/${decoded.userId}`);
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  // Return routes. * is a wildcard for any path that doesn't match the other routes, so it will always return the 404 page
  // /admin/* is a wildcard for any path that starts with /admin/, so it will always return the admin routes. Admin routes is in pages/admin/AdminRoutes.jsx
  return (
    <>
      <UserContext.Provider
        value={{
          user: user,
          setUser: setUser,
          userLoading: userLoading,
          isAdminPage: isAdminPage,
          setIsAdminPage: setIsAdminPage,
          updateUser: updateUser,
          activePage: activePage,
          setActivePage: setActivePage,
          conditionCountRefresh: conditionCountRefresh,
          setConditionCountRefresh: setConditionCountRefresh,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Navbar />
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Routes location={location}>
              <Route path="*" element={<UserRoutes />} />
              <Route path="/admin/*" element={<AdminRoutes />} />

              <Route path="/food" element={<Identify />} />
              <Route path="/food/add" element={<AddDI />} />
              <Route path="/food/scans" element={<Scans />} />
              <Route path="/food/metrics" element={<FoodMetrics />} />

              <Route path="/chatbot" element={<ChatBot />} />
            </Routes>
          </Box>
          {/* <Footer /> */}
          <Footer />
        </Box>
      </UserContext.Provider>
    </>
  );
}

// Check if root has already been created
const rootElement = document.getElementById("root");
const root = rootElement ? ReactDOM.createRoot(rootElement) : null;

if (root) {
  root.render(
    <GoogleOAuthProvider clientId="955375593672-pebtcd2hlgb9794nk2da820v6q155mqi.apps.googleusercontent.com">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <SnackbarProvider maxSnack={3}>
            <MainApp />
          </SnackbarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
} else {
  console.error("Root element not found in the document.");
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
