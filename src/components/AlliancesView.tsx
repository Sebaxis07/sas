import React, { useEffect, useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Lock, Plus, Trash2, Unlock } from 'lucide-react';
import { ALLIANCES, ALLIANCE_IDS } from '../data/defaults';
import { ActivityRulesCard } from './ActivityRulesCard';
import {
  calculateAllianceActivityPoints,
  calculateAllianceStandings,
  calculateCazatesorosRanks,
  calculateCazatesorosRawScores,
  calculateJustDanceRawScores,
  calculateMimicaRawScores,
  ranksFromScores,
} from '../domain/scoring';
import {
  AllianceActivity,
  AllianceAdjustment,
  AllianceId,
  CazatesorosAllianceCounts,
  Day19Activity,
} from '../types/tarreo';

interface AlliancesViewProps {
  activities: AllianceActivity[];
  day19Activities: Day19Activity[];
  adjustments: AllianceAdjustment[];
  allianceGoal: number;
  selectedId: string;
  onSelectId: (id: string) => void;
  onUpdateActivity: (
    activityId: string,
    updater: (a: AllianceActivity) => AllianceActivity,
  ) => void;
  onRemoveCustomActivity: (activityId: string) => void;
  onUpdateDay19Points: (activityId: string, allianceId: AllianceId, points: number) => void;
  onUpdateDay19Meta: (activityId: string, name: string, note: string) => void;
  onAddDay19Activity: (name: string) => void;
  onRemoveDay19Activity: (activityId: string) => void;
  onAddAdjustment: (allianceId: AllianceId, points: number, reason: string) => void;
  onRemoveAdjustment: (adjustmentId: string) => void;
  onOpenCustomModal: () => void;
}

