import { Button } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import { SetStateAction, useState } from "react";

import { styled } from "@mui/material/styles";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

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

const StyledFormControl = styled(FormControl)`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin: 20px;
`;

const StyledSelect = styled(Select)`
  width: 30vw;
`;

const Settingsbar = () => {
  const [selectedEquivalences, setEquivalences] = useState<string[] | []>([]);

  const handleSelect = (e: SelectChangeEvent<unknown>) =>
    setEquivalences(e.target.value as SetStateAction<string[] | []>);

  return (
    <StyledFormControl>
      <InputLabel id="equivalence-select">
        Examine processes in regards to
      </InputLabel>
      <StyledSelect
        id="equivalence-select"
        multiple
        value={selectedEquivalences}
        onChange={handleSelect}
        input={<OutlinedInput label=" Examine processes in regards to" />}
      >
        {EQUIVALENCES.map((equivalence) => (
          <MenuItem key={equivalence} value={equivalence}>
            {equivalence}
          </MenuItem>
        ))}
      </StyledSelect>
      <Button variant="contained">Examine</Button>
    </StyledFormControl>
  );
};

export default Settingsbar;
