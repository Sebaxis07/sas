import { useCallback, useEffect, useState } from 'react';
import {
  ALLIANCES,
  ALLIANCE_GOAL,
  createInitialDay19Activities,
  createInitialState,
} from '../data/defaults';
import {
  calculateAllianceStandings,
  calculateGeneralRanking,
} from '../domain/scoring';
import {
  AllianceActivity,
  AllianceAdjustment,
  AllianceId,
  Career,
  Participant,
  TarreoState,
  TournamentActivity,
  TournamentEntry,
} from '../types/tarreo';

const STORAGE_KEY = 'tarreo-inacap-2026-state-v1';

function normalizeState(parsed: Partial<TarreoState>): TarreoState {
  const base = createInitialState();
  return {
    version: 2,
    allianceGoal:
      typeof parsed.allianceGoal === 'number' && parsed.allianceGoal > 0
        ? parsed.allianceGoal
        : ALLIANCE_GOAL,
    participants: Array.isArray(parsed.participants) ? parsed.participants : base.participants,
    tournaments: Array.isArray(parsed.tournaments) ? parsed.tournaments : base.tournaments,
    allianceActivities: Array.isArray(parsed.allianceActivities)
      ? parsed.allianceActivities
      : base.allianceActivities,
    day19Activities:
      Array.isArray(parsed.day19Activities) && parsed.day19Activities.length > 0
        ? parsed.day19Activities
        : createInitialDay19Activities(),
    allianceAdjustments: Array.isArray(parsed.allianceAdjustments)
      ? parsed.allianceAdjustments
      : [],
  };
}

