import React, {useState, useEffect} from "react";
import {fetchPokemonData, fetchPokemonTypes} from "./pokeapi";

const PokeTeamBuilder = () => {
  const [pokemonList,
    setPokemonList] = useState([]);
  const [pokemonTypes,
    setPokemonTypes] = useState([]);
  const [loading,
    setLoading] = useState(false);
    const [selectedPokemonTeam,
      setSelectedPokemonTeam] = useState(() => {
        const temp = localStorage.getItem("pokemonteambuilderteam")
        if (temp == null) return []
        return JSON.parse(temp)
      });
  const [searchTerm,
    setSearchTerm] = useState("");
  const [filteredPokemon,
    setFilteredPokemon] = useState([]);
  const [selectedPokemon,
    setSelectedPokemon] = useState(null);
  const [teamWeaknesses,
    setTeamWeaknesses] = useState({});
  const [teamResistances,
    setTeamResistances] = useState({});
  const [teamImmunities,
    setTeamImmunities] = useState({});

  useEffect(() => {
    const fetchData = async() => {
      setLoading(true);
      try {
        const [pokemonData,
          pokemonTypesData] = await Promise.all([fetchPokemonData(), fetchPokemonTypes()]);
        setPokemonList(pokemonData);
        setPokemonTypes(pokemonTypesData);
        localStorage.setItem("masterpokemonlist", JSON.stringify(pokemonData));
        localStorage.setItem("masterpokemontypes", JSON.stringify(pokemonTypesData));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    const temp_pokemonList = localStorage.getItem("masterpokemonlist");
    const temp_pokemonTypeList = localStorage.getItem("masterpokemontypes");

    if (temp_pokemonList && temp_pokemonTypeList) {
      setPokemonList(JSON.parse(temp_pokemonList));
      setPokemonTypes(JSON.parse(temp_pokemonTypeList));
    } else {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (selectedPokemonTeam.length > 0) {
      const {weaknesses, resistances, immunities} = calculateTeamEffectiveness(selectedPokemonTeam, pokemonTypes);
      setTeamWeaknesses(weaknesses);
      setTeamResistances(resistances);
      setTeamImmunities(immunities);
    } else {
      setTeamWeaknesses({});
      setTeamResistances({});
      setTeamImmunities({});
    }
    if (selectedPokemonTeam.length > 0 || localStorage.getItem("pokemonteambuilderteam") !== JSON.stringify(selectedPokemonTeam)) {
      localStorage.setItem("pokemonteambuilderteam", JSON.stringify(selectedPokemonTeam));
    }
  }, [selectedPokemonTeam, pokemonTypes]);

  const calculatePokemonEffectiveness = (Pokemon, pokemonTypes) => {
    const weaknesses = {};
    const resistances = {};
    const immunities = {};

    Pokemon
      .types
      .forEach((type) => {
        const typeData = pokemonTypes.find((t) => t.name === type);
        if (typeData) {
          // Add weaknesses
          typeData
            .damageRelation
            .double_damage_from
            .forEach((type) => {
              weaknesses[type.name] = (weaknesses[type.name] || 0) + 1;
            });

          // Add resistances
          typeData
            .damageRelation
            .half_damage_from
            .forEach((type) => {
              resistances[type.name] = (resistances[type.name] || 0) + 1;
            });

          // Add immunities
          typeData
            .damageRelation
            .no_damage_from
            .forEach((type) => {
              immunities[type.name] = (immunities[type.name] || 0) + 1;
            });
        }
      });

    // Remove overlaps
    Object
      .keys(immunities)
      .forEach((immuneType) => {
        delete weaknesses[immuneType];
        delete resistances[immuneType];
      });

    Object
      .keys(resistances)
      .forEach((resistType) => {
        if (weaknesses[resistType]) {
          const temp = weaknesses[resistType]
          weaknesses[resistType] -= resistances[resistType];
          resistances[resistType] -= temp;
          if (weaknesses[resistType] <= 0) {
            delete weaknesses[resistType];
          }
          if (resistances[resistType] <= 0) {
            delete resistances[resistType];
          }
        }
      });

    return {weaknesses, resistances, immunities};
  };

  const calculateTeamEffectiveness = (team, pokemonTypes) => {
    const aggregatedWeaknesses = {};
    const aggregatedResistances = {};
    const aggregatedImmunities = {};

    team.forEach((pokemon) => {
      const {weaknesses, resistances, immunities} = calculatePokemonEffectiveness(pokemon, pokemonTypes);
      // Count weaknesses
      Object
        .keys(weaknesses)
        .forEach((type) => {
          aggregatedWeaknesses[type] = (aggregatedWeaknesses[type] || 0) + 1;
        });

      // Count resistances
      Object
        .keys(resistances)
        .forEach((type) => {
          aggregatedResistances[type] = (aggregatedResistances[type] || 0) + 1;
        });

      // Count immunities
      Object
        .keys(immunities)
        .forEach((type) => {
          aggregatedImmunities[type] = (aggregatedImmunities[type] || 0) + 1;
        });
    });

    return {weaknesses: aggregatedWeaknesses, resistances: aggregatedResistances, immunities: aggregatedImmunities};
  };

  const handleSearchChange = (e) => {
    const query = e
      .target
      .value
      .toLowerCase();
    setSearchTerm(query);

    const results = pokemonList.filter((pokemon) => pokemon.name.toLowerCase().startsWith(query));

    setFilteredPokemon(results);
    setSelectedPokemon(null);
  };

  const handlePokemonSelect = (pokemon) => {
    setSearchTerm(pokemon.name);
    setSelectedPokemon(pokemon);
    setFilteredPokemon([]);
  };

  const handleAddToTeam = () => {
    if (selectedPokemon) {
      if (selectedPokemonTeam.length < 6) {
        setSelectedPokemonTeam([
          ...selectedPokemonTeam, {
            ...selectedPokemon,
            keyId: crypto.randomUUID()
          }
        ]);
      } else {
        alert(`Team is full. Remove a Pokémon to add.`);
      }
      setSearchTerm("");
      setSelectedPokemon(null);
    } else {
      alert("Please select a Pokémon first!");
    }
  };

  const handleRemovePokemon = (pokemonKeyId) => {
    if (selectedPokemonTeam.length > 0) {
      setSelectedPokemonTeam(selectedPokemonTeam => {
        return selectedPokemonTeam.filter(pokemon => pokemon.keyId !== pokemonKeyId)
      })
    }
  }

  if (loading) 
    return <div>Loading... Please Wait</div>;
  
  return (
    <div className="container-fluid text-center mt-4">
      <h2>Pokémon Team Builder</h2>
      <div className="row justify-content-center mt-3">
        {/* Search Bar */}
        <div className="col-md-6 position-relative">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-control"/>
            <button type="button" className="btn btn-primary" onClick={handleAddToTeam}>
              Add to Team
            </button>
          </div>
          {/* Dropdown Menu */}
          {searchTerm && filteredPokemon.length > 0 && (
            <ul
              className="dropdown-menu show w-100"
              style={{
              maxHeight: "200px",
              overflowY: "auto"
            }}>
              {filteredPokemon.map((pokemon) => (
                <li
                  key={pokemon.id}
                  className="dropdown-item"
                  onClick={() => handlePokemonSelect(pokemon)}>
                  <img className='pokemon-image-row' src={pokemon.sprite} alt={pokemon.name}/>
                  <span className='poke-name'>{pokemon.name}</span>
                  <br></br>
                  {pokemon
                    .types
                    .map((type) => {
                      const matchingType = pokemonTypes.find((t) => t.name.toLowerCase() === type.toLowerCase());
                      return (
                        <span key={type}>
                          {< img className = "poke-type" src = {
                            matchingType.sprite
                          }
                          alt = {
                            type
                          } />}
                        </span>
                      );
                    })}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Selected Team Display */}
      <div className="row mt-5">
        <h4>Selected Pokémon Team</h4>
        <div className="row">
          {selectedPokemonTeam.map((pokemon) => {
            if (pokemonTypes.length === 0) {
              return null; // Skip rendering if data is invalid, due to parsing json of localstorage?
            }
            const {weaknesses, resistances, immunities} = calculatePokemonEffectiveness(pokemon, pokemonTypes);
          return (
            <div key={pokemon.keyId} className="col-4 d-flex justify-content-center mb-3">
              <div className="card text-center">
                <img
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="card-img-top img-fluid"/>
                <div className="card-body p-2">
                  <span className="d-flex justify-content-center mb-2">
                    {pokemon
                      .types
                      .map((type) => {
                        const matchingType = pokemonTypes.find((t) => t.name.toLowerCase() === type.toLowerCase());

                        return (<img
                          key={type}
                          className="poke-type me-1"
                          src={matchingType.sprite}
                          alt={type}/>);
                      })}
                  </span>
                  <span className="d-flex justify-content-center mb-2">
                    <div className="card-title mb-0 poke-name">{pokemon.name}</div>
                  </span>
                  <div className="accordion">
                    <div className="accordion-item">
                      <h2 className="accordion-header" id={`heading-${pokemon.keyId}-1`}>
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse-${pokemon.keyId}-1`}
                          aria-expanded="false"
                          aria-controls={`collapse-${pokemon.keyId}-1`}>
                          {Object.keys(weaknesses).length} Weakness
                        </button>
                      </h2>
                      <div
                        id={`collapse-${pokemon.keyId}-1`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading-${pokemon.keyId}-1`}>
                        <div className="accordion-body">
                        {Object.entries(weaknesses).map(([type, value]) => (
                          <p key={pokemon.pokemonKeyId + type}>{`Takes ${(2**value)}x from ${type.charAt(0).toUpperCase()
                            + type.slice(1)}`}</p>
                        ))}
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header" id={`heading-${pokemon.keyId}-2`}>
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse-${pokemon.keyId}-2`}
                          aria-expanded="false"
                          aria-controls={`collapse-${pokemon.keyId}-2`}>
                          {Object.keys(resistances).length + Object.keys(immunities).length} Resistance and Immunities
                        </button>
                      </h2>
                      <div
                        id={`collapse-${pokemon.keyId}-2`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading-${pokemon.keyId}-2`}>
                        <div className="accordion-body">
                        {Object.entries(resistances).map(([type, value]) => (
                          <p key={pokemon.pokemonKeyId + type}>{`Takes ${(1/2**value)}x from ${type.charAt(0).toUpperCase()
                            + type.slice(1)}`}</p>
                        ))}
                        {Object.entries(immunities).map(([type, value]) => (
                          <p key={pokemon.pokemonKeyId + type}>{`Takes no damage from ${type.charAt(0).toUpperCase()
                            + type.slice(1)}`}</p>
                        ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="d-flex justify-content-center mb-2">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemovePokemon(pokemon.keyId)}>
                      Remove Pokemon
                    </button>
                  </span>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
      {/*Pokemon Type Info Table*/}
      {selectedPokemonTeam.length > 0 && <div className='row'> <h4>Pokemon Team Resistances</h4><table className="table table-bordered mt-4 text-center col12"><thead>
        <tr>
          <th>Type</th>
          {pokemonTypes.map((type) => (
            <th key={type.name}>
              <img className='poke-type' src={type.sprite}></img>
            </th>
          ))}
        </tr>
      </thead><tbody>
  <tr>
    <td>Weaknesses</td>
    {pokemonTypes.map((type) => (
      <td
        key={`weak-${type.name}`}
        style={{
          backgroundColor: teamWeaknesses[type.name]
            ? `rgba(255, 0, 0, ${Math.min(teamWeaknesses[type.name] / 6, 1)})`
            : "transparent",
          fontWeight: 'bold',
        }}
      >
        {teamWeaknesses[type.name] || ""}
      </td>
    ))}
  </tr>
  <tr>
    <td>Resistances</td>
    {pokemonTypes.map((type) => (
      <td
        key={`resist-${type.name}`}
        style={{
          backgroundColor: teamResistances[type.name]
            ? `rgba(0, 255, 0, ${Math.min(teamResistances[type.name] / 6, 1)})`
            : "transparent",
          fontWeight: 'bold',
        }}
      >
        {teamResistances[type.name] || ""}
      </td>
    ))}
  </tr>
  <tr>
    <td>Immunities</td>
    {pokemonTypes.map((type) => (
      <td
        key={`immune-${type.name}`}
        style={{
          backgroundColor: teamImmunities[type.name]
            ? `rgba(0, 255, 0, ${Math.min(teamImmunities[type.name] / 6, 1)})`
            : "transparent",
          fontWeight: 'bold',
        }}
      >
        {teamImmunities[type.name] || ""}
      </td>
    ))}
  </tr>
</tbody>
</table></div>}
    </div>
  );
};

export default PokeTeamBuilder;