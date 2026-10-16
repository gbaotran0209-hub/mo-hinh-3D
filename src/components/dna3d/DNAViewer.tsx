import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DNAViewMode, NucleotideType, BasePairData, RenderStyle, HelixForm, SphereColorMode, RibbonTightness } from '../../types/genetics';
import { NUCLEOTIDES_SGK } from '../../data/geneticsData';
import { PDB_1BNA_ATOMS, PDB_1BNA_BONDS, PDB_1BNA_BASEPAIRS, PDBAtom } from '../../data/pdb1bna';
import { soundFx } from '../../utils/soundEffects';
import { RefreshCw, Sparkles, Eye, EyeOff } from 'lucide-react';

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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dnaGroupRef = useRef<THREE.Group | null>(null);
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

  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

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

    // ==========================================
    // 1. QUE & BI (BALL & STICK PDB MODEL)
    // Sáng bóng, kim loại chrome, chuẩn IUPAC màu base nitơ & liên kết hydrogen
    // ==========================================
    if (renderStyle === 'ballstick') {
      // 1. Draw 544 Covalent Bonds (Connecting Cylinders)
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

        const bondGeo = new THREE.CylinderGeometry(0.065, 0.065, dist, 12);
        const bondMesh = new THREE.Mesh(bondGeo, isMutated ? mutationHighlightMat : bondMat);
        bondMesh.position.copy(pA.clone().add(pB).multiplyScalar(0.5));
        bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pB.clone().sub(pA).normalize());
        bondMesh.castShadow = true;
        dnaGroup.add(bondMesh);
      }

      // 2. Draw 486 Atomic Spheres (sleek, polished jewel spheres)
      for (let i = 0; i < PDB_1BNA_ATOMS.length; i++) {
        const atom = PDB_1BNA_ATOMS[i];
        const pos = atomPositions[i];

        if (viewMode === 'mutation_delete' && atom.resSeq === 10) {
          continue;
        }

        const isMutated =
          (viewMode === 'mutation_substitute' && atom.resSeq === 6) ||
          (viewMode === 'mutation_uv_dimer' && (atom.resSeq === 7 || atom.resSeq === 8));

        const r = atom.elem === 'P' ? 0.36 : 0.28;
        const atomMeshGeo = new THREE.SphereGeometry(r, 16, 16);

        let mat: THREE.Material;
        if (isMutated) {
          mat = mutationHighlightMat;
        } else if (sphereColorMode === 'sgk') {
          // Chuẩn SGK: Phân biệt rõ Bazơ nitơ lõi & Khung xương đường-photphat
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
          // Sprite billboard A (Always facing camera, no clipping)
          const spriteMatA = new THREE.SpriteMaterial({
            map: textures[baseA],
            transparent: true,
            depthTest: false,
          });
          const badgeA = new THREE.Sprite(spriteMatA);
          badgeA.position.copy(posA).add(new THREE.Vector3(0, 0.45, 0));
          badgeA.scale.set(1.35, 1.35, 1.35);
          dnaGroup.add(badgeA);

          const spriteMatB = new THREE.SpriteMaterial({
            map: textures[baseB],
            transparent: true,
            depthTest: false,
          });
          const badgeB = new THREE.Sprite(spriteMatB);
          badgeB.position.copy(posB).add(new THREE.Vector3(0, 0.45, 0));
          badgeB.scale.set(1.35, 1.35, 1.35);
          dnaGroup.add(badgeB);
        }

        // Glowing Hydrogen Bonds between paired bases
        if (viewMode !== 'replication_fork' || posA.y < 5) {
          const numBonds = (baseA === 'A' || baseA === 'T') ? 2 : 3;
          const dist = posA.distanceTo(posB);
          const hBondDir = posB.clone().sub(posA).normalize();
          const mid = posA.clone().add(posB).multiplyScalar(0.5);

          for (let b = 0; b < numBonds; b++) {
            const yOff = (b - (numBonds - 1) / 2) * 0.30;
            const hGeo = new THREE.CylinderGeometry(0.045, 0.045, Math.max(0.4, dist - 1.2), 12);
            const hMesh = new THREE.Mesh(hGeo, new THREE.MeshStandardMaterial({
              color: '#ffffff',
              emissive: '#38bdf8',
              emissiveIntensity: 0.85,
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
    // Hạt nhỏ gọn, mật độ cao, phân biệt rõ khung xương & lõi bazơ để không bị rối mắt
    // ==========================================
    else if (renderStyle === 'sphere') {
      // Render all 486 primary atoms with compact, fine Van der Waals radii
      for (let i = 0; i < PDB_1BNA_ATOMS.length; i++) {
        const atom = PDB_1BNA_ATOMS[i];
        const pos = atomPositions[i];

        if (viewMode === 'mutation_delete' && atom.resSeq === 10) {
          continue; // Deleted
        }

        const isMutated =
          (viewMode === 'mutation_substitute' && atom.resSeq === 6) ||
          (viewMode === 'mutation_uv_dimer' && (atom.resSeq === 7 || atom.resSeq === 8));

        const r = VDW_RADII[atom.elem] || 0.28;
        const geo = new THREE.SphereGeometry(r, 16, 16);

        let mat: THREE.Material = elementMaterials[atom.elem] || elementMaterials.C;

        if (isMutated) {
          mat = mutationHighlightMat;
        } else if (sphereColorMode === 'sgk') {
          // Chuẩn SGK: Phân biệt rõ Khung xương đường-photphat & Cặp bazơ nitơ lõi
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

      // Add high-density Van der Waals surface contact spheres along covalent bonds
      // This produces the realistic "nhiều hạt hơn" (~900 compact glistening beads)
      // and fills the inter-atomic crevices like true crystallographic molecular surfaces
      const contactGeo = new THREE.SphereGeometry(0.20, 12, 12);
      for (const [idxA, idxB] of PDB_1BNA_BONDS) {
        const atomA = PDB_1BNA_ATOMS[idxA];
        const atomB = PDB_1BNA_ATOMS[idxB];
        if (!atomA || !atomB) continue;

        if (viewMode === 'mutation_delete' && (atomA.resSeq === 10 || atomB.resSeq === 10)) {
          continue;
        }

        const posA = atomPositions[idxA];
        const posB = atomPositions[idxB];
        if (!posA || !posB) continue;

        const dist = posA.distanceTo(posB);
        if (dist >= 1.25 && dist <= 1.7) {
          const midPos = posA.clone().add(posB).multiplyScalar(0.5);

          let beadMat: THREE.Material;
          if (sphereColorMode === 'sgk') {
            const isBbA = isBackboneAtom(atomA);
            const isBbB = isBackboneAtom(atomB);
            if (isBbA && isBbB) {
              beadMat = (atomA.name.startsWith('P') || atomB.name.startsWith('P'))
                ? matPhosphate
                : (atomA.chain === 'A' ? matBackboneA : matBackboneB);
            } else {
              const baseType = atomA.resName.replace('D', '');
              if (baseType === 'A') beadMat = matBaseA;
              else if (baseType === 'T') beadMat = matBaseT;
              else if (baseType === 'G') beadMat = matBaseG;
              else beadMat = matBaseC;
            }
          } else if (sphereColorMode === 'strands') {
            beadMat = atomA.chain === 'A' ? matStrandAOnly : matStrandBOnly;
          } else {
            beadMat = elementMaterials[atomA.elem] || elementMaterials.C;
          }

          const beadMesh = new THREE.Mesh(contactGeo, beadMat);
          beadMesh.position.copy(midPos);
          dnaGroup.add(beadMesh);
        }
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

          // Calculate radial outward vector from central helical axis (along Y)
          const dirA = new THREE.Vector3(bbA.x, 0, bbA.z).normalize();
          const dirB = new THREE.Vector3(bbB.x, 0, bbB.z).normalize();

          // Float cleanly outside the Van der Waals sphere radius
          const outerPosA = bbA.clone().add(dirA.clone().multiplyScalar(1.5));
          const outerPosB = bbB.clone().add(dirB.clone().multiplyScalar(1.5));

          const spriteMatA = new THREE.SpriteMaterial({
            map: textures[baseA],
            transparent: true,
            depthTest: false,
          });
          const spriteA = new THREE.Sprite(spriteMatA);
          spriteA.position.copy(outerPosA);
          spriteA.scale.set(1.4, 1.4, 1.4);
          dnaGroup.add(spriteA);

          const spriteMatB = new THREE.SpriteMaterial({
            map: textures[baseB],
            transparent: true,
            depthTest: false,
          });
          const spriteB = new THREE.Sprite(spriteMatB);
          spriteB.position.copy(outerPosB);
          spriteB.scale.set(1.4, 1.4, 1.4);
          dnaGroup.add(spriteB);
        }
      }
    }

    // ==========================================
    // 3. DẢI (CARTOON / RIBBON MODEL)
    // 2 dải gần lại với nhau theo yêu cầu, gắn kết liền mạch với bậc thang bazơ nitơ
    // ==========================================
    else if (renderStyle === 'cartoon') {
      // Radial scale factor to bring the 2 ribbons close together as requested:
      // Standard outer phosphate backbone is at radius ~10.2 Å.
      // Scaling to 0.64 (radius ~6.5 Å) brings the 2 ribbon strands much closer together,
      // creating an authentic, cohesive textbook double-helix ribbon!
      const ribbonScale = ribbonTightness === 'close' ? 0.64 : 0.90;

      const ribbonPointsA: THREE.Vector3[] = [];
      const ribbonPointsB: THREE.Vector3[] = [];

      // Calculate the 12 base-pair anchor points for Ribbon A and Ribbon B
      for (const pair of PDB_1BNA_BASEPAIRS) {
        const fullA = getTransformedVec3(pair.backboneA.x, pair.backboneA.y, pair.backboneA.z, 'A', helixForm, explodedFactor, viewMode);
        const fullB = getTransformedVec3(pair.backboneB.x, pair.backboneB.y, pair.backboneB.z, 'B', helixForm, explodedFactor, viewMode);

        const rPtA = new THREE.Vector3(fullA.x * ribbonScale, fullA.y, fullA.z * ribbonScale);
        const rPtB = new THREE.Vector3(fullB.x * ribbonScale, fullB.y, fullB.z * ribbonScale);

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
        const tubeGeoA = new THREE.TubeGeometry(curveA, 160, 0.60, 24, false);
        const tubeMeshA = new THREE.Mesh(tubeGeoA, ribbonMatA);
        tubeMeshA.castShadow = true;
        dnaGroup.add(tubeMeshA);

        // 5' and 3' terminal end-caps on Ribbon A
        const capGeo = new THREE.SphereGeometry(0.68, 20, 20);
        const capA5 = new THREE.Mesh(capGeo, ribbonMatA);
        capA5.position.copy(ribbonPointsA[0]);
        dnaGroup.add(capA5);

        const capA3 = new THREE.Mesh(capGeo, ribbonMatA);
        capA3.position.copy(ribbonPointsA[ribbonPointsA.length - 1]);
        dnaGroup.add(capA3);
      }

      if (ribbonPointsB.length > 2) {
        const curveB = new THREE.CatmullRomCurve3(ribbonPointsB, false, 'centripetal');
        const tubeGeoB = new THREE.TubeGeometry(curveB, 160, 0.60, 24, false);
        const tubeMeshB = new THREE.Mesh(tubeGeoB, ribbonMatB);
        tubeMeshB.castShadow = true;
        dnaGroup.add(tubeMeshB);

        // 5' and 3' terminal end-caps on Ribbon B
        const capGeo = new THREE.SphereGeometry(0.68, 20, 20);
        const capB5 = new THREE.Mesh(capGeo, ribbonMatB);
        capB5.position.copy(ribbonPointsB[ribbonPointsB.length - 1]);
        dnaGroup.add(capB5);

        const capB3 = new THREE.Mesh(capGeo, ribbonMatB);
        capB3.position.copy(ribbonPointsB[0]);
        dnaGroup.add(capB3);
      }

      // Stepped transverse ladder rungs for base pairs:
      // Spanning CONTINUOUSLY from Ribbon A all the way into Ribbon B!
      for (let i = 0; i < PDB_1BNA_BASEPAIRS.length; i++) {
        const pair = PDB_1BNA_BASEPAIRS[i];
        if (viewMode === 'mutation_delete' && (pair.seqA === 10 || pair.seqB === 15)) {
          continue;
        }

        const baseA = pair.baseA as NucleotideType;
        const baseB = pair.baseB as NucleotideType;

        const rPtA = ribbonPointsA[i];
        const rPtB = ribbonPointsB[i];

        const chord = rPtB.clone().sub(rPtA);
        const chordLen = chord.length();
        const chordDir = chord.clone().normalize();
        const mid = rPtA.clone().add(rPtB).multiplyScalar(0.5);

        // Hydrogen bond junction gap in the exact center
        const hBondGap = 0.38;
        const halfRungLen = Math.max(0.6, (chordLen - hBondGap) * 0.5);

        // Half-rung A starts right at Ribbon A and extends inwards to the center
        const centerHalfA = rPtA.clone().add(chordDir.clone().multiplyScalar(halfRungLen * 0.5));
        // Half-rung B starts right at Ribbon B and extends inwards to the center
        const centerHalfB = rPtB.clone().sub(chordDir.clone().multiplyScalar(halfRungLen * 0.5));

        const boxGeoA = new THREE.BoxGeometry(0.92, 0.40, halfRungLen);
        const boxMatA = new THREE.MeshPhysicalMaterial({
          color: baseA === 'A' ? '#10b981' : baseA === 'T' ? '#ef4444' : baseA === 'G' ? '#f59e0b' : '#06b6d4',
          roughness: 0.14,
          metalness: 0.2,
          clearcoat: 0.9,
          emissive: baseA === 'A' ? '#047857' : baseA === 'T' ? '#b91c1c' : baseA === 'G' ? '#b45309' : '#0369a1',
          emissiveIntensity: 0.12,
        });
        const boxA = new THREE.Mesh(boxGeoA, boxMatA);
        boxA.position.copy(centerHalfA);
        boxA.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), chordDir);
        boxA.castShadow = true;
        boxA.userData = { baseType: baseA, resSeq: pair.seqA, chain: 'A' };
        dnaGroup.add(boxA);
        interactiveObjectsRef.current.push(boxA);

        const boxGeoB = new THREE.BoxGeometry(0.92, 0.40, halfRungLen);
        const boxMatB = new THREE.MeshPhysicalMaterial({
          color: baseB === 'A' ? '#10b981' : baseB === 'T' ? '#ef4444' : baseB === 'G' ? '#f59e0b' : '#06b6d4',
          roughness: 0.14,
          metalness: 0.2,
          clearcoat: 0.9,
          emissive: baseB === 'A' ? '#047857' : baseB === 'T' ? '#b91c1c' : baseB === 'G' ? '#b45309' : '#0369a1',
          emissiveIntensity: 0.12,
        });
        const boxB = new THREE.Mesh(boxGeoB, boxMatB);
        boxB.position.copy(centerHalfB);
        boxB.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), chordDir);
        boxB.castShadow = true;
        boxB.userData = { baseType: baseB, resSeq: pair.seqB, chain: 'B' };
        dnaGroup.add(boxB);
        interactiveObjectsRef.current.push(boxB);

        // Letter badges for Model 3: Billboard sprites always facing camera!
        if (showLabels) {
          const spriteMatA = new THREE.SpriteMaterial({
            map: textures[baseA],
            transparent: true,
            depthTest: false,
          });
          const spriteA = new THREE.Sprite(spriteMatA);
          spriteA.position.copy(centerHalfA).add(new THREE.Vector3(0, 0.48, 0));
          spriteA.scale.set(1.3, 1.3, 1.3);
          dnaGroup.add(spriteA);

          const spriteMatB = new THREE.SpriteMaterial({
            map: textures[baseB],
            transparent: true,
            depthTest: false,
          });
          const spriteB = new THREE.Sprite(spriteMatB);
          spriteB.position.copy(centerHalfB).add(new THREE.Vector3(0, 0.48, 0));
          spriteB.scale.set(1.3, 1.3, 1.3);
          dnaGroup.add(spriteB);
        }

        // Center glowing hydrogen bond bridge (2 for A=T, 3 for G≡X)
        const numHbonds = (baseA === 'A' || baseA === 'T') ? 2 : 3;
        for (let b = 0; b < numHbonds; b++) {
          const yOff = (b - (numHbonds - 1) / 2) * 0.28;
          const hGeo = new THREE.CylinderGeometry(0.065, 0.065, hBondGap * 0.9, 12);
          const hMat = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            emissive: '#38bdf8',
            emissiveIntensity: 0.9,
          });
          const hMesh = new THREE.Mesh(hGeo, hMat);
          hMesh.position.copy(mid).add(new THREE.Vector3(0, yOff, 0));
          hMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), chordDir);
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

    // Floating Atmospheric Bioluminescent Dust Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePos[p] = (Math.random() - 0.5) * 60;
      particlePos[p + 1] = (Math.random() - 0.5) * 60;
      particlePos[p + 2] = (Math.random() - 0.5) * 60;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#38bdf8',
      size: 0.45,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Group for DNA
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);
    dnaGroupRef.current = dnaGroup;

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

          {/* Mục 3: Dải */}
          <button
            onClick={() => {
              soundFx.playClick();
              onChangeRenderStyle('cartoon');
            }}
            className={`w-full text-left px-3.5 py-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-2.5 cursor-pointer ${
              renderStyle === 'cartoon'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <span className="text-base">🧬</span>
            <span>3. Dải</span>
          </button>

          {/* Sub-panel for 3. Dải */}
          {renderStyle === 'cartoon' && (
            <div className="p-2.5 bg-slate-950/90 border border-purple-500/30 rounded-xl flex flex-col gap-1.5 animate-fadeIn text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-semibold text-purple-400">Khoảng cách 2 dải:</span>
                <button
                  onClick={onToggleLabels}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    showLabels
                      ? 'bg-purple-950 border-purple-600 text-purple-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {showLabels ? '👁️ Đang hiện nhãn' : '👁️ Đã ẩn nhãn'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onChangeRibbonTightness?.('close')}
                  className={`px-1 py-1 rounded text-[10px] font-semibold text-center transition-colors cursor-pointer ${
                    ribbonTightness === 'close'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Hai dải áp sát chuẩn tỉ lệ B-DNA (RCSB PDB), nối liền khít với các bậc thang base nitơ"
                >
                  Gần nhau (Compact B-DNA)
                </button>
                <button
                  onClick={() => onChangeRibbonTightness?.('wide')}
                  className={`px-1 py-1 rounded text-[10px] font-semibold text-center transition-colors cursor-pointer ${
                    ribbonTightness === 'wide'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Mở rộng khoảng cách 2 dải"
                >
                  Mở rộng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scientific Laboratory Telemetry HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none select-none flex flex-col gap-2">
        <div className="bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl flex flex-col gap-1 max-w-xs sm:max-w-sm">
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
      </div>

      {/* Hover / Selected Info Pill */}
      {hoveredInfo && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none animate-fadeIn">
          <div className="bg-slate-950/90 border border-cyan-500/60 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-medium text-cyan-300 shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="font-mono tracking-tight">{hoveredInfo}</span>
          </div>
        </div>
      )}

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
