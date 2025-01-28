import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ value, onChange, placeholder = "Recherche" }) => {
  return (
    <TextField
      label={placeholder}
      variant="outlined"
      value={value}
      onChange={onChange}
      sx={{ marginBottom: 2 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;