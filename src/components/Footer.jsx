import React from "react";
import { Box, Grid, Typography, Link } from "@mui/material";

export function Footer() {
  return (
    <Box className="bg-white border-t border-gray-200">
      <Box className="max-w-7xl mx-auto px-4 py-6">
        <Grid container spacing={8}>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" fontWeight="fontWeightBold" color="textPrimary">
              Features
            </Typography>
            <Box>
              <Link href="/oral-health/analyse" color="textSecondary" variant="body2">Oral Health</Link><br />
              <Link href="/disease-prediction/analyse" color="textSecondary" variant="body2">Disease Prediction</Link><br />
              <Link href="/acne-health/analyse" color="textSecondary" variant="body2">Derma Health</Link><br />
              <Link href="/food" color="textSecondary" variant="body2">Calorie Tracker</Link>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" fontWeight="fontWeightBold" color="textPrimary">
              Support
            </Typography>
            <Box>
              <Link href="#help-center" color="textSecondary" variant="body2">Help Center</Link><br />
              <Link href="#privacy" color="textSecondary" variant="body2">Privacy</Link><br />
              <Link href="#terms" color="textSecondary" variant="body2">Terms</Link>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" fontWeight="fontWeightBold" color="textPrimary">
              Resources
            </Typography>
            <Box>
              <Link href="#blog" color="textSecondary" variant="body2">Blog</Link><br />
              <Link href="#documentation" color="textSecondary" variant="body2">Documentation</Link>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" fontWeight="fontWeightBold" color="textPrimary">
              Company
            </Typography>
            <Box>
              <Link href="#about" color="textSecondary" variant="body2">About</Link><br />
              <Link href="#careers" color="textSecondary" variant="body2">Careers</Link><br />
              <Link href="#contact" color="textSecondary" variant="body2">Contact</Link>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
