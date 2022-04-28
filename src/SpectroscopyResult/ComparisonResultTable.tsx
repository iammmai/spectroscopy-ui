import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useMemo } from "react";

import type { SpectroscopyViewResult } from "./SpectroscopyResult";

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

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Coarest distinguishing formula</TableCell>
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
              <TableCell align="right">{row.inequivalences}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ComparisionTable;
