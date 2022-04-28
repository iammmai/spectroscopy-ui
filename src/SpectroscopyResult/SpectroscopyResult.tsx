import { IconButton } from "@mui/material";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ArrowBack } from "@mui/icons-material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import * as R from "ramda";
import { select } from "d3";
// import Flexbox from "react-svg-flexbox";

import Header from "Header/Header";
import styled from "styled-components";

import LTSInteractiveView from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import { LTS } from "../pseuco-shared-components/lts/lts";
import ComparisionTable from "./ComparisonResultTable";
import LTSViewer from "LTSViewer/LTSViewer";
import { renameStates, transformToLTS } from "utils/ltsConversion";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

type Distinctions = {
  formula: string;
  price: number[];
  inequivalences: string[];
};

export type SpectroscopyViewResult = {
  left: {
    stateKey: string;
    ccs: string;
  };
  right: {
    stateKey: string;
    ccs: string;
  };
  distinctions: Distinctions[];
  preorderings: string[];
};

export type SpectroscopyResult = {
  left: string;
  right: string;
  distinctions: Distinctions[];
  preorderings: string[];
};

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
`;

const Tag = styled.div`
  background-color: ${(props) => props.color || "#56ccf2"};
  color: white;
  display: flex;
  flex-direction: row;
  border-radius: 3px;
  padding: 2px 5px;
  align-items: center;
`;
const tagColors = ["#F2994A", "#6FCF97"];
const grey = "#BDBDBD";

const LTS_WIDTH = window.innerWidth - 200;
const LTS_HEIGHT = 400 as const;
// const ltsOffset =
const LEFT_SHIFT = LTS_WIDTH * 0.25;
const LTS_OFFSET = LTS_WIDTH * 0.4;

const formatCCS = (ccs: string) => ccs.replace(/[()\s]/g, "");

const getStateNameFromLTS = (ccs: string, LTS: LTS) => {
  const result = (Object.entries(LTS.states).find(
    (state) => formatCCS(ccs) === formatCCS((state[1] as any).ccs as string)
  ) || [])[0];
  return result || "";
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const StyledLTSViewer = styled(LTSViewer)`
  .state-border {
    stroke: black;
    /* fill: red; */
  }
`;

const StyledSvg = styled.svg`
  width: ${LTS_WIDTH}px;
  height: ${LTS_HEIGHT}px;
