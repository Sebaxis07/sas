import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Lock, Plus, Trash2, Trophy, UserPlus } from 'lucide-react';
import { CAREERS } from '../data/defaults';
import { ActivityRulesCard } from './ActivityRulesCard';
import {
  calculateTournamentEntryPoints,
  getEffectiveScale,
} from '../domain/scoring';
import {
  Career,
  Participant,
  PrizeDecisionMethod,
  ScaleOverride,
  TournamentActivity,
  TournamentEntry,
} from '../types/tarreo';

interface TournamentsViewProps {
  tournaments: TournamentActivity[];
  participants: Participant[];
  selectedId: string;
  onSelectId: (id: string) => void;
  onAddParticipant: (name: string, career: Career) => Participant;
  onUpsertEntry: (tournamentId: string, entry: TournamentEntry) => void;
  onRemoveEntry: (tournamentId: string, participantId: string) => void;
  onUpdateTournament: (
    tournamentId: string,
    updater: (t: TournamentActivity) => TournamentActivity,
  ) => void;
  onRemoveCustomTournament: (tournamentId: string) => void;
  onOpenCustomModal: () => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  tournaments,
  participants,
  selectedId,
  onSelectId,
  onAddParticipant,
  onUpsertEntry,
  onRemoveEntry,
  onUpdateTournament,
  onRemoveCustomTournament,
  onOpenCustomModal,
}) => {
  const [pickParticipantId, setPickParticipantId] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickCareer, setQuickCareer] = useState<Career>(CAREERS[0]);
  const [activeTeamName, setActiveTeamName] = useState('');
  const [closedNotice, setClosedNotice] = useState<string | null>(null);

  const activeTournament =
    tournaments.find((t) => t.id === selectedId) ?? tournaments[0];

  useEffect(() => {
    if (!tournaments.some((t) => t.id === selectedId) && tournaments[0]) {
      onSelectId(tournaments[0].id);
    }
  }, [tournaments, selectedId, onSelectId]);

  const showTeamColumn =
    activeTournament?.format === 'equipos' || activeTournament?.format === 'duplas';
  const teamSize =
    activeTournament?.teamSize ??
    (activeTournament?.format === 'duplas' ? 2 : 4);

  const teamCounts = useMemo(() => {
    const map = new Map<string, number>();
    if (!activeTournament) return map;
    for (const e of activeTournament.entries) {
      const name = (e.teamName ?? '').trim();
      if (!name) continue;
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return map;
  }, [activeTournament]);

  const getNextSuggestedTeam = (counts: Map<string, number>, labelPrefix: string) => {
    let idx = 1;
    while (counts.has(`${labelPrefix} ${idx}`)) {
      idx += 1;
    }
    return `${labelPrefix} ${idx}`;
  };

  useEffect(() => {
    if (!activeTournament) return;
    setClosedNotice(null);
    if (showTeamColumn) {
      const prefix = activeTournament.format === 'duplas' ? 'Dupla' : 'Equipo';
      // Pick first open team if one exists, otherwise suggest next team name
      const openTeam = Array.from(teamCounts.entries()).find(([, c]) => c < teamSize)?.[0];
      setActiveTeamName(openTeam ?? getNextSuggestedTeam(teamCounts, prefix));
    } else {
      setActiveTeamName('');
    }
  }, [activeTournament?.id]);

  // Group entries by team for team/duo tournaments
  const groupedTeams = useMemo(() => {
    if (!activeTournament || !showTeamColumn) return [];
    const groups = new Map<string, TournamentEntry[]>();
    for (const entry of activeTournament.entries) {
      const key = (entry.teamName ?? '').trim() || 'Sin equipo';
      const list = groups.get(key) ?? [];
      list.push(entry);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [activeTournament, showTeamColumn]);

  if (!activeTournament) return null;

  const enrolledIds = new Set(activeTournament.entries.map((e) => e.participantId));
  const availableParticipants = participants.filter((p) => !enrolledIds.has(p.id));
  const activeCount = activeTournament.entries.filter((e) => !e.isWO).length;
  const effectiveScale = getEffectiveScale(activeTournament);
  const currentScaleValues =
    effectiveScale === 'reduced'
      ? activeTournament.reducedScale
      : activeTournament.fullScale;

  const currentTeamTrimmed = activeTeamName.trim();
  const currentTeamCount = currentTeamTrimmed ? (teamCounts.get(currentTeamTrimmed) ?? 0) : 0;
  const currentTeamFull = showTeamColumn && currentTeamTrimmed !== '' && currentTeamCount >= teamSize;

  // Official capacity limits from bases (works even with pre-existing localStorage state)
  const maxTeamsLimit =
    activeTournament.id === 'valorant'
      ? teamSize === 5
        ? 3
        : 4
      : activeTournament.id === 'rocket-league'
        ? 6
        : activeTournament.maxTeams;

  const maxPlayersLimit =
    activeTournament.id === 'valorant'
      ? teamSize === 5
        ? 15
        : 16
      : activeTournament.id === 'rocket-league'
        ? 12
        : activeTournament.id === 'fortnite' || activeTournament.id === 'brawl'
          ? 8
          : activeTournament.maxPlayers;

  const closedTeamsCount = showTeamColumn
    ? Array.from(teamCounts.values()).filter((c) => c >= teamSize).length
    : 0;
  const totalTeamsCount = showTeamColumn ? teamCounts.size : 0;
  const capacityReached =
    (maxTeamsLimit !== undefined && closedTeamsCount >= maxTeamsLimit) ||
    (maxPlayersLimit !== undefined && activeTournament.entries.length >= maxPlayersLimit);

  const enrollWithAutoClose = (participantId: string) => {
    const prefix = activeTournament.format === 'duplas' ? 'Dupla' : 'Equipo';
    let targetTeam = showTeamColumn ? currentTeamTrimmed : undefined;
    if (showTeamColumn && (!targetTeam || (teamCounts.get(targetTeam) ?? 0) >= teamSize)) {
      targetTeam = getNextSuggestedTeam(teamCounts, prefix);
    }

    onUpsertEntry(activeTournament.id, {
      participantId,
      teamName: targetTeam,
      placement: null,
      isWO: false,
      directPoints: 0,
    });

    if (showTeamColumn && targetTeam) {
      const nextCount = (teamCounts.get(targetTeam) ?? 0) + 1;
      if (nextCount >= teamSize) {
        const updatedCounts = new Map(teamCounts);
        updatedCounts.set(targetTeam, nextCount);
        setClosedNotice(`${prefix} "${targetTeam}" completo (${nextCount}/${teamSize}): cerrado automáticamente.`);
        setActiveTeamName(getNextSuggestedTeam(updatedCounts, prefix));
      } else {
        setClosedNotice(null);
        setActiveTeamName(targetTeam);
      }
    }
  };

  const handleAddExisting = () => {
    if (!pickParticipantId) return;
    enrollWithAutoClose(pickParticipantId);
    setPickParticipantId('');
  };

  const handleQuickCreateAndEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    const created = onAddParticipant(quickName, quickCareer);
    enrollWithAutoClose(created.id);
    setQuickName('');
  };

  const setTeamPlacement = (teamName: string, placement: number | null) => {
    onUpdateTournament(activeTournament.id, (t) => ({
      ...t,
      entries: t.entries.map((entry) => {
        const entryTeam = (entry.teamName ?? '').trim();
        if (entryTeam === teamName) {
          return entry.isWO ? entry : { ...entry, placement };
        }
        // If another team currently holds this placement, clear it so there are never duplicates
        if (placement !== null && entry.placement === placement) {
          return { ...entry, placement: null };
        }
        return entry;
      }),
    }));
  };

  const setSinglePlacement = (participantId: string, placement: number | null) => {
    onUpdateTournament(activeTournament.id, (t) => {
      const maxAllowed = t.sharedThirdFourth && placement === 3 ? 2 : 1;
      const otherHolders = t.entries.filter(
        (e) => e.participantId !== participantId && !e.isWO && e.placement === placement,
      );
      const shouldClearOthers = placement !== null && otherHolders.length >= maxAllowed;
      const toClearId = shouldClearOthers ? otherHolders[0]?.participantId : null;

      return {
        ...t,
        entries: t.entries.map((entry) => {
          if (entry.participantId === participantId) {
            return entry.isWO ? entry : { ...entry, placement };
          }
          if (toClearId && entry.participantId === toClearId) {
            return { ...entry, placement: null };
          }
          return entry;
        }),
      };
    });
  };

  // Track taken placements so dropdowns disable already-assigned podium slots
  const isTeamPlacementTaken = (placement: number, currentTeam: string): string | null => {
    for (const [tName, members] of groupedTeams) {
      if (tName === currentTeam || tName === 'Sin equipo') continue;
      if (members.some((m) => !m.isWO && m.placement === placement)) {
        return tName;
      }
    }
    return null;
  };

  const isSinglePlacementTaken = (placement: number, currentParticipantId: string): boolean => {
    const maxAllowed = activeTournament.sharedThirdFourth && placement === 3 ? 2 : 1;
    const countOther = activeTournament.entries.filter(
      (e) => e.participantId !== currentParticipantId && !e.isWO && e.placement === placement,
    ).length;
    return countOther >= maxAllowed;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="section-title">Torneos de Tarreo</h1>
            <span className="badge badge-cyan">Puntos a Personas · Premio General</span>
          </div>
          <p className="section-subtitle">
            Valorant, Rocket League, Fortnite, Brawl y actividades personalizadas. No suman a la Copa de Alianzas.
          </p>
        </div>
        <button type="button" className="btn btn-cyan" onClick={onOpenCustomModal}>
          <Plus size={15} />
          <span>Nuevo Torneo de Tarreo</span>
        </button>
      </div>

      <div className="split-layout">
        {/* Sidebar list */}
        <aside className="activity-list">
          {tournaments.map((t) => {
            const count = t.entries.filter((e) => !e.isWO).length;
            return (
              <button
                key={t.id}
                type="button"
                className={`activity-item ${t.id === activeTournament.id ? 'active' : ''}`}
                onClick={() => onSelectId(t.id)}
              >
                <div className="activity-item-title">
                  <span>{t.name}</span>
                  {!t.isOfficial && <span className="badge badge-violet">Custom</span>}
                </div>
                <div className="activity-item-meta">
                  <span>{t.schedule}</span>
                  <span className="tabular">{count} jug.</span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Active Tournament Detail */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.3rem' }}>{activeTournament.name}</h2>
                <span className="badge badge-cyan">{activeTournament.schedule}</span>
                {maxTeamsLimit !== undefined && (
                  <span className={`badge tabular ${capacityReached ? 'badge-warning' : ''}`}>
                    {activeTournament.format === 'duplas' ? 'Duplas' : 'Equipos'}: {totalTeamsCount}/{maxTeamsLimit} (máx. {maxPlayersLimit} jug.)
                  </span>
                )}
                {maxTeamsLimit === undefined && maxPlayersLimit !== undefined && (
                  <span className={`badge tabular ${capacityReached ? 'badge-warning' : ''}`}>
                    Cupos: {activeTournament.entries.length}/{maxPlayersLimit} jug.
                  </span>
                )}
                {activeTournament.alwaysFullScale && activeTournament.isOfficial && (
                  <span className="badge badge-crimson">Siempre escala completa</span>
                )}
                {activeTournament.sharedThirdFourth && (
                  <span className="badge badge-warning">3.º y 4.º compartidos</span>
                )}
                {activeTournament.scoringMode === 'direct' && (
                  <span className="badge badge-violet">Puntaje directo</span>
                )}
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                {activeTournament.description}
              </p>
            </div>

            {!activeTournament.isOfficial && (
              <button
                type="button"
                className="btn btn-danger-ghost btn-sm"
                onClick={() => {
                  if (window.confirm(`¿Eliminar la actividad "${activeTournament.name}"?`)) {
                    onRemoveCustomTournament(activeTournament.id);
                  }
                }}
              >
                <Trash2 size={14} />
                <span>Eliminar</span>
              </button>
            )}
          </div>

          <ActivityRulesCard key={activeTournament.id} activityId={activeTournament.id} accent="cyan" />

          {/* Scale info bar */}
          {activeTournament.scoringMode === 'placement' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Escala activa:</span>
                <strong className="tabular">
                  1.º {currentScaleValues[0]} · 2.º {currentScaleValues[1]} ·{' '}
                  {activeTournament.sharedThirdFourth ? (
                    <>3.º/4.º {(currentScaleValues[2] + currentScaleValues[3]) / 2} c/u</>
                  ) : (
                    <>
                      3.º {currentScaleValues[2]} · 4.º {currentScaleValues[3]}
                    </>
                  )}
                </strong>
                <span style={{ color: 'var(--text-secondary)' }}>
                  (+{activeTournament.participationBonus} por jugar · -{activeTournament.woPenalty} W.O.)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {activeTournament.format === 'equipos' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tamaño de equipo:</span>
                    <select
                      className="select select-sm"
                      style={{ width: 'auto' }}
                      value={teamSize}
                      onChange={(e) =>
                        onUpdateTournament(activeTournament.id, (t) => ({
                          ...t,
                          teamSize: Number(e.target.value),
                        }))
                      }
                    >
                      <option value={4}>4 jugadores (4v4: máx. 4 equipos)</option>
                      <option value={5}>5 jugadores (5v5: máx. 3 equipos)</option>
                    </select>
                  </div>
                )}

                {activeTournament.isOfficial && !activeTournament.alwaysFullScale && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Modo escala:</span>
                    <select
                      className="select select-sm"
                      style={{ width: 'auto' }}
                      value={activeTournament.scaleOverride}
                      onChange={(e) =>
                        onUpdateTournament(activeTournament.id, (t) => ({
                          ...t,
                          scaleOverride: e.target.value as ScaleOverride,
                        }))
                      }
                    >
                      <option value="auto">
                        Auto ({activeCount >= 4 && activeCount <= 7 ? 'Reducida' : 'Normal'})
                      </option>
                      <option value="full">Forzar Normal (10/7/5/3)</option>
                      <option value="reduced">Forzar Reducida (5/4/3/2)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Team / Duo builder bar */}
          {showTeamColumn && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(0, 212, 232, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 280px' }}>
                  <label
                    htmlFor="active-team-input"
                    style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}
                  >
                    {activeTournament.format === 'duplas' ? 'Dupla activa:' : 'Equipo activo:'}
                  </label>
                  <input
                    id="active-team-input"
                    className="input input-sm"
                    style={{ maxWidth: 260 }}
                    placeholder={
                      activeTournament.format === 'duplas'
                        ? 'Nombre de la dupla...'
                        : 'Nombre del grupo...'
                    }
                    value={activeTeamName}
                    onChange={(e) => {
                      setActiveTeamName(e.target.value);
                      setClosedNotice(null);
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge tabular ${currentTeamFull ? 'badge-success' : 'badge-cyan'}`}>
                    {currentTeamFull ? (
                      <>
                        <Lock size={11} />
                        <span>
                          Cupo completo: {currentTeamCount}/{teamSize}
                        </span>
                      </>
                    ) : (
                      <span>
                        Cupos: {currentTeamCount}/{teamSize}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Al llegar a {teamSize} se cierra solo y pasa al siguiente grupo.
                  </span>
                </div>
              </div>

              {closedNotice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: 'var(--success)' }}>
                  <CheckCircle2 size={14} />
                  <span>{closedNotice}</span>
                </div>
              )}

              {capacityReached && (
                <div style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>
                  Cupo máximo alcanzado ({maxTeamsLimit ? `${maxTeamsLimit} ${activeTournament.format === 'duplas' ? 'duplas' : 'equipos'}` : `${maxPlayersLimit} jugadores`}): los siguientes ingresos pasan a lista de espera según las bases.
                </div>
              )}
            </div>
          )}

          {/* Enroll existing or quick-add student */}
          <div className="enroll-grid">
            <div>
              <label className="label">Inscribir participante existente</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="select select-sm"
                  value={pickParticipantId}
                  onChange={(e) => setPickParticipantId(e.target.value)}
                >
                  <option value="">
                    {availableParticipants.length === 0
                      ? 'No hay más participantes disponibles'
                      : 'Seleccionar estudiante...'}
                  </option>
                  {availableParticipants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.career})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddExisting}
                  disabled={!pickParticipantId}
                >
                  Agregar
                </button>
              </div>
            </div>

            <form onSubmit={handleQuickCreateAndEnroll}>
              <label className="label">Registro rápido e inscripción directa</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input input-sm"
                  placeholder="Nombre del estudiante..."
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                />
                <select
                  className="select select-sm"
                  style={{ maxWidth: 175 }}
                  value={quickCareer}
                  onChange={(e) => setQuickCareer(e.target.value as Career)}
                >
                  {CAREERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!quickName.trim()}
                >
                  <UserPlus size={14} />
                  <span>Crear</span>
                </button>
              </div>
            </form>
          </div>

          {/* Entries table */}
          {activeTournament.entries.length === 0 ? (
            <div className="empty-state">
              <p>Aún no hay jugadores inscritos en {activeTournament.name}.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Jugador</th>
                    {showTeamColumn && (
                      <th>{activeTournament.format === 'duplas' ? 'Dupla' : 'Equipo'}</th>
                    )}
                    <th style={{ width: 175 }}>
                      {activeTournament.scoringMode === 'direct' ? 'Puntaje' : 'Posición'}
                    </th>
                    <th className="text-center" style={{ width: 90 }}>
                      W.O.
                    </th>
                    <th className="text-right" style={{ width: 100 }}>
                      Total
                    </th>
                    <th style={{ width: 44 }} />
                  </tr>
                </thead>
                <tbody>
                  {showTeamColumn
                    ? groupedTeams.map(([teamName, members]) => {
                        const isClosed = teamName !== 'Sin equipo' && members.length >= teamSize;
                        const activeMembers = members.filter((m) => !m.isWO);
                        const sharedPlacement =
                          activeMembers.length > 0 &&
                          activeMembers.every((m) => m.placement === activeMembers[0].placement)
                            ? activeMembers[0].placement
                            : null;

                        return (
                          <React.Fragment key={teamName}>
                            <tr style={{ background: 'var(--bg-elevated)' }}>
                              <td colSpan={2}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '0.9rem' }}>{teamName}</strong>
                                  <span className={`badge tabular ${isClosed ? 'badge-success' : 'badge-warning'}`}>
                                    {isClosed ? (
                                      <>
                                        <Lock size={11} />
                                        <span>
                                          Cerrado: {members.length}/{teamSize}
                                        </span>
                                      </>
                                    ) : (
                                      <span>
                                        Abierto: {members.length}/{teamSize}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {teamName !== 'Sin equipo' && activeTournament.scoringMode === 'placement' && (
                                  <select
                                    className="select select-sm"
                                    aria-label={`Posición del grupo ${teamName}`}
                                    value={sharedPlacement ?? ''}
                                    onChange={(e) =>
                                      setTeamPlacement(
                                        teamName,
                                        e.target.value ? Number(e.target.value) : null,
                                      )
                                    }
                                  >
                                    <option value="">Lugar del grupo...</option>
                                    {[1, 2, 3, 4].map((pos) => {
                                      const takenBy = isTeamPlacementTaken(pos, teamName);
                                      return (
                                        <option key={pos} value={pos} disabled={takenBy !== null}>
                                          {pos}.º lugar {takenBy ? `(ocupado: ${takenBy})` : '(todo el grupo)'}
                                        </option>
                                      );
                                    })}
                                  </select>
                                )}
                              </td>
                              <td colSpan={3} />
                            </tr>
                            {members.map((entry) => {
                              const player = participants.find((p) => p.id === entry.participantId);
                              if (!player) return null;
                              const pts = calculateTournamentEntryPoints(activeTournament, entry);
                              return (
                                <tr key={entry.participantId}>
                                  <td style={{ paddingLeft: 24 }}>
                                    <div style={{ fontWeight: 500 }}>{player.name}</div>
                                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                      {player.career}
                                    </div>
                                  </td>
                                  <td>
                                    <input
                                      className="input input-sm"
                                      style={{ maxWidth: 160 }}
                                      placeholder={
                                        activeTournament.format === 'duplas'
                                          ? 'Ej: Dupla 1'
                                          : 'Ej: Equipo 1'
                                      }
                                      value={entry.teamName ?? ''}
                                      onChange={(e) =>
                                        onUpsertEntry(activeTournament.id, {
                                          ...entry,
                                          teamName: e.target.value,
                                        })
                                      }
                                    />
                                  </td>
                                  <td>
                                    <select
                                      className="select select-sm"
                                      disabled={entry.isWO}
                                      value={entry.placement ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value ? Number(e.target.value) : null;
                                        if (teamName !== 'Sin equipo') {
                                          setTeamPlacement(teamName, val);
                                        } else {
                                          setSinglePlacement(entry.participantId, val);
                                        }
                                      }}
                                    >
                                      <option value="">Participó (+{activeTournament.participationBonus})</option>
                                      {[1, 2, 3, 4].map((pos) => {
                                        const takenBy =
                                          teamName !== 'Sin equipo'
                                            ? isTeamPlacementTaken(pos, teamName)
                                            : isSinglePlacementTaken(pos, entry.participantId)
                                              ? 'otro'
                                              : null;
                                        return (
                                          <option key={pos} value={pos} disabled={takenBy !== null}>
                                            {pos}.º lugar{takenBy ? ' (ocupado)' : ''}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </td>
                                  <td className="text-center">
                                    <input
                                      type="checkbox"
                                      checked={entry.isWO}
                                      aria-label={`Marcar W.O. para ${player.name}`}
                                      onChange={(e) =>
                                        onUpsertEntry(activeTournament.id, {
                                          ...entry,
                                          isWO: e.target.checked,
                                          placement: e.target.checked ? null : entry.placement,
                                        })
                                      }
                                      style={{ margin: '0 auto' }}
                                    />
                                  </td>
                                  <td className="text-right font-display tabular" style={{ fontWeight: 700 }}>
                                    <span
                                      style={{
                                        color:
                                          pts < 0
                                            ? 'var(--danger)'
                                            : pts > activeTournament.participationBonus
                                              ? 'var(--accent-cyan)'
                                              : 'var(--text-primary)',
                                      }}
                                    >
                                      {pts > 0 ? `+${pts}` : pts}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-danger-ghost btn-icon"
                                      onClick={() =>
                                        onRemoveEntry(activeTournament.id, entry.participantId)
                                      }
                                      title="Quitar del torneo"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })
                    : activeTournament.entries.map((entry) => {
                        const player = participants.find((p) => p.id === entry.participantId);
                        if (!player) return null;
                        const pts = calculateTournamentEntryPoints(activeTournament, entry);

                        return (
                          <tr key={entry.participantId}>
                            <td>
                              <div style={{ fontWeight: 500 }}>{player.name}</div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                {player.career}
                              </div>
                            </td>

                            <td>
                              {activeTournament.scoringMode === 'direct' ? (
                                <input
                                  type="number"
                                  className="input input-sm tabular"
                                  style={{ maxWidth: 110 }}
                                  disabled={entry.isWO}
                                  value={entry.directPoints}
                                  onChange={(e) =>
                                    onUpsertEntry(activeTournament.id, {
                                      ...entry,
                                      directPoints: Number(e.target.value),
                                    })
                                  }
                                />
                              ) : (
                                <select
                                  className="select select-sm"
                                  disabled={entry.isWO}
                                  value={entry.placement ?? ''}
                                  onChange={(e) =>
                                    setSinglePlacement(
                                      entry.participantId,
                                      e.target.value ? Number(e.target.value) : null,
                                    )
                                  }
                                >
                                  <option value="">Participó (+{activeTournament.participationBonus})</option>
                                  <option value="1" disabled={isSinglePlacementTaken(1, entry.participantId)}>
                                    1.º lugar{isSinglePlacementTaken(1, entry.participantId) ? ' (ocupado)' : ''}
                                  </option>
                                  <option value="2" disabled={isSinglePlacementTaken(2, entry.participantId)}>
                                    2.º lugar{isSinglePlacementTaken(2, entry.participantId) ? ' (ocupado)' : ''}
                                  </option>
                                  {activeTournament.sharedThirdFourth ? (
                                    <option value="3" disabled={isSinglePlacementTaken(3, entry.participantId)}>
                                      3.º / 4.º compartido{isSinglePlacementTaken(3, entry.participantId) ? ' (2/2 ocupado)' : ''}
                                    </option>
                                  ) : (
                                    <>
                                      <option value="3" disabled={isSinglePlacementTaken(3, entry.participantId)}>
                                        3.º lugar{isSinglePlacementTaken(3, entry.participantId) ? ' (ocupado)' : ''}
                                      </option>
                                      <option value="4" disabled={isSinglePlacementTaken(4, entry.participantId)}>
                                        4.º lugar{isSinglePlacementTaken(4, entry.participantId) ? ' (ocupado)' : ''}
                                      </option>
                                    </>
                                  )}
                                </select>
                              )}
                            </td>

                            <td className="text-center">
                              <input
                                type="checkbox"
                                checked={entry.isWO}
                                aria-label={`Marcar W.O. para ${player.name}`}
                                onChange={(e) =>
                                  onUpsertEntry(activeTournament.id, {
                                    ...entry,
                                    isWO: e.target.checked,
                                    placement: e.target.checked ? null : entry.placement,
                                  })
                                }
                                style={{ margin: '0 auto' }}
                              />
                            </td>

                            <td className="text-right font-display tabular" style={{ fontWeight: 700 }}>
                              <span
                                style={{
                                  color:
                                    pts < 0
                                      ? 'var(--danger)'
                                      : pts > activeTournament.participationBonus
                                        ? 'var(--accent-cyan)'
                                        : 'var(--text-primary)',
                                }}
                              >
                                {pts > 0 ? `+${pts}` : pts}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn-danger-ghost btn-icon"
                                onClick={() =>
                                  onRemoveEntry(activeTournament.id, entry.participantId)
                                }
                                title="Quitar del torneo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          )}

          {/* Premio del campeón (para torneos por equipo/dupla: Valorant y Rocket League) */}
          {showTeamColumn && (
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderLeft: '3px solid var(--gold)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {(() => {
                const championTeam = groupedTeams.find(
                  ([tName, members]) =>
                    tName !== 'Sin equipo' &&
                    members.some((m) => !m.isWO && m.placement === 1),
                );
                const championCandidates = championTeam
                  ? championTeam[1]
                      .map((m) => participants.find((p) => p.id === m.participantId))
                      .filter((p): p is Participant => Boolean(p))
                  : activeTournament.entries
                      .map((m) => participants.find((p) => p.id === m.participantId))
                      .filter((p): p is Participant => Boolean(p));

                const res = activeTournament.prizeResolution ?? {
                  method: '' as PrizeDecisionMethod,
                  winnerParticipantId: '',
                  note: '',
                };

                const updatePrize = (
                  patch: Partial<{
                    method: PrizeDecisionMethod;
                    winnerParticipantId: string;
                    note: string;
                  }>,
                ) => {
                  onUpdateTournament(activeTournament.id, (t) => ({
                    ...t,
                    prizeResolution: {
                      method: t.prizeResolution?.method ?? '',
                      winnerParticipantId: t.prizeResolution?.winnerParticipantId ?? '',
                      note: t.prizeResolution?.note ?? '',
                      ...patch,
                    },
                  }));
                };

                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Trophy size={16} color="var(--gold)" />
                        <strong style={{ fontSize: '0.94rem' }}>
                          Premio del campeón (1 premio por torneo)
                        </strong>
                      </div>
                      {championTeam ? (
                        <span className="badge badge-success">
                          1.º lugar: {championTeam[0]}
                        </span>
                      ) : (
                        <span className="badge">Asigna 1.º lugar para filtrar ganadores</span>
                      )}
                    </div>

                    <div className="grid-3" style={{ gap: 12 }}>
                      <div>
                        <label className="label" htmlFor="prize-method">
                          Cómo lo define el equipo ganador
                        </label>
                        <select
                          id="prize-method"
                          className="select select-sm"
                          value={res.method}
                          onChange={(e) =>
                            updatePrize({ method: e.target.value as PrizeDecisionMethod })
                          }
                        >
                          <option value="">Seleccionar opción...</option>
                          <option value="mini-1v1">1) Mini torneo 1 contra 1 entre ellos</option>
                          <option value="acuerdo">2) Acuerdo de todos (deciden por su cuenta)</option>
                        </select>
                      </div>

                      <div>
                        <label className="label" htmlFor="prize-winner">
                          Quién se queda con el premio
                        </label>
                        <select
                          id="prize-winner"
                          className="select select-sm"
                          value={res.winnerParticipantId ?? ''}
                          onChange={(e) =>
                            updatePrize({ winnerParticipantId: e.target.value })
                          }
                        >
                          <option value="">Por definir...</option>
                          {championCandidates.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.career})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label" htmlFor="prize-note">
                          Detalle o acuerdo (opcional)
                        </label>
                        <input
                          id="prize-note"
                          className="input input-sm"
                          placeholder="Ej: Ganó 1v1 interno o lo comparten"
                          value={res.note ?? ''}
                          onChange={(e) => updatePrize({ note: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
