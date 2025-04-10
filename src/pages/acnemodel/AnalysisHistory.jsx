// 220147Q Chng Kai Jie Ryan
import { useNavigate } from "react-router-dom"; // Add this import
import { ArrowLeft } from "lucide-react"; // Add this import if using lucide icons
import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Container,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
} from "@mui/icons-material";
import http from "../../http";

function AnalysisHistory() {
  const navigate = useNavigate(); // Add this hook
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await http.get("/skin-analysis/history");
      if (response.data) {
        console.log("Fetched analyses:", response.data);
        // Log the first analysis details
        if (response.data.length > 0) {
          console.log("First analysis details:", {
            hasAnnotatedImage: !!response.data[0].annotated_image_url,
            annotatedImageUrl: response.data[0].annotated_image_url,
            predictions: response.data[0].predictions,
          });
        }
        setAnalyses(response.data);
      }
    } catch (err) {
      console.error("Error fetching analyses:", err);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      await http.put(`/skin-analysis/${selectedAnalysis.id}`, {
        notes: editNotes,
      });
      setOpenDialog(false);
      fetchAnalyses();
    } catch (err) {
      console.error("Error updating notes:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this analysis?")) {
      try {
        await http.delete(`/skin-analysis/${id}`);
        fetchAnalyses();
      } catch (err) {
        console.error("Error deleting analysis:", err);
      }
    }
  };

  const getConditionSummary = (predictions) => {
    // First, ensure predictions is an array
    let predictionsArray;
    try {
      predictionsArray =
        typeof predictions === "string" ? JSON.parse(predictions) : predictions;
    } catch (e) {
      console.error("Error parsing predictions:", e);
      return "No condition we can detect present";
    }

    // Check if we have valid predictions
    if (!Array.isArray(predictionsArray) || predictionsArray.length === 0) {
      return "No condition we can detect present";
    }

    const conditionCounts = predictionsArray.reduce((acc, pred) => {
      const condition = getConditionName(pred.class);
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(conditionCounts)
      .map(
        ([condition, count]) => `${count} ${condition}${count > 1 ? "s" : ""}`
      )
      .join(", ");
  };

  const getConditionName = (classId) => {
    const conditions = {
      1: "blackhead",
      2: "whitehead",
      3: "papule",
      4: "pustule",
      5: "nodule",
    };
    return conditions[classId] || "unknown condition";
  };

  const getAdvice = (predictions) => {
    // First, ensure predictions is an array
    let predictionsArray;
    try {
      predictionsArray =
        typeof predictions === "string" ? JSON.parse(predictions) : predictions;
    } catch (e) {
      console.error("Error parsing predictions:", e);
      return "Your skin appears healthy! Continue with your current skincare routine.";
    }

    // Check if we have valid predictions
    if (!Array.isArray(predictionsArray) || predictionsArray.length === 0) {
      return "Your skin appears healthy! Continue with your current skincare routine.";
    }

    const conditions = new Set(
      predictionsArray.map((p) => getConditionName(p.class))
    );
    let advice = [];

    if (conditions.has("blackhead") || conditions.has("whitehead")) {
      advice.push(
        "For blackheads and whiteheads:",
        "• Use products containing salicylic acid or benzoyl peroxide",
        "• Consider gentle exfoliation 2-3 times per week",
        "• Keep skin clean and avoid touching your face"
      );
    }

    if (conditions.has("papule") || conditions.has("pustule")) {
      advice.push(
        "For inflammatory acne (papules and pustules):",
        "• Apply benzoyl peroxide or tea tree oil treatments",
        "• Keep the affected area clean",
        "• Avoid picking or squeezing",
        "• Consider using products with niacinamide"
      );
    }

    if (conditions.has("nodule")) {
      advice.push(
        "For nodular acne:",
        "• Consult a dermatologist as this type of acne often requires prescription treatment",
        "• Apply ice to reduce inflammation",
        "• Keep the area clean and avoid irritation"
      );
    }

    return advice.join("\n");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container maxWidth="xl" className="py-24">
        {/* Back Button */}
        <Box className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowLeft size={20} />}
            className="text-gray-600 hover:bg-gray-100 normal-case" // normal-case prevents uppercase text
            variant="text"
            size="large"
          >
            Back to Analysis
          </Button>
        </Box>

        {/* Header */}
        <Box className="mb-8">
          <Typography variant="h4" className="font-semibold text-gray-800">
            Skin Analysis History
          </Typography>
          <Typography variant="body1" color="textSecondary" className="mt-2">
            Track your skin's progress over time
          </Typography>
        </Box>

        {/* Analysis Grid */}
        <Grid container spacing={4}>
          {analyses.map((analysis) => (
            <Grid item xs={12} sm={6} md={4} key={analysis.id}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                {/* Image Section */}
                <Box className="relative">
                  <img
                    src={analysis.imageUrl}
                    alt="Skin analysis"
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedAnalysis(analysis);
                      setOpenDetailsDialog(true);
                    }}
                  />
                  <Box className="absolute top-2 right-2 flex gap-1">
                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => {
                          setSelectedAnalysis(analysis);
                          setOpenDetailsDialog(true);
                        }}
                        className="bg-white hover:bg-gray-100"
                        size="small"
                      >
                        <ZoomInIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Content Section */}
                <Box className="p-4">
                  <Typography variant="subtitle1" className="font-medium mb-2">
                    Analysis from{" "}
                    {new Date(analysis.timestamp).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className="mb-3"
                  >
                    {getConditionSummary(analysis.predictions)}
                  </Typography>

                  {analysis.notes && (
                    <Typography
                      variant="body2"
                      className="mb-3 p-2 bg-gray-50 rounded"
                    >
                      {analysis.notes}
                    </Typography>
                  )}

                  {/* Actions */}
                  <Box className="flex justify-end gap-2 mt-2">
                    <Tooltip title="Edit Notes">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedAnalysis(analysis);
                          setEditNotes(analysis.notes);
                          setOpenDialog(true);
                        }}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Analysis">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(analysis.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Edit Notes Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Edit Notes</DialogTitle>
          <DialogContent>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add notes about your skin condition..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateNotes} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Analysis Details Dialog */}
        <Dialog
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Analysis Details</DialogTitle>
          <DialogContent>
            {selectedAnalysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="h6" className="mb-2">
                      Original Image
                    </Typography>
                    <img
                      src={selectedAnalysis.imageUrl}
                      alt="Original"
                      className="w-full rounded-lg"
                    />
                  </div>
                  {selectedAnalysis.predictions && (
                    <div>
                      <Typography variant="h6" className="mb-2">
                        {(() => {
                          let predictionsArray;
                          try {
                            predictionsArray =
                              typeof selectedAnalysis.predictions === "string"
                                ? JSON.parse(selectedAnalysis.predictions)
                                : selectedAnalysis.predictions;

                            console.log("Analysis data:", {
                              hasAnnotatedImage:
                                !!selectedAnalysis.annotatedImageUrl,
                              annotatedImageUrl:
                                selectedAnalysis.annotatedImageUrl,
                              predictions: predictionsArray,
                            });

                            return predictionsArray &&
                              predictionsArray.length > 0
                              ? "Annotated Image"
                              : "No Conditions Detected";
                          } catch (e) {
                            console.error("Error parsing predictions:", e);
                            return "No Conditions Detected";
                          }
                        })()}
                      </Typography>
                      <img
                        src={
                          selectedAnalysis.annotatedImageUrl ||
                          selectedAnalysis.imageUrl
                        }
                        alt="Analysis result"
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Typography variant="h6">Condition Summary</Typography>
                  <Typography variant="body1">
                    {getConditionSummary(selectedAnalysis.predictions)}
                  </Typography>
                </div>
                <div className="mt-4">
                  <Typography variant="h6">Recommendations</Typography>
                  <Typography
                    variant="body1"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {getAdvice(selectedAnalysis.predictions)}
                  </Typography>
                </div>
                {selectedAnalysis.notes && (
                  <div className="mt-4">
                    <Typography variant="h6">Notes</Typography>
                    <Typography variant="body1">
                      {selectedAnalysis.notes}
                    </Typography>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
}

export default AnalysisHistory;
