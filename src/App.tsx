import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";

import CCSOverview from "./CCSOverview/CCSOverview";
import SpectroscopyOverview from "./SpectroscopyOverview/SpectroscopyOverview";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CCSOverview />} />
          <Route path="/:id" element={<SpectroscopyOverview />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
