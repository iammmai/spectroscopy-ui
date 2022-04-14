import { IconButton } from "@mui/material";
import { useState } from "react";
import { ArrowBack } from "@mui/icons-material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import Header from "Header/Header";
import styled from "styled-components";

import { LTS } from "../pseuco-shared-components/lts/lts";
import ComparisionTable from "./ComparisonResultTable";

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

const SpectroscopyResultComponent = ({
  result = [],
  processes: states,
}: {
  result: SpectroscopyResult[];
  processes: { name: string; ccs: string }[];
}) => {
  //   const lts = useMemo(() => {});

  const [tab, setTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const renderTabLabel = (left: string, right: string) => (
    <Row>
      <Tag color={tagColors[0]}>{left}</Tag>
      <Tag color={tagColors[1]}>{right}</Tag>
    </Row>
  );

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
        {/* <LTSViewer lts={myLTS} /> */}
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tab} onChange={handleChange}>
              {result.map(({ left, right }) => (
                <Tab
                  key={left + right}
                  label={renderTabLabel(left, right)}
                  {...a11yProps(1)}
                />
              ))}
            </Tabs>
          </Box>
          {result.map((resultItem, i) => (
            <TabPanel value={tab} index={i}>
              <ComparisionTable
                key={resultItem.left + resultItem.right}
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
