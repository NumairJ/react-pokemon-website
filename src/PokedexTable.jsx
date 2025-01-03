import React, {useState, useEffect} from "react";
import {fetchPokemonData, fetchPokemonTypes} from "./pokeapi";

const PokedexTable = () => {
  const [pokemonList,
    setPokemonList] = useState([]);
  const [pokemonTypes,
    setPokemonTypes] = useState([]);
  const [searchTerm,
    setSearchTerm] = useState("");
  const [selectedType,
    setSelectedType] = useState("");
  const [sortKey,
    setSortKey] = useState("id");
  const [isAscending,
    setIsAscending] = useState(true);
  const [loading,
    setLoading] = useState(false);
  const [selectedPokemonId,
    setSelectedPokemonId] = useState(0);
  const [selectedPokemon,
    setSelectedPokemon] = useState(null);

  useEffect(() => {
    const fetchData = async() => {
      setLoading(true);
      try {
        const [pokemonData,
          pokemonTypesData] = await Promise.all([fetchPokemonData(), fetchPokemonTypes()]);
        setPokemonList(pokemonData);
        setPokemonTypes(pokemonTypesData);
        localStorage.setItem('masterpokemonlist', JSON.stringify(pokemonData));
        localStorage.setItem('masterpokemontypes', JSON.stringify(pokemonTypesData));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    const temp_pokemonList = localStorage.getItem('masterpokemonlist');
    const temp_pokemonTypeList = localStorage.getItem('masterpokemontypes');

    if (temp_pokemonList && temp_pokemonTypeList) {
      setPokemonList(JSON.parse(temp_pokemonList));
      setPokemonTypes(JSON.parse(temp_pokemonTypeList));
    } else {
      fetchData();
    }
  }, []);

  const handleSort = (key) => {
    setIsAscending(sortKey === key
      ? !isAscending
      : true);
    setSortKey(key);
  };

  const handleSelectedPokemon = (pokemonId) => {
    setSelectedPokemonId(pokemonId);
    if (pokemonId == 0) {
      return
    }
    const foundPokemon = binarySearch(pokemonList, pokemonId);
    if (foundPokemon) {
      setSelectedPokemon(foundPokemon);
    } else {
      alert("Pokemon not found HOW DID THIS HAPPEN??!?");
    }
  };

  const binarySearch = (array, id) => {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (array[mid].id === id) {
        return array[mid];
      } else if (array[mid].id < id) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return null; // default, shouldn't happen anyways
  };

  const filteredList = pokemonList.filter((pokemon) => searchTerm
    ? pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    : true).filter((pokemon) => selectedType
    ? pokemon.types.some((type) => type.toLowerCase() === selectedType)
    : true).sort((a, b) => {
    const valueA = a.stats[sortKey] || a[sortKey];
    const valueB = b.stats[sortKey] || b[sortKey];
    return isAscending
      ? valueA - valueB
      : valueB - valueA;
  });

  const getSortSymbol = (key) => {
    if (sortKey === key) {
      return isAscending
        ? ' ▲'
        : ' ▼';
    }
    return '⇵';
  };

  if (loading) 
    return <div>Loading... Please Wait</div>;
  
  return (
    <div className="container-fluid">
      <div className="row">
        <div
          className={selectedPokemonId == 0
          ? "col-lg-12 poke-table"
          : "col-lg-8 left-poke-table"}>
          {/* Filters */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"/>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-control">
              <option value="">All Types</option>
              {pokemonTypes.map((type) => (
                <option
                  key={type.id}
                  value={type.name}
                  style={{
                  backgroundImage: `url(${type.sprite})`
                }}>{type
                    .name
                    .toUpperCase()}
                </option>
              ))
}
            </select>
          </div>

          {/* Table */}
          <table className="table table-responsive-lg table-hover poke-table">
            <thead className='thead-dark'>
              <tr className='table-primary'>
                <th onClick={() => handleSort("id")}># {getSortSymbol("id")}</th>
                <th>Name</th>
                <th>Type</th>
                <th onClick={() => handleSort("total")}>Total {getSortSymbol("total")}</th>
                <th onClick={() => handleSort("hp")}>HP {getSortSymbol("hp")}</th>
                <th onClick={() => handleSort("attack")}>Attack {getSortSymbol("attack")}</th>
                <th onClick={() => handleSort("defense")}>Defense {getSortSymbol("defense")}</th>
                <th onClick={() => handleSort("spAtk")}>Sp. Atk {getSortSymbol("spAtk")}</th>
                <th onClick={() => handleSort("spDef")}>Sp. Def {getSortSymbol("spDef")}</th>
                <th onClick={() => handleSort("speed")}>Speed {getSortSymbol("speed")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((pokemon) => (
                <tr
                  key={pokemon.id}
                  onClick={() => handleSelectedPokemon(pokemon.id)}
                  className="poke-rows">
                  <td>{pokemon
                      .id
                      .toString()
                      .padStart(4, "0")}</td>
                  <td className="poke-name">{pokemon.name}
                    <img className="pokemon-image-row" src={pokemon.sprite} alt="Pokemon"/>
                  </td>
                  <td style={{
                    width: '20%'
                  }}>
                    {pokemon
                      .types
                      .map((type) => {
                        const matchingType = pokemonTypes.find((t) => t.name.toLowerCase() === type.toLowerCase());

                        return (
                          <span key={type} className="poke-type">
                            {matchingType
                              ? (<img
                                src={matchingType.sprite}
                                alt={type}
                                style={{
                                width: '50%',
                                height: '50%'
                              }}/>)
                              : (
                                <span>{type.toUpperCase()}</span>
                              )}
                          </span>
                        );
                      })}
                  </td>
                  <td>{pokemon.stats.total}</td>
                  <td>{pokemon.stats.hp}</td>
                  <td>{pokemon.stats.attack}</td>
                  <td>{pokemon.stats.defense}</td>
                  <td>{pokemon.stats.spAtk}</td>
                  <td>{pokemon.stats.spDef}</td>
                  <td>{pokemon.stats.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className={`col-lg-4 col-sm-12 d-flex justify-content-center right-side-zoom ${selectedPokemonId !== 0
          ? "active"
          : ""}`}>
          <div className="position-fixed">
            {selectedPokemonId === 0
              ? (
                <div>This is a work of Nintendo and Gamefreak</div>
              )
              : (
                <div className="pokemon-zoom">
                  <span className="d-flex flex-column">
                    {/* Row for Previous and Next buttons */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      {selectedPokemonId > 1 && (
                        <button
                          type="button"
                          onClick={() => handleSelectedPokemon(selectedPokemonId - 1)}
                          className="btn btn-primary">
                          Previous
                        </button>
                      )}
                      <div></div>
                      {selectedPokemonId < 1025 && (
                        <button
                          type="button"
                          onClick={() => handleSelectedPokemon(selectedPokemonId + 1)}
                          className="btn btn-primary">
                          Next
                        </button>
                      )}
                    </div>
                    {/* Close button */}
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleSelectedPokemon(0)}>
                      Close
                    </button>
                  </span>

                  <div>
                    <img src={selectedPokemon.sprite} alt="Pokemon"/>
                  </div>
                  <h1 className='poke-name'>{selectedPokemon.name}</h1>
                  {selectedPokemon
                    .types
                    .map((type) => {
                      const matchingType = pokemonTypes.find((t) => t.name.toLowerCase() === type.toLowerCase());

                      return (
                        <span key={type} className="poke-type">
                          {matchingType
                            ? (<img
                              src={matchingType.sprite}
                              alt={type}
                              style={{
                              width: '20%',
                              height: '20%'
                            }}/>)
                            : (
                              <span>{type.toUpperCase()}</span>
                            )}
                        </span>
                      );
                    })}
                  <div className="pokemon-stats">
                    <div className="pokemon-stats-bars">
                      {Object
                        .entries(selectedPokemon.stats)
                        .filter(([statName]) => statName !== "total")
                        .map(([
                          statName, statValue
                        ], index) => {
                          // Determine color based on the stat value
                          const getColorClass = (value) => {
                            if (value <= 30) 
                              return "bg-danger";
                            if (value <= 60) 
                              return "bg-warning-two";
                            if (value <= 89) 
                              return "bg-warning";
                            if (value < 150) 
                              return "bg-success";
                            return "bg-info";
                          };

                          const colorClass = getColorClass(statValue);

                          return (
                            <div key={`${statName}-${statValue}-${index}`}>
                              <div>{statName.toUpperCase()}: {statValue}</div>
                              <div className="progress mb-2">
                                <div
                                  className={`progress-bar ${colorClass}`}
                                  role="progressbar"
                                  style={{
                                  width: `${ (statValue / 255) * 100}%`
                                }}
                                  aria-valuenow={statValue}
                                  aria-valuemin="0"
                                  aria-valuemax="255"></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div className="total-stat">Total: {selectedPokemon.stats.total}</div>
                  </div>

                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokedexTable;