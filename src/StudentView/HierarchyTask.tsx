import { Button, Typography } from "@mui/material";
import { useState } from "react";

import * as R from "ramda";

import { LTS } from "pseuco-shared-components/lts/lts";
import { EquivalenceName } from "utils/constants";
import { SpectroscopyViewResult } from "../SpectroscopyResult/SpectroscopyResult";

import EquivalenceHierarchy from "EquivalenceHierarchy/EquivalenceHierarchy";
import ComparisionTable from "SpectroscopyResult/ComparisonResultTable";
import styled from "styled-components";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 5px;
`;

const HierarchyTask = ({
  onContinue,
  showResult,
  resultData,
}: {
  onContinue: () => void;
  showResult: boolean;
  resultData: SpectroscopyViewResult;
}) => {
  const [isResultVisible, setResultVisible] = useState(showResult);
  const [equivalences, setEquivalences] = useState<EquivalenceName[]>([]);

  const handleButtonClick = () => {
    setResultVisible(true);
    onContinue();
  };

  const renderResult = () => {
    return (
      <>
        <Typography>
          The processes can be distinguished under different
          preorders/equivalences. The table shows found distinguishing formulas
          and thei "prices". According to the prices we can determine under
          which equivalence the processes can be distinguished.
        </Typography>
        <Row>
          <ComparisionTable result={resultData} />
        </Row>
      </>
    );
  };

  const handleSelectEquivalence = (equivalence: EquivalenceName) => {
    setEquivalences(R.symmetricDifference(equivalences, [equivalence]));
  };

  const renderEquivalenceHierarchy = () => {
    return (
      <Row>
        <EquivalenceHierarchy
          equivalences={equivalences}
          onSelect={handleSelectEquivalence}
        />
      </Row>
    );
  };

  const renderTask = () => {
    return (
      <>
        <Typography>
          With this information you can place the two processes onto the
          hierarchy of equivalences. Select the equivalences for which the
          processes are similar.
        </Typography>
        {renderEquivalenceHierarchy()}
        <Button
          variant="contained"
          onClick={handleButtonClick}
          disabled={R.isEmpty(equivalences)}
        >
          Show entire results
        </Button>
      </>
    );
  };

  return isResultVisible ? renderResult() : renderTask();
};

export default HierarchyTask;
