import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Box,
  Tab,
  Tabs,
  IconButton,
  InputAdornment,
  Typography,
  Container,
  Paper,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";
import { Edit, Delete, Visibility, Search, Add } from "@mui/icons-material";
import http from "../http";
import { useNavigate } from "react-router-dom";
import EditUserForm from "./User/EditUserForm";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deleteSelectedDialogOpen, setDeleteSelectedDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // New state for role filter
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await http.get("/user/all");
      setUsers(Array.isArray(response.data.users) ? response.data.users : []);
      console.log("user to set:", response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const handleEdit = (user) => setEditUser(user);
  const handleDelete = (user) => setDeleteUser(user);
  const handleView = (userId) => navigate(`/admin/users/${userId}`);

  const handleEditComplete = () => {
    setEditUser(null);
    fetchUsers();
  };

  const confirmDelete = async () => {
    try {
      await http.delete(`/user/${deleteUser.userId}`);
      setDeleteUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSelectAllClick = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.userId));
    }
  };

  const handleCheckboxClick = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleDeleteSelected = () => {
    setDeleteSelectedDialogOpen(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) => http.delete(`/user/${userId}`))
      );
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting selected users:", error);
    } finally {
      setDeleteSelectedDialogOpen(false);
    }
  };

  const filteredUsers = users
    .filter((user) =>
      Object.values(user).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .filter((user) => (roleFilter ? user.role === roleFilter : true)); // Apply role filter

  const columns = [
    {
      field: "select",
      headerName: (
        <Checkbox
          checked={selectedUsers.length === users.length && users.length > 0}
          onChange={handleSelectAllClick}
        />
      ),
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <Checkbox
          checked={selectedUsers.includes(params.row.userId)}
          onChange={() => handleCheckboxClick(params.row.userId)}
        />
      ),
    },
    { field: "userId", headerName: "ID", width: 90 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleView(params.row.userId)} size="small">
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
  ];

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 2 }}>
        User Management
      </Typography>

      {/* <Paper elevation={3} sx={{ mt: 5, mb: 5 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="fullWidth">
          <Tab label="All Users" />
        </Tabs>
      </Paper> */}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search users..."
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

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            displayEmpty
            sx={{ mr: 2 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="specialist">Specialist</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>

          <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/admin/users/create")}>
            Create User
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="contained" onClick={handleSelectAllClick}>
          {selectedUsers.length === users.length ? "Unselect All" : "Select All"}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteSelected}
          disabled={selectedUsers.length === 0}
        >
          Delete Selected
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, width: "100%", height: "53vh", overflow: "hidden" }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={(row) => row.userId} // Ensures unique row IDs
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          rowsPerPageOptions={[5, 10, 20]}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        {editUser && <EditUserForm user={editUser} onSave={handleEditComplete} onCancel={() => setEditUser(null)} />}
      </Dialog>

      <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this user?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUser(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteSelectedDialogOpen} onClose={() => setDeleteSelectedDialogOpen(false)}>
        <DialogTitle>Delete Selected Users</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete the selected users?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSelectedDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteSelected} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default UserList;
