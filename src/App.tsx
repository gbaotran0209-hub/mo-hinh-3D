import React, { useState } from 'react';
import { Navbar, TabId } from './components/Navbar';
import { DNAViewer } from './components/dna3d/DNAViewer';
import { DNACustomizerDock } from './components/dna3d/DNACustomizerDock';
import { NucleotideDetailModal } from './components/dna3d/NucleotideDetailModal';
import { PolymeraseWalkthroughOverlay } from './components/dna3d/PolymeraseWalkthroughOverlay';
import { StructureExplorer } from './components/tabs/StructureExplorer';
import { MutationExplorer } from './components/tabs/MutationExplorer';
import { MutationStudio } from './components/tabs/MutationStudio';
import { GeneticLabGame } from './components/tabs/GeneticLabGame';
import { CodonWheelModal } from './components/tabs/CodonWheelModal';
import { ReferencesModal } from './components/tabs/ReferencesModal';
import { DNAViewMode, BasePairData, NucleotideType, RenderStyle, HelixForm, SphereColorMode, RibbonTightness } from './types/genetics';
import { soundFx } from './utils/soundEffects';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('3d');
  const [viewMode, setViewMode] = useState<DNAViewMode>('normal');
  
  // 3 Visual Model Styles (3Dmol.js PDB 1BNA: ballstick, sphere, cartoon)
  const [renderStyle, setRenderStyle] = useState<RenderStyle>('ballstick');
  const [sphereColorMode, setSphereColorMode] = useState<SphereColorMode>('sgk');
  const [ribbonTightness, setRibbonTightness] = useState<RibbonTightness>('close');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [helixForm, setHelixForm] = useState<HelixForm>('b-dna');
  const [showClassroomStand, setShowClassroomStand] = useState<boolean>(false);
  const [useVietnameseX, setUseVietnameseX] = useState<boolean>(false); // Chuẩn IUPAC dùng C (Cytosine)

  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [explodedFactor, setExplodedFactor] = useState<number>(0);

  // DNA Polymerase III Replication Simulation
  const [polymeraseActive, setPolymeraseActive] = useState<boolean>(false);
  const [polymeraseSpeed, setPolymeraseSpeed] = useState<number>(2.0);
  const [isPolymeraseWalkthroughOpen, setIsPolymeraseWalkthroughOpen] = useState<boolean>(false);
  const [laserScannerActive, setLaserScannerActive] = useState<boolean>(true);

  // Nucleotide Inspector Modal
  const [selectedBasePair, setSelectedBasePair] = useState<BasePairData | null>(null);
  const [selectedBase, setSelectedBase] = useState<NucleotideType | null>(null);
  const [selectedStrand, setSelectedStrand] = useState<1 | 2>(1);

  // Auxiliary Modals
  const [isCodonModalOpen, setIsCodonModalOpen] = useState(false);
  const [isReferencesModalOpen, setIsReferencesModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Handlers
  const handleSelectBasePair = (pair: BasePairData, base: NucleotideType, strand: 1 | 2) => {
    setSelectedBasePair(pair);
    setSelectedBase(base);
    setSelectedStrand(strand);
  };

  const handleCloseDetailModal = () => {
    setSelectedBasePair(null);
    setSelectedBase(null);
  };

  const handleSwitchTo3DWithMode = (mode: DNAViewMode) => {
    setViewMode(mode);
    setCurrentTab('3d');
  };

  const handleToggleSound = () => {
    const newState = soundFx.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <div className="h-screen h-[100dvh] w-screen w-[100dvw] bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white overflow-hidden select-none">
      {/* Sticky Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCodonModal={() => setIsCodonModalOpen(true)}
        onOpenReferencesModal={() => setIsReferencesModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area - Full screen, zero bottom gap */}
      <main className="flex-1 w-full min-h-0 relative overflow-hidden flex flex-col">
        {currentTab === '3d' && (
          <div className="relative w-full h-full min-h-0 overflow-hidden flex-1">
            {/* High-Fidelity Three.js 3D DNA Canvas with letter badges & multiple render styles */}
            <DNAViewer
              viewMode={viewMode}
              renderStyle={renderStyle}
              onChangeRenderStyle={setRenderStyle}
              sphereColorMode={sphereColorMode}
              onChangeSphereColorMode={setSphereColorMode}
              ribbonTightness={ribbonTightness}
              onChangeRibbonTightness={setRibbonTightness}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels(!showLabels)}
              helixForm={helixForm}
              showClassroomStand={showClassroomStand}
              useVietnameseX={useVietnameseX}
              rotationSpeed={rotationSpeed}
              explodedFactor={explodedFactor}
              onSelectBasePair={handleSelectBasePair}
              selectedPairIndex={selectedBasePair?.index ?? null}
              polymeraseActive={polymeraseActive}
              onTogglePolymerase={() => setPolymeraseActive(!polymeraseActive)}
              polymeraseSpeed={polymeraseSpeed}
              onChangePolymeraseSpeed={setPolymeraseSpeed}
              onOpenPolymeraseWalkthrough={() => setIsPolymeraseWalkthroughOpen(true)}
              laserScannerActive={laserScannerActive}
              onToggleLaserScanner={() => setLaserScannerActive(!laserScannerActive)}
            />

            {/* Ergonomic Collapsible Bottom Control Dock */}
            <DNACustomizerDock
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              renderStyle={renderStyle}
              onChangeRenderStyle={setRenderStyle}
              sphereColorMode={sphereColorMode}
              onChangeSphereColorMode={setSphereColorMode}
              ribbonTightness={ribbonTightness}
              onChangeRibbonTightness={setRibbonTightness}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels(!showLabels)}
              helixForm={helixForm}
              onChangeHelixForm={setHelixForm}
              showClassroomStand={showClassroomStand}
              onToggleClassroomStand={() => setShowClassroomStand(!showClassroomStand)}
              useVietnameseX={useVietnameseX}
              onToggleVietnameseX={() => setUseVietnameseX(!useVietnameseX)}
              rotationSpeed={rotationSpeed}
              onChangeRotationSpeed={setRotationSpeed}
              explodedFactor={explodedFactor}
              onChangeExplodedFactor={setExplodedFactor}
              polymeraseActive={polymeraseActive}
              onTogglePolymerase={() => setPolymeraseActive(!polymeraseActive)}
              polymeraseSpeed={polymeraseSpeed}
              onChangePolymeraseSpeed={setPolymeraseSpeed}
              onOpenPolymeraseWalkthrough={() => setIsPolymeraseWalkthroughOpen(true)}
              laserScannerActive={laserScannerActive}
              onToggleLaserScanner={() => setLaserScannerActive(!laserScannerActive)}
            />
          </div>
        )}

        {currentTab === 'structure' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <StructureExplorer />
          </div>
        )}

        {currentTab === 'mutations' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <MutationExplorer onSwitchTo3DMode={handleSwitchTo3DWithMode} />
          </div>
        )}

        {currentTab === 'studio' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <MutationStudio />
          </div>
        )}

        {currentTab === 'lab' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <GeneticLabGame />
          </div>
        )}
      </main>

      {/* Inspector Modal for clicked 3D Nucleotide / Base Pair */}
      <NucleotideDetailModal
        basePair={selectedBasePair}
        selectedBase={selectedBase}
        strand={selectedStrand}
        onClose={handleCloseDetailModal}
      />

      {/* 64 Genetic Codon Wheel & Table Modal */}
      <CodonWheelModal
        isOpen={isCodonModalOpen}
        onClose={() => setIsCodonModalOpen(false)}
      />

      {/* Authoritative Scientific References & Literature Citations Modal */}
      <ReferencesModal
        isOpen={isReferencesModalOpen}
        onClose={() => setIsReferencesModalOpen(false)}
      />

      {/* Interactive Guided Walk-Through Overlay for DNA Polymerase */}
      <PolymeraseWalkthroughOverlay
        isOpen={isPolymeraseWalkthroughOpen}
        onClose={() => setIsPolymeraseWalkthroughOpen(false)}
        polymeraseActive={polymeraseActive}
        onTogglePolymerase={() => setPolymeraseActive(!polymeraseActive)}
        polymeraseSpeed={polymeraseSpeed}
        onChangePolymeraseSpeed={setPolymeraseSpeed}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />
    </div>
  );
}
