import { RowingSharp } from "@mui/icons-material";

import { useMemo, useState } from "react";
import * as R from "ramda";
import styled from "styled-components";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

import { EQUIVALENCES } from "utils/constants";
import type { EquivalenceName } from "utils/constants";
import { Button, Popper, Box, IconButton } from "@mui/material";
import Block from "./Block";

const LIGHT_LIGHT_GREY = "#F2F2F2";
const LIGHT_GREY = "#E0E0E0";
const MID_GREY = "#BDBDBD";
const DARKER_GREY = "#AAAAAA";

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #074ee8;
  width: fit-content;
`;

// const Block = styled((props) => <div {...props} />)`
//   width: ${(props) => props.width};
//   height: ${(props) => props.height || "70px"};
//   background-color: ${(props) => props.color};
//   opacity: ${(props) => (props.isHighlighted ? 0.7 : 1)};
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   font-size: 12px;
//   color: #414040;
// `;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const getPreorders = (equivalence: EquivalenceName): EquivalenceName[] => {
  const preorders = R.pipe<any, any, any>(
    R.find(R.propEq("name", equivalence)),
    R.prop("preorders")
  )(R.values(EQUIVALENCES));

  // reached enabledness equivalence
  if (R.isEmpty(preorders)) return [];

  return R.pipe(
    R.map((preorder: any) => [
      ...preorders,
      ...getPreorders(preorder as EquivalenceName),
    ]),
    R.flatten,
    R.uniq
  )(preorders);
};

