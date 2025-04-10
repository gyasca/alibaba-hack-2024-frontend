import React from "react";
import {
  Container,
  Typography,
} from "@mui/material";
import AdminPageTitle from "../../components/AdminPageTitle";
import BulkCreateUser from "../../components/BulkCreateUser";
import CreateUserForm from "../../components/User/CreateUserForm";

function CreateUserPage() {
  return (
    <Container
      sx={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AdminPageTitle
        title="Create User"
        subtitle="Create individually OR create in bulk"
        backbutton
      />
      <BulkCreateUser />
      <CreateUserForm /> {/* Use the new CreateUser component here */}
    </Container>
  );
}

export default CreateUserPage;