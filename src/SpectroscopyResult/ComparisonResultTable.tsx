import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import HelpIcon from "@mui/icons-material/Help";
import IconButton from "@mui/material/IconButton";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import { useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import * as R from "ramda";

import type { SpectroscopyViewResult } from "./SpectroscopyResult";
import { EQUIVALENCES } from "utils/constants";
import EquivalenceHierarchy from "EquivalenceHierarchy/EquivalenceHierarchy";

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
  const [open, setOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

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

  const renderTooltipContent = (inequivalences: string[] = []) => {
    const descriptions = inequivalences.map((inequivalence) =>
      R.pipe<any, any, any>(
        R.find(R.propEq("name", inequivalence)),
        R.prop("description")
      )(Object.values(EQUIVALENCES))
    );

    return (
      <Box>
        {descriptions.map((description) => (
          <p>{description}</p>
        ))}
        <Link onClick={handleOpen}>View equivalence hierarchy</Link>
      </Box>
    );
  };

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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <EquivalenceHierarchy />
        </Box>
      </Modal>
    </TableContainer>
  );
};

export default ComparisionTable;
