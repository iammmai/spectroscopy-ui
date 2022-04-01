import { TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import "./CCSOverview.css";

const AddProcess = ({
  process,
  onPrefixChange,
  onCCSChange,
  onRemove,
  onBlur,
  error,
}: {
  process: { id?: string; ccs?: string; prefix?: string };
  onPrefixChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  onCCSChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  onRemove: any;
  onBlur: any;
  error: string | undefined;
}) => {
  return (
    <div className="row-container">
      <TextField
        label="Process-prefix"
        variant="outlined"
        onChange={onPrefixChange}
        value={process.prefix}
      />
      :
      <TextField
        label={`Process`}
        variant="outlined"
        value={process.ccs}
        onChange={onCCSChange}
        fullWidth
        onBlur={onBlur}
        {...(error && {
          error: true,
          helperText: error,
        })}
        placeholder="Enter process in ccs notation"
      />
      <IconButton onClick={onRemove}>
        <CloseIcon />
      </IconButton>
    </div>
  );
};

export default AddProcess;
