import { Link, Share } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Dialog,
  DialogTitle,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

const ShareModal = ({
  spectroscopyId,
  left,
  right,
}: {
  spectroscopyId: string;
  left: string;
  right: string;
}) => {
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [tab, setTab] = useState("default");
  const [tooltipText, setTooltipText] = useState("Copy link");

  const handleShare = () => setShareModalVisible(true);
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };
  const handleClose = () => setShareModalVisible(false);

  const handleCopyLink = (linkToCopy: string) => () => {
    navigator.clipboard.writeText(linkToCopy);
    setTooltipText("Copied!");
  };

  const standardLink = `${window.location.origin.toString()}/${spectroscopyId}/result?left=${left}&right=${right}`;
  const studentLink = `${window.location.origin.toString()}/${spectroscopyId}/student?left=${left}&right=${right}`;

  return (
    <>
      <IconButton onClick={handleShare}>
        <Share />
      </IconButton>

      <Dialog open={isShareModalVisible} onClose={handleClose}>
        <DialogTitle>Share spectroscopy results</DialogTitle>
        <Box sx={{ width: "600px" }}>
          <TabContext value={tab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList onChange={handleChange}>
                <Tab label="Standard view" value="default" />
                <Tab label="Student view" value="student" />
              </TabList>
            </Box>
            <TabPanel value="default">
              <FormControl sx={{ m: 1, width: "100%" }} variant="standard">
                <InputLabel htmlFor="standard-view">Share link</InputLabel>
                <Input
                  id="standard-view"
                  value={standardLink}
                  disabled={true}
                  endAdornment={
                    <InputAdornment position="end">
                      <Tooltip title={tooltipText}>
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleCopyLink(standardLink)}
                          onMouseOut={() => setTooltipText("Copy link")}
                        >
                          <Link />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </TabPanel>
            <TabPanel value="student">
              <FormControl sx={{ m: 1, width: "100%" }} variant="standard">
                <Typography>
                  The student view offers an interactive questionnaire on the
                  two processes.
                </Typography>
                <InputLabel htmlFor="standard-view">Share link</InputLabel>
                <Input
                  id="standard-view"
                  value={studentLink}
                  disabled={true}
                  endAdornment={
                    <InputAdornment position="end">
                      <Tooltip title={tooltipText}>
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleCopyLink(studentLink)}
                          onMouseOut={() => setTooltipText("Copy link")}
                        >
                          <Link />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </TabPanel>
          </TabContext>
        </Box>
      </Dialog>
    </>
  );
};

export default ShareModal;
