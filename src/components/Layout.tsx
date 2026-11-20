import React, { useRef, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Gamepad2,
  LayoutDashboard,
  MoreVertical,
  Presentation,
  RotateCcw,
  Shield,
  Upload,
  Users,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'tournaments' | 'alliances' | 'participants';

interface LayoutProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenProjection: () => void;
  onExportJson: () => void;
  onImportJson: (text: string) => { ok: boolean; error?: string };
  onExportCsv: () => void;
  onResetAll: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Resumen', icon: <LayoutDashboard size={15} /> },
  { id: 'tournaments', label: 'Torneos Tarreo', icon: <Gamepad2 size={15} /> },
  { id: 'alliances', label: 'Torneos Alianza', icon: <Shield size={15} /> },
  { id: 'participants', label: 'Ranking Personas', icon: <Users size={15} /> },
];

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onSelectTab,
  onOpenProjection,
  onExportJson,
  onImportJson,
  onExportCsv,
  onResetAll,
  children,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = onImportJson(String(reader.result ?? ''));
      if (!res.ok) {
        window.alert(res.error ?? 'Error al importar el respaldo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setMenuOpen(false);
  };

  const handleReset = () => {
    setMenuOpen(false);
    if (
      window.confirm(
        '¿Reiniciar todos los puntajes, participantes y actividades personalizadas? Esta acción no se puede deshacer.',
      )
    ) {
      onResetAll();
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div>
              <div className="brand-title">TARREO INACAP 2026</div>
              <div className="brand-sub">Sede Antofagasta · Puntajes</div>
            </div>
          </div>

          <nav className="nav-tabs" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onSelectTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="topbar-actions">
            <button
              type="button"
              className="btn btn-cyan"
              onClick={onOpenProjection}
              title="Abrir pantalla limpia para proyector"
            >
              <Presentation size={15} />
              <span>Proyectar</span>
            </button>

            <div className="menu-wrap">
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Respaldo y opciones"
                title="Respaldo y opciones"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="menu-popover">
                    <button
                      type="button"
                      className="menu-item"
                      onClick={() => {
                        onExportJson();
                        setMenuOpen(false);
                      }}
                    >
                      <Download size={15} />
                      <span>Exportar respaldo JSON</span>
                    </button>
                    <button
                      type="button"
                      className="menu-item"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={15} />
                      <span>Importar respaldo JSON</span>
                    </button>
                    <button
                      type="button"
                      className="menu-item"
                      onClick={() => {
                        onExportCsv();
                        setMenuOpen(false);
                      }}
                    >
                      <FileSpreadsheet size={15} />
                      <span>Exportar tablas CSV</span>
                    </button>
                    <div className="menu-divider" />
                    <button
                      type="button"
                      className="menu-item danger"
                      onClick={handleReset}
                    >
                      <RotateCcw size={15} />
                      <span>Reiniciar todo</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </header>

      <main className="main-container">{children}</main>
    </div>
  );
};
