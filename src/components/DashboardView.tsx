import React from 'react';
import { ArrowRight, Gamepad2, Plus, Shield, Trophy, Users } from 'lucide-react';
import { ALLIANCES } from '../data/defaults';
import {
  calculateAllianceStandings,
  calculateGeneralRanking,
  getEffectiveScale,
} from '../domain/scoring';
import { TarreoState } from '../types/tarreo';
import { NavTab } from './Layout';

interface DashboardViewProps {
  state: TarreoState;
  onNavigate: (tab: NavTab) => void;
  onOpenCustomModal: (target: 'tournament' | 'alliance') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigate,
  onOpenCustomModal,
}) => {
  const ranking = calculateGeneralRanking(state.participants, state.tournaments);
  const allianceStandings = calculateAllianceStandings(
    state.allianceActivities,
    state.day19Activities,
    state.allianceAdjustments,
    state.allianceGoal,
  );

  const topPlayers = ranking.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="section-title">Resumen de la Noche</h1>
          <p className="section-subtitle">
            Viernes 20 al Sábado 21 de Noviembre · 22:00 a 08:00 · Tercer Piso INACAP Antofagasta
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-cyan"
            onClick={() => onOpenCustomModal('tournament')}
          >
            <Plus size={15} />
            <span>+ Torneo de Tarreo</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpenCustomModal('alliance')}
          >
            <Plus size={15} />
            <span>+ Torneo de Alianza</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid-4">
        <div className="card card-compact">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>Participantes</span>
            <Users size={15} />
          </div>
          <div className="font-display tabular" style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6 }}>
            {state.participants.length}
          </div>
        </div>

        <div className="card card-compact" style={{ borderTop: '2px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>Torneos de Tarreo</span>
            <Gamepad2 size={15} color="var(--accent-cyan)" />
          </div>
          <div className="font-display tabular" style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6 }}>
            {state.tournaments.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Suman puntos a personas
          </div>
        </div>

        <div className="card card-compact" style={{ borderTop: '2px solid var(--accent-crimson)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>Torneos de Alianza</span>
            <Shield size={15} color="var(--accent-crimson)" />
          </div>
          <div className="font-display tabular" style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6 }}>
            {state.allianceActivities.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Suman puntos a Copa Alianzas
          </div>
        </div>

        <div className="card card-compact">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>Líder Premio General</span>
            <Trophy size={15} color="var(--gold)" />
          </div>
          <div
            className="font-display"
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              marginTop: 10,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {topPlayers[0] && topPlayers[0].totalPoints > 0
              ? `${topPlayers[0].participant.name} (${topPlayers[0].totalPoints} pts)`
              : 'Sin puntajes aún'}
          </div>
        </div>
      </div>

      {/* Main 2-column summary: Torneos de Alianza + Torneos de Tarreo */}
      <div className="grid-2">
        {/* Torneos de Alianza */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18, borderTop: '2px solid var(--accent-crimson)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.1rem' }}>Torneos de Alianza</h2>
                <span className="badge badge-crimson">Copa de Alianzas</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Cazatesoros, Just Dance, Mímica · Puntaje exclusivo para Terror, Shooter y Action
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('alliances')}
            >
              <span>Gestionar</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {allianceStandings.map((row) => {
              const meta = ALLIANCES.find((a) => a.id === row.id)!;
              const pct = Math.min(Math.max(row.goalPercent, 0), 100);
              return (
                <div key={row.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        className="tabular"
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                          width: 22,
                        }}
                      >
                        #{row.rank}
                      </span>
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          background: meta.color,
                        }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{meta.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span className="tabular" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Meta {state.allianceGoal.toLocaleString('es-CL')}: {row.goalPercent.toFixed(1)}%
                      </span>
                      <span className="font-display tabular" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                        {row.totalPoints.toLocaleString('es-CL')} pts
                      </span>
                    </div>
                  </div>
                  <div className="alliance-bar-track">
                    <div
                      className="alliance-bar-fill"
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top 5 Torneos de Tarreo */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: '2px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.1rem' }}>Torneos de Tarreo</h2>
                <span className="badge badge-cyan">Premio General (Personas)</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Valorant, Rocket League, Fortnite, Brawl · No suman puntos a las alianzas
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('participants')}
            >
              <span>Ver todos</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {topPlayers.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 12px' }}>
              <Users size={24} style={{ opacity: 0.4 }} />
              <p>Aún no hay participantes registrados. Agrega estudiantes en la pestaña Participantes o desde un torneo.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th>Estudiante</th>
                    <th className="text-center">1.º</th>
                    <th className="text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.map((row) => (
                    <tr key={row.participant.id}>
                      <td className="tabular" style={{ fontWeight: 700, color: row.rank === 1 ? 'var(--gold)' : 'var(--text-secondary)' }}>
                        {row.rank}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{row.participant.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {row.participant.career}
                        </div>
                      </td>
                      <td className="text-center tabular" style={{ color: 'var(--text-secondary)' }}>
                        {row.firstPlaces}
                      </td>
                      <td className="text-right font-display tabular" style={{ fontWeight: 700 }}>
                        {row.totalPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Tournaments quick status */}
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '1.05rem' }}>Estado de Torneos de Tarreo</h2>
            <span className="badge badge-cyan">Puntos a Personas</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate('tournaments')}
          >
            <span>Ir a Torneos Tarreo</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-4">
          {state.tournaments.map((t) => {
            const activeCount = t.entries.filter((e) => !e.isWO).length;
            const scale = getEffectiveScale(t);
            const champion = t.entries.find((e) => !e.isWO && e.placement === 1);
            const champName = champion
              ? state.participants.find((p) => p.id === champion.participantId)?.name
              : null;
            return (
              <div
                key={t.id}
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</span>
                  {!t.isOfficial && <span className="badge badge-violet">Custom</span>}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {t.schedule} · {activeCount} jug.
                  {t.scoringMode === 'placement' && (
                    <> · {scale === 'reduced' ? 'Escala reducida' : 'Escala normal'}</>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', marginTop: 'auto' }}>
                  {champName ? (
                    <span className="badge badge-success">1.º {champName}</span>
                  ) : (
                    <span className="badge">Pendiente</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
