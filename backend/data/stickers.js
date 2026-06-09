const TEAMS = [
  // Grupo A
  { id: 'mex', code: 'MEX', name: 'México',            group: 'A', flag: '🇲🇽' },
  { id: 'rsa', code: 'RSA', name: 'Sudáfrica',         group: 'A', flag: '🇿🇦' },
  { id: 'kor', code: 'KOR', name: 'Corea del Sur',     group: 'A', flag: '🇰🇷' },
  { id: 'cze', code: 'CZE', name: 'Chequia',           group: 'A', flag: '🇨🇿' },
  // Grupo B
  { id: 'can', code: 'CAN', name: 'Canadá',            group: 'B', flag: '🇨🇦' },
  { id: 'bih', code: 'BIH', name: 'Bosnia-Herzegovina',group: 'B', flag: '🇧🇦' },
  { id: 'qat', code: 'QAT', name: 'Qatar',             group: 'B', flag: '🇶🇦' },
  { id: 'sui', code: 'SUI', name: 'Suiza',             group: 'B', flag: '🇨🇭' },
  // Grupo C
  { id: 'bra', code: 'BRA', name: 'Brasil',            group: 'C', flag: '🇧🇷' },
  { id: 'mar', code: 'MAR', name: 'Marruecos',         group: 'C', flag: '🇲🇦' },
  { id: 'hai', code: 'HAI', name: 'Haití',             group: 'C', flag: '🇭🇹' },
  { id: 'sco', code: 'SCO', name: 'Escocia',           group: 'C', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  // Grupo D
  { id: 'usa', code: 'USA', name: 'Estados Unidos',    group: 'D', flag: '🇺🇸' },
  { id: 'par', code: 'PAR', name: 'Paraguay',          group: 'D', flag: '🇵🇾' },
  { id: 'aus', code: 'AUS', name: 'Australia',         group: 'D', flag: '🇦🇺' },
  { id: 'tur', code: 'TUR', name: 'Türkiye',           group: 'D', flag: '🇹🇷' },
  // Grupo E
  { id: 'ger', code: 'GER', name: 'Alemania',          group: 'E', flag: '🇩🇪' },
  { id: 'cuw', code: 'CUW', name: 'Curaçao',           group: 'E', flag: '🇨🇼' },
  { id: 'civ', code: 'CIV', name: "Côte d'Ivoire",    group: 'E', flag: '🇨🇮' },
  { id: 'ecu', code: 'ECU', name: 'Ecuador',           group: 'E', flag: '🇪🇨' },
  // Grupo F
  { id: 'ned', code: 'NED', name: 'Países Bajos',      group: 'F', flag: '🇳🇱' },
  { id: 'jpn', code: 'JPN', name: 'Japón',             group: 'F', flag: '🇯🇵' },
  { id: 'swe', code: 'SWE', name: 'Suecia',            group: 'F', flag: '🇸🇪' },
  { id: 'tun', code: 'TUN', name: 'Túnez',             group: 'F', flag: '🇹🇳' },
  // Grupo G
  { id: 'bel', code: 'BEL', name: 'Bélgica',          group: 'G', flag: '🇧🇪' },
  { id: 'egy', code: 'EGY', name: 'Egipto',            group: 'G', flag: '🇪🇬' },
  { id: 'irn', code: 'IRN', name: 'Irán',              group: 'G', flag: '🇮🇷' },
  { id: 'nzl', code: 'NZL', name: 'Nueva Zelanda',     group: 'G', flag: '🇳🇿' },
  // Grupo H
  { id: 'esp', code: 'ESP', name: 'España',            group: 'H', flag: '🇪🇸' },
  { id: 'cpv', code: 'CPV', name: 'Cabo Verde',        group: 'H', flag: '🇨🇻' },
  { id: 'ksa', code: 'KSA', name: 'Arabia Saudita',    group: 'H', flag: '🇸🇦' },
  { id: 'uru', code: 'URU', name: 'Uruguay',           group: 'H', flag: '🇺🇾' },
  // Grupo I
  { id: 'fra', code: 'FRA', name: 'Francia',           group: 'I', flag: '🇫🇷' },
  { id: 'sen', code: 'SEN', name: 'Senegal',           group: 'I', flag: '🇸🇳' },
  { id: 'irq', code: 'IRQ', name: 'Irak',              group: 'I', flag: '🇮🇶' },
  { id: 'nor', code: 'NOR', name: 'Noruega',           group: 'I', flag: '🇳🇴' },
  // Grupo J
  { id: 'arg', code: 'ARG', name: 'Argentina',         group: 'J', flag: '🇦🇷' },
  { id: 'alg', code: 'ALG', name: 'Argelia',           group: 'J', flag: '🇩🇿' },
  { id: 'aut', code: 'AUT', name: 'Austria',           group: 'J', flag: '🇦🇹' },
  { id: 'jor', code: 'JOR', name: 'Jordania',          group: 'J', flag: '🇯🇴' },
  // Grupo K
  { id: 'por', code: 'POR', name: 'Portugal',          group: 'K', flag: '🇵🇹' },
  { id: 'cod', code: 'COD', name: 'Congo RD',          group: 'K', flag: '🇨🇩' },
  { id: 'uzb', code: 'UZB', name: 'Uzbekistán',        group: 'K', flag: '🇺🇿' },
  { id: 'col', code: 'COL', name: 'Colombia',          group: 'K', flag: '🇨🇴' },
  // Grupo L
  { id: 'eng', code: 'ENG', name: 'Inglaterra',        group: 'L', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'cro', code: 'CRO', name: 'Croacia',           group: 'L', flag: '🇭🇷' },
  { id: 'gha', code: 'GHA', name: 'Ghana',             group: 'L', flag: '🇬🇭' },
  { id: 'pan', code: 'PAN', name: 'Panamá',            group: 'L', flag: '🇵🇦' },
];

const FWC_SPECIALS = [
  { num: '00', name: 'We Are Panini' },
  { num: '1',  name: 'Emblema del torneo' },
  { num: '2',  name: 'Presentación del torneo' },
  { num: '3',  name: 'Mascota Oficial' },
  { num: '4',  name: 'Slogan Oficial' },
  { num: '5',  name: 'Bola Oficial (Tronida)' },
  { num: '6',  name: 'Emblema país sede (CAN)' },
  { num: '7',  name: 'Estadio sede (USA)' },
  { num: '8',  name: 'Estadio sede (USA)' },
  { num: '9',  name: 'Italy 1934' },
  { num: '10', name: 'Brazil 1950' },
  { num: '11', name: 'Switzerland 1954' },
  { num: '12', name: 'Chile 1962' },
  { num: '13', name: 'Germany 1974' },
  { num: '14', name: 'Mexico 1986' },
  { num: '15', name: 'USA 1994' },
  { num: '16', name: 'Korea/Japan 2002' },
  { num: '17', name: 'Germany 2006' },
  { num: '18', name: 'Brazil 2014' },
  { num: '19', name: 'Qatar 2022' },
];

function generateStickers() {
  const stickers = [];
  let id = 1;

  // Special FWC stickers
  for (const s of FWC_SPECIALS) {
    stickers.push({
      id: id++,
      code: `FWC-${s.num}`,
      number: `FWC ${s.num}`,
      team: 'ESPECIALES',
      teamName: 'Especiales FWC',
      group: 'FWC',
      type: 'special',
      name: s.name,
    });
  }

  // Team stickers: 20 per team
  // 1 = badge, 2 = squad photo, 3-20 = players
  for (const team of TEAMS) {
    for (let n = 1; n <= 20; n++) {
      const code = `${team.code}-${n}`;
      let type = 'player';
      let name = `${team.code} ${n}`;
      if (n === 1)  { type = 'badge'; name = `Escudo ${team.name}`; }
      if (n === 13) { type = 'squad'; name = `Foto Equipo ${team.name}`; }

      stickers.push({
        id: id++,
        code,
        number: `${team.code} ${n}`,
        team: team.id,
        teamName: team.name,
        group: team.group,
        flag: team.flag,
        type,
        name,
      });
    }
  }

  return stickers;
}

const STICKERS = generateStickers();

module.exports = { TEAMS, STICKERS };
