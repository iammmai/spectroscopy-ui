import { RuleTwoTone } from "@mui/icons-material";
import api from "api";
import Header from "Header/Header";
import { LTS } from "pseuco-shared-components/lts/lts";
import * as R from "ramda";
import { useMemo, useReducer, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { SpectroscopyViewResult } from "SpectroscopyResult/SpectroscopyResult";
import styled from "styled-components";
import { useQueryParams } from "utils/hooks";
import CCSTask from "./CCSTask";
import DistFormulaTask from "./DistFormulaTask";

const ContentContainer = styled.div`
  max-width: 80%;
  /* height: 70%; */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 20px;
  padding: 20px 0 50px 0;
`;

const PROGRESSION_STATE = {
  CCS: "ccs",
  DIST_FORMULA: "distinguishingForumla",
  HIERARCHY: "hierarchy",
  RESULT: "result",
};

const initialState = {
  showCCSResult: false,
  showDistinguishingResult: false,
  showHierarchyTaskResult: false,
  progression: "ccs",
};

function reducer(state: any, action: { type: string }) {
  switch (action.type) {
    case "submitCCS":
      return {
        ...state,
        showCCSResult: true,
        progression: PROGRESSION_STATE.DIST_FORMULA,
      };
    case "submitDistinguishing":
      return {
        ...state,
        showDistinguishingResult: true,
        progression: PROGRESSION_STATE.HIERARCHY,
      };

    default:
      throw new Error();
  }
}

const StudentView = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { id } = useParams();
  const query = useQueryParams();
  const left = query.get("left");
  const right = query.get("right");
  const showCcsTask = query.get("ccs");
  const showwDistinguishingTask = query.get("dist");
  const showHierarchyTask = query.get("hierarchy");

  const { isLoading, error, data, isSuccess } = useQuery(
    "spectroscopyResult",
    async () => {
      return await api.get(
        `/spectroscopy/${id}/compare?left=${left}&right=${right}`
      );
    }
  );

  const sortedResultView = useMemo<SpectroscopyViewResult[]>(
    () =>
      isSuccess
        ? (R.path(["data", "result"])(data as any) as SpectroscopyViewResult[])
        : [],
    [data, isSuccess]
  );

  const ltsData: LTS[] = useMemo(
    () => (isSuccess ? [data.data.leftLTS, data.data.rightLTS] : []),
    [isSuccess, data]
  );

  const handleContinueCCS = () => dispatch({ type: "submitCCS" });
  const handleSubmitDistinguishing = () =>
    dispatch({ type: "submitDistinguishing" });

  return (
    <div className="App">
      <Header />
      <ContentContainer>
        <CCSTask
          ltsData={ltsData}
          onContinue={handleContinueCCS}
          showResult={state.showCCSResult}
        />
        {state.progression !== PROGRESSION_STATE.CCS && (
          <DistFormulaTask
            ltsData={ltsData}
            onContinue={handleSubmitDistinguishing}
            showResult={state.showDistinguishingResult}
            resultData={
              R.find(
                R.allPass([
                  R.pathEq(["left", "stateKey"], left),
                  R.pathEq(["right", "stateKey"], right),
                ]),
                sortedResultView
              ) as SpectroscopyViewResult
            }
          />
        )}
      </ContentContainer>
    </div>
  );
};

export default StudentView;
