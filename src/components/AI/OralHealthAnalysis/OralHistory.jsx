import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
  Typography,
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
  Alert,
  Stack,
} from "@mui/material";
import { Delete, Visibility, Refresh } from "@mui/icons-material";
import http from "../../../http";

const OralHistory = ({ labelMapping, refreshTrigger, jwtUserId }) => {
  const [oralHistory, setOralHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchOralHistory = async (userId) => {
    console.log("Fetching history for userId:", userId);
    let timeoutId;
  
    try {
      setError(null);
      setIsLoading(true);
  
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Request timed out'));
        }, 15000);
      });
  
      const response = await Promise.race([
        http.get("/history/oha/get-history", {
          params: { user_id: userId }
        }),
        timeoutPromise
      ]);
  
      clearTimeout(timeoutId);
      console.log("Response data:", response.data);
  
      if (response.data.history) {
        console.log(`Found ${response.data.history.length} history records`);
        
        const formattedHistory = response.data.history.map(record => {
          // Parse the UTC date and add 8 hours for Singapore time
          const utcDate = new Date(record.analysis_date);
          const sgDate = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours in milliseconds
          
          const formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }).format(sgDate);
        
          return {
            ...record,
            analysis_date: formattedDate,
            raw_date: record.analysis_date
          };
        });
  
        setOralHistory(formattedHistory);
      } else {
        console.log("No history data in response");
        setOralHistory([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
      }
      setError(err.response?.data?.error || err.message || "Failed to fetch oral health history");
      if (retryCount < 3) {
        console.log(`Retrying (${retryCount + 1}/3)...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchOralHistory(userId);
        }, 2000 * (retryCount + 1));
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // Only fetch when userId is available and changes
  useEffect(() => {
    console.log("Effect triggered - jwtUserId:", jwtUserId, "refreshTrigger:", refreshTrigger);
    if (jwtUserId) {
      setRetryCount(0); // Reset retry count on new fetch
      fetchOralHistory(jwtUserId);
    } else {
      console.warn("No user ID available");
      setError("User ID not available");
      setIsLoading(false);
    }
  }, [jwtUserId, refreshTrigger]);

  const handleDelete = async () => {
    try {
      if (selectedRows.length === 0) {
        return;
      }

      await Promise.all(
        selectedRows.map((id) =>
          http.delete("/history/oha/delete-result", { params: { id } })
        )
      );

      setOralHistory((prev) =>
        prev.filter((item) => !selectedRows.includes(item.id))
      );
      setSelectedRows([]);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete records");
    }
  };


  const columns = [
    {
      field: "analysis_date",
      headerName: "Date",
      width: 200,
      valueFormatter: (params) => {
        try {
          const date = new Date(params.value);
        } catch (err) {
          console.error("Date formatting error:", err);
          return params.value;
        }
      }
    },
    { field: "condition_count", headerName: "Condition Count", width: 150 },
    {
      field: "image_url",
      headerName: "Image Preview",
      width: 300,
      renderCell: (params) => {
        return (
          <Box sx={{ position: "relative", width: "100%", height: "auto" }}>
            <img
              src={params.row.image_url}
              alt="Oral Health"
              style={{ maxWidth: "50%", height: "50%", borderRadius: "8px", cursor: "pointer" }}
              onClick={() => handleDialogOpen(params.row.image_url)}
            />
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1
          }}
        >
          <IconButton
            onClick={() => handleDialogOpen(params.row.image_url)}
            size="small"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <Visibility />
          </IconButton>
          <IconButton
            onClick={() => {
              setSelectedRows([params.row.id]);
              setDeleteDialogOpen(true);
            }}
            size="small"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, gap: 2 }}>
        <CircularProgress />
        <Typography color="textSecondary">Loading history...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={() => {
                setRetryCount(0);
                fetchOralHistory(jwtUserId);
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const handleDialogOpen = (imageSrc) => {
    setSelectedImage(imageSrc);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {selectedRows.length > 0 && (
        <Button
          variant="contained"
          color="error"
          startIcon={<Delete />}
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Selected ({selectedRows.length})
        </Button>
      )}

      <Typography variant="h5" sx={{ mb: 2 }}>
        Oral Health History
      </Typography>

      {oralHistory.length === 0 ? (
        <Alert severity="info">No history available. User ID: {jwtUserId}</Alert>
      ) : (
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={oralHistory}
            columns={columns}
            rowHeight={90}
            pageSize={5}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection);
            }}
            rowSelectionModel={selectedRows}
            getRowId={(row) => row.id}
            initialState={{
              sorting: {
                sortModel: [{ field: 'analysis_date', sort: 'desc' }],
              },
            }}
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
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Analysis Result</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Click outside or press close to exit the preview.
          </DialogContentText>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <img
              src={selectedImage}
              alt="Analysis Result"
              style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OralHistory;
