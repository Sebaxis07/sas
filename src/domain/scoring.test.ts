import { describe, expect, it } from 'vitest';
import {
  ALLIANCE_GOAL,
  createInitialAllianceActivities,
  createInitialDay19Activities,
  createInitialTournaments,
} from '../data/defaults';
import {
  calculateAllianceActivityPoints,
  calculateAllianceStandings,
  calculateCazatesorosRanks,
  calculateCazatesorosRawScores,
  calculateGeneralRanking,
  calculateJustDanceRawScores,
  calculateMimicaRawScores,
  calculateTournamentEntryPoints,
  getEffectiveScale,
  ranksFromScores,
} from './scoring';
import { AllianceActivity, Participant, TournamentActivity } from '../types/tarreo';

const makePlayers = (count: number): Participant[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Jugador ${i + 1}`,
    career: 'Ingeniería Informática',
  }));

describe('Torneos Individuales — Reglas oficiales Tarreo INACAP 2026', () => {
  it('reproduce el ejemplo oficial de las bases: Ana = 17 puntos', () => {
    const players: Participant[] = [
      { id: 'ana', name: 'Ana', career: 'Analista Programador' },
      ...makePlayers(7),
    ];
    const tournaments = createInitialTournaments();
    // Torneo 1 (Fortnite, 8 jugadores -> escala completa): Ana 1.º (10 + 1 = 11)
    tournaments[2].entries = players.map((p, idx) => ({
      participantId: p.id,
      placement: idx === 0 ? 1 : null,
      isWO: false,
      directPoints: 0,
    }));
    // Torneo 2 (Valorant -> siempre completa): Ana 3.º (5 + 1 = 6)
    tournaments[0].entries = [
      { participantId: 'ana', placement: 3, isWO: false, directPoints: 0 },
    ];

    const ranking = calculateGeneralRanking(players, tournaments);
    const ana = ranking.find((r) => r.participant.id === 'ana');
    expect(ana?.totalPoints).toBe(17);
    expect(ana?.firstPlaces).toBe(1);
  });

  it('aplica escala reducida (5, 4, 3, 2) con 4 a 7 jugadores, excepto en Valorant', () => {
    const tournaments = createInitialTournaments();
    const valorant = tournaments[0];
    const fortnite = tournaments[2];

    const fiveEntries = Array.from({ length: 5 }, (_, i) => ({
      participantId: `p${i + 1}`,
      placement: i < 4 ? i + 1 : null,
      isWO: false,
      directPoints: 0,
    }));

    valorant.entries = fiveEntries;
    fortnite.entries = fiveEntries;

    expect(getEffectiveScale(valorant)).toBe('full');
    expect(getEffectiveScale(fortnite)).toBe('reduced');

    // Valorant 1.º = 10 + 1 = 11
    expect(calculateTournamentEntryPoints(valorant, fiveEntries[0])).toBe(11);
    // Fortnite (5 jugadores) 1.º = 5 + 1 = 6, 4.º = 2 + 1 = 3
    expect(calculateTournamentEntryPoints(fortnite, fiveEntries[0])).toBe(6);
    expect(calculateTournamentEntryPoints(fortnite, fiveEntries[3])).toBe(3);
  });

  it('en Brawl los perdedores de semifinal comparten 3.º y 4.º (4 pts cada uno en escala normal)', () => {
    const tournaments = createInitialTournaments();
    const brawl = tournaments[3];
    brawl.entries = Array.from({ length: 8 }, (_, i) => ({
      participantId: `p${i + 1}`,
      placement: i === 0 ? 1 : i === 1 ? 2 : i === 2 || i === 3 ? 3 : null,
      isWO: false,
      directPoints: 0,
    }));

    // 3.º compartido = (5+3)/2 = 4 + 1 por jugar = 5 pts
    expect(calculateTournamentEntryPoints(brawl, brawl.entries[2])).toBe(5);
    expect(calculateTournamentEntryPoints(brawl, brawl.entries[3])).toBe(5);
  });

  it('resta 1 punto en W.O. y no suma el +1 de participación', () => {
    const tournaments = createInitialTournaments();
    const fortnite = tournaments[2];
    const woEntry = {
      participantId: 'p1',
      placement: null,
      isWO: true,
      directPoints: 0,
    };
    expect(calculateTournamentEntryPoints(fortnite, woEntry)).toBe(-1);
  });

  it('desempata por más 1.º lugares, luego más 2.º lugares, y detecta partida de desempate', () => {
    const players: Participant[] = [
      { id: 'a', name: 'Alice', career: 'Analista Programador' },
      { id: 'b', name: 'Bob', career: 'Telecomunicaciones' },
      { id: 'c', name: 'Carla', career: 'Diseño Digital y Web' },
    ];
    const custom: TournamentActivity = {
      id: 't1',
      name: 'Custom 1',
      schedule: '',
      format: 'personalizado',
      description: '',
      isOfficial: false,
      scoringMode: 'placement',
      alwaysFullScale: true,
      sharedThirdFourth: false,
      scaleOverride: 'full',
      fullScale: [10, 10, 5, 3],
      reducedScale: [5, 4, 3, 2],
      participationBonus: 0,
      woPenalty: 1,
      entries: [
        { participantId: 'a', placement: 1, isWO: false, directPoints: 0 },
        { participantId: 'b', placement: 2, isWO: false, directPoints: 0 },
        { participantId: 'c', placement: 1, isWO: false, directPoints: 0 },
      ],
    };

    const ranking = calculateGeneralRanking(players, [custom]);
    // Alice & Carla tie on 10 pts AND 1 first place -> both rank 1, needsTiebreaker = true
    // Bob has 10 pts but 0 first places -> rank 3
    expect(ranking[0].rank).toBe(1);
    expect(ranking[1].rank).toBe(1);
    expect(ranking[0].needsTiebreaker).toBe(true);
    expect(ranking[1].needsTiebreaker).toBe(true);
    expect(ranking[2].participant.id).toBe('b');
    expect(ranking[2].rank).toBe(3);
  });
});

describe('Copa de Alianzas — Reglas oficiales Tarreo INACAP 2026', () => {
  it('reparte puntos en partes iguales cuando hay empate', () => {
    const activities = createInitialAllianceActivities();
    const cazatesoros = activities[0]; // 1500, 900, 450
    cazatesoros.ranks = { terror: 1, shooter: 1, action: 3 };

    const pts = calculateAllianceActivityPoints(cazatesoros);
    // Empate 1.º y 2.º: (1500 + 900) / 2 = 1200 cada una
    expect(pts.terror).toBe(1200);
    expect(pts.shooter).toBe(1200);
    expect(pts.action).toBe(450);
  });

  it('otorga 950 puntos a cada alianza si nadie encuentra nada en Cazatesoros', () => {
    const activities = createInitialAllianceActivities();
    const cazatesoros = activities[0];
    cazatesoros.cazatesoros!.nobodyFoundAnything = true;

    const pts = calculateAllianceActivityPoints(cazatesoros);
    expect(pts).toEqual({ terror: 950, shooter: 950, action: 950 });
  });

  it('calcula correctamente Cazatesoros Semana 3 (escala + Jackpot), Just Dance y tabla acumulada', () => {
    const activities = createInitialAllianceActivities();

    // Cazatesoros Semana 3:
    // Terror: 1 Pirate Shop Access (Jackpot -> 1.º automático aunque tenga 0 gizmos)
    // Shooter: 1 Corvette (10) + 1 Mochila (4) = 14 pts -> 2.º
    // Action: 3 Gizmos (3) + 1 Pantalla (2) = 5 pts -> 3.º
    activities[0].cazatesoros!.counts = {
      terror: {
        gizmo: 0,
        pantallaCarga: 0,
        jamTrack: 0,
        mochila: 0,
        corvette: 0,
        pirateShop: 1,
        solidGoldMiku: 0,
      },
      shooter: {
        gizmo: 0,
        pantallaCarga: 0,
        jamTrack: 0,
        mochila: 1,
        corvette: 1,
        pirateShop: 0,
        solidGoldMiku: 0,
      },
      action: {
        gizmo: 3,
        pantallaCarga: 1,
        jamTrack: 0,
        mochila: 0,
        corvette: 0,
        pirateShop: 0,
        solidGoldMiku: 0,
      },
    };
    const cazaRaw = calculateCazatesorosRawScores(activities[0]);
    expect(cazaRaw).toEqual({ terror: 0, shooter: 14, action: 5 });
    activities[0].ranks = calculateCazatesorosRanks(activities[0]);
    expect(activities[0].ranks).toEqual({ terror: 1, shooter: 2, action: 3 });

    // Si Action saca Solid Gold Miku, supera incluso al Pirate Shop Access de Terror
    const mikuTest = createInitialAllianceActivities()[0];
    mikuTest.cazatesoros!.counts.terror.pirateShop = 1;
    mikuTest.cazatesoros!.counts.action.solidGoldMiku = 1;
    expect(calculateCazatesorosRanks(mikuTest)).toEqual({
      action: 1,
      terror: 2,
      shooter: 3,
    });

    // Just Dance: Action wins Final (6 pts), Terror wins R1 (3 pts)
    activities[1].justDance!.rounds[0] = { terror: 1, shooter: 2, action: 3 };
    activities[1].justDance!.rounds[4] = { terror: 3, shooter: 2, action: 1 };
    const jdRaw = calculateJustDanceRawScores(activities[1]);
    expect(jdRaw).toEqual({ terror: 5, shooter: 6, action: 7 });
    activities[1].ranks = ranksFromScores(jdRaw, activities[1].disqualified);

    const standings = calculateAllianceStandings(activities);
    // Terror: 1500 + 450 = 1950
    // Action: 450 + 1500 = 1950
    // Shooter: 900 + 900 = 1800
    expect(standings[0].totalPoints).toBe(1950);
    expect(standings[1].totalPoints).toBe(1950);
    expect(standings[0].rank).toBe(1);
    expect(standings[1].rank).toBe(1);
    expect(standings[2].id).toBe('shooter');
    expect(standings[2].totalPoints).toBe(1800);
  });

  it('carga los puntajes exactos del día 19, permite editar Gymkanas, sumar ajustes y calcular meta de 32.000', () => {
    const day19 = createInitialDay19Activities();
    const activities = createInitialAllianceActivities();

    const baseStandings = calculateAllianceStandings(activities, day19, [], ALLIANCE_GOAL);
    const byId = Object.fromEntries(baseStandings.map((r) => [r.id, r]));

    expect(byId.terror.totalPoints).toBe(15331);
    expect(byId.action.totalPoints).toBe(13931);
    expect(byId.shooter.totalPoints).toBe(5100);
    expect(byId.terror.goalPercent).toBe(47.91);
    expect(byId.action.goalPercent).toBe(43.53);
    expect(byId.shooter.goalPercent).toBe(15.94);

    // Editar Gymkanas + ajuste manual + Copa de Alianzas del Tarreo
    day19[6].points.shooter = 500;
    activities[0].ranks = { terror: 1, shooter: 2, action: 3 }; // 1500, 900, 450
    const adjustments = [
      {
        id: 'adj-1',
        allianceId: 'action' as const,
        points: -200,
        reason: 'Corrección de acta',
        createdAt: '2026-11-20T20:00:00Z',
      },
    ];

    const updated = calculateAllianceStandings(activities, day19, adjustments, ALLIANCE_GOAL);
    const uById = Object.fromEntries(updated.map((r) => [r.id, r]));
    expect(uById.terror.totalPoints).toBe(15331 + 1500);
    expect(uById.action.totalPoints).toBe(13931 + 450 - 200);
    expect(uById.shooter.totalPoints).toBe(5100 + 500 + 900);
  });

  it('cubre casos límite: Brawl reducido, triple empate, descalificación, Mímica y actividades personalizadas', () => {
    // Brawl en escala reducida (5 jugadores): 3.º/4.º compartido = (3+2)/2 = 2.5 + 1 = 3.5 pts
    const brawl = createInitialTournaments()[3];
    brawl.entries = Array.from({ length: 5 }, (_, i) => ({
      participantId: `p${i + 1}`,
      placement: i === 0 ? 1 : i === 1 ? 2 : i === 2 || i === 3 ? 3 : null,
      isWO: false,
      directPoints: 0,
    }));
    expect(getEffectiveScale(brawl)).toBe('reduced');
    expect(calculateTournamentEntryPoints(brawl, brawl.entries[2])).toBe(3.5);

    // Triple empate en Mímica gamer (1000 + 600 + 300) / 3 = 633.33 cada una
    const mimica = createInitialAllianceActivities()[2];
    mimica.mimica!.turns[0] = { terror: 4, shooter: 4, action: 4 };
    const mimicaRaw = calculateMimicaRawScores(mimica);
    expect(mimicaRaw).toEqual({ terror: 4, shooter: 4, action: 4 });
    mimica.ranks = ranksFromScores(mimicaRaw, mimica.disqualified);
    const mimicaPts = calculateAllianceActivityPoints(mimica);
    expect(mimicaPts).toEqual({ terror: 633.33, shooter: 633.33, action: 633.33 });

    // Descalificación por trampas -> 0 puntos incluso en modo directo
    const customDirect: AllianceActivity = {
      id: 'aln-custom',
      name: 'Bono Nocturno',
      schedule: '02:00',
      description: 'Prueba relámpago',
      isOfficial: false,
      scoringMode: 'direct',
      placementPoints: [1000, 600, 300],
      ranks: { terror: null, shooter: null, action: null },
      directPoints: { terror: 400, shooter: 300, action: 200 },
      disqualified: { terror: true, shooter: false, action: false },
      calculatorKind: 'none',
    };
    expect(calculateAllianceActivityPoints(customDirect)).toEqual({
      terror: 0,
      shooter: 300,
      action: 200,
    });
  });
});
