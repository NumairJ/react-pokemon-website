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
          <Route path="react-pokemon-website/Pokedex" element={<PokedexTable />} />
          <Route path="react-pokemon-website/Team-Builder" element={<PokeTeamBuilder />} />
          <Route path="*" element={<div>Click On Navbar</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
