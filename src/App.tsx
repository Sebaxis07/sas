import React, { useState } from 'react';
import { AlliancesView } from './components/AlliancesView';
import {
  CustomActivityModal,
  CustomActivityTarget,
} from './components/CustomActivityModal';
import { DashboardView } from './components/DashboardView';
import { Layout, NavTab } from './components/Layout';
import { ParticipantsView } from './components/ParticipantsView';
import { ProjectionView } from './components/ProjectionView';
import { TournamentsView } from './components/TournamentsView';
import { useTarreoStore } from './hooks/useTarreoStore';

export const App: React.FC = () => {
  const store = useTarreoStore();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('valorant');
  const [selectedAllianceActId, setSelectedAllianceActId] = useState<string>('cazatesoros');
  const [customModalTarget, setCustomModalTarget] = useState<CustomActivityTarget | null>(
    null,
  );
  const [projectionOpen, setProjectionOpen] = useState(false);

  return (
    <>
      <Layout
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenProjection={() => setProjectionOpen(true)}
        onExportJson={store.exportJson}
        onImportJson={store.importJson}
        onExportCsv={store.exportCsv}
        onResetAll={store.resetAll}
      >
        {activeTab === 'dashboard' && (
          <DashboardView
            state={store.state}
            onNavigate={setActiveTab}
            onOpenCustomModal={(target) => setCustomModalTarget(target)}
          />
        )}

        {activeTab === 'tournaments' && (
          <TournamentsView
            tournaments={store.state.tournaments}
            participants={store.state.participants}
            selectedId={selectedTournamentId}
            onSelectId={setSelectedTournamentId}
            onAddParticipant={store.addParticipant}
            onUpsertEntry={store.upsertTournamentEntry}
            onRemoveEntry={store.removeTournamentEntry}
            onUpdateTournament={store.updateTournament}
            onRemoveCustomTournament={store.removeCustomTournament}
            onOpenCustomModal={() => setCustomModalTarget('tournament')}
          />
        )}

        {activeTab === 'alliances' && (
          <AlliancesView
            activities={store.state.allianceActivities}
            day19Activities={store.state.day19Activities}
            adjustments={store.state.allianceAdjustments}
            allianceGoal={store.state.allianceGoal}
            selectedId={selectedAllianceActId}
            onSelectId={setSelectedAllianceActId}
            onUpdateActivity={store.updateAllianceActivity}
            onRemoveCustomActivity={store.removeCustomAllianceActivity}
            onUpdateDay19Points={store.updateDay19ActivityPoints}
            onUpdateDay19Meta={store.updateDay19ActivityMeta}
            onAddDay19Activity={store.addDay19Activity}
            onRemoveDay19Activity={store.removeDay19Activity}
            onAddAdjustment={store.addAllianceAdjustment}
            onRemoveAdjustment={store.removeAllianceAdjustment}
            onOpenCustomModal={() => setCustomModalTarget('alliance')}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantsView
            participants={store.state.participants}
            tournaments={store.state.tournaments}
            onAddParticipant={store.addParticipant}
            onRemoveParticipant={store.removeParticipant}
          />
        )}
      </Layout>

      {customModalTarget && (
        <CustomActivityModal
          target={customModalTarget}
          onClose={() => setCustomModalTarget(null)}
          onCreateTournament={(activity) => {
            const id = store.addCustomTournament(activity);
            setSelectedTournamentId(id);
            setActiveTab('tournaments');
          }}
          onCreateAllianceActivity={(activity) => {
            const id = store.addCustomAllianceActivity(activity);
            setSelectedAllianceActId(id);
            setActiveTab('alliances');
          }}
        />
      )}

      {projectionOpen && (
        <ProjectionView
          state={store.state}
          onClose={() => setProjectionOpen(false)}
        />
      )}
    </>
  );
};
