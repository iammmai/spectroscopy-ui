import { TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Typography from "@mui/material/Typography";

import { useState } from "react";

import "./EditableTitle.css";

const EditableTitle = ({
  inputLabel,
  prefix,
  value,
  onChange,
  variant = "body1",
  placeholder,
  showEditOnHover = false,
}: {
  inputLabel: string;
  prefix?: string;
  value: string;
  onChange: (val: string) => void;
  variant?: "h4" | "body1" | "h5" | "h6";
  placeholder?: string;
  showEditOnHover?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => onChange(e.target.value);

  const handleClick = (e: any) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return isEditing ? (
    <TextField
      variant="outlined"
      defaultValue={value}
      onChange={handleChange}
      onBlur={() => setIsEditing(false)}
      autoFocus
      label={inputLabel}
      fullWidth
      placeholder={placeholder}
    />
  ) : (
    <div className="title-container">
      <Typography variant={variant}>{`${
        prefix ? prefix : ""
      } ${value}`}</Typography>
      <EditIcon onClick={handleClick} />
    </div>
  );
};

export default EditableTitle;