export const AlliancesView: React.FC<AlliancesViewProps> = ({
  activities,
  day19Activities,
  adjustments,
  allianceGoal,
  selectedId,
  onSelectId,
  onUpdateActivity,
  onRemoveCustomActivity,
  onUpdateDay19Points,
  onUpdateDay19Meta,
  onAddDay19Activity,
  onRemoveDay19Activity,
  onAddAdjustment,
  onRemoveAdjustment,
  onOpenCustomModal,
}) => {
  const [activeSection, setActiveSection] = useState<'tarreo' | 'day19' | 'adjustments'>('tarreo');
  const [showCalculator, setShowCalculator] = useState(false);
  const [adjAlliance, setAdjAlliance] = useState<AllianceId>('terror');
  const [adjPoints, setAdjPoints] = useState<string>('');
  const [adjReason, setAdjReason] = useState('');
  const [day19Unlocked, setDay19Unlocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [day19Password, setDay19Password] = useState('');
  const [day19AuthError, setDay19AuthError] = useState(false);
  const [newDay19Name, setNewDay19Name] = useState('');

  const handleUnlockDay19 = (e: React.FormEvent) => {
    e.preventDefault();
    if (day19Password === 'Dpastora2') {
      setDay19Unlocked(true);
      setShowUnlockPrompt(false);
      setDay19Password('');
      setDay19AuthError(false);
    } else {
      setDay19AuthError(true);
    }
  };

  const handleAddDay19 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDay19Name.trim()) return;
    onAddDay19Activity(newDay19Name);
    setNewDay19Name('');
  };

  const active = activities.find((a) => a.id === selectedId) ?? activities[0];
  const standings = calculateAllianceStandings(
    activities,
    day19Activities,
    adjustments,
    allianceGoal,
  );

  const handleAddAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(adjPoints);
    if (!Number.isFinite(numeric) || numeric === 0 || !adjReason.trim()) return;
    onAddAdjustment(adjAlliance, numeric, adjReason);
    setAdjPoints('');
    setAdjReason('');
  };

  useEffect(() => {
    if (!activities.some((a) => a.id === selectedId) && activities[0]) {
      onSelectId(activities[0].id);
    }
  }, [activities, selectedId, onSelectId]);

  if (!active) return null;

  const currentPts = calculateAllianceActivityPoints(active);

  const applyCalculatedRanks = (rawScores: Record<AllianceId, number>) => {
    const ranks = ranksFromScores(rawScores, active.disqualified);
    onUpdateActivity(active.id, (a) => ({
      ...a,
      ranks,
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="section-title">Torneos de Alianza</h1>
            <span className="badge badge-crimson">Copa de Alianzas</span>
          </div>
          <p className="section-subtitle">
            Cazatesoros, Just Dance, Mímica gamer y actividades personalizadas · Suman puntos solo a Terror, Shooter y Action.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onOpenCustomModal}>
          <Plus size={15} />
          <span>Nuevo Torneo de Alianza</span>
        </button>
      </div>

      {/* Tabla General de Alianzas hacia la meta de 32.000 */}
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ fontSize: '1.05rem' }}>Tabla General de Alianzas</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Puntaje de partida del día 19 más Copa de Alianzas del Tarreo y ajustes manuales: meta oficial {allianceGoal.toLocaleString('es-CL')} puntos
            </p>
          </div>
          <span className="badge badge-crimson tabular">
            Meta oficial: {allianceGoal.toLocaleString('es-CL')}
          </span>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Alianza</th>
                <th className="text-right">Día 19</th>
                <th className="text-right">Tarreo</th>
                <th className="text-right">Ajustes</th>
                <th className="text-right">Total</th>
                <th style={{ width: 210 }}>Meta {allianceGoal.toLocaleString('es-CL')}</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => {
                const meta = ALLIANCES.find((a) => a.id === row.id)!;
                const pct = Math.min(Math.max(row.goalPercent, 0), 100);
                return (
                  <tr key={row.id}>
                    <td className="font-display tabular" style={{ fontWeight: 700, color: row.rank === 1 ? 'var(--gold)' : 'var(--text-secondary)' }}>
                      {row.rank}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: meta.color,
                          }}
                        />
                        <span style={{ fontWeight: 700 }}>{meta.name}</span>
                      </div>
                    </td>
                    <td className="text-right tabular">{row.day19Points.toLocaleString('es-CL')}</td>
                    <td className="text-right tabular">{row.tarreoPoints.toLocaleString('es-CL')}</td>
                    <td
                      className="text-right tabular"
                      style={{
                        color:
                          row.adjustmentPoints > 0
                            ? 'var(--success)'
                            : row.adjustmentPoints < 0
                              ? 'var(--danger)'
                              : 'var(--text-secondary)',
                      }}
                    >
                      {row.adjustmentPoints > 0
                        ? `+${row.adjustmentPoints.toLocaleString('es-CL')}`
                        : row.adjustmentPoints.toLocaleString('es-CL')}
                    </td>
                    <td className="text-right font-display tabular" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {row.totalPoints.toLocaleString('es-CL')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span className="tabular" style={{ fontWeight: 600 }}>
                            {row.goalPercent.toFixed(1)}%
                          </span>
                          <span className="tabular" style={{ color: 'var(--text-secondary)' }}>
                            Faltan: {Math.max(allianceGoal - row.totalPoints, 0).toLocaleString('es-CL')}
                          </span>
                        </div>
                        <div className="alliance-bar-track">
                          <div
                            className="alliance-bar-fill"
                            style={{ width: `${pct}%`, background: meta.color }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sub-navegación limpia del módulo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div className="subtabs" role="tablist" aria-label="Secciones de Torneos de Alianza">
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === 'tarreo'}
            className={`subtab ${activeSection === 'tarreo' ? 'active' : ''}`}
            onClick={() => setActiveSection('tarreo')}
          >
            <span>Actividades del Tarreo</span>
            <span className="badge tabular">{activities.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === 'day19'}
            className={`subtab ${activeSection === 'day19' ? 'active' : ''}`}
            onClick={() => setActiveSection('day19')}
          >
            <span>Día 19: Puntaje de partida</span>
            <span className="badge tabular">{day19Activities.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === 'adjustments'}
            className={`subtab ${activeSection === 'adjustments' ? 'active' : ''}`}
            onClick={() => setActiveSection('adjustments')}
          >
            <span>Ajustes manuales</span>
            <span className="badge tabular">{adjustments.length}</span>
          </button>
        </div>
      </div>

      {activeSection === 'tarreo' && (
      <div className="split-layout">
        {/* Sidebar list */}
        <aside className="activity-list">
          {activities.map((act) => {
            const pts = calculateAllianceActivityPoints(act);
            const sum = pts.terror + pts.shooter + pts.action;
            return (
              <button
                key={act.id}
                type="button"
                className={`activity-item ${act.id === active.id ? 'active' : ''}`}
                onClick={() => {
                  onSelectId(act.id);
                  setShowCalculator(false);
                }}
              >
                <div className="activity-item-title">
                  <span>{act.name}</span>
                  {!act.isOfficial && <span className="badge badge-violet">Custom</span>}
                </div>
                <div className="activity-item-meta">
                  <span>{act.schedule}</span>
                  <span className="tabular">{sum > 0 ? 'Registrada' : 'Pendiente'}</span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Active Alliance Activity */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.3rem' }}>{active.name}</h2>
                <span className="badge badge-cyan">{active.schedule}</span>
                {active.scoringMode === 'placement' ? (
                  <span className="badge tabular">
                    1.º {active.placementPoints[0]} · 2.º {active.placementPoints[1]} · 3.º{' '}
                    {active.placementPoints[2]}
                  </span>
                ) : (
                  <span className="badge badge-violet">Puntaje directo</span>
                )}
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                {active.description}
              </p>
            </div>

            {!active.isOfficial && (
              <button
                type="button"
                className="btn btn-danger-ghost btn-sm"
                onClick={() => {
                  if (window.confirm(`¿Eliminar la actividad "${active.name}"?`)) {
                    onRemoveCustomActivity(active.id);
                  }
                }}
              >
                <Trash2 size={14} />
                <span>Eliminar</span>
              </button>
            )}
          </div>

          <ActivityRulesCard key={active.id} activityId={active.id} accent="crimson" />

          {/* Special Cazatesoros switch */}
          {active.calculatorKind === 'cazatesoros' && active.cazatesoros && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: active.cazatesoros.nobodyFoundAnything
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                fontSize: '0.84rem',
              }}
            >
              <input
                type="checkbox"
                checked={active.cazatesoros.nobodyFoundAnything}
                onChange={(e) =>
                  onUpdateActivity(active.id, (a) => ({
                    ...a,
                    cazatesoros: {
                      ...a.cazatesoros!,
                      nobodyFoundAnything: e.target.checked,
                    },
                  }))
                }
                style={{ margin: 0 }}
              />
              <span>
                <strong>Regla especial:</strong> Nadie encontró tesoros: otorgar{' '}
                <strong className="tabular">950 puntos</strong> a las tres alianzas.
              </span>
            </label>
          )}

          {/* Main Scoring Table */}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Alianza</th>
                  <th style={{ width: 200 }}>
                    {active.scoringMode === 'direct' ? 'Puntaje asignado' : 'Lugar obtenido'}
                  </th>
                  <th className="text-center" style={{ width: 120 }}>
                    Descalificada
                  </th>
                  <th className="text-right" style={{ width: 130 }}>
                    Puntos Copa
                  </th>
                </tr>
              </thead>
              <tbody>
                {ALLIANCES.map((meta) => {
                  const isDQ = active.disqualified[meta.id];
                  const disabledPlacement =
                    isDQ ||
                    (active.calculatorKind === 'cazatesoros' &&
                      Boolean(active.cazatesoros?.nobodyFoundAnything));

                  return (
                    <tr key={meta.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: meta.color,
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>{meta.name}</span>
                        </div>
                      </td>

                      <td>
                        {active.scoringMode === 'direct' ? (
                          <input
                            type="number"
                            className="input input-sm tabular"
                            style={{ maxWidth: 140 }}
                            disabled={isDQ}
                            value={active.directPoints[meta.id]}
                            onChange={(e) =>
                              onUpdateActivity(active.id, (a) => ({
                                ...a,
                                directPoints: {
                                  ...a.directPoints,
                                  [meta.id]: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        ) : (
                          <select
                            className="select select-sm"
                            disabled={disabledPlacement}
                            value={active.ranks[meta.id] ?? ''}
                            onChange={(e) =>
                              onUpdateActivity(active.id, (a) => ({
                                ...a,
                                ranks: {
                                  ...a.ranks,
                                  [meta.id]: e.target.value ? Number(e.target.value) : null,
                                },
                              }))
                            }
                          >
                            <option value="">Sin asignar</option>
                            <option value="1">1.º lugar</option>
                            <option value="2">2.º lugar</option>
                            <option value="3">3.º lugar</option>
                          </select>
                        )}
                      </td>

                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={isDQ}
                          aria-label={`Descalificar a ${meta.name}`}
                          onChange={(e) =>
                            onUpdateActivity(active.id, (a) => ({
                              ...a,
                              disqualified: {
                                ...a.disqualified,
                                [meta.id]: e.target.checked,
                              },
                            }))
                          }
                          style={{ margin: '0 auto' }}
                        />
                      </td>

                      <td className="text-right font-display tabular" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                        {isDQ ? (
                          <span className="badge badge-danger">0 (DQ)</span>
                        ) : (
                          <span>{currentPts[meta.id].toLocaleString('es-CL')} pts</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Tip: Si dos o tres alianzas empatan, asígnales el mismo lugar (ej. ambas en 1.º) y el sistema repartirá los puntos automáticamente.
          </p>

          {/* Optional Built-in Calculator for Official Activities */}
          {active.calculatorKind !== 'none' && (
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 16,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCalculator((v) => !v)}
              >
                <Calculator size={14} />
                <span>
                  {showCalculator ? 'Ocultar' : 'Abrir'} calculadora de {active.name}
                </span>
                {showCalculator ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showCalculator && active.calculatorKind === 'cazatesoros' && active.cazatesoros && (
                <CazatesorosCalculator
                  activity={active}
                  onUpdate={(updater) => onUpdateActivity(active.id, updater)}
                  onApplyRanks={(ranks) =>
                    onUpdateActivity(active.id, (a) => ({
                      ...a,
                      ranks,
                    }))
                  }
                />
              )}

              {showCalculator && active.calculatorKind === 'just-dance' && active.justDance && (
                <JustDanceCalculator
                  activity={active}
                  onUpdate={(updater) => onUpdateActivity(active.id, updater)}
                  onApply={applyCalculatedRanks}
                />
              )}

              {showCalculator && active.calculatorKind === 'mimica-gamer' && active.mimica && (
                <MimicaCalculator
                  activity={active}
                  onUpdate={(updater) => onUpdateActivity(active.id, updater)}
                  onApply={applyCalculatedRanks}
                />
              )}
            </div>
          )}
        </section>
      </div>
      )}

      {activeSection === 'day19' && (
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem' }}>Puntaje de partida: Jueves 19 de noviembre</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Reparto por lugar: 1.º 100%, 2.º 60%, 3.º 30%. Desbloquea con contraseña para editar cualquier actividad.
              </p>
            </div>
            {day19Unlocked ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDay19Unlocked(false)}
              >
                <Lock size={14} />
                <span>Bloquear edición</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowUnlockPrompt((v) => !v);
                  setDay19AuthError(false);
                }}
              >
                <Unlock size={14} />
                <span>Personalizar día 19</span>
              </button>
            )}
          </div>

          {showUnlockPrompt && !day19Unlocked && (
            <form
              onSubmit={handleUnlockDay19}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                padding: 10,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <input
                type="password"
                className="input input-sm"
                style={{ flex: '1 1 180px' }}
                placeholder="Ingresa la contraseña para editar el día 19"
                value={day19Password}
                onChange={(e) => {
                  setDay19Password(e.target.value);
                  setDay19AuthError(false);
                }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Desbloquear
              </button>
              {day19AuthError && (
                <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>
                  Contraseña incorrecta
                </span>
              )}
            </form>
          )}

          {day19Unlocked && (
            <form
              onSubmit={handleAddDay19}
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <input
                className="input input-sm"
                placeholder="Nueva actividad del día 19: ej. Trivia retro (1.500)"
                value={newDay19Name}
                onChange={(e) => setNewDay19Name(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-cyan btn-sm"
                disabled={!newDay19Name.trim()}
              >
                <Plus size={14} />
                <span>Agregar</span>
              </button>
            </form>
          )}

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th className="text-right">Terror</th>
                  <th className="text-right">Action</th>
                  <th className="text-right">Shooter</th>
                  {day19Unlocked && <th style={{ width: 40 }} />}
                </tr>
              </thead>
              <tbody>
                {day19Activities.map((act) => {
                  const canEditPoints = day19Unlocked;
                  return (
                    <tr key={act.id}>
                      <td>
                        {day19Unlocked ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <input
                              className="input input-sm"
                              value={act.name}
                              aria-label="Nombre actividad día 19"
                              onChange={(e) =>
                                onUpdateDay19Meta(act.id, e.target.value, act.note ?? '')
                              }
                            />
                            <input
                              className="input input-sm"
                              style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}
                              placeholder="Nota opcional"
                              value={act.note ?? ''}
                              aria-label="Nota actividad día 19"
                              onChange={(e) =>
                                onUpdateDay19Meta(act.id, act.name, e.target.value)
                              }
                            />
                          </div>
                        ) : (
                          <>
                            <div style={{ fontWeight: 500 }}>{act.name}</div>
                            {act.note && (
                              <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                                {act.note}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      {(['terror', 'action', 'shooter'] as AllianceId[]).map((id) => (
                        <td key={id} className="text-right tabular">
                          {canEditPoints ? (
                            <input
                              type="number"
                              className="input input-sm tabular text-right"
                              style={{ maxWidth: 88, marginLeft: 'auto' }}
                              value={act.points[id]}
                              aria-label={`${act.name} ${id}`}
                              onChange={(e) =>
                                onUpdateDay19Points(act.id, id, Number(e.target.value))
                              }
                            />
                          ) : (
                            act.points[id].toLocaleString('es-CL')
                          )}
                        </td>
                      ))}
                      {day19Unlocked && (
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger-ghost btn-icon"
                            onClick={() => onRemoveDay19Activity(act.id)}
                            title="Eliminar actividad del día 19"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                <tr>
                  <td style={{ fontWeight: 700 }}>Subtotal Día 19</td>
                  {(['terror', 'action', 'shooter'] as AllianceId[]).map((id) => {
                    const row = standings.find((s) => s.id === id);
                    return (
                      <td key={id} className="text-right font-display tabular" style={{ fontWeight: 700 }}>
                        {(row?.day19Points ?? 0).toLocaleString('es-CL')}
                      </td>
                    );
                  })}
                  {day19Unlocked && <td />}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeSection === 'adjustments' && (
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.05rem' }}>Ajustes manuales de puntaje</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Suma o resta puntos a mano a cualquier alianza indicando un motivo escrito.
            </p>
          </div>

          <form onSubmit={handleAddAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="grid-2" style={{ gap: 10 }}>
              <div>
                <label className="label" htmlFor="adj-alliance">
                  Alianza
                </label>
                <select
                  id="adj-alliance"
                  className="select select-sm"
                  value={adjAlliance}
                  onChange={(e) => setAdjAlliance(e.target.value as AllianceId)}
                >
                  {ALLIANCES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="adj-points">
                  Puntos (+ o negativo)
                </label>
                <input
                  id="adj-points"
                  type="number"
                  className="input input-sm tabular"
                  placeholder="Ej: 500 o -200"
                  value={adjPoints}
                  onChange={(e) => setAdjPoints(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="adj-reason">
                Motivo escrito
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="adj-reason"
                  className="input input-sm"
                  placeholder="Ej: Corrección de puntaje o bonificación"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!adjReason.trim() || !adjPoints || Number(adjPoints) === 0}
                >
                  Aplicar
                </button>
              </div>
            </div>
          </form>

          {adjustments.length === 0 ? (
            <div className="empty-state" style={{ padding: '18px 12px' }}>
              <p>No hay ajustes manuales registrados.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Alianza</th>
                    <th>Motivo</th>
                    <th className="text-right">Puntos</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {adjustments.map((adj) => {
                    const meta = ALLIANCES.find((a) => a.id === adj.allianceId)!;
                    return (
                      <tr key={adj.id}>
                        <td style={{ fontWeight: 600 }}>{meta.name}</td>
                        <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          {adj.reason}
                        </td>
                        <td
                          className="text-right font-display tabular"
                          style={{
                            fontWeight: 700,
                            color: adj.points > 0 ? 'var(--success)' : 'var(--danger)',
                          }}
                        >
                          {adj.points > 0 ? `+${adj.points}` : adj.points}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger-ghost btn-icon"
                            onClick={() => onRemoveAdjustment(adj.id)}
                            title="Eliminar ajuste"
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
        </section>
      )}
    </div>
  );
};

/* --- Sub-calculators --- */

const CAZATESOROS_ITEMS: Array<{
  key: keyof CazatesorosAllianceCounts;
  label: string;
  sublabel: string;
  odds: string;
  weightLabel: string;
  isJackpot?: boolean;
}> = [
  {
    key: 'solidGoldMiku',
    label: 'Solid Gold Miku',
    sublabel: 'Traje',
    odds: '1 en 1.562.500',
    weightLabel: 'JACKPOT (1.º)',
    isJackpot: true,
  },
  {
    key: 'pirateShop',
    label: 'Pirate Shop Access',
    sublabel: 'Acceso a la tienda (token)',
    odds: '1 en 137.500',
    weightLabel: 'JACKPOT (1.º)',
    isJackpot: true,
  },
  {
    key: 'corvette',
    label: 'Corvette ZR1 dorado',
    sublabel: 'Vehículo',
    odds: '1 en 7.813',
    weightLabel: '×10 pts',
  },
  {
    key: 'mochila',
    label: 'Miku’s Takarabako',
    sublabel: 'Adorno de mochila',
    odds: '1 en 568',
    weightLabel: '×4 pts',
  },
  {
    key: 'jamTrack',
    label: 'PPPP',
    sublabel: 'Jam Track',
    odds: '1 en 391',
    weightLabel: '×3 pts',
  },
  {
    key: 'pantallaCarga',
    label: 'May Fortune Find You',
    sublabel: 'Pantalla de carga',
    odds: '1 en 272',
    weightLabel: '×2 pts',
  },
  {
    key: 'gizmo',
    label: 'Gizmos',
    sublabel: 'Cosméticos pequeños',
    odds: '1 en 127',
    weightLabel: '×1 pt',
  },
];

const CazatesorosCalculator: React.FC<{
  activity: AllianceActivity;
  onUpdate: (updater: (a: AllianceActivity) => AllianceActivity) => void;
  onApplyRanks: (ranks: Record<AllianceId, number | null>) => void;
}> = ({ activity, onUpdate, onApplyRanks }) => {
  const raw = calculateCazatesorosRawScores(activity);
  const counts = activity.cazatesoros!.counts;

  const setCount = (
    id: AllianceId,
    field: keyof CazatesorosAllianceCounts,
    val: number,
  ) => {
    onUpdate((a) => {
      const prev: Partial<CazatesorosAllianceCounts> = a.cazatesoros!.counts[id] ?? {};
      return {
        ...a,
        cazatesoros: {
          ...a.cazatesoros!,
          counts: {
            ...a.cazatesoros!.counts,
            [id]: {
              gizmo: prev.gizmo ?? 0,
              pantallaCarga: prev.pantallaCarga ?? 0,
              jamTrack: prev.jamTrack ?? 0,
              mochila: prev.mochila ?? 0,
              corvette: prev.corvette ?? 0,
              pirateShop: prev.pirateShop ?? 0,
              solidGoldMiku: prev.solidGoldMiku ?? 0,
              [field]: Math.max(0, val),
            },
          },
        },
      };
    });
  };

  const hasJackpot = (id: AllianceId) => {
    const c = counts[id];
    if ((c?.solidGoldMiku || 0) > 0) return 'Solid Gold Miku';
    if ((c?.pirateShop || 0) > 0) return 'Pirate Shop';
    return null;
  };

  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Premio Semana 3</th>
              <th>Probabilidad</th>
              <th>Valor</th>
              {ALLIANCES.map((m) => (
                <th key={m.id} className="text-center" style={{ width: 96 }}>
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAZATESOROS_ITEMS.map((item) => (
              <tr key={item.key}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                    {item.sublabel}
                  </div>
                </td>
                <td className="tabular" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {item.odds}
                </td>
                <td>
                  <span className={`badge ${item.isJackpot ? 'badge-warning' : ''}`}>
                    {item.weightLabel}
                  </span>
                </td>
                {ALLIANCE_IDS.map((id) => (
                  <td key={id} className="text-center">
                    <input
                      type="number"
                      min={0}
                      className="input input-sm tabular text-center"
                      style={{ maxWidth: 68, margin: '0 auto' }}
                      value={counts[id]?.[item.key] ?? 0}
                      onChange={(e) => setCount(id, item.key, Number(e.target.value))}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ fontWeight: 700 }}>
                Resultado tesoros
              </td>
              {ALLIANCE_IDS.map((id) => {
                const jackpot = hasJackpot(id);
                return (
                  <td key={id} className="text-center font-display tabular" style={{ fontWeight: 700 }}>
                    {jackpot ? (
                      <span className="badge badge-warning">1.º ({jackpot})</span>
                    ) : (
                      <span>{raw[id]} pts</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <button
          type="button"
          className="btn btn-cyan btn-sm"
          onClick={() => onApplyRanks(calculateCazatesorosRanks(activity))}
        >
          Aplicar puestos según tesoros (Semana 3)
        </button>
      </div>
    </div>
  );
};

const JustDanceCalculator: React.FC<{
  activity: AllianceActivity;
  onUpdate: (updater: (a: AllianceActivity) => AllianceActivity) => void;
  onApply: (raw: Record<AllianceId, number>) => void;
}> = ({ activity, onUpdate, onApply }) => {
  const raw = calculateJustDanceRawScores(activity);
  const rounds = activity.justDance!.rounds;

  const setRoundRank = (roundIdx: number, id: AllianceId, val: number | null) => {
    onUpdate((a) => ({
      ...a,
      justDance: {
        rounds: a.justDance!.rounds.map((r, idx) =>
          idx === roundIdx ? { ...r, [id]: val } : r,
        ),
      },
    }));
  };

  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Ronda</th>
              {ALLIANCES.map((m) => (
                <th key={m.id}>{m.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rounds.map((round, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>
                  {idx === 4 ? 'Final (×2: 6/4/2)' : `Ronda ${idx + 1} (3/2/1)`}
                </td>
                {ALLIANCE_IDS.map((id) => (
                  <td key={id}>
                    <select
                      className="select select-sm"
                      value={round[id] ?? ''}
                      onChange={(e) =>
                        setRoundRank(idx, id, e.target.value ? Number(e.target.value) : null)
                      }
                    >
                      <option value="">—</option>
                      <option value="1">1.º</option>
                      <option value="2">2.º</option>
                      <option value="3">3.º</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{ fontWeight: 700 }}>Total rondas</td>
              {ALLIANCE_IDS.map((id) => (
                <td key={id} className="font-display tabular" style={{ fontWeight: 700 }}>
                  {raw[id]} pts
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <button
          type="button"
          className="btn btn-cyan btn-sm"
          onClick={() => onApply(raw)}
        >
          Aplicar puestos según rondas
        </button>
      </div>
    </div>
  );
};

const MimicaCalculator: React.FC<{
  activity: AllianceActivity;
  onUpdate: (updater: (a: AllianceActivity) => AllianceActivity) => void;
  onApply: (raw: Record<AllianceId, number>) => void;
}> = ({ activity, onUpdate, onApply }) => {
  const raw = calculateMimicaRawScores(activity);
  const turns = activity.mimica!.turns;

  const setTurn = (turnIdx: number, id: AllianceId, val: number) => {
    onUpdate((a) => ({
      ...a,
      mimica: {
        turns: a.mimica!.turns.map((t, idx) =>
          idx === turnIdx ? { ...t, [id]: Math.max(0, val) } : t,
        ),
      },
    }));
  };

  const maxScore = Math.max(raw.terror, raw.shooter, raw.action);
  const tiedFirst =
    maxScore > 0 && ALLIANCE_IDS.filter((id) => raw[id] === maxScore).length > 1;

  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Turno</th>
              {ALLIANCES.map((m) => (
                <th key={m.id}>{m.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turns.map((turn, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>Turno {idx + 1}</td>
                {ALLIANCE_IDS.map((id) => (
                  <td key={id}>
                    <input
                      type="number"
                      min={0}
                      className="input input-sm tabular"
                      style={{ maxWidth: 80 }}
                      value={turn[id]}
                      onChange={(e) => setTurn(idx, id, Number(e.target.value))}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{ fontWeight: 700 }}>Total aciertos</td>
              {ALLIANCE_IDS.map((id) => (
                <td key={id} className="font-display tabular" style={{ fontWeight: 700 }}>
                  {raw[id]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-cyan btn-sm"
          onClick={() => onApply(raw)}
        >
          Aplicar puestos según aciertos
        </button>
        {tiedFirst && (
          <span className="badge badge-warning">
            Empate en 1.º lugar — jugar tarjeta extra según bases
          </span>
        )}
      </div>
    </div>
  );
};
