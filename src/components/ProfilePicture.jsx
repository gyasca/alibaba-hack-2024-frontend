import React, { useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import { stringAvatar } from "../functions/stringAvatar";
import http from "../http"; // Assuming http is set up to handle API requests

function ProfilePicture(props) {
  const { user } = props;
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

  // Set the profile photo URL when user data is available
  useEffect(() => {
    if (user.profile_photo_file_path) {
      // Remove 'static/uploads/' from the file path to get the actual filename
      const fileName = user.profile_photo_file_path.replace(
        "static/uploads/",
        ""
      );
      // Construct the full URL to fetch the image from the server
      const fullUrl = `${
        import.meta.env.VITE_FILE_BASE_URL
      }/uploads/${fileName}`;
      setProfilePhotoUrl(fullUrl);
    }
  }, [user]); // This will run whenever the user changes

  const name = user.username || "User";
  const s = {
    ...stringAvatar(name).sx,
    ...props.sx,
  };

  return (
    <>
      {profilePhotoUrl ? (
        <Avatar {...props} src={profilePhotoUrl} />
      ) : (
        <Avatar {...stringAvatar(name)} sx={s} />
      )}
    </>
  );
}

export default ProfilePicture;
