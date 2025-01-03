import React from "react";
import PokedexTable from "./PokedexTable";
import PokeTeamBuilder from "./PokeTeamBuilder";
import Layout from "./Layout";

import { HashRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PokedexTable />} />
          <Route path="Team-Builder" element={<PokeTeamBuilder />} />
          <Route path="*" element={<div>HELP</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
