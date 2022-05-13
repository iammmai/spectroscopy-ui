import HelpIcon from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import * as R from "ramda";
import { useMemo } from "react";
import styledComponent from "styled-components";
import { styled } from "@mui/material/styles";

import { EQUIVALENCES } from "utils/constants";
import type { SpectroscopyViewResult } from "./SpectroscopyResult";

const StyledDiv = styledComponent.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  background-color: white;
  padding: 5px;
  gap: 5px;
`;

const priceLabel = [
  "observations",
  "conjunctions",
  "pDeep",
  "pFlat",
  "nFlat",
  "nH",
] as const;

type ResultRow = {
  formula: string;
  inequivalences: string[];
  observations: number;
  conjunctions: number;
  pDeep: number;
  pFlat: number;
  nFlat: number;
  nH: number;
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

const ComparisionTable = ({ result }: { result: SpectroscopyViewResult }) => {
  const rows = useMemo(() => {
    return result.distinctions.map(({ formula, price, inequivalences }) => ({
      formula,
      inequivalences,
      ...price.reduce(
        (prev, element, i) => ({
          ...prev,
          [priceLabel[i]]: element,
        }),
        {}
      ),
    }));
  }, [result.distinctions]) as ResultRow[];

  const renderTooltipContent = (inequivalenceNames: string[] = []) => {
    const inequivalences = inequivalenceNames.map((inequivalence) =>
      R.find(R.propEq("name", inequivalence))(Object.values(EQUIVALENCES))
    );

    return (
      <Box>
        {inequivalences.map((inequivalence: any, i: number) => (
          <StyledDiv key={inequivalence.name}>
            <Typography variant="overline">{inequivalence.name}</Typography>
            <Typography variant="body2">{inequivalence.description}</Typography>
            <Typography variant="body2">
              {`In order to be distinguished under ${inequivalence.name} equivalence a distinguishing
            formula must fulfil the following dimensions:`}
            </Typography>
            {Object.entries(inequivalence.dimensions).map((dimension) => (
              <Typography variant="body2" key={dimension[0]}>
                {dimension[0]} : {dimension[1]}
              </Typography>
            ))}
            {inequivalences.length > 1 && i !== inequivalences.length - 1 && (
              <Divider />
            )}
          </StyledDiv>
        ))}
      </Box>
    );
  };

  if (result.preorderings.includes(EQUIVALENCES.BISIMULATION.name)) {
    return (
      <Typography variant="body2">
        There are no distinguishing formulas found as the processes are
        bismilar.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Coarsest distinguishing formula</TableCell>
            <TableCell align="right">Observations</TableCell>
            <TableCell align="right">Conjuntions</TableCell>
            <TableCell align="right">Positive deep</TableCell>
            <TableCell align="right">Positive flat</TableCell>
            <TableCell align="right">Negative flat</TableCell>
            <TableCell align="right">Negative H</TableCell>
            <TableCell align="right">Inequivalences</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.formula}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.formula}
              </TableCell>
              <TableCell align="right">{row.observations}</TableCell>
              <TableCell align="right">{row.conjunctions}</TableCell>
              <TableCell align="right">{row.pDeep}</TableCell>
              <TableCell align="right">{row.pFlat}</TableCell>
              <TableCell align="right">{row.nFlat}</TableCell>
              <TableCell align="right">{row.nH}</TableCell>
              <TableCell align="right">
                {row.inequivalences.join(",")}
                <LightTooltip
                  title={renderTooltipContent(row.inequivalences)}
                  placement="top"
                >
                  <IconButton aria-label="help" size="small">
                    <HelpIcon fontSize="inherit" />
                  </IconButton>
                </LightTooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ComparisionTable;
