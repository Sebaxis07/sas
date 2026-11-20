import React, { useState } from 'react';
import { AlertTriangle, Search, Trash2, UserPlus } from 'lucide-react';
import { CAREERS } from '../data/defaults';
import { calculateGeneralRanking } from '../domain/scoring';
import { Career, Participant, TournamentActivity } from '../types/tarreo';

interface ParticipantsViewProps {
  participants: Participant[];
  tournaments: TournamentActivity[];
  onAddParticipant: (name: string, career: Career) => Participant;
  onRemoveParticipant: (participantId: string) => void;
}

export const ParticipantsView: React.FC<ParticipantsViewProps> = ({
  participants,
  tournaments,
  onAddParticipant,
  onRemoveParticipant,
}) => {
  const [name, setName] = useState('');
  const [career, setCareer] = useState<Career>(CAREERS[0]);
  const [search, setSearch] = useState('');

  const ranking = calculateGeneralRanking(participants, tournaments);
  const filtered = ranking.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      row.participant.name.toLowerCase().includes(q) ||
      row.participant.career.toLowerCase().includes(q)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddParticipant(name, career);
    setName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="section-title">Ranking Personas — Torneos de Tarreo</h1>
            <span className="badge badge-cyan">Premio General</span>
          </div>
          <p className="section-subtitle">
            Desempate oficial: 1) Total de puntos · 2) Más 1.º lugares · 3) Más 2.º lugares · 4) Partida de desempate.
          </p>
        </div>
      </div>

      {/* Registration form */}
      <form
        onSubmit={handleSubmit}
        className="card card-compact"
        style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}
      >
        <div style={{ flex: '1 1 240px' }}>
          <label className="label" htmlFor="new-player-name">
            Nombre del estudiante
          </label>
          <input
            id="new-player-name"
            className="input"
            placeholder="Ej: Ana Morales"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ flex: '1 1 220px' }}>
          <label className="label" htmlFor="new-player-career">
            Carrera
          </label>
          <select
            id="new-player-career"
            className="select"
            value={career}
            onChange={(e) => setCareer(e.target.value as Career)}
          >
            {CAREERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
          <UserPlus size={15} />
          <span>Registrar estudiante</span>
        </button>
      </form>

      {/* Ranking Table */}
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 600 }}>
            Tabla General ({participants.length} inscritos)
          </div>
          <div style={{ position: 'relative', width: 260, maxWidth: '100%' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              className="input input-sm"
              style={{ paddingLeft: 32 }}
              placeholder="Buscar por nombre o carrera..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>
              {participants.length === 0
                ? 'Todavía no hay participantes registrados.'
                : 'No se encontraron coincidencias.'}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>#</th>
                  <th>Estudiante</th>
                  {tournaments.map((t) => (
                    <th key={t.id} className="text-center">
                      {t.name.length > 14 ? `${t.name.slice(0, 12)}…` : t.name}
                    </th>
                  ))}
                  <th className="text-center">1.º</th>
                  <th className="text-center">2.º</th>
                  <th className="text-right">Total</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.participant.id}>
                    <td
                      className="font-display tabular"
                      style={{
                        fontWeight: 700,
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 500 }}>{row.participant.name}</span>
                        {row.needsTiebreaker && (
                          <span className="badge badge-warning">
                            <AlertTriangle size={11} />
                            <span>Desempate</span>
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {row.participant.career}
                      </div>
                    </td>
                    {tournaments.map((t) => {
                      const v = row.breakdown[t.id];
                      return (
                        <td
                          key={t.id}
                          className="text-center tabular"
                          style={{
                            color:
                              v === undefined
                                ? 'var(--text-muted)'
                                : v < 0
                                  ? 'var(--danger)'
                                  : 'var(--text-primary)',
                          }}
                        >
                          {v === undefined ? '—' : v}
                        </td>
                      );
                    })}
                    <td className="text-center tabular" style={{ color: 'var(--text-secondary)' }}>
                      {row.firstPlaces}
                    </td>
                    <td className="text-center tabular" style={{ color: 'var(--text-secondary)' }}>
                      {row.secondPlaces}
                    </td>
                    <td
                      className="text-right font-display tabular"
                      style={{ fontWeight: 700, fontSize: '1.05rem' }}
                    >
                      {row.totalPoints}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger-ghost btn-icon"
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Eliminar a ${row.participant.name} y sus puntajes de todos los torneos?`,
                            )
                          ) {
                            onRemoveParticipant(row.participant.id);
                          }
                        }}
                        title="Eliminar participante"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
