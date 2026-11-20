import {
  AllianceActivity,
  AllianceId,
  AllianceMeta,
  Career,
  Day19Activity,
  TarreoState,
  TournamentActivity,
} from '../types/tarreo';

export const CAREERS: Career[] = [
  'Analista Programador',
  'Ingeniería Informática',
  'Telecomunicaciones',
  'Diseño Digital y Web',
];

export const ALLIANCES: AllianceMeta[] = [
  {
    id: 'terror',
    name: 'Terror',
    color: 'var(--alliance-terror)',
    softColor: 'var(--alliance-terror-soft)',
  },
  {
    id: 'shooter',
    name: 'Shooter',
    color: 'var(--alliance-shooter)',
    softColor: 'var(--alliance-shooter-soft)',
  },
  {
    id: 'action',
    name: 'Action',
    color: 'var(--alliance-action)',
    softColor: 'var(--alliance-action-soft)',
  },
];

export const ALLIANCE_IDS: AllianceId[] = ['terror', 'shooter', 'action'];
export const ALLIANCE_GOAL = 32000;

export function createInitialDay19Activities(): Day19Activity[] {
  return [
    {
      id: 'd19-torneo-retro',
      name: 'Torneo retro (4.000)',
      maxPoints: 4000,
      points: { terror: 2400, action: 4000, shooter: 1200 },
    },
    {
      id: 'd19-taca-taca',
      name: 'Taca-taca (1.500)',
      maxPoints: 1500,
      points: { terror: 1200, action: 1200, shooter: 450 },
      note: 'Empate en el 1.º lugar: Terror y Action',
    },
    {
      id: 'd19-ping-pong',
      name: 'Ping pong (1.500)',
      maxPoints: 1500,
      points: { terror: 1500, action: 900, shooter: 450 },
    },
    {
      id: 'd19-baby-futbol',
      name: 'Baby fútbol (4.000)',
      maxPoints: 4000,
      points: { terror: 4000, action: 2400, shooter: 1200 },
    },
    {
      id: 'd19-quemadas',
      name: 'Quemadas (4.000)',
      maxPoints: 4000,
      points: { terror: 4000, action: 2400, shooter: 1200 },
    },
    {
      id: 'd19-canta',
      name: 'Si te la sabes, canta (2.000)',
      maxPoints: 2000,
      points: { terror: 1200, action: 2000, shooter: 600 },
    },
    {
      id: 'd19-gymkanas',
      name: 'Gymkanas (provisional)',
      maxPoints: null,
      points: { terror: 1031, action: 1031, shooter: 0 },
      note: 'Pendiente de corregir: editable a mano',
      editable: true,
    },
  ];
}

export const STANDARD_FULL_SCALE = [10, 7, 5, 3];
export const STANDARD_REDUCED_SCALE = [5, 4, 3, 2];

export function createInitialTournaments(): TournamentActivity[] {
  return [
    {
      id: 'valorant',
      name: 'Valorant',
      schedule: '23:15 a 01:00',
      format: 'equipos',
      teamSize: 4,
      maxTeams: 4,
      maxPlayers: 16,
      description:
        'Equipos de 4 (o 5v5 con 3 equipos completos). Swiftplay Bo3. Siempre otorga puntaje completo.',
      isOfficial: true,
      scoringMode: 'placement',
      alwaysFullScale: true,
      sharedThirdFourth: false,
      scaleOverride: 'auto',
      fullScale: [...STANDARD_FULL_SCALE],
      reducedScale: [...STANDARD_REDUCED_SCALE],
      participationBonus: 1,
      woPenalty: 1,
      entries: [],
    },
    {
      id: 'rocket-league',
      name: 'Rocket League',
      schedule: '01:30 a 02:30',
      format: 'duplas',
      teamSize: 2,
      maxTeams: 6,
      maxPlayers: 12,
      description:
        'Duplas fijas 2v2 en Soccar (5 min, DFH Stadium). Máx. 12 jugadores (6 duplas).',
      isOfficial: true,
      scoringMode: 'placement',
      alwaysFullScale: false,
      sharedThirdFourth: false,
      scaleOverride: 'auto',
      fullScale: [...STANDARD_FULL_SCALE],
      reducedScale: [...STANDARD_REDUCED_SCALE],
      participationBonus: 1,
      woPenalty: 1,
      entries: [],
    },
    {
      id: 'fortnite',
      name: 'Fortnite',
      schedule: '03:00 a 04:00',
      format: '1v1',
      maxPlayers: 8,
      description:
        'Duelos 1v1 Zero Build (Isla 9672-8216-8367). Máx. 8 jugadores, eliminación directa.',
      isOfficial: true,
      scoringMode: 'placement',
      alwaysFullScale: false,
      sharedThirdFourth: false,
      scaleOverride: 'auto',
      fullScale: [...STANDARD_FULL_SCALE],
      reducedScale: [...STANDARD_REDUCED_SCALE],
      participationBonus: 1,
      woPenalty: 1,
      entries: [],
    },
    {
      id: 'brawl',
      name: 'Super Smash Bros. Brawl',
      schedule: '04:00 a 05:00',
      format: '1v1',
      maxPlayers: 8,
      description:
        'Duelos 1v1 en Wii (3 vidas, 6 min, sin objetos). Perdedores de semis comparten 3.º y 4.º lugar.',
      isOfficial: true,
      scoringMode: 'placement',
      alwaysFullScale: false,
      sharedThirdFourth: true,
      scaleOverride: 'auto',
      fullScale: [...STANDARD_FULL_SCALE],
      reducedScale: [...STANDARD_REDUCED_SCALE],
      participationBonus: 1,
      woPenalty: 1,
      entries: [],
    },
  ];
}

