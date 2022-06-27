import { ArrowBack } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import api from "api";
import * as R from "ramda";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import EquivalenceHierarchy from "EquivalenceHierarchy/EquivalenceHierarchy";
import Header from "Header/Header";
import Arrow from "utils/arrowSvg";
import { EquivalenceName, tagColors } from "utils/constants";
import { useQueryParams } from "utils/hooks";
import { LTS } from "../pseuco-shared-components/lts/lts";
import LTSInteractiveView, {
  LTSInteractiveViewProps,
} from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import ComparisonTable from "./ComparisonResultTable";
import ShareModal from "./ShareModal";

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

export const Tag = styled.div`
  background-color: ${(props) => props.color || "#56ccf2"};
  color: white;
  display: flex;
  flex-direction: row;
  border-radius: 3px;
  padding: 2px 5px;
  align-items: center;
`;

const TabContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  margin-top: 25px;
  gap: 30px;
  flex-wrap: wrap;
`;

const StyledDiv = styled((props) => <div {...props} />)`
  display: flex;
  flex-direction: column;
  text-align: left;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  background-color: white;
  padding: 20px;
  height: fit-content;
  width: ${(props) => props.width};
  gap: 5px;
`;

const StyledLTSInteractiveView = styled(
  forwardRef<LTSInteractiveView, LTSInteractiveViewProps>((props, ref) => (
    <LTSInteractiveView {...R.omit(["highlightColor"], props)} ref={ref} />
  ))
)`
  .state-border-selected {
    stroke: black;
    fill: ${(props) => props.highlightColor || "#56ccf2"};
  }
`;

const grey = "#BDBDBD";

const LTS_WIDTH = window.innerWidth - 200;
const LTS_HEIGHT = 400 as const;
const LEFT_SHIFT = LTS_WIDTH * 0.25;
const LTS_OFFSET = LTS_WIDTH * 0.4;

const EMPTY_RESULT = {
  left: {
    stateKey: "",
    ccs: "",
  },
  right: { stateKey: "", ccs: "" },
  distinctions: [],
  preorderings: [],
};

const getResultDistinctions = R.pipe<
  [SpectroscopyViewResult],
  Distinctions[],
  string[][],
  string[],
  string[]
>(
  R.prop("distinctions"),
  R.map((distinction) => distinction.inequivalences),
  R.flatten,
  R.uniq
);

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const StyledSvg = styled.svg`
  width: ${LTS_WIDTH}px;
  height: ${LTS_HEIGHT}px;
`;

const TooltipText = styled.span`
  font-size: 12px;
