import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import http from '../../http';

const StudentProgress = ({ userId }) => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      const response = await http.get(`/students/${userId}/enrollments`);
      setEnrollments(response.data);
    };
    fetchEnrollments();
  }, [userId]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Student Progress</Typography>
      <List>
        {enrollments.map(enrollment => (
          <ListItem key={enrollment.id}>
            <ListItemText 
              primary={enrollment.module.title} 
              secondary={`Course: ${enrollment.course.name}`}
            />
            <Chip label={enrollment.status} color={
              enrollment.status === 'passed' ? 'success' : 
              enrollment.status === 'failed' ? 'error' : 'default'
            } />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default StudentProgress;