function loadState(): TarreoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<TarreoState>;
    if (
      !parsed ||
      !Array.isArray(parsed.participants) ||
      !Array.isArray(parsed.tournaments) ||
      !Array.isArray(parsed.allianceActivities)
    ) {
      return createInitialState();
    }
    return normalizeState(parsed);
  } catch {
    return createInitialState();
  }
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useTarreoStore() {
  const [state, setState] = useState<TarreoState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  // --- Participants ---
  const addParticipant = useCallback(
    (name: string, career: Career, alliance?: AllianceId): Participant => {
      const trimmed = name.trim();
      const participant: Participant = {
        id: makeId('usr'),
        name: trimmed,
        career,
        alliance,
      };
      setState((prev) => ({
        ...prev,
        participants: [...prev.participants, participant],
      }));
      return participant;
    },
    [],
  );

  const removeParticipant = useCallback((participantId: string) => {
    setState((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== participantId),
      tournaments: prev.tournaments.map((t) => ({
        ...t,
        entries: t.entries.filter((e) => e.participantId !== participantId),
      })),
    }));
  }, []);

  // --- Tournaments ---
  const updateTournament = useCallback(
    (tournamentId: string, updater: (t: TournamentActivity) => TournamentActivity) => {
      setState((prev) => ({
        ...prev,
        tournaments: prev.tournaments.map((t) => (t.id === tournamentId ? updater(t) : t)),
      }));
    },
    [],
  );

  const upsertTournamentEntry = useCallback(
    (tournamentId: string, entry: TournamentEntry) => {
      updateTournament(tournamentId, (t) => {
        const exists = t.entries.some((e) => e.participantId === entry.participantId);
        return {
          ...t,
          entries: exists
            ? t.entries.map((e) =>
                e.participantId === entry.participantId ? entry : e,
              )
            : [...t.entries, entry],
        };
      });
    },
    [updateTournament],
  );

  const removeTournamentEntry = useCallback(
    (tournamentId: string, participantId: string) => {
      updateTournament(tournamentId, (t) => ({
        ...t,
        entries: t.entries.filter((e) => e.participantId !== participantId),
      }));
    },
    [updateTournament],
  );

  const addCustomTournament = useCallback(
    (activity: Omit<TournamentActivity, 'id' | 'isOfficial' | 'entries'>): string => {
      const id = makeId('trn');
      const created: TournamentActivity = {
        ...activity,
        id,
        isOfficial: false,
        entries: [],
      };
      setState((prev) => ({
        ...prev,
        tournaments: [...prev.tournaments, created],
      }));
      return id;
    },
    [],
  );

  const removeCustomTournament = useCallback((tournamentId: string) => {
    setState((prev) => ({
      ...prev,
      tournaments: prev.tournaments.filter((t) => t.id !== tournamentId || t.isOfficial),
    }));
  }, []);

  // --- Alliance Activities ---
  const updateAllianceActivity = useCallback(
    (activityId: string, updater: (a: AllianceActivity) => AllianceActivity) => {
      setState((prev) => ({
        ...prev,
        allianceActivities: prev.allianceActivities.map((a) =>
          a.id === activityId ? updater(a) : a,
        ),
      }));
    },
    [],
  );

  const addCustomAllianceActivity = useCallback(
    (
      activity: Pick<
        AllianceActivity,
        'name' | 'schedule' | 'description' | 'scoringMode' | 'placementPoints'
      >,
    ): string => {
      const id = makeId('aln');
      const created: AllianceActivity = {
        ...activity,
        id,
        isOfficial: false,
        ranks: { terror: null, shooter: null, action: null },
        directPoints: { terror: 0, shooter: 0, action: 0 },
        disqualified: { terror: false, shooter: false, action: false },
        calculatorKind: 'none',
      };
      setState((prev) => ({
        ...prev,
        allianceActivities: [...prev.allianceActivities, created],
      }));
      return id;
    },
    [],
  );

  const removeCustomAllianceActivity = useCallback((activityId: string) => {
    setState((prev) => ({
      ...prev,
      allianceActivities: prev.allianceActivities.filter(
        (a) => a.id !== activityId || a.isOfficial,
      ),
    }));
  }, []);

  // --- Day 19 & Manual Adjustments ---
  const updateDay19ActivityPoints = useCallback(
    (activityId: string, allianceId: AllianceId, points: number) => {
      setState((prev) => ({
        ...prev,
        day19Activities: prev.day19Activities.map((act) =>
          act.id === activityId
            ? { ...act, points: { ...act.points, [allianceId]: points } }
            : act,
        ),
      }));
    },
    [],
  );

  const updateDay19ActivityMeta = useCallback(
    (activityId: string, name: string, note: string) => {
      setState((prev) => ({
        ...prev,
        day19Activities: prev.day19Activities.map((act) =>
          act.id === activityId ? { ...act, name, note } : act,
        ),
      }));
    },
    [],
  );

  const addDay19Activity = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      day19Activities: [
        ...prev.day19Activities,
        {
          id: makeId('d19'),
          name: trimmed,
          maxPoints: null,
          points: { terror: 0, action: 0, shooter: 0 },
          note: '',
          editable: false,
        },
      ],
    }));
  }, []);

  const removeDay19Activity = useCallback((activityId: string) => {
    setState((prev) => ({
      ...prev,
      day19Activities: prev.day19Activities.filter((act) => act.id !== activityId),
    }));
  }, []);

  const addAllianceAdjustment = useCallback(
    (allianceId: AllianceId, points: number, reason: string) => {
      const trimmed = reason.trim();
      if (!trimmed || points === 0) return;
      const entry: AllianceAdjustment = {
        id: makeId('adj'),
        allianceId,
        points,
        reason: trimmed,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        allianceAdjustments: [entry, ...prev.allianceAdjustments],
      }));
    },
    [],
  );

  const removeAllianceAdjustment = useCallback((adjustmentId: string) => {
    setState((prev) => ({
      ...prev,
      allianceAdjustments: prev.allianceAdjustments.filter((a) => a.id !== adjustmentId),
    }));
  }, []);

  // --- Backup & Export ---
  const exportJson = useCallback(() => {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    downloadFile(
      `tarreo-inacap-2026-respaldo-${stamp}.json`,
      JSON.stringify(state, null, 2),
      'application/json',
    );
  }, [state]);

  const importJson = useCallback((jsonText: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonText) as TarreoState;
      if (
        !parsed ||
        !Array.isArray(parsed.participants) ||
        !Array.isArray(parsed.tournaments) ||
        !Array.isArray(parsed.allianceActivities)
      ) {
        return { ok: false, error: 'El archivo no tiene el formato válido del Tarreo.' };
      }
      setState(normalizeState(parsed));
      return { ok: true };
    } catch {
      return { ok: false, error: 'No se pudo leer el archivo JSON.' };
    }
  }, []);

  const exportCsv = useCallback(() => {
    const ranking = calculateGeneralRanking(state.participants, state.tournaments);
    const allianceStandings = calculateAllianceStandings(
      state.allianceActivities,
      state.day19Activities,
      state.allianceAdjustments,
      state.allianceGoal,
    );
    const stamp = new Date().toISOString().slice(0, 10);

    const lines: string[] = [];
    lines.push('=== RANKING GENERAL INDIVIDUAL ===');
    const tHeaders = state.tournaments.map((t) => `"${t.name}"`).join(',');
    lines.push(`Puesto,Nombre,Carrera,Total,1er Lugar,2do Lugar,W.O.,${tHeaders}`);

    for (const row of ranking) {
      const perTournament = state.tournaments
        .map((t) => row.breakdown[t.id] ?? 0)
        .join(',');
      lines.push(
        `${row.rank},"${row.participant.name}","${row.participant.career}",${row.totalPoints},${row.firstPlaces},${row.secondPlaces},${row.woCount},${perTournament}`,
      );
    }

    lines.push('');
    lines.push('=== TABLA GENERAL DE ALIANZAS ===');
    const aHeaders = state.allianceActivities.map((a) => `"${a.name}"`).join(',');
    lines.push(`Puesto,Alianza,Dia 19,Tarreo,Ajustes,Total,Meta 32000 %,${aHeaders}`);
    for (const row of allianceStandings) {
      const meta = ALLIANCES.find((a) => a.id === row.id);
      const perAct = state.allianceActivities
        .map((a) => row.breakdown[a.id] ?? 0)
        .join(',');
      lines.push(
        `${row.rank},"${meta?.name ?? row.id}",${row.day19Points},${row.tarreoPoints},${row.adjustmentPoints},${row.totalPoints},${row.goalPercent}%,${perAct}`,
      );
    }

    downloadFile(`tarreo-inacap-2026-puntajes-${stamp}.csv`, '\uFEFF' + lines.join('\n'), 'text/csv;charset=utf-8');
  }, [state]);

  const resetAll = useCallback(() => {
    setState(createInitialState());
  }, []);

  return {
    state,
    addParticipant,
    removeParticipant,
    updateTournament,
    upsertTournamentEntry,
    removeTournamentEntry,
    addCustomTournament,
    removeCustomTournament,
    updateAllianceActivity,
    addCustomAllianceActivity,
    removeCustomAllianceActivity,
    updateDay19ActivityPoints,
    updateDay19ActivityMeta,
    addDay19Activity,
    removeDay19Activity,
    addAllianceAdjustment,
    removeAllianceAdjustment,
    exportJson,
    importJson,
    exportCsv,
    resetAll,
  };
}
