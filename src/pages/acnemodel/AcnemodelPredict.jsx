// 220147Q Chng Kai Jie Ryan
import React from "react";
import { MessageCircle } from "lucide-react";
import ImageUploadForPrediction from "../../components/AI/ImageUploadForPrediction";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import { Camera, Clock, ChevronRight, History } from "lucide-react";
import ChatBot from "./ChatBot";

function AcnemodelPredict() {
  const labelMapping = {
    0: "blackheads",
    1: "dark spot",
    2: "nodules",
    3: "papules",
    4: "pustules",
    5: "whiteheads",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container maxWidth="xl" className="py-24">
        <Grid container spacing={6}>
          {/* Header Card - Full Width */}
          <Grid item xs={12}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Box className="flex flex-col">
                  <Typography variant="h5" className="font-semibold">
                    Skin Analysis Dashboard
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    AI-Powered Acne Detection
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Card */}
          <Grid item xs={12}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4} className="text-center">
                    <Box className="w-24 h-24 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                      <Camera size={40} className="text-green-600" />
                    </Box>
                    <Typography variant="h6" className="font-medium mb-2">
                      Easy Upload
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Quick image capture for instant analysis
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} className="text-center">
                    <Box className="w-24 h-24 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
                      <Clock size={40} className="text-blue-600" />
                    </Box>
                    <Typography variant="h6" className="font-medium mb-2">
                      Fast Analysis
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Get results within seconds
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} className="text-center">
                    <Box className="w-24 h-24 rounded-full bg-purple-100 mx-auto mb-4 flex items-center justify-center">
                      <Typography
                        variant="h3"
                        className="font-semibold text-purple-600"
                      >
                        6
                      </Typography>
                    </Box>
                    <Typography variant="h6" className="font-medium mb-2">
                      Conditions
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Comprehensive skin condition detection
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Upload Card - Left Side */}
          <Grid item xs={12} md={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-6">
                <Typography variant="h6" className="font-medium mb-3">
                  Upload Image for Analysis
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="mb-6"
                >
                  Our AI model will analyze your skin and detect various acne
                  conditions
                </Typography>
                <Box className="bg-gray-50 p-6 rounded-lg">
                  <ImageUploadForPrediction
                    modelRoute="/acnemodel/predict"
                    labelMapping={labelMapping}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side Column */}
          <Grid item xs={12} md={4}>
            {/* Conditions Card */}
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Typography variant="h6" className="font-medium mb-4">
                      Detectable Conditions
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.values(labelMapping).map((condition, index) => (
                        <Grid item xs={12} key={index}>
                          <Paper
                            elevation={0}
                            className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Typography
                              variant="body1"
                              className="capitalize text-gray-700 font-medium"
                            >
                              {condition}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* History Card */}
              <Grid item xs={12}>
                <Link
                  to="/acne-health/analysis-history"
                  className="block no-underline"
                >
                  <Card className="shadow-sm hover:shadow-md transition-shadow bg-blue-50 hover:bg-blue-100 cursor-pointer">
                    <CardContent className="p-6">
                      <Box className="flex items-center justify-between">
                        <Box className="flex items-center gap-3">
                          <History size={24} className="text-blue-600" />
                          <Box>
                            <Typography
                              variant="h6"
                              className="font-semibold text-blue-600 mb-2"
                            >
                              View History
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-blue-600 mb-1"
                            >
                              Check previous analyses
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-blue-600"
                            >
                              Track your skin's progress
                            </Typography>
                          </Box>
                        </Box>
                        <ChevronRight size={24} className="text-blue-600" />
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>

              {/* Chatbot Card */}
              <Grid item xs={12}>
                <Link to="/acne-health/chatbot" className="block no-underline">
                  <Card className="shadow-sm hover:shadow-md transition-shadow bg-purple-50 hover:bg-purple-100 cursor-pointer">
                    <CardContent className="p-6">
                      <Box className="flex items-center justify-between">
                        <Box className="flex items-center gap-3">
                          <MessageCircle
                            size={24}
                            className="text-purple-600"
                          />
                          <Box>
                            <Typography
                              variant="h6"
                              className="font-semibold text-purple-600 mb-2"
                            >
                              AI Assistant
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-purple-600 mb-1"
                            >
                              Chat about your skin condition
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-purple-600"
                            >
                              Get personalized advice
                            </Typography>
                          </Box>
                        </Box>
                        <ChevronRight size={24} className="text-purple-600" />
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

<ChatBot />;

export default AcnemodelPredict;
