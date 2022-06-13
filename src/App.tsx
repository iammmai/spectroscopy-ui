import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";

import CCSOverview from "./CCSOverview/CCSOverview";
import SpectroscopyOverview from "./SpectroscopyOverview/SpectroscopyOverview";
import SpectroscopyList from "SpectroscopyList/SpectroscopyList";
import SpectroscopyResult from "SpectroscopyResult/SpectroscopyResult";
import StudentView from "StudentView/StudentView";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CCSOverview />} />
          <Route path="/list" element={<SpectroscopyList />} />
          <Route path="/:id" element={<SpectroscopyOverview />} />
          <Route path="/:id/result" element={<SpectroscopyResult />} />
          <Route path="/:id/student" element={<StudentView />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
