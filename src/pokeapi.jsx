const P = new Pokedex.Pokedex();

//Generates all pokemon information, default is all
export const fetchPokemonData = async (startId = 1, endId = 1025) => {
  const ids = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);

  const pokemonDetails = await Promise.all(
    ids.map((id) => P.getPokemonByName(id)) // Fetch Pokémon by ID
  );

  return pokemonDetails.map((pokemon) => ({
    id: pokemon.id,
    name: pokemon.name,
    sprite: pokemon.sprites.other.home.front_default,
    types: pokemon.types.map((typeInfo) => typeInfo.type.name),
    stats: {
      total: pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
      hp: pokemon.stats[0].base_stat,
      attack: pokemon.stats[1].base_stat,
      defense: pokemon.stats[2].base_stat,
      spAtk: pokemon.stats[3].base_stat,
      spDef: pokemon.stats[4].base_stat,
      speed: pokemon.stats[5].base_stat,
    },
  }));
};

//Generates all pokemon types, default is all
export const fetchPokemonTypes = async (startId = 1, endId = 18) => {
  const ids = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);

  const pokemonTypes = await Promise.all(
    ids.map((id) => P.getTypeByName(id)) // Fetch Type by ID
  );

  return pokemonTypes.map((type) => ({
    id: type.id,
    name: type.name,
    sprite: type.sprites?.['generation-viii']?.['sword-shield']?.name_icon,
    damageRelation: type.damage_relations
  }));
};