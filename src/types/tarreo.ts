export type Career =
  | 'Analista Programador'
  | 'Ingeniería Informática'
  | 'Telecomunicaciones'
  | 'Diseño Digital y Web';

export type AllianceId = 'terror' | 'shooter' | 'action';

export interface AllianceMeta {
  id: AllianceId;
  name: string;
  color: string;
  softColor: string;
}

export interface Participant {
  id: string;
  name: string;
  career: Career;
  alliance?: AllianceId;
}

export type TournamentScoringMode = 'placement' | 'direct';
export type ScaleOverride = 'auto' | 'full' | 'reduced';
export type TournamentFormat = 'equipos' | 'duplas' | '1v1' | 'personalizado';

export interface TournamentEntry {
  participantId: string;
  teamName?: string;
  /** Placement 1..N (only used in 'placement' mode). null = participated without top placement */
  placement: number | null;
  /** True if player did not show up (W.O.): -1 pt and no +1 participation */
  isWO: boolean;
  /** Direct points (only used in 'direct' mode) */
  directPoints: number;
}

export type PrizeDecisionMethod = '' | 'mini-1v1' | 'acuerdo';

export interface TournamentPrizeResolution {
  method: PrizeDecisionMethod;
  winnerParticipantId?: string;
  note?: string;
}

export interface TournamentActivity {
  id: string;
  name: string;
  schedule: string;
  format: TournamentFormat;
  /** Team size for team/duo tournaments (e.g. 4 or 5 for Valorant, 2 for Rocket League) */
  teamSize?: number;
  /** Maximum number of teams/duos according to rules */
  maxTeams?: number;
  /** Maximum number of players according to rules */
  maxPlayers?: number;
  description: string;
  isOfficial: boolean;
  scoringMode: TournamentScoringMode;
  /** Valorant always uses full scale regardless of player count */
  alwaysFullScale: boolean;
  /** Brawl: 3rd and 4th split their points (e.g. (5+3)/2 = 4) */
  sharedThirdFourth: boolean;
  scaleOverride: ScaleOverride;
  /** Points by placement index [1st, 2nd, 3rd, 4th, ...] */
  fullScale: number[];
  reducedScale: number[];
  participationBonus: number;
  woPenalty: number;
  entries: TournamentEntry[];
  prizeResolution?: TournamentPrizeResolution;
}

export type AllianceScoringMode = 'placement' | 'direct';
export type AllianceCalculatorKind = 'none' | 'cazatesoros' | 'just-dance' | 'mimica-gamer';

export interface CazatesorosAllianceCounts {
  gizmo: number;
  pantallaCarga: number;
  jamTrack: number;
  mochila: number;
  corvette: number;
  pirateShop: number;
  solidGoldMiku: number;
}

export interface CazatesorosData {
  nobodyFoundAnything: boolean;
  counts: Record<AllianceId, CazatesorosAllianceCounts>;
}

export interface JustDanceData {
  /** 5 rounds: indices 0..3 normal (3/2/1), index 4 final (6/4/2). Stores placement 1|2|3|null */
  rounds: Array<Record<AllianceId, number | null>>;
}

export interface MimicaData {
  /** 5 turns storing guessed cards count per alliance */
  turns: Array<Record<AllianceId, number>>;
}

export interface AllianceActivity {
  id: string;
  name: string;
  schedule: string;
  description: string;
  isOfficial: boolean;
  scoringMode: AllianceScoringMode;
  /** Points for 1st, 2nd, 3rd in placement mode */
  placementPoints: [number, number, number];
  /** Assigned rank (1, 2, 3 or null if not yet played). Equal ranks split points automatically. */
  ranks: Record<AllianceId, number | null>;
  /** Direct points when scoringMode === 'direct' */
  directPoints: Record<AllianceId, number>;
  /** Disqualified for cheating (0 pts) */
  disqualified: Record<AllianceId, boolean>;
  calculatorKind: AllianceCalculatorKind;
  cazatesoros?: CazatesorosData;
  justDance?: JustDanceData;
  mimica?: MimicaData;
}

export interface Day19Activity {
  id: string;
  name: string;
  maxPoints: number | null;
  points: Record<AllianceId, number>;
  note?: string;
  editable?: boolean;
}

export interface AllianceAdjustment {
  id: string;
  allianceId: AllianceId;
  points: number;
  reason: string;
  createdAt: string;
}

export interface TarreoState {
  version: number;
  allianceGoal: number;
  participants: Participant[];
  tournaments: TournamentActivity[];
  allianceActivities: AllianceActivity[];
  day19Activities: Day19Activity[];
  allianceAdjustments: AllianceAdjustment[];
}