`;

const SpectroscopyResultComponent = ({
  result = [],
  processes: states,
}: {
  result: SpectroscopyResult[];
  processes: { name: string; ccs: string }[];
}) => {
  const ltsRefs = useRef<LTSInteractiveView[]>([]);
  const [tab, setTab] = useState(0);
  const [tooltipCoordinates, setTooltipCoordinates] = useState<{
    x?: number;
    y?: number;
  }>({});
  const [hoverStateKey, setHoverStateKey] = useState();

  const handleExpandAll = (lts: LTS) => {
    for (let i = 0; i < Object.keys(lts.states).length; i++) {
      if (ltsRefs.current[i]) {
        (ltsRefs.current[i] as LTSInteractiveView).expandAllSingleStep();
      }
    }
  };
  const ltsData: LTS[] = useMemo(
    () =>
      states.map(({ ccs, name }) =>
        renameStates(transformToLTS(ccs), R.head(name), parseInt(R.tail(name)))
      ),
    [states]
  );

  useEffect(() => {
    ltsData.forEach((lts) => handleExpandAll(lts));
  }, [tab, ltsData]);

  const processNames = useMemo(
    () => states.map((state) => state.name),
    [states]
  );

  const sortedResultView = useMemo(() => {
    const sorted = R.sort((a: SpectroscopyResult, b: SpectroscopyResult) => {
      const leftProp: (obj: any) => string | undefined = R.prop("left");
      if (processNames.includes(leftProp(a) as string)) {
        return -Infinity;
      }
      return (leftProp(a) || "").length - (leftProp(b) || "").length;
    }, result);

    return sorted.map((resultItem) => {
      const initialStateLeft = R.find(
        R.propEq("name", resultItem.left),
        states
      );
      const initialStateRight = R.find(
        R.propEq("name", resultItem.right),
        states
      );
      return {
        ...resultItem,
        left: initialStateLeft
          ? {
              stateKey: initialStateLeft.name,
              ccs: initialStateLeft.ccs,
            }
          : {
              stateKey: getStateNameFromLTS(resultItem.left, ltsData[0]),
              ccs: resultItem.left,
            },
        right: initialStateRight
          ? {
              stateKey: initialStateRight.name,
              ccs: initialStateRight.ccs,
            }
          : {
              stateKey: getStateNameFromLTS(resultItem.right, ltsData[1]),
              ccs: resultItem.right as any,
            },
      };
    });
  }, [result, processNames, ltsData, states]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    select("#test").remove();
    select("#lts-comparision")
      .append("circle")
      .attr("id", "test")
      .attr("cx", 100 * newValue)
      .attr("cy", 100)
      .attr("r", 10);
  };

  const renderTabLabel = (left: string, right: string, isActive: boolean) => (
    <Row>
      <Tag color={isActive ? tagColors[0] : grey}>{left}</Tag>
      <Tag color={isActive ? tagColors[1] : grey}>{right}</Tag>
    </Row>
  );

  const handleStateClick = (stateKey: string) => {};

  const getInitialStateKey = (leftOrRight: "left" | "right") => {
    return R.path([tab, leftOrRight, "stateKey"], sortedResultView) as string;
  };

  const renderTooltip = useCallback(() => {
    return (
      tooltipCoordinates.x &&
      tooltipCoordinates.y && (
        <g
          transform={`translate(${tooltipCoordinates.x}, ${tooltipCoordinates.y})`}
        >
          <rect
            width="200px"
            height="100px"
            fill="white"
            stroke="black"
            rx="15"
          />
          <text x="10px" y="30px">
            SVG 1
          </text>
        </g>
      )
    );
  }, [tooltipCoordinates]);

  const handleMouseOver = useCallback(
    (stateKey: string) => {
      ltsRefs.current.forEach((ref, i) => {
        const coords = ref.getStateCoordinates(stateKey);
        if (coords.x && coords.y) {
          setTooltipCoordinates({
            x: i * LTS_OFFSET + coords.x - LEFT_SHIFT,
            y: coords.y,
          });
          return;
        }
      });
    },
    [setTooltipCoordinates, ltsRefs]
  );

  const handleMouseOut = useCallback(
    (stateKey: string) => {
      setTooltipCoordinates({});
    },
    [setTooltipCoordinates]
  );

  const renderLTS = useCallback(
    (leftOrRight: "left" | "right") => {
      const initialStateKey = getInitialStateKey(leftOrRight);
      const lts = R.find(R.hasPath(["states", initialStateKey]))(ltsData);
      const index = leftOrRight === "left" ? 0 : 1;
      return (
        <g transform={`translate(${index * LTS_OFFSET - LEFT_SHIFT}, 0)`}>
          <LTSInteractiveView
            lts={
              {
                ...lts,
                initialState: initialStateKey,
              } as LTS
            }
            width={LTS_WIDTH}
            height={LTS_HEIGHT}
            showExpandNotice={false}
            stickyNodes={false}
            directedExploration={false}
            shortWeakSteps={false}
            scale={0.5}
            ref={(el: LTSInteractiveView) => (ltsRefs.current[index] = el)}
            // onStateClick={handleStateClick}
            onStateMouseOver={handleMouseOver}
            onStateMouseOut={handleMouseOut}
          />
        </g>
      );
    },
    [ltsData, getInitialStateKey]
  );

  const renderLTSData = useMemo(() => {
    return (
      <StyledSvg>
        {renderLTS("left")}
        {renderLTS("right")}
        {renderTooltip()}
      </StyledSvg>
    );
  }, [renderLTS, renderTooltip]);

  return (
    <div className="App">
      <Header />
      <Row>
        <IconButton>
          <ArrowBack />
        </IconButton>
        <span>Back to overview</span>
      </Row>
      <div className="content-container">
        <Row>
          <span>Comparing states:</span>
          {states.map((process, i) => (
            <Tag color={tagColors[i]}>{`${process.name} = ${process.ccs}`}</Tag>
          ))}
        </Row>
        <Row>{renderLTSData}</Row>
        <Box sx={{ width: "100%", paddingBottom: "100px" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tab} onChange={handleChange}>
              {sortedResultView.map(({ left, right }, i) => (
                <Tab
                  key={left.stateKey + right.stateKey}
                  label={renderTabLabel(
                    left.stateKey,
                    right.stateKey,
                    tab === i
                  )}
                  {...a11yProps(1)}
                />
              ))}
            </Tabs>
          </Box>
          {sortedResultView.map((resultItem, i) => (
            <TabPanel value={tab} index={i}>
              <ComparisionTable
                key={resultItem.left.stateKey + resultItem.right.stateKey}
                result={resultItem}
              />
            </TabPanel>
          ))}
        </Box>
      </div>
    </div>
  );
};

export default SpectroscopyResultComponent;
