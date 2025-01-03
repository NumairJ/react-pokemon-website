import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import PokedexTable from "./PokedexTable";
import PokeTeamBuilder from "./PokeTeamBuilder";
import Layout from "./Layout";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="Pokedex" element={<PokedexTable />} />
          <Route path="Team-Builder" element={<PokeTeamBuilder />} />
          <Route path="*" element={<div>Click On Navbar</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