`;

const SpectroscopyResultComponent = () => {
  let navigate = useNavigate();
  const { id } = useParams();

  const query = useQueryParams();
  const left = query.get("left");
  const right = query.get("right");

  const ltsRefs = useRef<LTSInteractiveView[]>([]);
  const [tab, setTab] = useState(0);
  const [tooltipCoordinates, setTooltipCoordinates] = useState<{
    x?: number;
    y?: number;
  }>({});
  const [hoverStateKey, setHoverStateKey] = useState<string | null>(null);

  const { isLoading, error, data, isSuccess } = useQuery(
    "spectroscopyResult",
    async () => {
      return await api.get(
        `/spectroscopy/${id}/compare?left=${left}&right=${right}`
      );
    }
  );

  const sortedResultView = useMemo(
    () =>
      isSuccess
        ? (R.path(["data", "result"])(data as any) as SpectroscopyViewResult[])
        : [EMPTY_RESULT],
    [data, isSuccess]
  );

  const states = useMemo(
    () =>
      isSuccess && left && right
        ? [
            {
              name: left,
              ccs: R.path<any>(["data", "leftLTS", "states", left, "ccs"])(
                data
              ) as string,
            },
            {
              name: right,
              ccs: R.path<any>(["data", "rightLTS", "states", right, "ccs"])(
                data
              ) as string,
            },
          ]
        : [],
    [data, isSuccess, left, right]
  );

  const handleExpandAll = (lts: LTS) => {
    for (let i = 0; i < Object.keys(lts.states).length; i++) {
      if (ltsRefs.current[i]) {
        (ltsRefs.current[i] as LTSInteractiveView).expandAllSingleStep();
      }
    }
  };

  const ltsData: LTS[] = useMemo(
    () => (isSuccess ? [data.data.leftLTS, data.data.rightLTS] : []),
    [isSuccess, data]
  );

  useEffect(() => {
    ltsData.forEach((lts) => handleExpandAll(lts));
  }, [tab, ltsData]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const renderTabLabel = (left: string, right: string, isActive: boolean) => (
    <Row>
      <Tag color={isActive ? tagColors[0] : grey}>{left}</Tag>
      <Tag color={isActive ? tagColors[1] : grey}>{right}</Tag>
    </Row>
  );

  const handleStateClick = (stateKey: string) => {
    const selectedTab = R.findIndex(R.pathEq(["left", "stateKey"], stateKey))(
      sortedResultView
    );
    if (selectedTab >= 0) {
      setTab(selectedTab);
    }
  };

  const getInitialStateKey = (leftOrRight: "left" | "right") => {
    return R.path([tab, leftOrRight, "stateKey"], sortedResultView) as string;
  };

  const renderTooltipText = (result: SpectroscopyViewResult) => {
    if (result.preorderings.includes("bisimulation")) {
      return (
        <TooltipText>
          {`${result.left.stateKey} and ${result.right.stateKey} are bisimilar`}
        </TooltipText>
      );
    }
    const distinctions = getResultDistinctions(result);
    return (
      R.not(R.isEmpty(distinctions)) && (
        <TooltipText>
          {`${(result as SpectroscopyViewResult).left.stateKey} distinguished
          from ${
            (result as SpectroscopyViewResult).right.stateKey
          } under ${R.join(", ")(distinctions)} preorder.`}
        </TooltipText>
      )
    );
  };

  const renderTooltip = useCallback(() => {
    const result = R.find(R.pathEq(["left", "stateKey"], hoverStateKey))(
      sortedResultView
    );

    const tooltipText = result && renderTooltipText(result);
    return (
      tooltipCoordinates.x &&
      tooltipCoordinates.y &&
      tooltipText && (
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
          <foreignObject x="7px" y="7px" width="180px" height="90px">
            {tooltipText}
          </foreignObject>
        </g>
      )
    );
  }, [tooltipCoordinates, hoverStateKey, sortedResultView]);

  const getCoordinates = (stateKey: string) => {
    return R.find<any>(R.compose(R.not, R.isNil))(
      ltsRefs.current.map((ref, i) => {
        const coords = ref.getStateCoordinates(stateKey);
        return coords.x && coords.y
          ? {
              x: i * LTS_OFFSET + coords.x - LEFT_SHIFT,
              y: coords.y,
            }
          : undefined;
      })
    );
  };

  const handleMouseOver = useCallback((stateKey: string) => {
    ltsRefs.current.forEach((ref, i) => {
      const coords = ref.getStateCoordinates(stateKey);
      if (coords.x && coords.y) {
        setTooltipCoordinates(getCoordinates(stateKey));
        return;
      }
    });
    setHoverStateKey(stateKey);
  }, []);

  const handleMouseOut = useCallback(
    (stateKey: string) => {
      setTooltipCoordinates({});
      setHoverStateKey(null);
    },
    [setTooltipCoordinates]
  );

  const renderLTS = useCallback(
    (leftOrRight: "left" | "right") => {
      const initialStateKey = getInitialStateKey(leftOrRight);
      const lts = R.find(R.hasPath(["states", initialStateKey]))(ltsData);
      const index = leftOrRight === "left" ? 0 : 1;
      return (
        lts && (
          <g transform={`translate(${index * LTS_OFFSET - LEFT_SHIFT}, 0)`}>
            <StyledLTSInteractiveView
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
              onStateClick={handleStateClick}
              onStateMouseOver={handleMouseOver}
              onStateMouseOut={handleMouseOut}
              highlightColor="#56ccf2"
            />
          </g>
        )
      );
    },
    [ltsData, getInitialStateKey]
  );

  const renderPreorderArrow = (result: SpectroscopyViewResult) => {
    const fromCoord = tooltipCoordinates;
    const toCoord = getCoordinates(result.right.stateKey);
    return (
      !R.isEmpty(fromCoord) &&
      toCoord && (
        <Arrow
          from={fromCoord as { x: number; y: number }}
          to={toCoord}
          label={result.preorderings.join(",")}
        />
      )
    );
  };

  const renderLTSData = () => {
    const result = R.find(R.pathEq(["left", "stateKey"], hoverStateKey))(
      sortedResultView
    );

    return (
      <StyledSvg>
        {renderLTS("left")}
        {renderLTS("right")}
        {result && renderPreorderArrow(result)}
        {renderTooltip()}
      </StyledSvg>
    );
  };

  return (
    <div className="App">
      <Header />
      <Row>
        <IconButton onClick={() => navigate(`../${id}`)}>
          <ArrowBack />
        </IconButton>
        <span>Back to overview</span>
      </Row>
      <div className="content-container">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <Row>
              <span>Comparing states:</span>
              {states.map((process, i) => (
                <Tag
                  color={tagColors[i]}
                  key={process.name}
                >{`${process.name} = ${process.ccs}`}</Tag>
              ))}
              <ShareModal
                spectroscopyId={id as string}
                left={left as string}
                right={right as string}
              />
            </Row>
            <Row>{renderLTSData()}</Row>
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
                <TabPanel
                  value={tab}
                  index={i}
                  key={resultItem.left.stateKey + resultItem.right.stateKey}
                >
                  <Row>
                    <Typography>Comparing</Typography>
                    <Tag
                      color={tagColors[0]}
                    >{`${resultItem.left.stateKey} = ${resultItem.left.ccs}`}</Tag>
                    <Typography>to</Typography>
                    <Tag
                      color={tagColors[1]}
                    >{`${resultItem.right.stateKey} = ${resultItem.right.ccs}`}</Tag>
                  </Row>
                  <TabContainer>
                    <StyledDiv width="100%">
                      <Typography variant="subtitle1">
                        Overview of distinguishing formulas
                      </Typography>
                      <Divider />
                      <ComparisonTable result={resultItem} />
                    </StyledDiv>
                    <StyledDiv width="min-content">
                      <Typography variant="subtitle1">
                        Hierarchy of equivalences/preorders
                      </Typography>
                      <Divider />
                      <Typography variant="body2">
                        The processes are equivalent under the preorderings,
                        which are highlighted in blue.
                      </Typography>
                      <EquivalenceHierarchy
                        equivalences={
                          resultItem.preorderings as EquivalenceName[]
                        }
                        distinctions={
                          resultItem.distinctions as {
                            formula: string;
                            inequivalences: EquivalenceName[];
                          }[]
                        }
                      />
                    </StyledDiv>
                  </TabContainer>
                </TabPanel>
              ))}
            </Box>
          </>
        )}
      </div>
    </div>
  );
};

export default SpectroscopyResultComponent;
