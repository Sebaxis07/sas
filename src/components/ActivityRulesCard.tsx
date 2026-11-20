import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { ACTIVITY_GUIDES } from '../data/activityGuides';

interface ActivityRulesCardProps {
  activityId: string;
  accent?: 'cyan' | 'crimson';
}

export const ActivityRulesCard: React.FC<ActivityRulesCardProps> = ({
  activityId,
  accent = 'cyan',
}) => {
  const [open, setOpen] = useState(false);
  const guide = ACTIVITY_GUIDES[activityId];

  if (!guide) return null;

  const accentColor = accent === 'crimson' ? 'var(--accent-crimson)' : 'var(--accent-cyan)';

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-subtle)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 14px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <BookOpen size={15} color={accentColor} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: '0.84rem' }}>
            Explicación y reglas de la actividad
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {guide.summary}
          </span>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          <span>{open ? 'Ocultar' : 'Ver detalle'}</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: '14px 16px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
            background: 'var(--bg-elevated)',
          }}
        >
          {guide.items.map((item) => (
            <div
              key={item.label}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderLeft: `2px solid ${accentColor}`,
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: accentColor,
                  marginBottom: 4,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
