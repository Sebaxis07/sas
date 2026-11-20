import { ALLIANCE_GOAL, ALLIANCE_IDS } from '../data/defaults';
import {
  AllianceActivity,
  AllianceAdjustment,
  AllianceId,
  Day19Activity,
  Participant,
  TournamentActivity,
  TournamentEntry,
} from '../types/tarreo';

export type EffectiveScale = 'full' | 'reduced';

/**
 * Determines whether a tournament uses full or reduced placement scale.
 * Rule: With 4 to 7 players, placement points are reduced (5, 4, 3, 2).
 * Valorant ALWAYS gives full scale. Manual override takes precedence.
 */
export function getEffectiveScale(tournament: TournamentActivity): EffectiveScale {
  if (tournament.scaleOverride === 'full') return 'full';
  if (tournament.scaleOverride === 'reduced') return 'reduced';
  if (tournament.alwaysFullScale) return 'full';

  const activePlayers = tournament.entries.filter((e) => !e.isWO).length;
  if (activePlayers >= 4 && activePlayers <= 7) {
    return 'reduced';
  }
  return 'full';
}

/**
 * Calculates the placement points for a given rank in a tournament,
 * respecting full/reduced scale and Brawl's shared 3rd/4th place rule.
 */
export function getPlacementPoints(
  tournament: TournamentActivity,
  placement: number | null,
): number {
  if (placement === null || placement < 1) return 0;
  const scaleType = getEffectiveScale(tournament);
  const scale = scaleType === 'reduced' ? tournament.reducedScale : tournament.fullScale;

  // Brawl rule: 3rd and 4th share points -> (3rd + 4th) / 2
  if (tournament.sharedThirdFourth && (placement === 3 || placement === 4)) {
    const p3 = scale[2] ?? 0;
    const p4 = scale[3] ?? 0;
    return (p3 + p4) / 2;
  }

  return scale[placement - 1] ?? 0;
}

/**
 * Calculates total points earned by a single tournament entry.
 * - Direct mode: returns directPoints (or -woPenalty if W.O.)
 * - Placement mode:
 *   - If W.O.: -woPenalty (no participation bonus)
 *   - Otherwise: placementPoints + participationBonus
 */
export function calculateTournamentEntryPoints(
  tournament: TournamentActivity,
  entry: TournamentEntry,
): number {
  if (entry.isWO) {
    return -tournament.woPenalty;
  }
  if (tournament.scoringMode === 'direct') {
    return entry.directPoints;
  }
  return getPlacementPoints(tournament, entry.placement) + tournament.participationBonus;
}

export interface PlayerRankingRow {
  participant: Participant;
  totalPoints: number;
  firstPlaces: number;
  secondPlaces: number;
  tournamentsPlayed: number;
  woCount: number;
  breakdown: Record<string, number>;
  /** Rank position (1-based). Exact ties share the same rank. */
  rank: number;
  /** True if tied on points, 1st places, AND 2nd places with another player */
  needsTiebreaker: boolean;
}

/**
 * Computes the General Ranking across all tournaments according to the rules:
 * 1. Highest total points
 * 2. Most 1st places
 * 3. Most 2nd places
 * 4. If still tied -> needsTiebreaker = true
 */
export function calculateGeneralRanking(
  participants: Participant[],
  tournaments: TournamentActivity[],
): PlayerRankingRow[] {
  const rows: PlayerRankingRow[] = participants.map((participant) => {
    let totalPoints = 0;
    let firstPlaces = 0;
    let secondPlaces = 0;
    let tournamentsPlayed = 0;
    let woCount = 0;
    const breakdown: Record<string, number> = {};

    for (const t of tournaments) {
      const entry = t.entries.find((e) => e.participantId === participant.id);
      if (!entry) continue;

      const pts = calculateTournamentEntryPoints(t, entry);
      breakdown[t.id] = pts;
      totalPoints += pts;

      if (entry.isWO) {
        woCount += 1;
      } else {
        tournamentsPlayed += 1;
        if (t.scoringMode === 'placement') {
          if (entry.placement === 1) firstPlaces += 1;
          if (entry.placement === 2) secondPlaces += 1;
        }
      }
    }

    return {
      participant,
      totalPoints,
      firstPlaces,
      secondPlaces,
      tournamentsPlayed,
      woCount,
      breakdown,
      rank: 1,
      needsTiebreaker: false,
    };
  });

  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.firstPlaces !== a.firstPlaces) return b.firstPlaces - a.firstPlaces;
    if (b.secondPlaces !== a.secondPlaces) return b.secondPlaces - a.secondPlaces;
    return a.participant.name.localeCompare(b.participant.name, 'es');
  });

  // Assign ranks and detect exact ties that require a tiebreaker match
  for (let i = 0; i < rows.length; i++) {
    if (i > 0) {
      const prev = rows[i - 1];
      const curr = rows[i];
      const exactTie =
        curr.totalPoints === prev.totalPoints &&
        curr.firstPlaces === prev.firstPlaces &&
        curr.secondPlaces === prev.secondPlaces &&
        curr.tournamentsPlayed > 0;

      if (exactTie) {
        curr.rank = prev.rank;
        curr.needsTiebreaker = true;
        prev.needsTiebreaker = true;
      } else {
        curr.rank = i + 1;
      }
    }
  }

  return rows;
}

