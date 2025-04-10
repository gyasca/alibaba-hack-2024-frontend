import { Container } from "@mui/material";
import React from "react";
import SpecificUserDetails from "../../components/SpecificUserDetails";
function ViewSpecificUser() {
  return (
    <Container
      sx={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        mt: "4%"
      }}
    >
      <SpecificUserDetails />
    </Container>
  );
}

export default ViewSpecificUser;
