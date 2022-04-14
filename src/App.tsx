import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";

import CCSOverview from "./CCSOverview/CCSOverview";
import SpectroscopyOverview from "./SpectroscopyOverview/SpectroscopyOverview";
import SpectroscopyList from "SpectroscopyList/SpectroscopyList";
import SpectroscopyResult from "SpectroscopyResult/SpectroscopyResult";

import resultData from "exampleData";

const queryClient = new QueryClient();

const exampleProcesses = [
  { name: "L16", ccs: "a.b.0 + a.(b.0 + c.0)" },
  { name: "R16", ccs: " a.(b.0 + c.0)" },
];

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CCSOverview />} />
          <Route path="/list" element={<SpectroscopyList />} />
          <Route path="/:id" element={<SpectroscopyOverview />} />
          <Route
            path="/result"
            element={
              <SpectroscopyResult
                result={resultData}
                processes={exampleProcesses}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
