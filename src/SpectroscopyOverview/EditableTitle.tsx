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
  errorMsg,
}: {
  inputLabel: string;
  prefix?: string;
  value: string;
  onChange: (val: string) => void;
  variant?: "h4" | "body1" | "h5" | "h6";
  placeholder?: string;
  showEditOnHover?: boolean;
  errorMsg?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => onChange(e.target.value);

  const handleClick = (e: any) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleMouseOver = () => {
    if (showEditOnHover) {
      setIsEditVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (showEditOnHover) {
      setIsEditVisible(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (showEditOnHover) setIsEditVisible(false);
  };

  return isEditing ? (
    <TextField
      variant="outlined"
      defaultValue={value}
      onChange={handleChange}
      onBlur={handleBlur}
      autoFocus
      label={inputLabel}
      fullWidth
      placeholder={placeholder}
      error={errorMsg ? true : false}
      helperText={errorMsg}
    />
  ) : (
    <div
      className="title-container"
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <Typography variant={variant}>{`${prefix ? prefix : ""} ${
        value || placeholder
      }`}</Typography>
      {(!showEditOnHover || isEditVisible) && (
        <EditIcon onClick={handleClick} />
      )}
    </div>
  );
};

export default EditableTitle;
