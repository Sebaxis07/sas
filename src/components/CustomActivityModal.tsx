import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  AllianceActivity,
  AllianceScoringMode,
  TournamentActivity,
  TournamentScoringMode,
} from '../types/tarreo';

export type CustomActivityTarget = 'tournament' | 'alliance';

interface CustomActivityModalProps {
  target: CustomActivityTarget;
  onClose: () => void;
  onCreateTournament: (
    activity: Omit<TournamentActivity, 'id' | 'isOfficial' | 'entries'>,
  ) => void;
  onCreateAllianceActivity: (
    activity: Pick<
      AllianceActivity,
      'name' | 'schedule' | 'description' | 'scoringMode' | 'placementPoints'
    >,
  ) => void;
}

export const CustomActivityModal: React.FC<CustomActivityModalProps> = ({
  target: initialTarget,
  onClose,
  onCreateTournament,
  onCreateAllianceActivity,
}) => {
  const [target, setTarget] = useState<CustomActivityTarget>(initialTarget);
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');

  // Tournament specific
  const [tScoringMode, setTScoringMode] = useState<TournamentScoringMode>('placement');
  const [scale1, setScale1] = useState(10);
  const [scale2, setScale2] = useState(7);
  const [scale3, setScale3] = useState(5);
  const [scale4, setScale4] = useState(3);
  const [participationBonus, setParticipationBonus] = useState(1);
  const [woPenalty, setWoPenalty] = useState(1);

  // Alliance specific
  const [aScoringMode, setAScoringMode] = useState<AllianceScoringMode>('placement');
  const [a1, setA1] = useState(1000);
  const [a2, setA2] = useState(600);
  const [a3, setA3] = useState(300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (target === 'tournament') {
      onCreateTournament({
        name: name.trim(),
        schedule: schedule.trim() || 'Horario libre',
        format: 'personalizado',
        description: description.trim() || 'Actividad personalizada con puntaje propio.',
        scoringMode: tScoringMode,
        alwaysFullScale: true,
        sharedThirdFourth: false,
        scaleOverride: 'full',
        fullScale: [scale1, scale2, scale3, scale4],
        reducedScale: [scale1, scale2, scale3, scale4],
        participationBonus: tScoringMode === 'placement' ? participationBonus : 0,
        woPenalty,
      });
    } else {
      onCreateAllianceActivity({
        name: name.trim(),
        schedule: schedule.trim() || 'Horario libre',
        description: description.trim() || 'Actividad personalizada de Copa de Alianzas.',
        scoringMode: aScoringMode,
        placementPoints: [a1, a2, a3],
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.15rem' }}>Nueva Actividad Personalizada</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Elige si es un Torneo de Tarreo (personas) o un Torneo de Alianza (Copa de Alianzas).
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Tipo de torneo / actividad</label>
            <div className="grid-2" style={{ gap: 8 }}>
              <button
                type="button"
                className={`btn ${target === 'tournament' ? 'btn-cyan' : 'btn-secondary'}`}
                onClick={() => setTarget('tournament')}
              >
                Torneo de Tarreo (Personas)
              </button>
              <button
                type="button"
                className={`btn ${target === 'alliance' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTarget('alliance')}
              >
                Torneo de Alianza (Copa)
              </button>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="custom-name">
              Nombre de la actividad *
            </label>
            <input
              id="custom-name"
              className="input"
              placeholder={
                target === 'tournament'
                  ? 'Ej: Mario Kart 8, FIFA, Trivia Gamer...'
                  : 'Ej: Desafío Relámpago, Quiz Nocturno...'
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div>
              <label className="label" htmlFor="custom-schedule">
                Horario (opcional)
              </label>
              <input
                id="custom-schedule"
                className="input"
                placeholder="Ej: 01:00 a 01:30"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="custom-mode">
                Tipo de puntaje
              </label>
              {target === 'tournament' ? (
                <select
                  id="custom-mode"
                  className="select"
                  value={tScoringMode}
                  onChange={(e) => setTScoringMode(e.target.value as TournamentScoringMode)}
                >
                  <option value="placement">Por posiciones (1.º, 2.º, 3.º, 4.º)</option>
                  <option value="direct">Puntaje directo personalizado</option>
                </select>
              ) : (
                <select
                  id="custom-mode"
                  className="select"
                  value={aScoringMode}
                  onChange={(e) => setAScoringMode(e.target.value as AllianceScoringMode)}
                >
                  <option value="placement">Por posiciones (1.º, 2.º, 3.º)</option>
                  <option value="direct">Puntaje directo por alianza</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="custom-desc">
              Descripción breve (opcional)
            </label>
            <input
              id="custom-desc"
              className="input"
              placeholder="Reglas rápidas o formato de la actividad"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {target === 'tournament' && tScoringMode === 'placement' && (
            <div
              style={{
                background: 'var(--bg-elevated)',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="label" style={{ marginBottom: 10 }}>
                Puntajes por lugar
              </div>
              <div className="grid-4" style={{ gap: 10 }}>
                <div>
                  <label className="label">1.º lugar</label>
                  <input
                    type="number"
                    className="input input-sm tabular"
                    value={scale1}
                    onChange={(e) => setScale1(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">2.º lugar</label>
                  <input
                    type="number"
                    className="input input-sm tabular"
                    value={scale2}
                    onChange={(e) => setScale2(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">3.º lugar</label>
                  <input
                    type="number"
                    className="input input-sm tabular"
                    value={scale3}
                    onChange={(e) => setScale3(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">4.º lugar</label>
                  <input
                    type="number"
                    className="input input-sm tabular"
                    value={scale4}
                    onChange={(e) => setScale4(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: 10, marginTop: 12 }}>
                <div>
                  <label className="label">Bono por participar (+)</label>
                  <input
                    type="number"
                    className="input input-sm tabular"
                    value={participationBonus}
                    onChange={(e) => setParticipationBonus(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">Penalización W.O. (-)</label>
                  <input
                    type="number"
                    min={0}
                    className="input input-sm tabular"
                    value={woPenalty}
                    onChange={(e) => setWoPenalty(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {target === 'alliance' && aScoringMode === 'placement' && (
            <div
              style={{
                background: 'var(--bg-elevated)',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="label" style={{ marginBottom: 10 }}>
                Puntajes por lugar (empates se reparten automáticamente)
              </div>
              <div className="grid-3" style={{ gap: 10 }}>
                <div>
                  <label className="label">1.º lugar</label>
                  <input
                    type="number"
                    className="input input-sm tabular"
                    value={a1}
                    onChange={(e) => setA1(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">2.º lugar</label>
                  <input
                    type="number"
                    className="input input-sm tabular"
                    value={a2}
                    onChange={(e) => setA2(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">3.º lugar</label>
                  <input
                    type="number"
                    className="input input-sm tabular"
                    value={a3}
                    onChange={(e) => setA3(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Crear actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
