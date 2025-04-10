import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Card,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Delete, Visibility } from "@mui/icons-material";
import http from "../../../http";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const drawBoundingBoxes = (imageSrc, predictions, labelMapping) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageSrc;
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      predictions.forEach((prediction, index) => {
        const { x_center, y_center, width, height, pred_class, confidence } =
          prediction;
        const x = x_center - width / 2;
        const y = y_center - height / 2;

        ctx.strokeStyle = "#39FF14";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        const label = labelMapping[pred_class] || "Unknown";
        const confidenceText = (confidence * 100).toFixed(1);

        ctx.font = "bold 16px Poppins";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
          `Box ${index + 1} - ${confidenceText}% ${label}`,
          x,
          y > 20 ? y - 10 : y + height + 20
        );
      });

      resolve(canvas.toDataURL());
    };
  });
};

const OralHistory = ({ labelMapping, refreshTrigger, jwtUserId }) => {
  const [oralHistory, setOralHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (jwtUserId) {
      fetchOralHistory(jwtUserId);
    } else {
      setError("User not logged in");
      setIsLoading(false);
    }
  }, [refreshTrigger]);

  const fetchOralHistory = async (userId) => {
    try {
      const response = await http.get("/history/oha/get-history", {
        params: { user_id: userId },
      });

      if (response.status === 200 && response.data.history.length === 0) {
        console.warn("No history records found");
        setOralHistory([]); // Ensure the UI still renders
        setIsLoading(false);
        return;
      }

      const historyWithImages = await Promise.all(
        response.data.history.map(async (item) => {
          if (item.predictions) {
            const imageWithBoundingBoxes = await drawBoundingBoxes(
              item.original_image_path,
              item.predictions,
              labelMapping
            );
            return {
              ...item,
              image_with_bounding_boxes: imageWithBoundingBoxes,
            };
          }
          return item;
        })
      );

      setOralHistory(historyWithImages);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.warn("No records found for this user.");
        setOralHistory([]); // Ensure an empty state is handled properly
      } else {
        setError("Failed to fetch oral health history");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Check if there are selected rows
      if (selectedRows.length === 0) {
        alert("No records selected for deletion");
        return;
      }

      // Delete each selected record
      await Promise.all(
        selectedRows.map((id) =>
          http.delete(`/history/oha/delete-result`, { params: { id } })
        )
      );

      // Update the oralHistory state to remove deleted records
      setOralHistory((prev) =>
        prev.filter((item) => !selectedRows.includes(item.id))
      );
      setSelectedRows([]); // Clear selected rows
      setDeleteDialogOpen(false); // Close the dialog
    } catch (err) {
      console.error("Failed to delete records", err);
      alert("Error deleting records");
    }
  };

  const handleDialogOpen = (imageSrc) => {
    setSelectedImage(imageSrc);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

  const columns = [
    { field: "analysis_date", headerName: "Date", width: 200 },
    { field: "condition_count", headerName: "Condition Count", width: 150 },
    { field: "user_id", headerName: "User ID", width: 120 },
    {
      field: "image_preview",
      headerName: "Image Preview",
      width: 300,
      renderCell: (params) => {
        const { image_with_bounding_boxes, original_image_path } = params.row;
        return (
          <Box sx={{ position: "relative", width: "100%", height: "auto" }}>
            <img
              src={image_with_bounding_boxes || original_image_path}
              alt="Oral Health"
              style={{ maxWidth: "50%", height: "50%", borderRadius: "8px" }}
              onClick={() =>
                handleDialogOpen(
                  image_with_bounding_boxes || original_image_path
                )
              }
            />
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              const imageSrc =
                params.row.image_with_bounding_boxes ||
                params.row.original_image_path;
              setSelectedImage(imageSrc); // Set the image to show in the dialog
              setDialogOpen(true); // Open the dialog
            }}
            size="small"
          >
            <Visibility />
          </IconButton>
          <IconButton
            onClick={() => {
              setSelectedRows([params.row.id]);
              setDeleteDialogOpen(true);
            }}
            size="small"
          >
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  const chartData = oralHistory.map((item, index) => ({
    scan: index + 1,
    conditionCount: item.condition_count,
    date: item.analysis_date,
  }));

  const dailyData = oralHistory.reduce((acc, item) => {
    const date = item.analysis_date.split("T")[0];
    if (!acc[date]) {
      acc[date] = { date, totalConditions: 0, count: 0 };
    }
    acc[date].totalConditions += item.condition_count;
    acc[date].count += 1;
    return acc;
  }, {});

  const dailyAverageData = Object.values(dailyData).map((day) => ({
    date: day.date,
    averageConditions: day.totalConditions / day.count,
  }));

  const conditionCountData = Object.entries(labelMapping).map(
    ([key, label]) => {
      const count = oralHistory.reduce((acc, item) => {
        if (item.predictions) {
          return (
            acc +
            item.predictions.filter(
              (prediction) => prediction.pred_class === parseInt(key)
            ).length
          );
        }
        return acc;
      }, 0);
      return { condition: label, count };
    }
  );

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ width: '100%', mb: 4, p: 3 }}>
      {selectedRows.length > 0 && (
        <Button
          variant="contained"
          color="error"
          startIcon={<Delete />}
          sx={{
            position: "absolute",
            top: 16, // Adjust top margin for better visibility
            right: 16, // Adjust right margin
            zIndex: 1, // Ensure it's above other content
          }}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Selected
        </Button>
      )}
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Oral Health History
      </Typography>
      {oralHistory.length === 0 ? (
        <Typography>No history available.</Typography>
      ) : (
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={oralHistory}
            rowHeight={90}
            columns={columns}
            pageSize={5}
            checkboxSelection
            onRowSelectionModelChange={(newSelectionModel) => {
              console.log("New selection:", newSelectionModel); // Debug line
              setSelectedRows(newSelectionModel);
            }}
            rowSelectionModel={selectedRows}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row.id}
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedRows.length} record(s)?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Image with Bounding Boxes</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            Click outside the image or press close to exit the preview.
          </DialogContentText>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <img
              src={selectedImage}
              alt="Enlarged View"
              style={{ maxWidth: "100%", height: "auto", borderRadius: "20px", mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Charts Section */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Analytics
      </Typography>
      <Grid container spacing={3} sx={{ml: 8}}>
        {/* Chart 1: Condition Count Over Scans */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Condition Count Over Scans</Typography>
          <LineChart
            width={isMobile ? 350 : 500}
            height={300}
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="scan" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="conditionCount" stroke="#8884d8" />
          </LineChart>
        </Grid>

        {/* Chart 2: Daily Average Condition Count */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Daily Average Condition Count</Typography>
          <LineChart
            width={isMobile ? 350 : 500}
            height={300}
            data={dailyAverageData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="averageConditions"
              stroke="#82ca9d"
            />
          </LineChart>
        </Grid>

        {/* Chart 3: Condition Count by Condition Type */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">
            Condition Count by Condition Type
          </Typography>
          <BarChart
            width={isMobile ? 350 : 500}
            height={300}
            data={conditionCountData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="condition" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </Grid>

        {/* Chart 4: Condition Count Over Time */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Condition Count Over Time</Typography>
          <LineChart
            width={isMobile ? 350 : 500}
            height={300}
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="conditionCount" stroke="#ff7300" />
          </LineChart>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OralHistory;
