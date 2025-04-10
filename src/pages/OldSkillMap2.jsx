import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/system";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ArcherContainer, ArcherElement } from "react-archer";

const CurvyPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  padding: theme.spacing(2),
  backgroundColor: "#F0F4F8",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  marginBottom: theme.spacing(1),
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const CurvyButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  margin: theme.spacing(1),
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
}));

const LeftSectionPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  padding: theme.spacing(2),
  backgroundColor: "#F0F4F8",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  height: "100%",
}));

const categories = [
  "Business Innovation & Enterprise",
  "Programming",
  "Web & UX Design",
  "Data Structures & Algorithms",
  "Marketing Strategy",
  "Full Stack Development for Data Science",
];

const initialModules = {
  CL1: [
    "Mathematical Analysis & Application",
    "Network Technologies",
    "Statistical Research Methods",
    "Business Innovation & Enterprise",
    "Programming",
  ],
  CL2: [
    "Cybersecurity Technologies & Ethics",
    "AI & Data Analytics",
    "Database Design & Administration",
    "Web & UX Design",
  ],
  CL3: [
    "Predictive Modelling",
    "Data Wrangling",
    "Marketing Strategy",
    "Data Structures & Algorithms",
  ],
  CL4: [
    "Applied Machine Learning",
    "AI Ethics & Governance",
    "Data Platform Management",
    "Data Journalism",
  ],
  CL5: [
    "Applied Deep Learning",
    "Text Analytics",
    "Machine Learning Operations",
    "Data Processing on Big Data",
    "Full Stack Development for Data Science",
  ],
  Outcomes: [
    "Analytics & Computational Modelling",
    "Applied Artificial Intelligence",
    "Data Strategy for AIOps",
    "Emerging Technology & Application",
    "Data Visualization & Journalism",
    "DataOps for AI Innovation",
    "Business Needs Analysis & Strategy",
    "Agile Development for Data Science",
  ],
};

const relationships = [
    { from: "Mathematical Analysis & Application", to: "Predictive Modelling" },
    { from: "Predictive Modelling", to: "Applied Machine Learning" },
    { from: "Applied Machine Learning", to: "Applied Deep Learning" },
    { from: "Applied Deep Learning", to: "Applied Artificial Intelligence" },
    { from: "Predictive Modelling", to: "Text Analytics" },
    { from: "Text Analytics", to: "Analytics & Computational Modelling" },
  
    { from: "Network Technologies", to: "Cybersecurity Technologies & Ethics" },
    {
      from: "Cybersecurity Technologies & Ethics",
      to: "Data Platform Management",
    },
    { from: "Data Platform Management", to: "Machine Learning Operations" },
    { from: "Machine Learning Operations", to: "Data Strategy for AIOps" },
    { from: "Cybersecurity Technologies & Ethics", to: "AI Ethics & Governance" },
    { from: "AI Ethics & Governance", to: "Technology Synthesis & Application" },
    {
      from: "Technology Synthesis & Application",
      to: "Emerging Technology & Application",
    },
  
    { from: "Statistical Research Methods", to: "AI & Data Analytics" },
    { from: "AI & Data Analytics", to: "AI Ethics & Governance" },
    { from: "AI & Data Analytics", to: "Data Journalism" },
    { from: "Data Journalism", to: "Data Visualization & Journalism" },
  
    { from: "Database Design & Administration", to: "Data Wrangling" },
    { from: "Data Wrangling", to: "Data Processing on Big Data" },
    { from: "Data Processing on Big Data", to: "DataOps for AI Innovation" },
  
    { from: "Business Innovation & Enterprise", to: "Marketing Strategy" },
    { from: "Marketing Strategy", to: "Business Needs Analysis & Strategy" },
  
    { from: "Programming", to: "Web & UX Design" },
    { from: "Web & UX Design", to: "Data Structures & Algorithms" },
    {
      from: "Data Structures & Algorithms",
      to: "Full Stack Development for Data Science",
    },
    {
      from: "Full Stack Development for Data Science",
      to: "Agile Development for Data Science",
    },
  ];

const ViewSkillMap2 = () => {
  const [open, setOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  const [moduleState, setModuleState] = useState(initialModules);
  const [maxRows, setMaxRows] = useState(0);

  useEffect(() => {
    const max = Math.max(...Object.values(moduleState).map(arr => arr.length));
    setMaxRows(max);
  }, [moduleState]);

  const handleClickOpen = (module) => {
    setSelectedModule(module);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    
    const newModuleState = { ...moduleState };
    const [movedItem] = newModuleState[sourceColumn].splice(source.index, 1);
    newModuleState[destColumn].splice(destination.index, 0, movedItem);

    setModuleState(newModuleState);
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: "2rem" }}>
      <Grid container spacing={4}>
        {/* Left Section */}
        <Grid item xs={12} md={2}>
          <LeftSectionPaper elevation={3}>
            <Typography variant="h5" gutterBottom>
              DAAA Curriculum
            </Typography>
            <Box display="flex" flexDirection="column">
              {categories.map((category, index) => (
                <CurvyButton key={index} variant="contained" size="small">
                  {category}
                </CurvyButton>
              ))}
            </Box>
            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={2}>
              <Button size="small">1</Button>
              <Button size="small">2</Button>
              <Button size="small">3</Button>
            </Box>
          </LeftSectionPaper>
        </Grid>

        {/* Right Section */}
        <Grid item xs={12} md={10}>
          <DragDropContext onDragEnd={onDragEnd}>
            <ArcherContainer strokeColor="blue">
              <Grid container spacing={2}>
                {Object.keys(moduleState).map((column, columnIndex) => (
                  <Grid item xs={2} key={columnIndex}>
                    <Typography variant="h6" textAlign="center">
                      {column}
                    </Typography>
                    <Droppable droppableId={column}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          style={{ minHeight: "100px" }}
                        >
                          {[...Array(maxRows)].map((_, rowIndex) => (
                            <Draggable
                              key={`${column}-${rowIndex}`}
                              draggableId={`${column}-${rowIndex}`}
                              index={rowIndex}
                              isDragDisabled={!moduleState[column][rowIndex]}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <ArcherElement
                                    id={moduleState[column][rowIndex] || `${column}-${rowIndex}`}
                                    relations={relationships
                                      .filter((rel) => rel.from === moduleState[column][rowIndex])
                                      .map((rel) => ({
                                        targetId: rel.to,
                                        targetAnchor: "left",
                                        sourceAnchor: "right",
                                        style: {
                                          strokeColor: "purple",
                                          strokeWidth: 2,
                                          strokeDasharray: 2,
                                        },
                                      }))}
                                  >
                                    <CurvyPaper
                                      elevation={3}
                                      onClick={() => moduleState[column][rowIndex] && handleClickOpen(moduleState[column][rowIndex])}
                                      style={{
                                        cursor: moduleState[column][rowIndex] ? "pointer" : "default",
                                        marginBottom: "8px",
                                        minHeight: "80px",
                                      }}
                                    >
                                      <Typography variant="body2" align="center">
                                        {moduleState[column][rowIndex] || "+"}
                                      </Typography>
                                    </CurvyPaper>
                                  </ArcherElement>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Grid>
                ))}
              </Grid>
            </ArcherContainer>
          </DragDropContext>
        </Grid>
      </Grid>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {selectedModule} Certifications
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Dummy Certification 1</Typography>
          <Typography gutterBottom>Dummy Certification 2</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewSkillMap2;