import { TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import "./CCSOverview.css";

const AddProcess = ({
  process,
  onPrefixChange: onProcessNameChange,
  onCCSChange,
  onRemove,
  onBlur,
  error,
}: {
  process: { id?: string; ccs?: string; processName?: string };
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
  const isValidProcessName = (name: string) =>
    !!name.match(/\w0/gm) && name.length === 2;
  return (
    <div className="row-container">
      <TextField
        label="Process name"
        variant="outlined"
        onChange={onProcessNameChange}
        value={process.processName}
        {...(process.processName &&
          !isValidProcessName(process.processName) && {
            error: true,
            helperText:
              "Process name needs to start with a letter followed by 0.",
          })}
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
