import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Checkbox,
} from "@mui/material";
import { Edit, Delete, Visibility, Search, Add } from "@mui/icons-material";
import http from "../../http";
import { useNavigate } from "react-router-dom";
import EditModuleForm from "./EditModuleForm";

function ModuleList() {
  const [modules, setModules] = useState([]);
  const [deleteModule, setDeleteModule] = useState(null);
  const [editModule, setEditModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [deleteSelectedDialogOpen, setDeleteSelectedDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await http.get("/module/all");
      setModules(response.data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const handleView = (moduleCode) => navigate(`/admin/modules/${moduleCode}`);
  const handleEdit = (module) => setEditModule(module);
  const handleDelete = (module) => setDeleteModule(module);

  const confirmDelete = async () => {
    try {
      await http.delete(`/module/${deleteModule.moduleCode}`);
      setDeleteModule(null);
      fetchModules();
    } catch (error) {
      console.error("Error deleting module:", error);
    }
  };

  const handleEditClose = () => {
    setEditModule(null);
    fetchModules();
  };

  const handleSelectAllClick = () => {
    if (selectedModules.length === modules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(modules.map((module) => module.moduleCode));
    }
  };

  const handleCheckboxClick = (moduleCode) => {
    setSelectedModules((prevSelected) =>
      prevSelected.includes(moduleCode)
        ? prevSelected.filter((code) => code !== moduleCode)
        : [...prevSelected, moduleCode]
    );
  };

  const handleDeleteSelected = () => {
    setDeleteSelectedDialogOpen(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedModules.map((moduleCode) =>
          http.delete(`/module/${moduleCode}`)
        )
      );
      setSelectedModules([]);
      fetchModules();
    } catch (error) {
      console.error("Error deleting selected modules:", error);
    } finally {
      setDeleteSelectedDialogOpen(false);
    }
  };

  const columns = [
    {
      field: "select",
      headerName: "",
      width: 50,
      renderCell: (params) => (
        <Checkbox
          checked={selectedModules.includes(params.row.moduleCode)}
          onChange={() => handleCheckboxClick(params.row.moduleCode)}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => handleView(params.row.moduleCode)}
            size="small"
          >
            <Visibility />
          </IconButton>
          <IconButton onClick={() => handleEdit(params.row)} size="small">
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)} size="small">
            <Delete />
          </IconButton>
        </>
      ),
    },
    { field: "moduleCode", headerName: "Module Code", width: 150 },
    { field: "title", headerName: "Title", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
    { field: "credit", headerName: "Credit", width: 100 },
    { field: "school", headerName: "School", width: 150 }
  ];

  const filteredModules = modules.filter((module) =>
    Object.values(module).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Module Management
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search modules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/admin/modules/create")}
        >
          Create Module
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="contained" onClick={handleSelectAllClick}>
          {selectedModules.length === modules.length
            ? "Unselect All"
            : "Select All"}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteSelected}
          disabled={selectedModules.length === 0}
        >
          Delete Selected
        </Button>
      </Box>
      <Box
        sx={{ flexGrow: 1, width: "100%", height: "60vh", overflow: "hidden" }}
      >
        <DataGrid
          rows={filteredModules}
          columns={columns}
          getRowId={(row) => row.moduleCode}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          components={{ Toolbar: GridToolbar }}
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-main": { overflow: "auto" },
            "& .MuiDataGrid-virtualScroller": { overflow: "auto" },
          }}
        />
      </Box>

      <Dialog open={!!deleteModule} onClose={() => setDeleteModule(null)}>
        <DialogTitle>Delete Module</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this module?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModule(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!editModule}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Module</DialogTitle>
        <DialogContent>
          {editModule && (
            <EditModuleForm module={editModule} onClose={handleEditClose} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteSelectedDialogOpen}
        onClose={() => setDeleteSelectedDialogOpen(false)}
      >
        <DialogTitle>Delete Selected Modules</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the selected modules? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSelectedDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteSelected} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModuleList;