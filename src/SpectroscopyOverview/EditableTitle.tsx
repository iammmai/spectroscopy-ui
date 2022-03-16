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
}: {
  inputLabel: string;
  prefix: string;
  value: string;
  onChange: (val: string) => void;
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
    />
  ) : (
    <div className="title-container">
      <Typography>{`${prefix} ${value}`}</Typography>
      <EditIcon onClick={handleClick} />
    </div>
  );
};

export default EditableTitle;
