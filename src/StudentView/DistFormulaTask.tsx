import { Button, FormControl, Typography } from "@mui/material";
import { useState } from "react";

import { TextField, Select, MenuItem, InputLabel } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

import * as R from "ramda";
import { v4 as uuidv4 } from "uuid";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import LTSViewer from "LTSViewer/LTSViewer";
import { LTS } from "pseuco-shared-components/lts/lts";
import {
  SpectroscopyViewResult,
  Tag,
} from "../SpectroscopyResult/SpectroscopyResult";
import { tagColors, EQUIVALENCES } from "utils/constants";

import styled from "styled-components";
import ComparisionTable from "SpectroscopyResult/ComparisonResultTable";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 5px;
`;

const LTSContainer = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const DistFormulaTask = ({
  ltsData,
  onContinue,
  showResult,
  resultData,
}: {
  ltsData: LTS[];
  onContinue: () => void;
  showResult: boolean;
  resultData: SpectroscopyViewResult;
}) => {
  const [isResultVisible, setResultVisible] = useState(showResult);
  const [formulae, setFormulae] = useState<any>({});

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

  const handleInputBlur =
    (id: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormulae({
        ...formulae,
        [id]: {
          ...formulae[id],
          formula: e.target.value,
        },
      });
    };

  const handleSelectEquivalence =
    (id: string) => (event: SelectChangeEvent) => {
      setFormulae({
        ...formulae,
        [id]: {
          ...formulae[id],
          equivalence: event.target.value,
        },
      });
    };

  const renderFormulaRow = ({
    id,
    formula,
    equivalence,
  }: {
    id: string;
    formula: string;
    equivalence: string;
  }) => {
    return (
      <Row>
        <TextField
          variant="outlined"
          label="Distinguishing formulae"
          sx={{ width: "50%" }}
          value={formula}
          onBlur={handleInputBlur(id)}
        />
        <FormControl sx={{ width: "50%" }}>
          <InputLabel id="equivalence-select">Equivalence</InputLabel>
          <Select
            labelId="equivalence-select"
            id={id}
            label="Equivalence"
            value={equivalence}
            onChange={handleSelectEquivalence(id)}
          >
            {Object.values(EQUIVALENCES).map((equivalence) => (
              <MenuItem key={equivalence.name} value={equivalence.name}>
                {equivalence.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Row>
    );
  };

  const handleAddFormula = () => {
    const id = uuidv4();
    setFormulae({
      ...formulae,
      [id]: { id, formula: null, equivalence: null },
    });
  };

  const renderTask = () => {
    return (
      <>
        <Typography>
          {`The processes can be distinguished under different preorders/equivalences. Try to
          find HML fomulae that satisfy ${R.path(
            [0, "inistalState"],
            ltsData
          )} but do not satify ${R.path(
            [1, "inistalState"],
            ltsData
          )}and select the equivalence it`}
          distinguishes.
        </Typography>
        {Object.values(formulae).map((formula: any) =>
          renderFormulaRow(formula)
        )}
        <Button
          variant="outlined"
          startIcon={<AddOutlinedIcon />}
          onClick={handleAddFormula}
        >
          Distinguishing formula
        </Button>
        <Button
          variant="contained"
          onClick={handleButtonClick}
          disabled={R.isEmpty(formulae)}
        >
          Continue
        </Button>
      </>
    );
  };

  return isResultVisible ? renderResult() : renderTask();
};

export default DistFormulaTask;
