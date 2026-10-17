import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DNAViewMode, NucleotideType, BasePairData, RenderStyle, HelixForm, SphereColorMode, RibbonTightness } from '../../types/genetics';
import { NUCLEOTIDES_SGK } from '../../data/geneticsData';
import { PDB_1BNA_ATOMS, PDB_1BNA_BONDS, PDB_1BNA_BASEPAIRS, PDBAtom } from '../../data/pdb1bna';
import { soundFx } from '../../utils/soundEffects';
import { RefreshCw, Sparkles, Eye, EyeOff, Play, Pause, FastForward, Activity, BookOpen, Zap } from 'lucide-react';
import { DNAPolymeraseModel, PolymeraseTelemetry } from './DNAPolymerase3D';

interface DNAViewerProps {
  viewMode: DNAViewMode;
  renderStyle: RenderStyle;
  onChangeRenderStyle: (style: RenderStyle) => void;
  sphereColorMode?: SphereColorMode;
  onChangeSphereColorMode?: (mode: SphereColorMode) => void;
  ribbonTightness?: RibbonTightness;
  onChangeRibbonTightness?: (tightness: RibbonTightness) => void;
  showLabels?: boolean;
  onToggleLabels?: () => void;
  helixForm: HelixForm;
  showClassroomStand: boolean;
  useVietnameseX: boolean;
  rotationSpeed: number;
  explodedFactor: number;
  onSelectBasePair: (basePair: BasePairData, selectedBase: NucleotideType, strand: 1 | 2) => void;
  selectedPairIndex: number | null;
  polymeraseActive?: boolean;
  onTogglePolymerase?: () => void;
  polymeraseSpeed?: number;
  onChangePolymeraseSpeed?: (speed: number) => void;
  onOpenPolymeraseWalkthrough?: () => void;
  laserScannerActive?: boolean;
  onToggleLaserScanner?: () => void;
}

// Generate circular letter badge texture for A, T, G, C, X
const createLetterTexture = (
  letter: string,
  bgColor: string,
  borderColor: string = '#ffffff'
): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);

    // Outer glow
    const gradHalo = ctx.createRadialGradient(128, 128, 90, 128, 128, 126);
    gradHalo.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradHalo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradHalo;
    ctx.beginPath();
    ctx.arc(128, 128, 126, 0, Math.PI * 2);
    ctx.fill();

    // Metallic rim
    const gradRim = ctx.createLinearGradient(0, 0, 256, 256);
    gradRim.addColorStop(0, '#ffffff');
    gradRim.addColorStop(0.5, borderColor);
    gradRim.addColorStop(1, '#475569');

    ctx.beginPath();
    ctx.arc(128, 128, 112, 0, Math.PI * 2);
    ctx.fillStyle = gradRim;
    ctx.fill();

    // Solid core
    const gradCore = ctx.createRadialGradient(128, 100, 10, 128, 128, 100);
    gradCore.addColorStop(0, bgColor);
    gradCore.addColorStop(1, '#090d16');

    ctx.beginPath();
    ctx.arc(128, 128, 96, 0, Math.PI * 2);
    ctx.fillStyle = gradCore;
    ctx.fill();

    // Inner bright stroke
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(128, 128, 92, 0, Math.PI * 2);
    ctx.stroke();

    // Letter text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 130px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    ctx.fillText(letter, 128, 134);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.needsUpdate = true;
  return texture;
};

// Standard IUPAC / CPK atomic colors
const CPK_COLORS: Record<string, string> = {
  P: '#f59e0b', // Phosphorus (Amber Gold)
  O: '#ef4444', // Oxygen (Crimson Red)
  N: '#2563eb', // Nitrogen (Cobalt Blue)
  C: '#64748b', // Carbon (Slate)
  H: '#f8fafc', // Hydrogen (White)
};

// Compact Van der Waals radii (scaled for fine, dense high-resolution molecular surfaces)
const VDW_RADII: Record<string, number> = {
  P: 0.36, // Phosphorus on backbone
  C: 0.30, // Carbon
  N: 0.28, // Nitrogen
  O: 0.26, // Oxygen
  H: 0.20, // Hydrogen
};

// Check if an atom belongs to the sugar-phosphate backbone
const isBackboneAtom = (atom: PDBAtom): boolean => {
  return (
    atom.name.includes("'") ||
    atom.name.startsWith('P') ||
    atom.name.startsWith('OP') ||
    atom.name.startsWith('O1') ||
    atom.name.startsWith('O2') ||
    atom.name.startsWith('O3')
  );
};

