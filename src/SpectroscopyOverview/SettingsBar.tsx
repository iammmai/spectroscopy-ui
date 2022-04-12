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
}: {
  selectedStates: { id: string; key: string }[];
  onTagClose: (state: { id: string; key: string }) => void;
}) => {
  const [selectedEquivalences, setEquivalences] = useState<string[] | []>([]);

  const handleSelect = (e: SelectChangeEvent<unknown>) =>
    setEquivalences(e.target.value as SetStateAction<string[] | []>);

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
        <InputLabel id="equivalence-select-label">
          Examine states in regards to
        </InputLabel>
        <StyledSelect
          labelId="equivalence-select-label"
          id="equivalence-select"
          multiple
          value={selectedEquivalences}
          onChange={handleSelect}
          input={<OutlinedInput label=" Examine states in regards to" />}
        >
          {EQUIVALENCES.map((equivalence) => (
            <MenuItem key={equivalence} value={equivalence}>
              {equivalence}
            </MenuItem>
          ))}
        </StyledSelect>
        <Button
          variant="contained"
          disabled={
            selectedStates.length < 2 || selectedEquivalences.length === 0
          }
        >
          Examine
        </Button>
      </FormControl>
    </StyledDiv>
  );
};

export default Settingsbar;