const EquivalenceHierarchy = ({
  equivalences = [],
  distinctions = [],
}: {
  equivalences: EquivalenceName[];
  distinctions: { formula: string; inequivalences: EquivalenceName[] }[];
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const preorders = useMemo(
    () =>
      R.pipe(
        R.map((equivalence: EquivalenceName) => getPreorders(equivalence)),
        R.flatten,
        R.concat(equivalences),
        R.uniq
      )(equivalences),
    [equivalences]
  );

  const distinctionsByEquivalence = useMemo(
    () =>
      R.pipe(
        // @ts-ignore
        R.map(R.unwind("inequivalences")),
        R.flatten,
        R.groupBy((distinction: any) => distinction.inequivalences)
      )(distinctions),
    [distinctions]
  );

  return (
    <>
      <OuterContainer>
        <Row>
          <Block
            width="460px"
            height="70px"
            color={LIGHT_GREY}
            name={EQUIVALENCES.BISIMULATION.name}
            isHighlighted={preorders.includes(EQUIVALENCES.BISIMULATION.name)}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.BISIMULATION.name]
            }
          >
            {EQUIVALENCES.BISIMULATION.name}
          </Block>
        </Row>
        <Row>
          <Block
            width="460px"
            height="70px"
            color={MID_GREY}
            name={EQUIVALENCES.NESTED_SIMULATION.name}
            isHighlighted={preorders.includes(
              EQUIVALENCES.NESTED_SIMULATION.name
            )}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.NESTED_SIMULATION.name]
            }
          >
            {EQUIVALENCES.NESTED_SIMULATION.name}
          </Block>
        </Row>
        <Row>
          <Block
            width="299px"
            height="70px"
            color={LIGHT_LIGHT_GREY}
            name={EQUIVALENCES.READY_SIMULATION.name}
            isHighlighted={preorders.includes(
              EQUIVALENCES.READY_SIMULATION.name
            )}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.READY_SIMULATION.name]
            }
          >
            {EQUIVALENCES.READY_SIMULATION.name}
          </Block>
          <Block
            width="161px"
            color={MID_GREY}
            name={EQUIVALENCES.NESTED_SIMULATION.name}
            isHighlighted={preorders.includes(
              EQUIVALENCES.NESTED_SIMULATION.name
            )}
          />
        </Row>
        <Row>
          <Block
            width="138px"
            name={EQUIVALENCES.SIMULATION.name}
            color={MID_GREY}
            isHighlighted={preorders.includes(EQUIVALENCES.SIMULATION.name)}
          ></Block>
          <Block
            width="161px"
            color={LIGHT_GREY}
            name={EQUIVALENCES.READY_TRACE.name}
            isHighlighted={preorders.includes(EQUIVALENCES.READY_TRACE.name)}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.READY_TRACE.name]
            }
          >
            {EQUIVALENCES.READY_TRACE.name}
          </Block>
          <Block
            width="161px"
            color={LIGHT_LIGHT_GREY}
            name={EQUIVALENCES.POSSIBLE_FUTURE.name}
            isHighlighted={preorders.includes(
              EQUIVALENCES.POSSIBLE_FUTURE.name
            )}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.POSSIBLE_FUTURE.name]
            }
          >
            {EQUIVALENCES.POSSIBLE_FUTURE.name}
          </Block>
        </Row>
        <Row>
          <Block
            width="138px"
            name={EQUIVALENCES.SIMULATION.name}
            color={MID_GREY}
            isHighlighted={preorders.includes(EQUIVALENCES.SIMULATION.name)}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.SIMULATION.name]
            }
          >
            {EQUIVALENCES.SIMULATION.name}
          </Block>
          <Block
            width="107px"
            color={DARKER_GREY}
            name={EQUIVALENCES.FAILURE_TRACE.name}
            isHighlighted={preorders.includes(EQUIVALENCES.FAILURE_TRACE.name)}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.FAILURE_TRACE.name]
            }
          >
            {EQUIVALENCES.FAILURE_TRACE.name}
          </Block>
          <Block
            width="107px"
            color={MID_GREY}
            name={EQUIVALENCES.READINESS.name}
            isHighlighted={preorders.includes(EQUIVALENCES.READINESS.name)}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.READINESS.name]
            }
          >
            {EQUIVALENCES.READINESS.name}
          </Block>
          <Block
            width="108px"
            color={LIGHT_GREY}
            name={EQUIVALENCES.IMPOSSIBLE_FUTURE.name}
            isHighlighted={preorders.includes(
              EQUIVALENCES.IMPOSSIBLE_FUTURE.name
            )}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.IMPOSSIBLE_FUTURE.name]
            }
          >
            {EQUIVALENCES.IMPOSSIBLE_FUTURE.name}
          </Block>
        </Row>
        <Row>
          <Block
            width="138px"
            name={EQUIVALENCES.SIMULATION.name}
            color={MID_GREY}
            isHighlighted={preorders.includes(EQUIVALENCES.SIMULATION.name)}
          ></Block>
          <Block
            width="322px"
            color={LIGHT_LIGHT_GREY}
            name={EQUIVALENCES.FAILURE.name}
            isHighlighted={preorders.includes(EQUIVALENCES.FAILURE.name)}
            distinctions={distinctionsByEquivalence[EQUIVALENCES.FAILURE.name]}
          >
            {EQUIVALENCES.FAILURE.name}
          </Block>
        </Row>
        <Row>
          <Block
            width="460px"
            height="70px"
            color={LIGHT_GREY}
            name={EQUIVALENCES.TRACES.name}
            isHighlighted={preorders.includes(EQUIVALENCES.TRACES.name)}
            distinctions={distinctionsByEquivalence[EQUIVALENCES.TRACES.name]}
          >
            {EQUIVALENCES.TRACES.name}
          </Block>
        </Row>
        <Row>
          <Block
            width="460px"
            height="70px"
            color={MID_GREY}
            isHighlighted={preorders.includes(EQUIVALENCES.ENABLEDNESS.name)}
            name={EQUIVALENCES.ENABLEDNESS.name}
            distinctions={
              distinctionsByEquivalence[EQUIVALENCES.ENABLEDNESS.name]
            }
          >
            {EQUIVALENCES.ENABLEDNESS.name}
          </Block>
        </Row>
      </OuterContainer>
    </>
  );
};

export default EquivalenceHierarchy;
