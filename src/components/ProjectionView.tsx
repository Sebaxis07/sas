import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { ALLIANCES } from '../data/defaults';
import {
  calculateAllianceStandings,
  calculateGeneralRanking,
} from '../domain/scoring';
import { TarreoState } from '../types/tarreo';

type ProjectionMode = 'combined' | 'alliances' | 'individual';

interface ProjectionViewProps {
  state: TarreoState;
  onClose: () => void;
}

export const ProjectionView: React.FC<ProjectionViewProps> = ({ state, onClose }) => {
  const [mode, setMode] = useState<ProjectionMode>('combined');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const allianceStandings = calculateAllianceStandings(
    state.allianceActivities,
    state.day19Activities,
    state.allianceAdjustments,
    state.allianceGoal,
  );
  const ranking = calculateGeneralRanking(state.participants, state.tournaments).slice(0, 10);

  return (
    <div className="projection-shell">
      <header className="projection-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="brand-mark" style={{ height: 40, width: 12 }} />
          <div>
            <div className="projection-title">TARREO INACAP 2026</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Resultados en Vivo · Sede Antofagasta
            </div>
          </div>
        </div>

        <div className="projection-controls">
          <button
            type="button"
            className={`btn btn-sm ${mode === 'combined' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('combined')}
          >
            Combinado
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'alliances' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('alliances')}
          >
            Torneos de Alianza
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'individual' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('individual')}
          >
            Torneos de Tarreo
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            title="Salir del modo proyección (Esc)"
          >
            <X size={15} />
            <span>Salir</span>
          </button>
        </div>
      </header>

      <div className={`projection-grid ${mode === 'combined' ? 'combined' : ''}`}>
        {(mode === 'combined' || mode === 'alliances') && (
          <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 28, borderTop: '3px solid var(--accent-crimson)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.5rem' }}>Torneos de Alianza</h2>
                <span className="badge badge-crimson">Copa de Alianzas</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                Puntaje acumulado de la noche para Terror, Shooter y Action
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
              {allianceStandings.map((row) => {
                const meta = ALLIANCES.find((a) => a.id === row.id)!;
                const pct = Math.min(Math.max(row.goalPercent, 0), 100);

                return (
                  <div key={row.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          className="font-display tabular"
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: row.rank === 1 ? 'var(--gold)' : 'var(--text-secondary)',
                            width: 34,
                          }}
                        >
                          #{row.rank}
                        </span>
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: meta.color,
                          }}
                        />
                        <span className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                          {meta.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                        <span className="tabular" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                          Meta {state.allianceGoal.toLocaleString('es-CL')}: {row.goalPercent.toFixed(1)}%
                        </span>
                        <span
                          className="font-display tabular"
                          style={{ fontSize: '2.1rem', fontWeight: 700, color: meta.color }}
                        >
                          {row.totalPoints.toLocaleString('es-CL')}
                        </span>
                      </div>
                    </div>

                    <div className="alliance-bar-track" style={{ height: 14 }}>
                      <div
                        className="alliance-bar-fill"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>

                    {/* Per-activity mini breakdown */}
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <span className="tabular">
                        Día 19: <strong style={{ color: 'var(--text-primary)' }}>{row.day19Points.toLocaleString('es-CL')}</strong>
                      </span>
                      <span className="tabular">
                        Tarreo: <strong style={{ color: 'var(--text-primary)' }}>{row.tarreoPoints.toLocaleString('es-CL')}</strong>
                      </span>
                      {row.adjustmentPoints !== 0 && (
                        <span className="tabular">
                          Ajustes: <strong style={{ color: 'var(--text-primary)' }}>{row.adjustmentPoints > 0 ? `+${row.adjustmentPoints}` : row.adjustmentPoints}</strong>
                        </span>
                      )}
                      {state.allianceActivities.map((act) => (
                        <span key={act.id} className="tabular">
                          {act.name}: <strong style={{ color: 'var(--text-primary)' }}>{row.breakdown[act.id] ?? 0}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(mode === 'combined' || mode === 'individual') && (
          <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 22, borderTop: '3px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: '1.5rem' }}>Torneos de Tarreo</h2>
                  <span className="badge badge-cyan">Premio General (Personas)</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                  Top 10 jugadores de la noche
                </p>
              </div>
              <Trophy size={26} color="var(--gold)" />
            </div>

            {ranking.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: '1rem' }}>Esperando los primeros resultados de los torneos...</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table" style={{ fontSize: '1.05rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: 64 }}>#</th>
                      <th>Jugador</th>
                      <th className="text-center">1.º</th>
                      <th className="text-right">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((row) => (
                      <tr key={row.participant.id}>
                        <td
                          className="font-display tabular"
                          style={{
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color:
                              row.rank === 1
                                ? 'var(--gold)'
                                : row.rank === 2
                                  ? 'var(--silver)'
                                  : row.rank === 3
                                    ? 'var(--bronze)'
                                    : 'var(--text-secondary)',
                          }}
                        >
                          {row.rank}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{row.participant.name}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {row.participant.career}
                          </div>
                        </td>
                        <td className="text-center tabular" style={{ color: 'var(--text-secondary)' }}>
                          {row.firstPlaces}
                        </td>
                        <td
                          className="text-right font-display tabular"
                          style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent-cyan)' }}
                        >
                          {row.totalPoints}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