/**
 * Helper: converts raw scores (higher = better) into 1-based ranks with ties.
 * Example: { terror: 10, shooter: 10, action: 4 } -> { terror: 1, shooter: 1, action: 3 }
 */
export function ranksFromScores(
  scores: Record<AllianceId, number>,
  disqualified: Record<AllianceId, boolean>,
): Record<AllianceId, number | null> {
  const eligible = ALLIANCE_IDS.filter((id) => !disqualified[id]);
  const sorted = [...eligible].sort((a, b) => scores[b] - scores[a]);

  const result: Record<AllianceId, number | null> = {
    terror: null,
    shooter: null,
    action: null,
  };

  for (let i = 0; i < sorted.length; i++) {
    const id = sorted[i];
    if (i > 0 && scores[id] === scores[sorted[i - 1]]) {
      result[id] = result[sorted[i - 1]];
    } else {
      result[id] = i + 1;
    }
  }

  return result;
}

/**
 * Calculator for Cazatesoros (Week 3 rarity scale):
 * - Regular points: Gizmo=1, Pantalla de carga=2, Jam Track=3, Mochila=4, Corvette ZR1=10
 * - Instant Win Jackpots: Pirate Shop Access (tier 1), Solid Gold Miku (tier 2, highest)
 */
export function calculateCazatesorosRawScores(
  activity: AllianceActivity,
): Record<AllianceId, number> {
  const counts = activity.cazatesoros?.counts;
  const calc = (id: AllianceId) => {
    const c = counts?.[id];
    if (!c) return 0;
    return (
      (c.gizmo || 0) * 1 +
      (c.pantallaCarga || 0) * 2 +
      (c.jamTrack || 0) * 3 +
      (c.mochila || 0) * 4 +
      (c.corvette || 0) * 10
    );
  };
  return {
    terror: calc('terror'),
    shooter: calc('shooter'),
    action: calc('action'),
  };
}

/**
 * Computes Cazatesoros ranks respecting Jackpot instant-win priority:
 * 1. Solid Gold Miku (1 in 1,562,500) -> highest instant win
 * 2. Pirate Shop Access (1 in 137,500) -> instant win over any regular score
 * 3. Regular treasure points (Gizmo..Corvette)
 */
export function calculateCazatesorosRanks(
  activity: AllianceActivity,
): Record<AllianceId, number | null> {
  const raw = calculateCazatesorosRawScores(activity);
  const counts = activity.cazatesoros?.counts;

  const compositeScore = (id: AllianceId): number => {
    const c = counts?.[id];
    const miku = c?.solidGoldMiku || 0;
    const shop = c?.pirateShop || 0;
    // Composite weight ensures Miku > Pirate Shop > any regular score
    const tierWeight = miku > 0 ? 2_000_000 + miku * 10_000 : shop > 0 ? 1_000_000 + shop * 10_000 : 0;
    return tierWeight + raw[id];
  };

  return ranksFromScores(
    {
      terror: compositeScore('terror'),
      shooter: compositeScore('shooter'),
      action: compositeScore('action'),
    },
    activity.disqualified,
  );
}

/**
 * Calculator for Just Dance:
 * Rounds 1-4: 1st=3, 2nd=2, 3rd=1
 * Round 5 (Final): 1st=6, 2nd=4, 3rd=2
 */
export function calculateJustDanceRawScores(
  activity: AllianceActivity,
): Record<AllianceId, number> {
  const totals: Record<AllianceId, number> = { terror: 0, shooter: 0, action: 0 };
  const rounds = activity.justDance?.rounds ?? [];
  const normalPts = [3, 2, 1];
  const finalPts = [6, 4, 2];

  rounds.forEach((round, idx) => {
    const scale = idx === 4 ? finalPts : normalPts;
    for (const id of ALLIANCE_IDS) {
      const rank = round[id];
      if (rank !== null && rank >= 1 && rank <= 3) {
        totals[id] += scale[rank - 1];
      }
    }
  });

  return totals;
}

/**
 * Calculator for Mímica gamer: sum of guessed cards across 5 turns.
 */
export function calculateMimicaRawScores(activity: AllianceActivity): Record<AllianceId, number> {
  const totals: Record<AllianceId, number> = { terror: 0, shooter: 0, action: 0 };
  const turns = activity.mimica?.turns ?? [];

  for (const turn of turns) {
    for (const id of ALLIANCE_IDS) {
      totals[id] += turn[id] || 0;
    }
  }
  return totals;
}

/**
 * Calculates points awarded to each alliance for a single AllianceActivity.
 * - Handles Cazatesoros "nobody found anything" -> 950 pts each (except disqualified)
 * - Handles disqualification -> 0 pts
 * - Handles ties in placement mode: sums the points of tied positions and splits equally
 */
