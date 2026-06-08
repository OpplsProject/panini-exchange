const TEAMS = [
  { id: 'mexico',       name: 'México',           group: 'A', flag: '🇲🇽' },
  { id: 'canada',       name: 'Canadá',           group: 'A', flag: '🇨🇦' },
  { id: 'jamaica',      name: 'Jamaica',           group: 'A', flag: '🇯🇲' },
  { id: 'honduras',     name: 'Honduras',          group: 'A', flag: '🇭🇳' },
  { id: 'usa',          name: 'Estados Unidos',    group: 'B', flag: '🇺🇸' },
  { id: 'ecuador',      name: 'Ecuador',           group: 'B', flag: '🇪🇨' },
  { id: 'bolivia',      name: 'Bolivia',           group: 'B', flag: '🇧🇴' },
  { id: 'venezuela',    name: 'Venezuela',         group: 'B', flag: '🇻🇪' },
  { id: 'argentina',    name: 'Argentina',         group: 'C', flag: '🇦🇷' },
  { id: 'chile',        name: 'Chile',             group: 'C', flag: '🇨🇱' },
  { id: 'paraguay',     name: 'Paraguay',          group: 'C', flag: '🇵🇾' },
  { id: 'trinidad',     name: 'Trinidad y Tobago', group: 'C', flag: '🇹🇹' },
  { id: 'brazil',       name: 'Brasil',            group: 'D', flag: '🇧🇷' },
  { id: 'colombia',     name: 'Colombia',          group: 'D', flag: '🇨🇴' },
  { id: 'uruguay',      name: 'Uruguay',           group: 'D', flag: '🇺🇾' },
  { id: 'peru',         name: 'Perú',              group: 'D', flag: '🇵🇪' },
  { id: 'france',       name: 'Francia',           group: 'E', flag: '🇫🇷' },
  { id: 'belgium',      name: 'Bélgica',           group: 'E', flag: '🇧🇪' },
  { id: 'netherlands',  name: 'Países Bajos',      group: 'E', flag: '🇳🇱' },
  { id: 'denmark',      name: 'Dinamarca',         group: 'E', flag: '🇩🇰' },
  { id: 'germany',      name: 'Alemania',          group: 'F', flag: '🇩🇪' },
  { id: 'austria',      name: 'Austria',           group: 'F', flag: '🇦🇹' },
  { id: 'switzerland',  name: 'Suiza',             group: 'F', flag: '🇨🇭' },
  { id: 'slovakia',     name: 'Eslovaquia',        group: 'F', flag: '🇸🇰' },
  { id: 'spain',        name: 'España',            group: 'G', flag: '🇪🇸' },
  { id: 'portugal',     name: 'Portugal',          group: 'G', flag: '🇵🇹' },
  { id: 'turkey',       name: 'Turquía',           group: 'G', flag: '🇹🇷' },
  { id: 'georgia',      name: 'Georgia',           group: 'G', flag: '🇬🇪' },
  { id: 'england',      name: 'Inglaterra',        group: 'H', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'croatia',      name: 'Croacia',           group: 'H', flag: '🇭🇷' },
  { id: 'serbia',       name: 'Serbia',            group: 'H', flag: '🇷🇸' },
  { id: 'albania',      name: 'Albania',           group: 'H', flag: '🇦🇱' },
  { id: 'italy',        name: 'Italia',            group: 'I', flag: '🇮🇹' },
  { id: 'poland',       name: 'Polonia',           group: 'I', flag: '🇵🇱' },
  { id: 'ukraine',      name: 'Ucrania',           group: 'I', flag: '🇺🇦' },
  { id: 'hungary',      name: 'Hungría',           group: 'I', flag: '🇭🇺' },
  { id: 'japan',        name: 'Japón',             group: 'J', flag: '🇯🇵' },
  { id: 'south_korea',  name: 'Corea del Sur',     group: 'J', flag: '🇰🇷' },
  { id: 'saudi_arabia', name: 'Arabia Saudita',    group: 'J', flag: '🇸🇦' },
  { id: 'iran',         name: 'Irán',              group: 'J', flag: '🇮🇷' },
  { id: 'australia',    name: 'Australia',         group: 'K', flag: '🇦🇺' },
  { id: 'china',        name: 'China',             group: 'K', flag: '🇨🇳' },
  { id: 'indonesia',    name: 'Indonesia',         group: 'K', flag: '🇮🇩' },
  { id: 'new_zealand',  name: 'Nueva Zelanda',     group: 'K', flag: '🇳🇿' },
  { id: 'morocco',      name: 'Marruecos',         group: 'L', flag: '🇲🇦' },
  { id: 'senegal',      name: 'Senegal',           group: 'L', flag: '🇸🇳' },
  { id: 'egypt',        name: 'Egipto',            group: 'L', flag: '🇪🇬' },
  { id: 'nigeria',      name: 'Nigeria',           group: 'L', flag: '🇳🇬' },
];

function generateStickers() {
  const stickers = [];
  let num = 1;

  const specials = [
    'Bienvenida al Mundial',
    'Trofeo FIFA',
    'Estadio MetLife (Nueva York)',
    'Estadio AT&T (Dallas)',
    'Estadio Azteca (Ciudad de México)',
    'Estadio BC Place (Vancouver)',
    'Estadio Gillette (Boston)',
    'Estadio Hard Rock (Miami)',
    'Mascota Oficial',
    'El Camino al Mundial',
  ];

  for (const name of specials) {
    stickers.push({
      id: num,
      number: String(num).padStart(3, '0'),
      team: 'ESPECIALES',
      teamName: 'Especiales',
      group: 'ESP',
      type: 'special',
      name,
    });
    num++;
  }

  for (const team of TEAMS) {
    stickers.push({
      id: num,
      number: String(num).padStart(3, '0'),
      team: team.id,
      teamName: team.name,
      group: team.group,
      flag: team.flag,
      type: 'badge',
      name: `Escudo ${team.name}`,
    });
    num++;

    stickers.push({
      id: num,
      number: String(num).padStart(3, '0'),
      team: team.id,
      teamName: team.name,
      group: team.group,
      flag: team.flag,
      type: 'squad',
      name: `Foto Equipo ${team.name}`,
    });
    num++;

    for (let p = 1; p <= 16; p++) {
      stickers.push({
        id: num,
        number: String(num).padStart(3, '0'),
        team: team.id,
        teamName: team.name,
        group: team.group,
        flag: team.flag,
        type: 'player',
        name: `Jugador ${p}`,
      });
      num++;
    }
  }

  return stickers;
}

const STICKERS = generateStickers();

module.exports = { TEAMS, STICKERS };