export function createInitialAllianceActivities(): AllianceActivity[] {
  return [
    {
      id: 'cazatesoros',
      name: 'Cazatesoros',
      schedule: '04:00 a 05:00',
      description:
        '1 hora en Fortnite Dúos (Semana 3). Gizmo=1, Pantalla=2, Jam=3, Mochila=4, Corvette=10. Pirate Shop Access o Solid Gold Miku = Victoria instantánea (1.º). Si nadie encuentra nada: 950 pts c/u.',
      isOfficial: true,
      scoringMode: 'placement',
      placementPoints: [1500, 900, 450],
      ranks: { terror: null, shooter: null, action: null },
      directPoints: { terror: 0, shooter: 0, action: 0 },
      disqualified: { terror: false, shooter: false, action: false },
      calculatorKind: 'cazatesoros',
      cazatesoros: {
        nobodyFoundAnything: false,
        counts: {
          terror: {
            gizmo: 0,
            pantallaCarga: 0,
            jamTrack: 0,
            mochila: 0,
            corvette: 0,
            pirateShop: 0,
            solidGoldMiku: 0,
          },
          shooter: {
            gizmo: 0,
            pantallaCarga: 0,
            jamTrack: 0,
            mochila: 0,
            corvette: 0,
            pirateShop: 0,
            solidGoldMiku: 0,
          },
          action: {
            gizmo: 0,
            pantallaCarga: 0,
            jamTrack: 0,
            mochila: 0,
            corvette: 0,
            pirateShop: 0,
            solidGoldMiku: 0,
          },
        },
      },
    },
    {
      id: 'just-dance',
      name: 'Just Dance',
      schedule: '02:30 a 03:00',
      description:
        '5 canciones en Wii (4 rondas normales: 3/2/1 pts + 1 final con jurado: 6/4/2 pts).',
      isOfficial: true,
      scoringMode: 'placement',
      placementPoints: [1500, 900, 450],
      ranks: { terror: null, shooter: null, action: null },
      directPoints: { terror: 0, shooter: 0, action: 0 },
      disqualified: { terror: false, shooter: false, action: false },
      calculatorKind: 'just-dance',
      justDance: {
        rounds: Array.from({ length: 5 }, () => ({
          terror: null,
          shooter: null,
          action: null,
        })),
      },
    },
    {
      id: 'mimica-gamer',
      name: 'Mímica gamer',
      schedule: '05:00 a 05:30',
      description:
        '5 turnos de 60 segundos (1 mimo + 3 adivinadores por alianza). Cada acierto suma 1 punto. Empate en 1.º: tarjeta extra.',
      isOfficial: true,
      scoringMode: 'placement',
      placementPoints: [1000, 600, 300],
      ranks: { terror: null, shooter: null, action: null },
      directPoints: { terror: 0, shooter: 0, action: 0 },
      disqualified: { terror: false, shooter: false, action: false },
      calculatorKind: 'mimica-gamer',
      mimica: {
        turns: Array.from({ length: 5 }, () => ({
          terror: 0,
          shooter: 0,
          action: 0,
        })),
      },
    },
  ];
}

export function createInitialState(): TarreoState {
  return {
    version: 2,
    allianceGoal: ALLIANCE_GOAL,
    participants: [],
    tournaments: createInitialTournaments(),
    allianceActivities: createInitialAllianceActivities(),
    day19Activities: createInitialDay19Activities(),
    allianceAdjustments: [],
  };
}
