// components/CertificationManager.jsx
import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import http from '../../http'

const CertificationManager = ({ moduleCode }) => {
  const [certifications, setCertifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentCertification, setCurrentCertification] = useState({ name: '', description: '' });

  useEffect(() => {
    const fetchCertifications = async () => {
      const response = await http.get(`/modules/${moduleCode}/certifications`);
      setCertifications(response.data);
    };
    fetchCertifications();
  }, [moduleCode]);

  const handleOpen = (certification = { name: '', description: '' }) => {
    setCurrentCertification(certification);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (currentCertification.id) {
      await http.put(`/certifications/${currentCertification.id}`, currentCertification);
    } else {
      await http.post(`/modules/${moduleCode}/certifications`, currentCertification);
    }
    handleClose();
    // Refresh certifications
    const response = await http.get(`/modules/${moduleCode}/certifications`);
    setCertifications(response.data);
  };

  const handleDelete = async (id) => {
    await http.delete(`/certifications/${id}`);
    // Refresh certifications
    const response = await http.get(`/modules/${moduleCode}/certifications`);
    setCertifications(response.data);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Certifications for {moduleCode}</Typography>
      <Button onClick={() => handleOpen()}>Add New Certification</Button>
      <List>
        {certifications.map(certification => (
          <ListItem key={certification.id}>
            <ListItemText 
              primary={certification.name} 
              secondary={certification.description}
            />
            <Button onClick={() => handleOpen(certification)}>Edit</Button>
            <Button onClick={() => handleDelete(certification.id)}>Delete</Button>
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentCertification.id ? 'Edit' : 'Add'} Certification</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={currentCertification.name}
            onChange={(e) => setCurrentCertification({...currentCertification, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={currentCertification.description}
            onChange={(e) => setCurrentCertification({...currentCertification, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CertificationManager;