import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  IconButton,
  Box,
} from '@mui/material';
import { styled } from '@mui/system';
import { Add as AddIcon, Save as SaveIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Custom styled components for Paper and Button with curvy borders and shadows
const CurvyPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  padding: theme.spacing(2),
  backgroundColor: "#F0F4F8",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  marginBottom: theme.spacing(4),
}));

const CurvyButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  margin: theme.spacing(1),
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
}));

const Test1 = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modules, setModules] = useState(Array(30).fill(null));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [title, setTitle] = useState('Competence Map');
  const [editingIndex, setEditingIndex] = useState(null);

  const categories = ['Category 1', 'Category 2', 'Category 3']; // Example categories

  const handleAddModule = (moduleData, index) => {
    const newModules = [...modules];
    newModules[index] = moduleData;
    setModules(newModules);
    setShowModal(false);
    setHasUnsavedChanges(true);
  };

  const handleEditModule = (index) => {
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDeleteModule = (index) => {
    const newModules = [...modules];
    newModules[index] = null;
    setModules(newModules);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', { title, modules: modules.filter(m => m) });
    setHasUnsavedChanges(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'navy' }}>
        <Toolbar>
          <TextField
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasUnsavedChanges(true);
            }}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              style: { fontSize: '1.25rem', color: 'white' }
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          {hasUnsavedChanges && (
            <Button color="inherit" startIcon={<SaveIcon />} onClick={handleSaveChanges}>
              Save Changes
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Grid container spacing={2}>
        {/* Left Section */}
        <Grid item xs={12} md={2}>
          <CurvyPaper elevation={3}>
            <Typography variant="h5" gutterBottom>
              DAAA Curriculum
            </Typography>
            {categories.map((category, index) => (
              <CurvyButton key={index} fullWidth variant="contained">
                {category}
              </CurvyButton>
            ))}
            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={2}>
              <Button>1</Button>
              <Button>2</Button>
              <Button>3</Button>
            </Box>
          </CurvyPaper>
        </Grid>

        {/* Right Section */}
        <Grid item xs={12} md={10}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)} 
            centered
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="VIEW COMPETENCE MAP" />
            <Tab label="CREATE COMPETENCE MAP" />
            <Tab label="COMPETENCE MAP - LEVEL 1" />
          </Tabs>

          {activeTab === 0 && <ViewCompetenceMap modules={modules.filter(m => m)} />}
          {activeTab === 1 && (
            <CreateCompetenceMap 
              modules={modules} 
              onAddModule={(index) => {
                setEditingIndex(index);
                setShowModal(true);
              }}
              onEditModule={handleEditModule}
              onDeleteModule={handleDeleteModule}
            />
          )}
          {activeTab === 2 && <CompetenceMapLevel1 modules={modules.filter(m => m)} />}

          <Dialog open={showModal} onClose={() => setShowModal(false)}>
            <DialogTitle>{editingIndex !== null && modules[editingIndex] ? 'Edit Module' : 'Add New Module'}</DialogTitle>
            <AddModuleForm 
              onSubmit={(moduleData) => handleAddModule(moduleData, editingIndex)} 
              onClose={() => {
                setShowModal(false);
                setEditingIndex(null);
              }}
              initialValue={editingIndex !== null ? modules[editingIndex]?.name : ''}
            />
          </Dialog>
        </Grid>
      </Grid>
    </Box>
  );
};

const ViewCompetenceMap = ({ modules }) => (
  <Box sx={{ p: 3 }}>
    <TextField fullWidth label="Search for specific module" variant="outlined" margin="normal" />
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {modules.map((module, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            {module.name}
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const CreateCompetenceMap = ({ modules, onAddModule, onEditModule, onDeleteModule }) => (
  <Box sx={{ p: 3 }}>
    <Grid container spacing={2}>
      {modules.map((module, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <ModuleCard 
            module={module} 
            onAdd={() => onAddModule(index)}
            onEdit={() => onEditModule(index)}
            onDelete={() => onDeleteModule(index)}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

const ModuleCard = ({ module, onAdd, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        textAlign: 'center', 
        height: '100px',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        border: '2px dashed #ccc',
        bgcolor: 'transparent',
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {module ? (
        <>
          <Typography>{module.name}</Typography>
          {isHovered && (
            <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
              <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={onDelete}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          )}
        </>
      ) : (
        <IconButton onClick={onAdd} size="large">
          <AddIcon />
        </IconButton>
      )}
    </Paper>
  );
};

const CompetenceMapLevel1 = ({ modules }) => (
  <Box sx={{ p: 3 }}>
    <TextField fullWidth label="Search for specific module" variant="outlined" margin="normal" />
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {modules.map((module, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            {module.name}
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const AddModuleForm = ({ onSubmit, onClose, initialValue = '' }) => {
  const [moduleName, setModuleName] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: moduleName });
    setModuleName('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Module Name"
          type="text"
          fullWidth
          variant="outlined"
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          {initialValue ? 'Update Module' : 'Add Module'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default Test1;