export const DNAViewer: React.FC<DNAViewerProps> = ({
  viewMode,
  renderStyle,
  onChangeRenderStyle,
  sphereColorMode = 'sgk',
  onChangeSphereColorMode,
  ribbonTightness = 'close',
  onChangeRibbonTightness,
  showLabels = true,
  onToggleLabels,
  helixForm,
  showClassroomStand,
  useVietnameseX,
  rotationSpeed,
  explodedFactor,
  onSelectBasePair,
  selectedPairIndex,
  polymeraseActive = false,
  onTogglePolymerase,
  polymeraseSpeed = 2.0,
  onChangePolymeraseSpeed,
  onOpenPolymeraseWalkthrough,
  laserScannerActive = true,
  onToggleLaserScanner,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dnaGroupRef = useRef<THREE.Group | null>(null);
  const polymeraseRef = useRef<DNAPolymeraseModel | null>(null);
  const polymeraseProgressRef = useRef<number>(0);
  const laserScannerRef = useRef<THREE.Group | null>(null);
  const basePairPositionsRef = useRef<{ posA: THREE.Vector3; posB: THREE.Vector3; baseA: NucleotideType; baseB: NucleotideType }[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const interactiveObjectsRef = useRef<THREE.Mesh[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Mutable refs
  const rotationSpeedRef = useRef(rotationSpeed);
  rotationSpeedRef.current = rotationSpeed;

  const onSelectBasePairRef = useRef(onSelectBasePair);
  onSelectBasePairRef.current = onSelectBasePair;

  const useVietnameseXRef = useRef(useVietnameseX);
  useVietnameseXRef.current = useVietnameseX;

  const polymeraseActiveRef = useRef(polymeraseActive);
  polymeraseActiveRef.current = polymeraseActive;

  const polymeraseSpeedRef = useRef(polymeraseSpeed);
  polymeraseSpeedRef.current = polymeraseSpeed;

  const laserScannerActiveRef = useRef(laserScannerActive);
  laserScannerActiveRef.current = laserScannerActive;

  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [isPolymerasePlaying, setIsPolymerasePlaying] = useState<boolean>(true);
  const [polymeraseTelemetry, setPolymeraseTelemetry] = useState<PolymeraseTelemetry | null>(null);
  const [scannedTelemetry, setScannedTelemetry] = useState<{
    yPos: number;
    bpIndex: number;
    baseA: string;
    baseB: string;
    tmTemp: number;
    deltaG: number;
    hBonds: number;
  } | null>(null);

  // Cached textures
  const textures = useMemo(() => {
    return {
      A: createLetterTexture('A', '#059669', '#34d399'), // Emerald
      T: createLetterTexture('T', '#dc2626', '#f87171'), // Ruby Red
      G: createLetterTexture('G', '#d97706', '#fbbf24'), // Golden Amber
      C: createLetterTexture(useVietnameseX ? 'X' : 'C', '#0284c7', '#38bdf8'), // Cyan Blue
    };
  }, [useVietnameseX]);

  // Transform raw PDB coordinates so the DNA stands vertically along Y axis
  // 1BNA original coordinates have helical axis along Z, so (x, y, z) -> (x, -z, y)
  // Transform vector helper with support for Helix forms, unzipping, and exploded view
  const getTransformedVec3 = useCallback((
    rawX: number,
    rawY: number,
    rawZ: number,
    chain: 'A' | 'B',
    form: HelixForm,
    explode: number,
    mode: DNAViewMode
  ): THREE.Vector3 => {
    let px = rawX;
    let py = -rawZ; // Vertical axis
    let pz = rawY;

    // Exploded view: push Chain A and Chain B apart radially
    if (explode > 0) {
      const strandDir = chain === 'A' ? 1 : -1;
      px += strandDir * explode * 3.5;
    }

    // Replication fork: unzipping top residues
    if (mode === 'replication_fork' && py > 5) {
      const unzippingFactor = (py - 5) * 0.45;
      if (chain === 'A') {
        px += unzippingFactor * 2.2;
        pz += unzippingFactor * 1.5;
      } else {
        px -= unzippingFactor * 2.2;
        pz -= unzippingFactor * 1.5;
      }
    }

    // Helix forms adjustments
    if (form === 'a-dna') {
      py *= 0.78; // Compressed rise
      px *= 1.22; // Wider diameter
      pz *= 1.22;
    } else if (form === 'z-dna') {
      py *= 1.25; // Elongated
      px = -px * 0.88; // Left-handed invert
      pz *= 0.88;
    }

    return new THREE.Vector3(px, py, pz);
  }, []);

  // Transform raw PDB coordinates so the DNA stands vertically along Y axis
  const getTransformedPos = useCallback((
    atom: PDBAtom,
    form: HelixForm,
    explode: number,
    mode: DNAViewMode
  ): THREE.Vector3 => {
    return getTransformedVec3(atom.x, atom.y, atom.z, atom.chain, form, explode, mode);
  }, [getTransformedVec3]);

  // Build the 3D DNA model using real crystallographic PDB 1BNA structure
  const buildDNAModel = useCallback(() => {
    const dnaGroup = dnaGroupRef.current;
    if (!dnaGroup) return;

    // Clear previous children
    while (dnaGroup.children.length > 0) {
      const child = dnaGroup.children[0];
      dnaGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
    }
    interactiveObjectsRef.current = [];

    // Pre-calculate transformed positions for all 486 atoms
    const atomPositions = PDB_1BNA_ATOMS.map((atom) =>
      getTransformedPos(atom, helixForm, explodedFactor, viewMode)
    );

    // Materials
    const bondMat = new THREE.MeshPhysicalMaterial({
      color: '#e2e8f0',
      roughness: 0.12,
      metalness: 0.9,
      clearcoat: 0.95,
    });

    const mutationHighlightMat = new THREE.MeshPhysicalMaterial({
      color: '#f43f5e',
      emissive: '#e11d48',
      emissiveIntensity: 0.7,
      roughness: 0.12,
      metalness: 0.2,
      clearcoat: 1.0,
    });

    // Material cache for elements (CPK)
    const elementMaterials: Record<string, THREE.MeshPhysicalMaterial> = {};
    for (const [elem, col] of Object.entries(CPK_COLORS)) {
      elementMaterials[elem] = new THREE.MeshPhysicalMaterial({
        color: col,
        roughness: 0.15,
        metalness: 0.2,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
      });
    }

    // Shared IUPAC Materials:
    // Backbone Strand A: Titanium Cerulean Blue
    const matBackboneA = new THREE.MeshPhysicalMaterial({
      color: '#0284c7',
      roughness: 0.2,
      metalness: 0.25,
      clearcoat: 0.9,
    });
    // Backbone Strand B: Titanium Royal Violet
    const matBackboneB = new THREE.MeshPhysicalMaterial({
      color: '#8b5cf6',
      roughness: 0.2,
      metalness: 0.25,
      clearcoat: 0.9,
    });
    // Phosphate: Glowing Amber Gold
    const matPhosphate = new THREE.MeshPhysicalMaterial({
      color: '#f59e0b',
      roughness: 0.15,
      metalness: 0.4,
      clearcoat: 0.95,
      emissive: '#b45309',
      emissiveIntensity: 0.18,
    });
    // 4 Base types in interior core (Chuẩn IUPAC)
    const matBaseA = new THREE.MeshPhysicalMaterial({
      color: '#10b981', // Emerald Green (Adenine)
      roughness: 0.15,
      metalness: 0.15,
      clearcoat: 0.85,
      emissive: '#047857',
      emissiveIntensity: 0.12,
    });
    const matBaseT = new THREE.MeshPhysicalMaterial({
      color: '#ef4444', // Ruby Red (Thymine)
      roughness: 0.15,
      metalness: 0.15,
      clearcoat: 0.85,
      emissive: '#b91c1c',
      emissiveIntensity: 0.12,
    });
    const matBaseG = new THREE.MeshPhysicalMaterial({
      color: '#f59e0b', // Amber Gold (Guanine)
      roughness: 0.15,
      metalness: 0.15,
      clearcoat: 0.85,
      emissive: '#b45309',
      emissiveIntensity: 0.12,
    });
    const matBaseC = new THREE.MeshPhysicalMaterial({
      color: '#06b6d4', // Sky Blue (Cytosine / C)
      roughness: 0.15,
      metalness: 0.15,
      clearcoat: 0.85,
      emissive: '#0369a1',
      emissiveIntensity: 0.12,
    });

    const matStrandAOnly = new THREE.MeshPhysicalMaterial({
      color: '#06b6d4',
      roughness: 0.18,
      metalness: 0.25,
      clearcoat: 0.9,
    });
    const matStrandBOnly = new THREE.MeshPhysicalMaterial({
      color: '#d946ef',
      roughness: 0.18,
      metalness: 0.25,
      clearcoat: 0.9,
    });

    // Record central base pair positions for DNA Polymerase and telemetry
    basePairPositionsRef.current = PDB_1BNA_BASEPAIRS.map((pair) => {
      const posA = getTransformedVec3(pair.centerA.x, pair.centerA.y, pair.centerA.z, 'A', helixForm, 0, viewMode);
      const posB = getTransformedVec3(pair.centerB.x, pair.centerB.y, pair.centerB.z, 'B', helixForm, 0, viewMode);
      return {
        posA,
        posB,
        baseA: pair.baseA as NucleotideType,
        baseB: pair.baseB as NucleotideType,
      };
    });

    // ==========================================
    // 1. QUE & BI (BALL & STICK PDB MODEL)
    // Khung chrome thanh mảnh, hạt nguyên tử nhỏ gọn rõ lõi theo đúng yêu cầu người dùng
    // ==========================================
    if (renderStyle === 'ballstick') {
      // 1. Draw Covalent Bonds - Khung chrome thanh mảnh (r = 0.040), phản chiếu kim loại cao
      for (const [idxA, idxB] of PDB_1BNA_BONDS) {
        const pA = atomPositions[idxA];
        const pB = atomPositions[idxB];
        if (!pA || !pB) continue;

        const atomA = PDB_1BNA_ATOMS[idxA];
        const atomB = PDB_1BNA_ATOMS[idxB];

        // Mutation delete check: skip deleted residue 10
        if (viewMode === 'mutation_delete' && (atomA.resSeq === 10 || atomB.resSeq === 10)) {
          continue;
        }

        const isMutated =
          (viewMode === 'mutation_substitute' && (atomA.resSeq === 6 || atomB.resSeq === 6)) ||
          (viewMode === 'mutation_uv_dimer' && (atomA.resSeq === 7 || atomA.resSeq === 8));

        const dist = pA.distanceTo(pB);
        if (dist > 3.0) continue; // Don't bridge exploded/unzipped strands

        const bondGeo = new THREE.CylinderGeometry(0.040, 0.040, dist, 12);
        const bondMesh = new THREE.Mesh(bondGeo, isMutated ? mutationHighlightMat : bondMat);
        bondMesh.position.copy(pA.clone().add(pB).multiplyScalar(0.5));
        bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pB.clone().sub(pA).normalize());
        bondMesh.castShadow = true;
        dnaGroup.add(bondMesh);
      }

      // 2. Draw Atomic Spheres - Hạt nguyên tử gọn gàng, độ bóng jewel clearcoat
      for (let i = 0; i < PDB_1BNA_ATOMS.length; i++) {
        const atom = PDB_1BNA_ATOMS[i];
        const pos = atomPositions[i];

        if (viewMode === 'mutation_delete' && atom.resSeq === 10) {
          continue;
        }

        const isMutated =
          (viewMode === 'mutation_substitute' && atom.resSeq === 6) ||
          (viewMode === 'mutation_uv_dimer' && (atom.resSeq === 7 || atom.resSeq === 8));

        const r = atom.elem === 'P' ? 0.25 : 0.18;
        const atomMeshGeo = new THREE.SphereGeometry(r, 16, 16);

        let mat: THREE.Material;
        if (isMutated) {
          mat = mutationHighlightMat;
        } else if (sphereColorMode === 'sgk' || sphereColorMode === 'iupac') {
          // Chuẩn IUPAC: Phân biệt rõ Base nitơ lõi & Khung xương đường-phosphate
          const isBb = isBackboneAtom(atom);
          if (isBb) {
            mat = atom.name.startsWith('P') ? matPhosphate : (atom.chain === 'A' ? matBackboneA : matBackboneB);
          } else {
            const baseType = atom.resName.replace('D', '');
            if (baseType === 'A') mat = matBaseA;
            else if (baseType === 'T') mat = matBaseT;
            else if (baseType === 'G') mat = matBaseG;
            else mat = matBaseC;
          }
        } else if (sphereColorMode === 'strands') {
          mat = atom.chain === 'A' ? matStrandAOnly : matStrandBOnly;
        } else {
          mat = elementMaterials[atom.elem] || elementMaterials.C;
        }

        const atomMesh = new THREE.Mesh(atomMeshGeo, mat);
        atomMesh.position.copy(pos);
        atomMesh.castShadow = true;
        atomMesh.userData = {
          atom,
          baseType: atom.resName.replace('D', ''),
          resSeq: atom.resSeq,
          chain: atom.chain,
          isBackbone: isBackboneAtom(atom),
        };

        dnaGroup.add(atomMesh);
        interactiveObjectsRef.current.push(atomMesh);
      }

      // 3. Draw Letter Badges & Glowing Hydrogen Bonds for each of the 12 base pairs
      for (const pair of PDB_1BNA_BASEPAIRS) {
        if (viewMode === 'mutation_delete' && (pair.seqA === 10 || pair.seqB === 15)) {
          continue;
        }

        const baseA = pair.baseA as NucleotideType;
        const baseB = pair.baseB as NucleotideType;

        const posA = getTransformedVec3(pair.centerA.x, pair.centerA.y, pair.centerA.z, 'A', helixForm, explodedFactor, viewMode);
        const posB = getTransformedVec3(pair.centerB.x, pair.centerB.y, pair.centerB.z, 'B', helixForm, explodedFactor, viewMode);

        if (showLabels) {
          const spriteMatA = new THREE.SpriteMaterial({
            map: textures[baseA],
            transparent: true,
            depthTest: false,
          });
          const badgeA = new THREE.Sprite(spriteMatA);
          badgeA.position.copy(posA).add(new THREE.Vector3(0, 0.40, 0));
          badgeA.scale.set(1.25, 1.25, 1.25);
          dnaGroup.add(badgeA);

          const spriteMatB = new THREE.SpriteMaterial({
            map: textures[baseB],
            transparent: true,
            depthTest: false,
          });
          const badgeB = new THREE.Sprite(spriteMatB);
          badgeB.position.copy(posB).add(new THREE.Vector3(0, 0.40, 0));
          badgeB.scale.set(1.25, 1.25, 1.25);
          dnaGroup.add(badgeB);
        }

        // Glowing Hydrogen Bonds between paired bases (slender laser cylinders)
        if (viewMode !== 'replication_fork' || posA.y < 5) {
          const numBonds = (baseA === 'A' || baseA === 'T') ? 2 : 3;
          const dist = posA.distanceTo(posB);
          const hBondDir = posB.clone().sub(posA).normalize();
          const mid = posA.clone().add(posB).multiplyScalar(0.5);

          for (let b = 0; b < numBonds; b++) {
            const yOff = (b - (numBonds - 1) / 2) * 0.28;
            const hGeo = new THREE.CylinderGeometry(0.032, 0.032, Math.max(0.4, dist - 0.9), 12);
            const hMesh = new THREE.Mesh(hGeo, new THREE.MeshStandardMaterial({
              color: '#ffffff',
              emissive: '#38bdf8',
              emissiveIntensity: 0.95,
            }));
            hMesh.position.copy(mid).add(new THREE.Vector3(0, yOff, 0));
            hMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hBondDir);
            dnaGroup.add(hMesh);
          }
        }
      }
    }

    // ==========================================
    // 2. KHÔNG GIAN (TRUE VAN DER WAALS CPK MODEL)
    // Tinh gọn, bề mặt phân tử mượt mà rõ rãnh lớn và rãnh nhỏ, không bị rối mắt
    // ==========================================
    else if (renderStyle === 'sphere') {
      // Render all 486 primary atoms with compact, calibrated Van der Waals radii
      for (let i = 0; i < PDB_1BNA_ATOMS.length; i++) {
        const atom = PDB_1BNA_ATOMS[i];
        const pos = atomPositions[i];

        if (viewMode === 'mutation_delete' && atom.resSeq === 10) {
          continue;
        }

        const isMutated =
          (viewMode === 'mutation_substitute' && atom.resSeq === 6) ||
          (viewMode === 'mutation_uv_dimer' && (atom.resSeq === 7 || atom.resSeq === 8));

        const r = VDW_RADII[atom.elem] || 0.26;
        const geo = new THREE.SphereGeometry(r, 16, 16);

        let mat: THREE.Material = elementMaterials[atom.elem] || elementMaterials.C;

        if (isMutated) {
          mat = mutationHighlightMat;
        } else if (sphereColorMode === 'sgk' || sphereColorMode === 'iupac') {
          // Chuẩn IUPAC: Phân biệt rõ Khung xương đường-phosphate & Cặp base nitơ lõi
          const isBb = isBackboneAtom(atom);
          if (isBb) {
            if (atom.name.startsWith('P')) {
              mat = matPhosphate;
            } else if (atom.chain === 'A') {
              mat = matBackboneA;
            } else {
              mat = matBackboneB;
            }
          } else {
            const baseType = atom.resName.replace('D', '');
            if (baseType === 'A') mat = matBaseA;
            else if (baseType === 'T') mat = matBaseT;
            else if (baseType === 'G') mat = matBaseG;
            else mat = matBaseC;
          }
        } else if (sphereColorMode === 'strands') {
          mat = atom.chain === 'A' ? matStrandAOnly : matStrandBOnly;
        } else {
          mat = elementMaterials[atom.elem] || elementMaterials.C;
        }

        const atomMesh = new THREE.Mesh(geo, mat);
        atomMesh.position.copy(pos);
        atomMesh.castShadow = true;
        atomMesh.userData = {
          atom,
          baseType: atom.resName.replace('D', ''),
          resSeq: atom.resSeq,
          chain: atom.chain,
          isBackbone: isBackboneAtom(atom),
        };

        dnaGroup.add(atomMesh);
        interactiveObjectsRef.current.push(atomMesh);
      }

      // Letter badges visible on outer face without clipping
      if (showLabels) {
        for (const pair of PDB_1BNA_BASEPAIRS) {
          if (viewMode === 'mutation_delete' && (pair.seqA === 10 || pair.seqB === 15)) {
            continue;
          }

          const baseA = pair.baseA as NucleotideType;
          const baseB = pair.baseB as NucleotideType;

          const bbA = getTransformedVec3(pair.backboneA.x, pair.backboneA.y, pair.backboneA.z, 'A', helixForm, explodedFactor, viewMode);
          const bbB = getTransformedVec3(pair.backboneB.x, pair.backboneB.y, pair.backboneB.z, 'B', helixForm, explodedFactor, viewMode);

          const dirA = new THREE.Vector3(bbA.x, 0, bbA.z).normalize();
          const dirB = new THREE.Vector3(bbB.x, 0, bbB.z).normalize();

          const outerPosA = bbA.clone().add(dirA.clone().multiplyScalar(1.3));
          const outerPosB = bbB.clone().add(dirB.clone().multiplyScalar(1.3));

          const spriteMatA = new THREE.SpriteMaterial({
            map: textures[baseA],
            transparent: true,
            depthTest: false,
          });
          const spriteA = new THREE.Sprite(spriteMatA);
          spriteA.position.copy(outerPosA);
          spriteA.scale.set(1.3, 1.3, 1.3);
          dnaGroup.add(spriteA);

          const spriteMatB = new THREE.SpriteMaterial({
            map: textures[baseB],
            transparent: true,
            depthTest: false,
          });
          const spriteB = new THREE.Sprite(spriteMatB);
          spriteB.position.copy(outerPosB);
          spriteB.scale.set(1.3, 1.3, 1.3);
          dnaGroup.add(spriteB);
        }
      }
    }

    // ==========================================
    // 3. DẢI (CARTOON / RIBBON MODEL)
    // Tách 2 dải ra hai phía và giữ nguyên hệ thống bậc thang cặp base ở giữa theo yêu cầu người dùng!
    // ==========================================
    else if (renderStyle === 'cartoon') {
      const ribbonScale = ribbonTightness === 'close' ? 0.65 : 0.88;

      const ribbonPointsA: THREE.Vector3[] = [];
      const ribbonPointsB: THREE.Vector3[] = [];

      // Calculate anchor points for Ribbon A and Ribbon B:
      // When explodedFactor > 0: 2 dải tách xa hẳn ra hai phía khỏi phần ở giữa!
      const explodeDistance = explodedFactor * 13.5; // Tách mạnh ra hai phía theo yêu cầu

      for (const pair of PDB_1BNA_BASEPAIRS) {
        // Base backbone positions without explode
        const bbA = getTransformedVec3(pair.backboneA.x, pair.backboneA.y, pair.backboneA.z, 'A', helixForm, 0, viewMode);
        const bbB = getTransformedVec3(pair.backboneB.x, pair.backboneB.y, pair.backboneB.z, 'B', helixForm, 0, viewMode);

        // Direction radiating outward from central Y axis
        const dirA = new THREE.Vector3(bbA.x, 0, bbA.z).normalize();
        const dirB = new THREE.Vector3(bbB.x, 0, bbB.z).normalize();

        const rPtA = new THREE.Vector3(
          bbA.x * ribbonScale + dirA.x * explodeDistance,
          bbA.y,
          bbA.z * ribbonScale + dirA.z * explodeDistance
        );
        const rPtB = new THREE.Vector3(
          bbB.x * ribbonScale + dirB.x * explodeDistance,
          bbB.y,
          bbB.z * ribbonScale + dirB.z * explodeDistance
        );

        ribbonPointsA.push(rPtA);
        ribbonPointsB.push(rPtB);
      }

      const ribbonMatA = new THREE.MeshPhysicalMaterial({
        color: '#06b6d4', // Radiant Aqua Cyan
        roughness: 0.12,
        metalness: 0.45,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        emissive: '#0891b2',
        emissiveIntensity: 0.22,
      });

      const ribbonMatB = new THREE.MeshPhysicalMaterial({
        color: '#d946ef', // Radiant Orchid Magenta
        roughness: 0.12,
        metalness: 0.45,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        emissive: '#a21caf',
        emissiveIntensity: 0.22,
      });

      // Continuous, elegant helical ribbons
      if (ribbonPointsA.length > 2) {
        const curveA = new THREE.CatmullRomCurve3(ribbonPointsA, false, 'centripetal');
        const tubeGeoA = new THREE.TubeGeometry(curveA, 160, 0.58, 24, false);
        const tubeMeshA = new THREE.Mesh(tubeGeoA, ribbonMatA);
        tubeMeshA.castShadow = true;
        dnaGroup.add(tubeMeshA);

        // 5' and 3' terminal end-caps on Ribbon A
        const capGeo = new THREE.SphereGeometry(0.65, 20, 20);
        const capA5 = new THREE.Mesh(capGeo, ribbonMatA);
        capA5.position.copy(ribbonPointsA[0]);
        dnaGroup.add(capA5);

        const capA3 = new THREE.Mesh(capGeo, ribbonMatA);
        capA3.position.copy(ribbonPointsA[ribbonPointsA.length - 1]);
        dnaGroup.add(capA3);
      }

      if (ribbonPointsB.length > 2) {
        const curveB = new THREE.CatmullRomCurve3(ribbonPointsB, false, 'centripetal');
        const tubeGeoB = new THREE.TubeGeometry(curveB, 160, 0.58, 24, false);
        const tubeMeshB = new THREE.Mesh(tubeGeoB, ribbonMatB);
        tubeMeshB.castShadow = true;
        dnaGroup.add(tubeMeshB);

        // 5' and 3' terminal end-caps on Ribbon B
        const capGeo = new THREE.SphereGeometry(0.65, 20, 20);
        const capB5 = new THREE.Mesh(capGeo, ribbonMatB);
        capB5.position.copy(ribbonPointsB[ribbonPointsB.length - 1]);
        dnaGroup.add(capB5);

        const capB3 = new THREE.Mesh(capGeo, ribbonMatB);
        capB3.position.copy(ribbonPointsB[0]);
        dnaGroup.add(capB3);
      }

      // BẬC THANG CẶP BASE Ở GIỮA (GIỮ VỮNG VỊ TRÍ TRUNG TÂM THEO YÊU CẦU NGƯỜI DÙNG)
      for (let i = 0; i < PDB_1BNA_BASEPAIRS.length; i++) {
        const pair = PDB_1BNA_BASEPAIRS[i];
        if (viewMode === 'mutation_delete' && (pair.seqA === 10 || pair.seqB === 15)) {
          continue;
        }

        const baseA = pair.baseA as NucleotideType;
        const baseB = pair.baseB as NucleotideType;

        // Vị trí neo trực tiếp trên 2 dải ruy-băng A và B
        const anchorA = ribbonPointsA[i];
        const anchorB = ribbonPointsB[i];

        const spanVec = anchorB.clone().sub(anchorA);
        const spanDist = spanVec.length();
        const spanDir = spanVec.clone().normalize();
        const midCore = anchorA.clone().add(anchorB).multiplyScalar(0.5);

        const hBondGap = 0.40;
        // Bậc thang tự động co giãn theo khoảng cách thực tế giữa 2 dải, ăn khớp 100% không bao giờ bị hở
        const halfRungLen = Math.max(0.8, (spanDist - hBondGap) * 0.5);

        // Nửa bậc thang A neo từ dải A hướng vào tâm
        const centerHalfA = anchorA.clone().add(spanDir.clone().multiplyScalar(halfRungLen * 0.5));
        // Nửa bậc thang B neo từ dải B hướng vào tâm
        const centerHalfB = anchorB.clone().sub(spanDir.clone().multiplyScalar(halfRungLen * 0.5));

        const boxGeoA = new THREE.BoxGeometry(0.88, 0.36, halfRungLen);
        const boxMatA = new THREE.MeshPhysicalMaterial({
          color: baseA === 'A' ? '#10b981' : baseA === 'T' ? '#ef4444' : baseA === 'G' ? '#f59e0b' : '#0ea5e9',
          roughness: 0.14,
          metalness: 0.2,
          clearcoat: 0.9,
          emissive: baseA === 'A' ? '#047857' : baseA === 'T' ? '#b91c1c' : baseA === 'G' ? '#b45309' : '#0284c7',
          emissiveIntensity: 0.14,
        });
        const boxA = new THREE.Mesh(boxGeoA, boxMatA);
        boxA.position.copy(centerHalfA);
        boxA.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), spanDir);
        boxA.castShadow = true;
        boxA.userData = { baseType: baseA, resSeq: pair.seqA, chain: 'A' };
        dnaGroup.add(boxA);
        interactiveObjectsRef.current.push(boxA);

        const boxGeoB = new THREE.BoxGeometry(0.88, 0.36, halfRungLen);
        const boxMatB = new THREE.MeshPhysicalMaterial({
          color: baseB === 'A' ? '#10b981' : baseB === 'T' ? '#ef4444' : baseB === 'G' ? '#f59e0b' : '#0ea5e9',
          roughness: 0.14,
          metalness: 0.2,
          clearcoat: 0.9,
          emissive: baseB === 'A' ? '#047857' : baseB === 'T' ? '#b91c1c' : baseB === 'G' ? '#b45309' : '#0284c7',
          emissiveIntensity: 0.14,
        });
        const boxB = new THREE.Mesh(boxGeoB, boxMatB);
        boxB.position.copy(centerHalfB);
        boxB.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), spanDir);
        boxB.castShadow = true;
        boxB.userData = { baseType: baseB, resSeq: pair.seqB, chain: 'B' };
        dnaGroup.add(boxB);
        interactiveObjectsRef.current.push(boxB);

        // Mộng khớp phân tử (Socket Bezels) tại điểm tiếp giáp giữa ruy-băng và bậc thang
        const socketGeo = new THREE.SphereGeometry(0.46, 16, 16);
        const socketA = new THREE.Mesh(socketGeo, ribbonMatA);
        socketA.position.copy(anchorA);
        dnaGroup.add(socketA);

        const socketB = new THREE.Mesh(socketGeo, ribbonMatB);
        socketB.position.copy(anchorB);
        dnaGroup.add(socketB);

        // Letter badges for Model 3: Hover ngay phía trên các bậc thang
        if (showLabels) {
          const spriteMatA = new THREE.SpriteMaterial({
            map: textures[baseA],
            transparent: true,
            depthTest: false,
          });
          const spriteA = new THREE.Sprite(spriteMatA);
          spriteA.position.copy(centerHalfA).add(new THREE.Vector3(0, 0.45, 0));
          spriteA.scale.set(1.25, 1.25, 1.25);
          dnaGroup.add(spriteA);

          const spriteMatB = new THREE.SpriteMaterial({
            map: textures[baseB],
            transparent: true,
            depthTest: false,
          });
          const spriteB = new THREE.Sprite(spriteMatB);
          spriteB.position.copy(centerHalfB).add(new THREE.Vector3(0, 0.45, 0));
          spriteB.scale.set(1.25, 1.25, 1.25);
          dnaGroup.add(spriteB);
        }

        // Cầu nối liên kết Hydrogen phát sáng ở trung tâm (2 cho A=T, 3 cho G≡C)
        const numHbonds = (baseA === 'A' || baseA === 'T') ? 2 : 3;
        for (let b = 0; b < numHbonds; b++) {
          const yOff = (b - (numHbonds - 1) / 2) * 0.28;
          const hGeo = new THREE.CylinderGeometry(0.048, 0.048, hBondGap * 0.95, 12);
          const hMat = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            emissive: '#38bdf8',
            emissiveIntensity: 1.2,
          });
          const hMesh = new THREE.Mesh(hGeo, hMat);
          hMesh.position.copy(midCore).add(new THREE.Vector3(0, yOff, 0));
          hMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), spanDir);
          dnaGroup.add(hMesh);
        }
      }
    }

    // Classroom Stand (Giá đỡ phòng thí nghiệm sinh học)
    if (showClassroomStand) {
      const standGroup = new THREE.Group();
      const baseMat = new THREE.MeshPhysicalMaterial({
        color: '#0f172a',
        metalness: 0.85,
        roughness: 0.15,
        clearcoat: 0.9,
      });
      const chromeMat = new THREE.MeshPhysicalMaterial({
        color: '#e2e8f0',
        metalness: 0.98,
        roughness: 0.08,
        clearcoat: 1.0,
      });

      // Pedestal base
      const baseGeo = new THREE.CylinderGeometry(8.5, 9.5, 1.2, 64);
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(0, -18.5, 0);
      baseMesh.receiveShadow = true;
      standGroup.add(baseMesh);

      const chromeBevelGeo = new THREE.TorusGeometry(9.0, 0.2, 16, 64);
      const chromeBevel = new THREE.Mesh(chromeBevelGeo, chromeMat);
      chromeBevel.position.set(0, -17.9, 0);
      chromeBevel.rotation.x = Math.PI / 2;
      standGroup.add(chromeBevel);

      // Central axis rod
      const rodGeo = new THREE.CylinderGeometry(0.32, 0.32, 38, 32);
      const rodMesh = new THREE.Mesh(rodGeo, chromeMat);
      rodMesh.position.set(0, 0, 0);
      rodMesh.castShadow = true;
      standGroup.add(rodMesh);

      // Top chrome finial
      const finialGeo = new THREE.SphereGeometry(1.1, 32, 32);
      const finialMesh = new THREE.Mesh(finialGeo, chromeMat);
      finialMesh.position.set(0, 19.5, 0);
      standGroup.add(finialMesh);

      dnaGroup.add(standGroup);
    }
  }, [renderStyle, sphereColorMode, ribbonTightness, showLabels, helixForm, viewMode, showClassroomStand, explodedFactor, textures, getTransformedPos, getTransformedVec3]);

  // One-time Three.js scene setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || (window.innerHeight - 64) || 600;

    // Scene
    const scene = new THREE.Scene();
    
    // High-end cinematic radial vignette background (deep bio-navy to obsidian)
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 512;
    bgCanvas.height = 512;
    const bgCtx = bgCanvas.getContext('2d');
    if (bgCtx) {
      const grad = bgCtx.createRadialGradient(256, 256, 15, 256, 256, 360);
      grad.addColorStop(0, '#0c1b33'); // Bio-luminescent dark cyan-navy
      grad.addColorStop(0.5, '#070f1e'); // Deep space navy
      grad.addColorStop(1, '#020408'); // Pure obsidian at border
      bgCtx.fillStyle = grad;
      bgCtx.fillRect(0, 0, 512, 512);
    }
    const bgTexture = new THREE.CanvasTexture(bgCanvas);
    scene.background = bgTexture;
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 36);
    cameraRef.current = camera;

    // High performance WebGL renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 80;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Balanced 4-point studio lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 2.6);
    keyLight.position.set(25, 35, 30);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#38bdf8', 1.6);
    fillLight.position.set(-30, -10, -25);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#c084fc', 2.2);
    rimLight.position.set(0, -30, 25);
    scene.add(rimLight);

    const kickLight = new THREE.DirectionalLight('#fbbf24', 1.0);
    kickLight.position.set(0, 30, -30);
    scene.add(kickLight);

    // Floating Atmospheric Bioluminescent Dust Particles (280 quantum particles with color variation)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const colorPalette = [
      new THREE.Color('#38bdf8'), // Sky Cyan
      new THREE.Color('#10b981'), // Emerald
      new THREE.Color('#fbbf24'), // Gold
      new THREE.Color('#c084fc'), // Purple
    ];
    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePos[p] = (Math.random() - 0.5) * 65;
      particlePos[p + 1] = (Math.random() - 0.5) * 65;
      particlePos[p + 2] = (Math.random() - 0.5) * 65;
      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      particleColors[p] = c.r;
      particleColors[p + 1] = c.g;
      particleColors[p + 2] = c.b;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.52,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Bio-Laser Scanner Scanning Plane
    const laserScannerGroup = new THREE.Group();
    laserScannerGroup.visible = laserScannerActiveRef.current;

    // 1. Semi-transparent laser scanning disk
    const scanPlaneGeo = new THREE.CircleGeometry(16, 48);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: '#06b6d4',
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    laserScannerGroup.add(scanPlane);

    // 2. High-intensity outer perimeter laser beam ring
    const beamRingGeo = new THREE.TorusGeometry(16, 0.08, 8, 48);
    const beamRingMat = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
      transparent: true,
      opacity: 0.88,
    });
    const beamRing = new THREE.Mesh(beamRingGeo, beamRingMat);
    beamRing.rotation.x = Math.PI / 2;
    laserScannerGroup.add(beamRing);

    // 3. Inner focal scanning ring
    const innerRingGeo = new THREE.TorusGeometry(4.2, 0.07, 8, 36);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: '#10b981',
      transparent: true,
      opacity: 0.95,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    laserScannerGroup.add(innerRing);

    // 4. Center scanner light emitter
    const laserLight = new THREE.PointLight('#06b6d4', 2.2, 16);
    laserScannerGroup.add(laserLight);

    scene.add(laserScannerGroup);
    laserScannerRef.current = laserScannerGroup;

    // Group for DNA
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);
    dnaGroupRef.current = dnaGroup;

    // Phức Hệ Enzyme DNA Polymerase III Chuẩn Cấu Trúc Bậc 2 PDB
    const polymerase = new DNAPolymeraseModel();
    polymerase.group.visible = false;
    scene.add(polymerase.group);
    polymeraseRef.current = polymerase;

    // Build model immediately
    buildDNAModel();

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.baseType && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.baseType) {
          const { baseType, resSeq, chain, atom } = obj.userData;
          const nuName = useVietnameseXRef.current && baseType === 'C' ? 'Cytosine (C/X)' : NUCLEOTIDES_SGK[baseType as NucleotideType]?.fullName || baseType;
          const compBase = NUCLEOTIDES_SGK[baseType as NucleotideType]?.complementary || (baseType === 'A' ? 'T' : baseType === 'T' ? 'A' : baseType === 'G' ? 'C' : 'G');
          const compName = useVietnameseXRef.current && compBase === 'C' ? 'Cytosine (C/X)' : NUCLEOTIDES_SGK[compBase]?.fullName || compBase;
          const hBonds = (baseType === 'A' || baseType === 'T') ? 2 : 3;
          const atomDetail = atom ? ` • Nguyên tử ${atom.elem} (${atom.name})` : '';

          setHoveredInfo(`${nuName} [Chuỗi ${chain} • bp #${resSeq}]${atomDetail} • ${hBonds} liên kết Hydrogen với ${compName}`);
          containerRef.current.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredInfo(null);
      containerRef.current.style.cursor = 'grab';
    };

    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.baseType && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.baseType) {
          const { baseType, resSeq, chain } = obj.userData;
          const strand = chain === 'B' ? 2 : 1;
          const compBase = (baseType === 'A' ? 'T' : baseType === 'T' ? 'A' : baseType === 'G' ? 'C' : 'G') as NucleotideType;
          const basePairData: BasePairData = {
            index: typeof resSeq === 'number' ? resSeq - 1 : 0,
            baseA: baseType,
            baseB: compBase,
            positionY: 0,
            rotationY: 0,
          };
          soundFx.playBaseSelect(baseType);
          onSelectBasePairRef.current(basePairData, baseType, strand);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', handlePointerMove);
    dom.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (dnaGroupRef.current && rotationSpeedRef.current > 0) {
        dnaGroupRef.current.rotation.y += 0.007 * rotationSpeedRef.current;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0008;
      }

      // Cập nhật động học Phức Hệ DNA Polymerase III
      if (polymeraseRef.current) {
        if (polymeraseActiveRef.current) {
          polymeraseRef.current.group.visible = true;
          if (isPolymerasePlaying) {
            polymeraseProgressRef.current += (polymeraseSpeedRef.current * 0.016);
          }
          const tNow = performance.now() * 0.001;
          const tlm = polymeraseRef.current.update(
            basePairPositionsRef.current,
            polymeraseProgressRef.current,
            tNow
          );
          if (Math.floor(tNow * 10) % 2 === 0) {
            setPolymeraseTelemetry(tlm);
          }
        } else {
          polymeraseRef.current.group.visible = false;
        }
      }

      // Cập nhật Tia Laser Sinh Học Quét Phân Tử (Bio-Laser Scanner)
      if (laserScannerRef.current) {
        if (laserScannerActiveRef.current) {
          laserScannerRef.current.visible = true;
          const tNow = performance.now() * 0.001;
          const laserY = Math.sin(tNow * 0.85) * 20.0;
          laserScannerRef.current.position.y = laserY;
          laserScannerRef.current.rotation.z += 0.005;

          // Phát hiện cặp base đang được laser quét qua
          if (basePairPositionsRef.current.length > 0) {
            let closestIdx = 0;
            let minDy = 999;
            for (let i = 0; i < basePairPositionsRef.current.length; i++) {
              const bpY = (basePairPositionsRef.current[i].posA.y + basePairPositionsRef.current[i].posB.y) * 0.5;
              const dy = Math.abs(bpY - laserY);
              if (dy < minDy) {
                minDy = dy;
                closestIdx = i;
              }
            }

            if (minDy < 2.2 && Math.floor(tNow * 10) % 2 === 0) {
              const bp = basePairPositionsRef.current[closestIdx];
              const hBonds = (bp.baseA === 'A' || bp.baseA === 'T') ? 2 : 3;
              const tm = (bp.baseA === 'G' || bp.baseA === 'C') ? 74.5 : 66.2;
              const dG = (bp.baseA === 'G' || bp.baseA === 'C') ? -2.4 : -1.3;
              setScannedTelemetry({
                yPos: laserY,
                bpIndex: closestIdx + 1,
                baseA: bp.baseA,
                baseB: bp.baseB,
                tmTemp: tm,
                deltaG: dG,
                hBonds,
              });
            }
          }
        } else {
          laserScannerRef.current.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // ResizeObserver - dynamically fits container down to exact pixel
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || container.clientWidth || window.innerWidth;
        const h = entry.contentRect.height || container.clientHeight || window.innerHeight;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h, false);
        }
      }
    });

    resizeObserver.observe(container);

    const handleWindowResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h, false);
      }
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      dom.removeEventListener('pointermove', handlePointerMove);
      dom.removeEventListener('click', handleClick);
      if (polymeraseRef.current) polymeraseRef.current.dispose();
      renderer.dispose();
    };
  }, []); // Run ONCE on mount

  // Whenever visual props change, rebuild without resetting camera
  useEffect(() => {
    buildDNAModel();
  }, [buildDNAModel]);

  // Reset view handler
  const handleResetView = () => {
    if (!controlsRef.current || !cameraRef.current) return;
    soundFx.playClick();
    controlsRef.current.reset();
    cameraRef.current.position.set(0, 2, 36);
    controlsRef.current.target.set(0, 0, 0);
    if (dnaGroupRef.current) {
      dnaGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div
      className="relative w-full h-full select-none overflow-hidden bg-slate-950 flex-1 min-h-0"
    >
      {/* Three.js canvas container - fills 100% of viewport, eliminating any bottom gap */}
      <div
        ref={containerRef}
        className="w-full h-full absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Floating UI Panel (Mục 1 2 3 chỉ để tên loại mô hình như người dùng yêu cầu) */}
      <div className="absolute top-4 left-4 z-10 w-80 max-w-[calc(100vw-32px)] bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 p-4 flex flex-col gap-3 pointer-events-auto">
        {/* Tiêu đề */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-cyan-400">
              Chuỗi Xoắn Kép DNA
            </h1>
            <span className="text-[10px] font-mono bg-cyan-950 px-2 py-0.5 rounded text-cyan-300 border border-cyan-800">
              PDB: 1BNA
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cấu trúc B-DNA thực nghiệm tinh thể học (RCSB PDB 1BNA, Nature 1980)
          </p>
        </div>

        {/* Hướng dẫn thao tác */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs">
          <h2 className="font-semibold text-slate-300 mb-1.5 border-b border-slate-800 pb-1">
            Hướng dẫn thao tác chuột / cảm ứng:
          </h2>
          <ul className="space-y-1 text-slate-400 text-[11px]">
            <li><span className="text-cyan-400 font-bold">↻ Xoay:</span> Chuột trái & kéo (hoặc vuốt 1 ngón)</li>
            <li><span className="text-cyan-400 font-bold">⇹ Di chuyển:</span> Chuột phải & kéo (hoặc vuốt 2 ngón)</li>
            <li><span className="text-cyan-400 font-bold">± Thu/Phóng:</span> Cuộn chuột (hoặc chụm ngón tay)</li>
            <li><span className="text-emerald-400 font-bold">🔍 Chi tiết:</span> Nhấp trực tiếp vào bất kỳ nguyên tử/nuclêôtit nào</li>
          </ul>
        </div>

        {/* Bảng chọn kiểu hiển thị (Mục 1, 2, 3 CHỈ ĐỂ TÊN theo đúng yêu cầu người dùng) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-0.5">
            <span>Kiểu hiển thị:</span>
            <button
              onClick={handleResetView}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Góc mặc định</span>
            </button>
          </div>

          {/* Mục 1: Que & Bi */}
          <button
            onClick={() => {
              soundFx.playClick();
              onChangeRenderStyle('ballstick');
            }}
            className={`w-full text-left px-3.5 py-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-2.5 cursor-pointer ${
              renderStyle === 'ballstick'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <span className="text-base">⚛</span>
            <span>1. Que & Bi</span>
          </button>

          {/* Sub-panel for 1. Que & Bi */}
          {renderStyle === 'ballstick' && (
            <div className="p-2.5 bg-slate-950/90 border border-blue-500/30 rounded-xl flex flex-col gap-1.5 animate-fadeIn text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-semibold text-blue-400">Tùy biến Que & Bi:</span>
                <button
                  onClick={onToggleLabels}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    showLabels
                      ? 'bg-blue-950 border-blue-600 text-blue-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {showLabels ? '👁️ Đang hiện nhãn' : '👁️ Đã ẩn nhãn'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onChangeSphereColorMode?.('sgk')}
                  className={`px-1 py-1 rounded text-[10px] font-semibold text-center transition-colors cursor-pointer ${
                    sphereColorMode === 'sgk'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Chuẩn IUPAC: Phân biệt rõ các cặp base nitơ trong lõi và khung đường - phosphate"
                >
                  Chuẩn IUPAC (Lõi & Khung)
                </button>
                <button
                  onClick={() => onChangeSphereColorMode?.('cpk')}
                  className={`px-1 py-1 rounded text-[10px] font-semibold text-center transition-colors cursor-pointer ${
                    sphereColorMode === 'cpk'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Màu nguyên tử hóa học CPK chuẩn quốc tế (C xám, O đỏ, N lam, P vàng)"
                >
                  Nguyên tử CPK
                </button>
              </div>
            </div>
          )}

          {/* Mục 2: Không Gian */}
          <button
            onClick={() => {
              soundFx.playClick();
              onChangeRenderStyle('sphere');
            }}
            className={`w-full text-left px-3.5 py-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-2.5 cursor-pointer ${
              renderStyle === 'sphere'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <span className="text-base">🌑</span>
            <span>2. Không Gian</span>
          </button>

          {/* Sub-panel for 2. Không Gian */}
          {renderStyle === 'sphere' && (
            <div className="p-2.5 bg-slate-950/90 border border-cyan-500/30 rounded-xl flex flex-col gap-1.5 animate-fadeIn text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-semibold text-cyan-400">Tùy biến Không Gian:</span>
                <button
                  onClick={onToggleLabels}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    showLabels
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {showLabels ? '👁️ Đang hiện nhãn' : '👁️ Đã ẩn nhãn'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => onChangeSphereColorMode?.('sgk')}
                  className={`px-1 py-1 rounded text-[10px] font-semibold text-center transition-colors cursor-pointer ${
                    sphereColorMode === 'sgk'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Chuẩn IUPAC: Phân biệt rõ khung đường - phosphate viền ngoài và các cặp base A-T & G-C trong lõi"
                >
                  Chuẩn IUPAC
                </button>
                <button
                  onClick={() => onChangeSphereColorMode?.('strands')}
                  className={`px-1 py-1 rounded text-[10px] font-semibold text-center transition-colors cursor-pointer ${
                    sphereColorMode === 'strands'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Tô màu phân biệt 2 chuỗi polynucleotide xoắn đối song"
                >
                  2 Chuỗi Polynucleotide
                </button>
                <button
                  onClick={() => onChangeSphereColorMode?.('cpk')}
                  className={`px-1 py-1 rounded text-[10px] font-semibold text-center transition-colors cursor-pointer ${
                    sphereColorMode === 'cpk'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Màu nguyên tử hóa học CPK chuẩn quốc tế (C xám, O đỏ, N lam, P vàng, H trắng)"
                >
                  Nguyên tử CPK
                </button>
              </div>
            </div>
          )}

          {/* Mục 4: Mô Phỏng Phức Hệ DNA Polymerase III */}
          <div className="pt-1.5 border-t border-slate-800">
            <button
              onClick={() => {
                soundFx.playClick();
                onTogglePolymerase?.();
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
                polymeraseActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🧬</span>
                <span>Enzyme DNA Polymerase III</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                polymeraseActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {polymeraseActive ? 'ĐANG CHẠY' : 'BẬT'}
              </span>
            </button>

            {/* Nút Khám Phá Hướng Dẫn Tương Tác 5'->3' & Okazaki */}
            {onOpenPolymeraseWalkthrough && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenPolymeraseWalkthrough();
                }}
                className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 hover:text-white text-[11px] font-semibold flex items-center justify-between cursor-pointer transition-colors shadow-sm"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hướng dẫn cơ chế 5'→3' & Okazaki</span>
                </span>
                <span className="text-[10px] bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-300 font-mono">5 BƯỚC</span>
              </button>
            )}
          </div>

          {/* Mục 5: Tia Laser Sinh Học Quét Phân Tử */}
          <div className="pt-1.5 border-t border-slate-800">
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleLaserScanner?.();
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
                laserScannerActive
                  ? 'bg-gradient-to-r from-cyan-900/80 to-blue-900/80 text-white border-cyan-400 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${laserScannerActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                <span>Tia Laser Quét Phân Tử</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                laserScannerActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {laserScannerActive ? 'ĐANG QUÉT' : 'TẮT'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Top-Right: DNA Polymerase Replication Console & Laboratory Telemetry HUD */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2.5 max-w-sm pointer-events-none select-none">
        {/* DNA Polymerase III Active Console */}
        {polymeraseActive && (
          <div className="w-full bg-slate-950/92 border border-emerald-500/50 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl pointer-events-auto flex flex-col gap-2 animate-fadeIn text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-xs text-emerald-300">DNA Polymerase III Holoenzyme</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-950/90 text-emerald-400 px-2 py-0.5 rounded border border-emerald-700/60">
                5' → 3'
              </span>
            </div>

            {/* Reaction telemetry info */}
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex flex-col gap-1 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">VỊ TRÍ:</span>
                <span className="text-cyan-300 font-bold">Cặp base #{polymeraseTelemetry?.currentBpIndex || 1} / 12</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">MẠCH KHUÔN:</span>
                <span className="text-emerald-400 font-bold">Base {polymeraseTelemetry?.templateBase || 'A'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">CƠ CHẤT GẮN:</span>
                <span className="text-amber-400 font-bold">{polymeraseTelemetry?.incomingSubstrate || 'dTTP'} (Watson - Crick)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">GIAI ĐOẠN:</span>
                <span className="text-sky-300">{polymeraseTelemetry?.reactionPhase || 'Gắn kết dNTP'}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Đọc sửa 3'→5':</span>
                <span className="text-emerald-400">Hoạt động (99.999%)</span>
              </div>
            </div>

            {/* Polymerase interactive controls */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsPolymerasePlaying(!isPolymerasePlaying);
                  }}
                  className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isPolymerasePlaying
                      ? 'bg-amber-600/90 text-white border-amber-500 hover:bg-amber-500'
                      : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                  }`}
                  title={isPolymerasePlaying ? 'Tạm dừng mô phỏng' : 'Tiếp tục mô phỏng'}
                >
                  {isPolymerasePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPolymerasePlaying ? 'Tạm dừng' : 'Chạy tiếp'}</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    polymeraseProgressRef.current = Math.floor(polymeraseProgressRef.current) + 1;
                  }}
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Tiến thêm 1 nucleotide"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>+1 bp</span>
                </button>
              </div>

              {/* Speed selector */}
              <div className="flex items-center gap-1">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      soundFx.playClick();
                      onChangePolymeraseSpeed?.(spd);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      polymeraseSpeed === spd
                        ? 'bg-cyan-600 text-white border border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Nút Khám Phá Hướng Dẫn Tương Tác 5'->3' & Okazaki */}
            {onOpenPolymeraseWalkthrough && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenPolymeraseWalkthrough();
                }}
                className="w-full mt-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-900/90 to-cyan-950/90 hover:from-emerald-800 hover:to-cyan-900 border border-emerald-500/50 text-emerald-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
                <span>Hướng Dẫn: Chiều 5'→3' & Mạch Dẫn/Muộn</span>
              </button>
            )}
          </div>
        )}

        {/* Scientific Laboratory Telemetry HUD Overlay */}
        <div className="w-full bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>RCSB PDB ID: 1BNA</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              RES: 1.90 Å
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono text-slate-300 pt-0.5">
            <div><span className="text-slate-500">DẠNG:</span> B-DNA Dodecamer</div>
            <div><span className="text-slate-500">XOẮN:</span> 36.0° / bp</div>
            <div><span className="text-slate-500">BƯỚC:</span> 3.4 nm (10 bp)</div>
            <div><span className="text-slate-500">ĐƯỜNG KÍNH:</span> 2.0 nm</div>
          </div>
        </div>

        {/* Nanoscale Ruler & Reticle indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-xl text-[10px] font-mono text-slate-400">
          <span className="text-cyan-400">├── 1.0 nm (10 Å) ──┤</span>
          <span className="text-slate-500">•</span>
          <span>Rãnh lớn: 2.2 nm | Rãnh nhỏ: 1.2 nm</span>
        </div>

        {/* Bio-Laser Real-time Scanning Telemetry HUD */}
        {laserScannerActive && scannedTelemetry && (
          <div className="w-full bg-slate-950/92 border border-cyan-500/50 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl flex flex-col gap-1.5 pointer-events-auto animate-fadeIn text-[11px] font-mono text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>QUÉT QUANG HỌC BIOLASER</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-700/60">
                Y = {scannedTelemetry.yPos > 0 ? `+${scannedTelemetry.yPos.toFixed(1)}` : scannedTelemetry.yPos.toFixed(1)} Å
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] pt-0.5">
              <div className="text-slate-300">
                <span className="text-slate-500">CẶP BASE: </span>
                <span className="text-cyan-300 font-bold">#{scannedTelemetry.bpIndex} ({scannedTelemetry.baseA}≡{scannedTelemetry.baseB})</span>
              </div>
              <div className="text-slate-300 text-right">
                <span className="text-slate-500">LIÊN KẾT H: </span>
                <span className="text-amber-300 font-bold">{scannedTelemetry.hBonds} liên kết</span>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">NHIỆT CHẢY Tm: </span>
                <span className="text-emerald-300 font-bold">{scannedTelemetry.tmTemp.toFixed(1)}°C</span>
              </div>
              <div className="text-slate-300 text-right">
                <span className="text-slate-500">NĂNG LƯỢNG ΔG: </span>
                <span className="text-purple-300 font-bold">{scannedTelemetry.deltaG.toFixed(1)} kcal/mol</span>
              </div>
            </div>
          </div>
        )}

        {/* Hover / Selected Info Pill */}
        {hoveredInfo && (
          <div className="w-full animate-fadeIn">
            <div className="bg-slate-950/92 border border-cyan-500/60 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-medium text-cyan-300 shadow-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="font-mono tracking-tight text-[11px] leading-tight">{hoveredInfo}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mode Overlay Badge for Mutations */}
      <div className="absolute bottom-24 left-4 z-10 pointer-events-none">
        {viewMode !== 'normal' && (
          <div className="bg-rose-950/90 border border-rose-500/70 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-rose-200 shadow-2xl flex items-center gap-2 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
            <span>
              {viewMode === 'mutation_substitute' && 'ĐANG MÔ PHỎNG: Đột biến thay thế cặp nucleotide (Transversion A-T → T-A)'}
              {viewMode === 'mutation_insert' && 'ĐANG MÔ PHỎNG: Đột biến chèn thêm cặp nucleotide (Frameshift Insertion +1 bp)'}
              {viewMode === 'mutation_delete' && 'ĐANG MÔ PHỎNG: Đột biến mất cặp nucleotide (Frameshift Deletion -1 bp)'}
              {viewMode === 'mutation_uv_dimer' && 'ĐANG MÔ PHỎNG: Tổn thương quang hóa tia UV tạo Dimer Thymine (T=T)'}
              {viewMode === 'replication_fork' && 'ĐANG MÔ PHỎNG: Chạc ba tái bản DNA (DNA Replication Fork)'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
