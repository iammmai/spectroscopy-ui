import { Button } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import * as R from "ramda";
import styled from "styled-components";
import StateTag from "./StateTag";
import { tagColors } from "utils/constants";

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
            selectedStates.map((state, i) => (
              <StateTag
                label={state.key}
                onClose={handleTagClose(state)}
                key={state.key}
                color={tagColors[i]}
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
