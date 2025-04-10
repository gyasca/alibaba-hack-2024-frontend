// 220147Q Chng Kai Jie Ryan
import React from "react";
import { Container, Box, Typography, IconButton } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatBot from "./ChatBot";

function ChatbotPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Container maxWidth="xl" className="py-24">
        {/* Back Button */}
        <Box className="mb-8">
          <IconButton
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100"
            size="large"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </IconButton>
        </Box>

        {/* Header */}
        <Box className="mb-8 text-center">
          <Typography variant="h4" className="font-semibold text-gray-800">
            AI Skin Care Assistant
          </Typography>
          <Typography variant="body1" color="textSecondary" className="mt-2">
            Chat with our AI to learn more about your skin condition
          </Typography>
        </Box>

        {/* Chatbot */}
        <ChatBot />
      </Container>
    </div>
  );
}

export default ChatbotPage;