export function calculateAllianceActivityPoints(
  activity: AllianceActivity,
): Record<AllianceId, number> {
  const result: Record<AllianceId, number> = { terror: 0, shooter: 0, action: 0 };

  if (activity.scoringMode === 'direct') {
    for (const id of ALLIANCE_IDS) {
      result[id] = activity.disqualified[id] ? 0 : activity.directPoints[id] || 0;
    }
    return result;
  }

  // Cazatesoros special rule: if nobody finds anything, all 3 alliances get 950 pts
  if (
    activity.calculatorKind === 'cazatesoros' &&
    activity.cazatesoros?.nobodyFoundAnything
  ) {
    for (const id of ALLIANCE_IDS) {
      result[id] = activity.disqualified[id] ? 0 : 950;
    }
    return result;
  }

  // Group non-disqualified alliances that have a rank assigned
  const rankedAlliances = ALLIANCE_IDS.filter(
    (id) => !activity.disqualified[id] && activity.ranks[id] !== null,
  );
  if (rankedAlliances.length === 0) return result;

  // Sort by assigned rank ascending
  const sorted = [...rankedAlliances].sort(
    (a, b) => (activity.ranks[a] as number) - (activity.ranks[b] as number),
  );

  // Walk through groups with identical rank and split the corresponding slot points
  let slotIndex = 0;
  let i = 0;
  while (i < sorted.length) {
    const currentRank = activity.ranks[sorted[i]];
    const group: AllianceId[] = [];
    while (i < sorted.length && activity.ranks[sorted[i]] === currentRank) {
      group.push(sorted[i]);
      i++;
    }

    let slotSum = 0;
    for (let s = 0; s < group.length; s++) {
      slotSum += activity.placementPoints[slotIndex + s] ?? 0;
    }
    const splitPoints = Math.round((slotSum / group.length) * 100) / 100;

    for (const id of group) {
      result[id] = splitPoints;
    }
    slotIndex += group.length;
  }

  return result;
}

export interface AllianceStandingsRow {
  id: AllianceId;
  day19Points: number;
  tarreoPoints: number;
  adjustmentPoints: number;
  totalPoints: number;
  goalPercent: number;
  breakdown: Record<string, number>;
  rank: number;
}

export function calculateDay19Totals(
  day19Activities: Day19Activity[],
): Record<AllianceId, number> {
  const totals: Record<AllianceId, number> = { terror: 0, shooter: 0, action: 0 };
  for (const act of day19Activities) {
    for (const id of ALLIANCE_IDS) {
      totals[id] += act.points[id] || 0;
    }
  }
  return totals;
}

export function calculateAdjustmentTotals(
  adjustments: AllianceAdjustment[],
): Record<AllianceId, number> {
  const totals: Record<AllianceId, number> = { terror: 0, shooter: 0, action: 0 };
  for (const adj of adjustments) {
    totals[adj.allianceId] += adj.points || 0;
  }
  return totals;
}

/**
 * Aggregates total Copa de Alianzas points:
 * Day 19 starting points + Tarreo Copa de Alianzas + Manual adjustments.
 */
export function calculateAllianceStandings(
  activities: AllianceActivity[],
  day19Activities: Day19Activity[] = [],
  adjustments: AllianceAdjustment[] = [],
  goal: number = ALLIANCE_GOAL,
): AllianceStandingsRow[] {
  const day19Totals = calculateDay19Totals(day19Activities);
  const adjustmentTotals = calculateAdjustmentTotals(adjustments);
  const tarreoTotals: Record<AllianceId, number> = { terror: 0, shooter: 0, action: 0 };
  const breakdowns: Record<AllianceId, Record<string, number>> = {
    terror: {},
    shooter: {},
    action: {},
  };

  for (const act of activities) {
    const pts = calculateAllianceActivityPoints(act);
    for (const id of ALLIANCE_IDS) {
      tarreoTotals[id] += pts[id];
      breakdowns[id][act.id] = pts[id];
    }
  }

  const rows: AllianceStandingsRow[] = ALLIANCE_IDS.map((id) => {
    const day19Points = Math.round(day19Totals[id] * 100) / 100;
    const tarreoPoints = Math.round(tarreoTotals[id] * 100) / 100;
    const adjustmentPoints = Math.round(adjustmentTotals[id] * 100) / 100;
    const totalPoints = Math.round((day19Points + tarreoPoints + adjustmentPoints) * 100) / 100;
    const goalPercent = goal > 0 ? Math.round((totalPoints / goal) * 10000) / 100 : 0;

    return {
      id,
      day19Points,
      tarreoPoints,
      adjustmentPoints,
      totalPoints,
      goalPercent,
      breakdown: breakdowns[id],
      rank: 1,
    };
  });

  rows.sort((a, b) => b.totalPoints - a.totalPoints);

  for (let i = 0; i < rows.length; i++) {
    if (i > 0 && rows[i].totalPoints === rows[i - 1].totalPoints) {
      rows[i].rank = rows[i - 1].rank;
    } else {
      rows[i].rank = i + 1;
    }
  }

  return rows;
}
