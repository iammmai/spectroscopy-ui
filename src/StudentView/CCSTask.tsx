import { Button, Typography } from "@mui/material";
import { useState } from "react";

import { TextField } from "@mui/material";
import * as R from "ramda";

import LTSViewer from "LTSViewer/LTSViewer";
import { LTS } from "pseuco-shared-components/lts/lts";
import { Tag } from "../SpectroscopyResult/SpectroscopyResult";
import { tagColors } from "utils/constants";

import styled from "styled-components";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const LTSContainer = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const CCSTask = ({
  ltsData,
  onContinue,
  showResult,
}: {
  ltsData: LTS[];
  onContinue: () => void;
  showResult: boolean;
}) => {
  const [isResultVisible, setResultVisible] = useState(showResult);
  const [ccsAnswer, setCcsAnswer] = useState({
    left: null,
    right: null,
  });

  const handleCCSChange =
    (key: "left" | "right") =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCcsAnswer({ ...ccsAnswer, [key]: event.target.value });
    };

  const handleButtonClick = () => {
    setResultVisible(true);
    onContinue();
  };

  const renderLTS = () => {
    return ltsData.map((lts, i) => {
      const key = i === 0 ? "left" : "right";
      return (
        <LTSContainer>
          <LTSViewer lts={lts} expandAll />
          <TextField
            variant="outlined"
            onChange={handleCCSChange(key)}
            label="Derive the CCS formula from the LTS"
            sx={{ width: "80%" }}
            value={ccsAnswer[key]}
          />
        </LTSContainer>
      );
    });
  };

  const renderResult = () => {
    return (
      <>
        <Typography>
          Given are these two processes as labelled transistion systems.
        </Typography>
        <Row>
          {ltsData.map((lts, i) => {
            const key = i === 0 ? "left" : "right";
            return (
              <LTSContainer>
                <LTSViewer lts={lts} expandAll />
                <Tag color={tagColors[i]} key={lts.initialState}>{`${
                  lts.initialState
                } = ${R.path(["states", lts.initialState, "ccs"], lts)}`}</Tag>
              </LTSContainer>
            );
          })}
        </Row>
      </>
    );
  };

  const renderTask = () => {
    return (
      <>
        <Typography>
          Given are these two processes as labelled transistion systems. State
          the corresponding CCS terms for each of them.
        </Typography>
        <Row>{renderLTS()}</Row>
        <Button
          variant="contained"
          onClick={handleButtonClick}
          disabled={R.any(R.isNil)(Object.values(ccsAnswer))}
        >
          Continue
        </Button>
      </>
    );
  };

  return isResultVisible ? renderResult() : renderTask();
};

export default CCSTask;
