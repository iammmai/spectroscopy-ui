import { Button } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import * as R from "ramda";

import { SetStateAction, useState } from "react";

import styled from "styled-components";
import StateTag from "./StateTag";

const EQUIVALENCES = [
  "bisimulation",
  "2-nested simulation",
  "ready simulation",
  "ready traces",
  "possible futures",
  "simulation",
  "failure",
  "traces",
];

const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 3px;
  padding: 2px 5px;
  align-items: center;
`;

const TagContainer = styled.div`
  border-radius: 3px;
  border: 1px solid #c4c4c4;
  width: 20vw;
  min-height: 1.4375em;
  padding: 16.5px 14px;
  display: flex;
  justify-content: row;
  gap: 5px;
`;

const formControlStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: "10px",
  margin: "20px",
  alignItems: "center",
} as const;

const PlaceholderText = styled.span`
  color: #666666; ;
`;
const StyledSelect = styled(Select)`
  width: 30vw;
`;

const Settingsbar = ({
  selectedStates = [],
  onTagClose,
  onCompare,
}: {
  selectedStates: { id: string; key: string }[];
  onTagClose: (state: { id: string; key: string }) => void;
  onCompare: () => void;
}) => {
  const handleTagClose = (state: { id: string; key: string }) => () => {
    onTagClose(state);
  };

  return (
    <StyledDiv>
      <FormControl sx={formControlStyle}>
        <span>States to compare:</span>
        <TagContainer>
          {R.isEmpty(selectedStates) ? (
            <PlaceholderText>Select states from the lts</PlaceholderText>
          ) : (
            selectedStates.map((state) => (
              <StateTag
                label={state.key}
                onClose={handleTagClose(state)}
                key={state.key}
              />
            ))
          )}
        </TagContainer>
      </FormControl>
      <FormControl sx={formControlStyle}>
        <Button
          variant="contained"
          disabled={selectedStates.length < 2}
          onClick={onCompare}
        >
          Compare
        </Button>
      </FormControl>
    </StyledDiv>
  );
};

export default Settingsbar;
