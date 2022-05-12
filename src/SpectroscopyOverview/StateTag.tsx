import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";

const StyledDiv = styled((props) => <div {...props} />)`
  background-color: ${(props) => props.color || "#56ccf2"};
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
  color,
}: {
  label: string;
  onClose: () => void;
  color?: string;
}) => {
  return (
    <StyledDiv color={color}>
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
