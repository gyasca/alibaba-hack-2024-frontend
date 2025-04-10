import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import http from "../http";
import AdminPageTitle from "./AdminPageTitle";

function BulkCreateUser() {
  const [snackbar, setSnackbar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState([]);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();

  const processUsers = async (users) => {
    try {
      const response = await http.post("/user/bulk-register", { users });
      return response.data;
    } catch (error) {
      console.error("Error in bulk registration:", error);
      throw error;
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      setLoading(true);
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      try {
        const result = await processUsers(jsonData);
        setSnackbar({
          message: `Created ${result.success.length} users. Failed: ${result.errors.length}`,
          severity: result.errors.length > 0 ? "warning" : "success",
        });
        if (result.errors.length > 0) {
          setErrorDetails(result.errors);
          setErrorDialogOpen(true);
        } else {
          setSuccessDialogOpen(true);
        }
      } catch (error) {
        setSnackbar({ message: "Error processing users", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  return (
    <Box sx={{ width: "100%", mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Create users in bulk
      </Typography>
      <Box
        sx={{
          mx: 0,
          mb: 10
        }}
      >
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed #cccccc",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": {
              borderColor: "primary.main",
            },
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography>Drop the Excel file here ...</Typography>
          ) : (
            <Typography>
              Drag and drop an Excel file here, or click to select one
            </Typography>
          )}
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mt: 2 }} />}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
      />
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle>Error Details</DialogTitle>
        <DialogContent>
          {errorDetails.map((error, index) => (
            <Typography key={index}>{`${error.email}: ${
              Array.isArray(error.error) ? error.error.join(", ") : error.error
            }`}</Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
      >
        <DialogTitle>Users Created Successfully</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to view the users now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setSuccessDialogOpen(false);
              navigate("/admin/users");
            }}
          >
            View Users
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BulkCreateUser;
