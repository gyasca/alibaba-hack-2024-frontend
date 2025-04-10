import React, { useState, useRef, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, Switch, FormControlLabel, CircularProgress } from "@mui/material";
import http from "../../../http";
import { marked } from "marked";
import DOMPurify from "dompurify";

const Chatbot = ({ singleOralResult, labelMapping, jwtUserId }) => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am your HealthBuddy Oral Health Analysis Assistant! How may I help you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [oralResultsSummary, setOralResultsSummary] = useState("");
  const [includeHistory, setIncludeHistory] = useState(false);
  const [oralHistory, setOralHistory] = useState([]);

  const fetchOralHistory = async (userId) => {
    setIsLoading(true);
    try {
      const response = await http.get("/history/oha/get-history", {
        params: { user_id: userId },
      });

      if (response.status === 200 && response.data.history.length === 0) {
        console.warn("No history records found");
        setOralHistory([]); // Ensure the UI still renders
        return;
      }

      setOralHistory(response.data.history); // Directly use the history data without bounding boxes
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.warn("No records found for this user.");
        setOralHistory([]);
      } else {
        setError("Failed to fetch oral health history");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchChange = () => {
    setIncludeHistory((prev) => {
      const newValue = !prev;
      if (newValue) {
        fetchOralHistory(jwtUserId);
      } else {
        setOralHistory([]); // Clear history when switch is off
      }
      return newValue;
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (singleOralResult && singleOralResult.length > 0) {
      const latestHistory = singleOralResult[singleOralResult.length - 1];

      const formattedResults = latestHistory.predictions
        .map((prediction) => {
          const condition =
            labelMapping[prediction.pred_class] || "Unknown Condition";
          const confidence = (prediction.confidence * 100).toFixed(2);
          return `${condition} (${confidence}%)`;
        })
        .join(", ");

      setOralResultsSummary(formattedResults);

      const message = {
        text: `Detected conditions: ${formattedResults}. What do these results mean?`,
        sender: "user",
      };

      setMessages((prev) => [...prev, message]);

      const fetchChatResponse = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const requestPayload = {
            instruction:
              "You are a helpful chatbot in an oral health analysis app. Based on images users upload of their mouth (teeth, gums, tongue, etc.), processed by a YOLOv8 object detection model, you will review the output from the model, which detects conditions like Caries, Gingivitis, Tooth Discoloration, and Ulcers. Your task is to provide explanations for these conditions, along with actionable recommendations to improve the user's oral health and suggest preventive measures. Remind users that this is an estimated diagnosis and recommend Singaporean dentists with links to their pages. If users ask for more details or medical advice, do provide them the advice as some of them are really low income and need the help. If you are concerned, you can clarify that this is just an AI app for estimated diagnoses and not to be taken as professional medical advice. Below are the results of the analysis.",
            results: formattedResults,
            message: "What do these results mean?",
          };

          const response = await http.post("/ohamodel/chat", requestPayload);

          if (response.status === 200) {
            const botMessage = {
              text: response.data.response,
              sender: "bot",
            };
            setMessages((prev) => [...prev, botMessage]);
          } else {
            setError("Error fetching chatbot response.");
          }
        } catch (error) {
          console.error("Error calling chatbot API:", error);
          setError("Error fetching chatbot response.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchChatResponse();
    }
  }, [singleOralResult]);

  useEffect(() => {
    if (includeHistory && oralHistory.length > 0) {
      const formattedHistory = oralHistory
        .map((historyItem) => {
          const analysisDate = historyItem.analysis_date;
          const conditionsCount = historyItem.predictions.reduce((acc, prediction) => {
            const condition = labelMapping[prediction.pred_class] || "Unknown Condition";
            acc[condition] = (acc[condition] || 0) + 1;
            return acc;
          }, {});

          const conditionString = Object.entries(conditionsCount)
            .map(([condition, count]) => `${count} ${condition.toLowerCase()}`)
            .join(", ");

          return `On ${analysisDate}, ${historyItem.predictions.length} conditions (${conditionString}) were detected.`;
        })
        .join("\n");

      const historyMessage = {
        text: `Here is your past oral health history:\n\n${formattedHistory}`,
        sender: "bot",
      };

      setMessages((prev) => [...prev, historyMessage]);
    }
  }, [includeHistory, oralHistory]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newUserMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");

    const fetchUserResponse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const context = messages
          .map((msg) => `${msg.sender}: ${msg.text}`)
          .join("\n");

        const requestPayload = {
          message: input,
          chat_history: context,
        };

        const response = await http.post("/ohamodel/chat", requestPayload);

        if (response.status === 200) {
          setMessages((prev) => [
            ...prev,
            { text: response.data.response, sender: "bot" },
          ]);
        } else {
          setError("Error fetching chatbot response.");
        }
      } catch (error) {
        console.error("Error calling chatbot API:", error);
        setError("Error fetching chatbot response.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserResponse();
  };

  const renderMarkdown = (markdownText) => {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      smartLists: true,
    });
    const rawHTML = marked(markdownText);
    const cleanHTML = DOMPurify.sanitize(rawHTML);
    return { __html: cleanHTML };
  };

  return (
    <Box sx={{ width: '100%', mb: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Oral Health Assistant
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={includeHistory}
            onChange={handleSwitchChange}
            color="primary"
          />
        }
        label="Include past oral history"
      />

      <Box
        sx={{
          height: 500,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          p: 1,
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#1976d2" : "#ffffff",
              color: msg.sender === "user" ? "#fff" : "#000",
              p: msg.sender === "bot" ? 2 : 1.5,
              m: 0.5,
              borderRadius: 2,
              maxWidth: "70%",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
              "& .markdown-content": {
                "& h1": {
                  textAlign: "center",
                  color: "#1976d2",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  mb: 3,
                  mt: 1,
                },
                "& h2": {
                  color: "#2196f3",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  mt: 3,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                },
                "& p": {
                  mb: 2,
                  lineHeight: 1.6,
                  textAlign: "justify",
                },
                "& ul, & ol": {
                  ml: 3,
                  mb: 2,
                  "& li": {
                    mb: 1,
                    position: "relative",
                    "&::before": {
                      content: '"•"',
                      color: "#2196f3",
                      position: "absolute",
                      left: -20,
                      fontWeight: "bold",
                    },
                  },
                },
                "& blockquote": {
                  borderLeft: "4px solid #ffa726",
                  bgcolor: "#fff3e0",
                  p: 2,
                  my: 2,
                  borderRadius: 1,
                  "& p": {
                    m: 0,
                    color: "#e65100",
                  },
                },
                "& a": {
                  color: "#0077cc",
                  textDecoration: "none",
                  fontWeight: "medium",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "#0056b3",
                  },
                },
                "& strong": {
                  color: "#0d47a1",
                  fontWeight: "bold",
                },
              },
            }}
          >
            {msg.sender === "bot" ? (
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={renderMarkdown(msg.text)}
              />
            ) : (
              msg.text
            )}
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <Box sx={{ display: "flex", mt: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </Box>
    </Box>
  );
};

export default Chatbot;
