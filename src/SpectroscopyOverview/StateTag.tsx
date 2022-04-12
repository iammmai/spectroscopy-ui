import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";

const StyledDiv = styled.div`
  background-color: #56ccf2;
  color: white;
  display: flex;
  flex-direction: row;
  border-radius: 3px;
  padding: 2px 5px;
  font-size: 12px;
  align-items: center;
`;
const StateTag = ({
  label,
  onClose,
}: {
  label: string;
  onClose: () => void;
}) => {
  return (
    <StyledDiv>
      <span>{label}</span>
      <CloseIcon
        fontSize="small"
        onClick={onClose}
        sx={{ cursor: "pointer" }}
      />
    </StyledDiv>
  );
};

export default StateTag;
