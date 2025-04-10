// 220147Q Chng Kai Jie Ryan
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown"; // Import ReactMarkdown
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length === 0) {
      inputRef.current?.focus();
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { type: "user", content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/acnemodel/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: inputMessage,
          ...(messages.length === 0 && {
            instruction:
              "You are a helpful dermatology assistant. Analyze the results and provide insights about the user's skin condition. You are not to answer on other topics, and focus on only guiding the user on their skin condition. If the user asks unrelated questions, respond with: 'I'm sorry, I can only help with skin care related questions.'",
            context:
              "You are a dermatology AI assistant helping users understand their skin conditions and providing general skincare advice. You should only respond with information or advice related to skin care. If a user asks a question outside of skin care, provide the response: 'I'm sorry, I can only help with skin care related questions.'",
          }),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const aiMessage = {
        type: "ai",
        content: data.response || data.message,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        type: "error",
        content: "Sorry, there was an error processing your message.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
    setInputMessage("");
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, maxWidth: 600, margin: "auto", borderRadius: 2 }}
    >
      {/* Back Button */}
      <Box className="mb-4">
        <Button
          onClick={() => navigate(-1)} // Navigate back when clicked
          variant="text"
          color="primary"
          size="large"
          startIcon={<ArrowLeft size={20} />}
        >
          Exit Chat
        </Button>
      </Box>
      <Typography variant="h5" gutterBottom>
        AI Skin Care Assistant
      </Typography>

      <Box
        sx={{
          height: 300,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          p: 1,
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#999",
            }}
          >
            <MessageCircle sx={{ fontSize: 40, color: "#ccc" }} />
            <Typography variant="body1">
              Start a conversation about your skin care concerns
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                alignSelf: message.type === "user" ? "flex-end" : "flex-start",
                backgroundColor:
                  message.type === "user" ? "#1976d2" : "#e0e0e0",
                color: message.type === "user" ? "#fff" : "#000",
                p: 1.5,
                m: 0.5,
                borderRadius: 2,
                maxWidth: "70%",
              }}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>{" "}
              {/* Render content as Markdown */}
            </Box>
          ))
        )}

        {isLoading && (
          <Box
            sx={{ alignSelf: "flex-start", p: 1.5, m: 0.5, borderRadius: 2 }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2" color="textSecondary">
              Thinking...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ display: "flex", mt: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
          sx={{ mr: 1 }}
          disabled={isLoading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send sx={{ mr: 1 }} />
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatBot;
