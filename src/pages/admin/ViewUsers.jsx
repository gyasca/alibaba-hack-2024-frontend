import React from "react";
import UserList from "../../components/UserList";
import { Container } from "@mui/material";

function ViewUsers() {
  return (
    <Container
      sx={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        mt: "4%",
      }}
    >
      <UserList />
    </Container>
  );
}

export default ViewUsers;
