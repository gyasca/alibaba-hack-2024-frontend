import React, { useEffect, useContext, useState } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  EventAvailable,
  TrendingUp,
  Description,
  School,
  AccountBalance,
  ListAlt,
  Help,
  Info,
  EmojiEvents,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { UserContext } from "../main"; // Adjust the import path as needed
import http from "../http"; // Adjust the import path as needed
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
  boxShadow:
    "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  boxShadow:
    "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
  borderRadius: "10px",
  backgroundColor: "#F0F4F8", // Light blue background
}));

const IndicatorTypography = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
}));

const StudentPortal = () => {
  const { user } = useContext(UserContext);
  const [indicators, setIndicators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Student Portal - CM App";
    fetchIndicators();
  }, [user]);

  const fetchIndicators = async () => {
    if (user && user.userId) {
      try {
        const certificatesResponse = await http.get(
          `/certificate/user/${user.userId}`
        );
        const modulesResponse = await http.get(
          `/courseModule/course/${user.course}/modules`
        );
        const userResponse = await http.get(`/user/${user.userId}`);

        const certificates = certificatesResponse.data;
        const modules = modulesResponse.data;
        const userData = userResponse.data;

        // Create a set of unique module codes that have certificates
        const completedModuleCodes = new Set(
          certificates.map((cert) => cert.moduleCode)
        );

        // Calculate completed modules and credits
        let modulesCompleted = completedModuleCodes.size;
        let creditsCompleted = 0;
        let totalCredits = 0;

        modules.forEach((module) => {
          const moduleCredits = parseInt(module.Module.credit) || 0;
          totalCredits += moduleCredits;

          if (completedModuleCodes.has(module.moduleCode)) {
            creditsCompleted += moduleCredits;
          }
        });

        const totalModules = modules.length;
        const gpa = userData.gpa || "N/A";
        const ccaPoints = userData.ccaPoints || 0;

        setIndicators([
          {
            label: "Certifications Obtained",
            count: certificates.length,
            color: "#4CAF50",
          },
          {
            label: "Modules Completed",
            count: `${modulesCompleted}/${totalModules}`,
            color: "#2196F3",
          },
          {
            label: "Credits Completed",
            count: `${creditsCompleted}/${totalCredits}`,
            color: "#FF9800",
          },
          // { label: "Current GPA", count: gpa, color: "#9C27B0" },

          // { label: "CCA Points", count: ccaPoints, color: "#795548" },
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching indicators:", error);
        setIsLoading(false);
      }
    }
  };

  const menuItems = [
    {
      icon: <TrendingUp fontSize="large" />,
      label: "Competence Map",
      link: "/competence-map",
    },
    {
      icon: <EmojiEvents fontSize="large" />,
      label: "Certificates",
      link: "/certificates",
    },
    {
      icon: <Description fontSize="large" />,
      label: "Module Progression",
      link: "/module-progression",
    },

    {
      icon: <Description fontSize="large" />,
      label: "Resume",
      link: "/resume",
    },
    {
      icon: <School fontSize="large" />,
      label: "Student Portal",
      link: "/studentportal",
    },
    {
      icon: <AccountBalance fontSize="large" />,
      label: "CCC Transcript",
      link: "/transcript",
    },
    {
      icon: <TrendingUp fontSize="large" />,
      label: "Grade Point Average",
      link: "/gpa",
    },
    {
      icon: <Help fontSize="large" />,
      label: "SIT Help Desk",
      link: "/studentportal",
    },
    { icon: <Info fontSize="large" />, label: "About Me", link: "/profile" },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Student Portal{" "}
      </Typography>
      <StyledPaper elevation={0} sx={{ mb: 3 }}>
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

      <StyledPaper elevation={0} sx={{ mb: 3, textAlign: "center" }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2} justifyContent="space-around">
            {indicators.map((indicator, index) => (
              <Grid item key={index} xs={6} sm={4} md={2}>
                <IndicatorTypography
                  variant="h4"
                  style={{ color: indicator.color }}
                >
                  {indicator.count}
                </IndicatorTypography>
                <Typography variant="body2">{indicator.label}</Typography>
              </Grid>
            ))}
          </Grid>
        )}
      </StyledPaper>

      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StyledCard>
              <CardContent>
                {item.external ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <IconButton sx={{ mb: 1 }}>{item.icon}</IconButton>
                    <Typography variant="subtitle1">{item.label}</Typography>
                  </a>
                ) : (
                  <Link
                    to={item.link}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <IconButton sx={{ mb: 1 }}>{item.icon}</IconButton>
                    <Typography variant="subtitle1">{item.label}</Typography>
                  </Link>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default StudentPortal;
