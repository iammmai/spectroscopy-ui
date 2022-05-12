import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import * as R from "ramda";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { Popper, Box, IconButton, Typography } from "@mui/material";
import { EquivalenceName } from "utils/constants";

const ALERT_ORANGE = "#FFC52F";

const StyledDiv = styled((props) => <div {...props} />)`
  width: ${(props) => props.width};
  height: ${(props) => props.height || "70px"};
  background-color: ${(props) => props.color};
  opacity: ${(props) => (props.isHighlighted ? 0.7 : 1)};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #414040;
  gap: 3px;
`;

const Content = styled.div`
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  width: 300px;
  background-color: white;
  padding: 10px;
`;

const Block = ({
  width,
  height,
  isHighlighted,
  color,
  children,
  distinctions,
  name,
}: {
  width: string;
  height?: string;
  isHighlighted: boolean;
  color: string;
  children?: ReactNode;
  distinctions?: { formula: string; inequivalences: EquivalenceName[] }[];
  name: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMouseOver = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseOut = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <StyledDiv
        width={width}
        height={height}
        isHighlighted={isHighlighted}
        color={color}
      >
        {children}
        {distinctions && (
          <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <ReportProblemIcon sx={{ color: ALERT_ORANGE, fontSize: 20 }} />
          </div>
        )}
      </StyledDiv>
      {distinctions && (
        <Popper open={open} anchorEl={anchorEl}>
          <Content>
            <Typography variant="body2" gutterBottom>
              {`The processes are distinguished under ${name} preorder as the following distinguishing formula have been found:`}
            </Typography>
            <Typography>
              {distinctions.map((d) => (
                <Typography variant="body2" gutterBottom>
                  {d.formula}
                </Typography>
              ))}
            </Typography>
          </Content>
        </Popper>
      )}
    </>
  );
};

export default Block;
