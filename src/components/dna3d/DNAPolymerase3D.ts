import * as THREE from 'three';
import { NucleotideType } from '../../types/genetics';

export interface PolymeraseTelemetry {
  currentBpIndex: number;
  templateBase: NucleotideType;
  incomingSubstrate: string;
  reactionPhase: 'Gắn kết dNTP' | 'Xúc tác liên kết Phosphodiester' | 'Tịnh tiến 5\' → 3\'';
  proofreadingActive: boolean;
  fidelityRate: string;
  processivity: string;
}

// Procedural 3D Helix Curve for Alpha-Helices
class AlphaHelixCurve extends THREE.Curve<THREE.Vector3> {
  private radius: number;
  private height: number;
  private turns: number;
  private startAngle: number;

  constructor(radius = 0.55, height = 3.6, turns = 3.5, startAngle = 0) {
    super();
    this.radius = radius;
    this.height = height;
    this.turns = turns;
    this.startAngle = startAngle;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const angle = this.startAngle + t * this.turns * Math.PI * 2;
    const x = this.radius * Math.cos(angle);
    const y = (t - 0.5) * this.height;
    const z = this.radius * Math.sin(angle);
    return optionalTarget.set(x, y, z);
  }
}

// Procedural Undulating Curve for Beta-Sheets
class BetaStrandCurve extends THREE.Curve<THREE.Vector3> {
  private length: number;
  private waves: number;
  private amplitude: number;

  constructor(length = 3.8, waves = 2.5, amplitude = 0.32) {
    super();
    this.length = length;
    this.waves = waves;
    this.amplitude = amplitude;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const x = Math.sin(t * this.waves * Math.PI * 2) * this.amplitude;
    const y = (t - 0.5) * this.length;
    const z = 0;
    return optionalTarget.set(x, y, z);
  }
}

export class DNAPolymeraseModel {
  public group: THREE.Group;
  private clampGroup: THREE.Group;
  private palmGroup: THREE.Group;
  private fingersGroup: THREE.Group;
  private thumbGroup: THREE.Group;
  private mgIon1: THREE.Mesh;
  private mgIon2: THREE.Mesh;
  private mgLight: THREE.PointLight;
  private incomingDntpGroup: THREE.Group;
  private dntpPhosphate1: THREE.Mesh;
  private dntpPhosphate2: THREE.Mesh;
  private dntpPhosphate3: THREE.Mesh;
  private dntpBaseSphere: THREE.Mesh;
  private dntpLabelSprite: THREE.Sprite;
  private daughterStrandGroup: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'DNAPolymeraseComplex_PDB';

    // Materials - High grade biological PBR finishes
    // 1. Beta-Clamp 24K Topaz Gold Metallic
    const clampGoldMat = new THREE.MeshPhysicalMaterial({
      color: '#f59e0b',
      emissive: '#d97706',
      emissiveIntensity: 0.28,
      metalness: 0.94,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
    });

    const clampHingeMat = new THREE.MeshPhysicalMaterial({
      color: '#fbbf24',
      metalness: 0.98,
      roughness: 0.10,
      clearcoat: 1.0,
    });

    // 2. Alpha-Helix Ribbon Material (Cyan/Sapphire Bio-Crystal)
    const helixMat = new THREE.MeshPhysicalMaterial({
      color: '#0284c7', // Sky-Sapphire
      emissive: '#0369a1',
      emissiveIntensity: 0.22,
      roughness: 0.20,
      metalness: 0.35,
      clearcoat: 0.95,
      clearcoatRoughness: 0.10,
    });

    // 3. Beta-Sheet Ribbon Material (Emerald/Teal Pleated Ribbon)
    const betaSheetMat = new THREE.MeshPhysicalMaterial({
      color: '#059669', // Emerald
      emissive: '#047857',
      emissiveIntensity: 0.26,
      roughness: 0.18,
      metalness: 0.30,
      clearcoat: 0.95,
      clearcoatRoughness: 0.10,
      side: THREE.DoubleSide,
    });

    // 4. Thumb Domain Alpha-Helix (Purple / Amethyst)
    const thumbHelixMat = new THREE.MeshPhysicalMaterial({
      color: '#8b5cf6', // Violet
      emissive: '#7c3aed',
      emissiveIntensity: 0.24,
      roughness: 0.20,
      metalness: 0.35,
      clearcoat: 0.95,
      clearcoatRoughness: 0.10,
    });

    // =========================================================================
    // 1. BETA-SLIDING CLAMP (HOMODIMER RING WITH HINGE & CLEFT CHANNELS)
    // =========================================================================
    this.clampGroup = new THREE.Group();
    this.clampGroup.position.set(0, -2.4, 0);

    // Two semi-circular subunits forming the clamp ring
    const subunitAngle = Math.PI - 0.20;
    const ringRadius = 3.6;
    const ringTube = 0.46;

    const clampGeo1 = new THREE.TorusGeometry(ringRadius, ringTube, 16, 36, subunitAngle);
    const clampMesh1 = new THREE.Mesh(clampGeo1, clampGoldMat);
    clampMesh1.rotation.x = Math.PI / 2;
    clampMesh1.rotation.z = 0.10;
    clampMesh1.castShadow = true;
    this.clampGroup.add(clampMesh1);

    const clampGeo2 = new THREE.TorusGeometry(ringRadius, ringTube, 16, 36, subunitAngle);
    const clampMesh2 = new THREE.Mesh(clampGeo2, clampGoldMat);
    clampMesh2.rotation.x = Math.PI / 2;
    clampMesh2.rotation.z = Math.PI + 0.10;
    clampMesh2.castShadow = true;
    this.clampGroup.add(clampMesh2);

    // Hinge joints connecting the two clamp halves
    const hingeGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.65, 16);
    const hinge1 = new THREE.Mesh(hingeGeo, clampHingeMat);
    hinge1.position.set(ringRadius, 0, 0);
    this.clampGroup.add(hinge1);

    const hinge2 = new THREE.Mesh(hingeGeo, clampHingeMat);
    hinge2.position.set(-ringRadius, 0, 0);
    this.clampGroup.add(hinge2);

    this.group.add(this.clampGroup);

    // =========================================================================
    // 2. CATALYTIC PALM DOMAIN (ANTIPARALLEL BETA-SHEET CORE & Mg2+ ACTIVE SITE)
    // =========================================================================
    this.palmGroup = new THREE.Group();
    this.palmGroup.position.set(2.2, 0.2, 0.8);

    // 3 parallel/antiparallel beta-strands with directional arrow tips
    for (let b = 0; b < 3; b++) {
      const strandCurve = new BetaStrandCurve(3.6, 2.0, 0.25);
      const strandGeo = new THREE.TubeGeometry(strandCurve, 40, 0.22, 12, false);
      const strandMesh = new THREE.Mesh(strandGeo, betaSheetMat);
      strandMesh.position.set((b - 1) * 0.72, 0, (b % 2 === 0 ? 0.2 : -0.2));
      strandMesh.rotation.z = Math.PI / 8;
      strandMesh.castShadow = true;
      this.palmGroup.add(strandMesh);

      // Arrow tip on beta-strand (PDB cartoon ribbon convention)
      const arrowGeo = new THREE.ConeGeometry(0.40, 0.75, 12);
      const arrowMesh = new THREE.Mesh(arrowGeo, betaSheetMat);
      arrowMesh.position.set((b - 1) * 0.72, b % 2 === 0 ? 1.9 : -1.9, (b % 2 === 0 ? 0.2 : -0.2));
      arrowMesh.rotation.x = b % 2 === 0 ? 0 : Math.PI;
      this.palmGroup.add(arrowMesh);
    }

    // Scaffold alpha-helices backing the palm
    const palmHelix1 = new THREE.TubeGeometry(new AlphaHelixCurve(0.55, 3.8, 3.0), 50, 0.20, 12, false);
    const palmMeshH1 = new THREE.Mesh(palmHelix1, helixMat);
    palmMeshH1.position.set(1.4, 0, -0.6);
    palmMeshH1.rotation.x = Math.PI / 6;
    this.palmGroup.add(palmMeshH1);

    this.group.add(this.palmGroup);

    // =========================================================================
    // 3. FINGERS DOMAIN (FLEXIBLE BUNDLE OF ALPHA-HELICES FOR dNTP BINDING)
    // =========================================================================
    this.fingersGroup = new THREE.Group();
    this.fingersGroup.position.set(2.0, 1.8, -1.2);

    // 4 coiled alpha-helices creating the fingers domain pocket
    for (let f = 0; f < 4; f++) {
      const angleOffset = (f * Math.PI) / 2;
      const fingerCurve = new AlphaHelixCurve(0.50, 3.4, 2.8, angleOffset);
      const fingerGeo = new THREE.TubeGeometry(fingerCurve, 48, 0.18, 12, false);
      const fingerMesh = new THREE.Mesh(fingerGeo, helixMat);
      fingerMesh.position.set(Math.cos(angleOffset) * 0.75, 0, Math.sin(angleOffset) * 0.75);
      fingerMesh.rotation.x = -Math.PI / 4 + (f * 0.08);
      fingerMesh.castShadow = true;
      this.fingersGroup.add(fingerMesh);
    }

    this.group.add(this.fingersGroup);

    // =========================================================================
    // 4. THUMB DOMAIN (ALPHA-HELICAL GRASP OVER DUPLEX EXIT CHANNEL)
    // =========================================================================
    this.thumbGroup = new THREE.Group();
    this.thumbGroup.position.set(-2.0, 0.8, 1.8);

    for (let t = 0; t < 2; t++) {
      const thumbCurve = new AlphaHelixCurve(0.58, 3.6, 3.0, t * Math.PI);
      const thumbGeo = new THREE.TubeGeometry(thumbCurve, 48, 0.20, 12, false);
      const thumbMesh = new THREE.Mesh(thumbGeo, thumbHelixMat);
      thumbMesh.position.set(t * 0.75, 0, 0);
      thumbMesh.rotation.y = Math.PI / 4;
      thumbMesh.rotation.z = -Math.PI / 8;
      thumbMesh.castShadow = true;
      this.thumbGroup.add(thumbMesh);
    }

    this.group.add(this.thumbGroup);

    // =========================================================================
    // 5. CATALYTIC ACTIVE SITE: DUAL Mg2+ IONS & FLUORESCENT CHARGE
    // =========================================================================
    const mgGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const mgMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#06b6d4',
      emissiveIntensity: 2.2,
      roughness: 0.08,
    });

    this.mgIon1 = new THREE.Mesh(mgGeo, mgMat);
    this.mgIon1.position.set(1.2, 0.4, 0.5);
    this.group.add(this.mgIon1);

    this.mgIon2 = new THREE.Mesh(mgGeo, mgMat);
    this.mgIon2.position.set(1.8, 0.2, 0.8);
    this.group.add(this.mgIon2);

    // Coordination bond dashed lines to simulate active site coordination
    const coordMat = new THREE.LineDashedMaterial({
      color: '#38bdf8',
      dashSize: 0.15,
      gapSize: 0.08,
      linewidth: 2,
    });
    const coordPts = [
      new THREE.Vector3(1.2, 0.4, 0.5),
      new THREE.Vector3(1.8, 0.2, 0.8),
      new THREE.Vector3(1.5, 0.9, 0.2),
    ];
    const coordGeo = new THREE.BufferGeometry().setFromPoints(coordPts);
    const coordLine = new THREE.Line(coordGeo, coordMat);
    coordLine.computeLineDistances();
    this.group.add(coordLine);

    this.mgLight = new THREE.PointLight('#38bdf8', 2.2, 9);
    this.mgLight.position.set(1.5, 0.3, 0.65);
    this.group.add(this.mgLight);

    // =========================================================================
    // 6. INCOMING dNTP SUBSTRATE (TRIPHOSPHATE + NITROGENOUS BASE + LABEL)
    // =========================================================================
    this.incomingDntpGroup = new THREE.Group();
    const pGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const pMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#d97706',
      emissiveIntensity: 0.8,
      roughness: 0.15,
    });

    // α, β, γ phosphate spheres
    this.dntpPhosphate1 = new THREE.Mesh(pGeo, pMat);
    this.dntpPhosphate2 = new THREE.Mesh(pGeo, pMat);
    this.dntpPhosphate3 = new THREE.Mesh(pGeo, pMat);
    this.dntpPhosphate1.position.set(0, 0, 0);
    this.dntpPhosphate2.position.set(0.38, 0.16, 0);
    this.dntpPhosphate3.position.set(0.76, 0.32, 0);
    this.incomingDntpGroup.add(this.dntpPhosphate1);
    this.incomingDntpGroup.add(this.dntpPhosphate2);
    this.incomingDntpGroup.add(this.dntpPhosphate3);

    // Deoxyribose ring
    const riboseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.14, 5);
    const riboseMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3 });
    const riboseMesh = new THREE.Mesh(riboseGeo, riboseMat);
    riboseMesh.position.set(-0.35, -0.05, 0);
    riboseMesh.rotation.x = Math.PI / 2;
    this.incomingDntpGroup.add(riboseMesh);

    // Nitrogenous Base plate
    const baseGeo = new THREE.BoxGeometry(0.72, 0.34, 0.90);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      roughness: 0.15,
      emissive: '#059669',
      emissiveIntensity: 0.6,
    });
    this.dntpBaseSphere = new THREE.Mesh(baseGeo, baseMat);
    this.dntpBaseSphere.position.set(-0.85, -0.1, 0);
    this.incomingDntpGroup.add(this.dntpBaseSphere);

    // HUD sprite label
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('dNTP', 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.dntpLabelSprite = new THREE.Sprite(spriteMat);
    this.dntpLabelSprite.scale.set(1.2, 1.2, 1.2);
    this.dntpLabelSprite.position.set(-0.2, 0.9, 0);
    this.incomingDntpGroup.add(this.dntpLabelSprite);

    this.group.add(this.incomingDntpGroup);

    // =========================================================================
    // 7. NASCENT DAUGHTER STRAND TAIL (EMERGING FROM EXIT CHANNEL)
    // =========================================================================
    this.daughterStrandGroup = new THREE.Group();
    const daughterCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.8, 0.6),
      new THREE.Vector3(-0.8, -2.8, 1.2),
      new THREE.Vector3(-1.4, -3.8, 1.8),
    ]);
    const daughterGeo = new THREE.TubeGeometry(daughterCurve, 24, 0.32, 12, false);
    const daughterMat = new THREE.MeshPhysicalMaterial({
      color: '#10b981', // Nascent Green
      emissive: '#059669',
      emissiveIntensity: 0.7,
      roughness: 0.12,
      clearcoat: 1.0,
    });
    const daughterMesh = new THREE.Mesh(daughterGeo, daughterMat);
    this.daughterStrandGroup.add(daughterMesh);
    this.group.add(this.daughterStrandGroup);
  }

  public update(
    basePairPositions: { posA: THREE.Vector3; posB: THREE.Vector3; baseA: NucleotideType; baseB: NucleotideType }[],
    progressFloat: number,
    timeSec: number
  ): PolymeraseTelemetry {
    if (!basePairPositions || basePairPositions.length === 0) {
      return {
        currentBpIndex: 0,
        templateBase: 'A',
        incomingSubstrate: 'dTTP',
        reactionPhase: 'Gắn kết dNTP',
        proofreadingActive: true,
        fidelityRate: '99.999% (1 sai sót / 10^7 bp)',
        processivity: 'Kẹp trượt khóa vòng kép (> 5,000 bp)',
      };
    }

    const n = basePairPositions.length;
    const normalizedProgress = ((progressFloat % n) + n) % n;
    const idx0 = Math.floor(normalizedProgress);
    const idx1 = (idx0 + 1) % n;
    const frac = normalizedProgress - idx0;

    const currentPair = basePairPositions[idx0];
    const nextPair = basePairPositions[idx1];

    // Enzyme follows template strand (Strand A)
    const targetPos0 = currentPair.posA;
    const targetPos1 = nextPair.posA;
    const interpPos = targetPos0.clone().lerp(targetPos1, frac);

    this.group.position.copy(interpPos);

    // Rotate enzyme so active site always faces the helical core
    const angleY = Math.atan2(interpPos.x, interpPos.z);
    this.group.rotation.y = angleY + Math.PI / 2;

    // Fingers domain conformational flex:
    // Open during approach (frac < 0.4), closes tightly during phosphodiester catalysis (frac 0.4 - 0.85)
    let fingerFlex = 0;
    if (frac < 0.40) {
      // Open conformation
      fingerFlex = 0.18 * (1 - frac / 0.40);
    } else if (frac < 0.85) {
      // Tightly closed catalytic conformation
      fingerFlex = -0.15;
    } else {
      // Re-opening for translocation
      fingerFlex = 0.12 * ((frac - 0.85) / 0.15);
    }
    this.fingersGroup.rotation.x = -Math.PI / 4 + fingerFlex;

    // Substrate dNTP animation: flies in, docks at frac > 0.4
    const templateBase = currentPair.baseA;
    const compBase: NucleotideType =
      templateBase === 'A' ? 'T' : templateBase === 'T' ? 'A' : templateBase === 'G' ? 'C' : 'G';
    const substrateName = `d${compBase}TP`;

    const substrateColor =
      compBase === 'A' ? '#10b981' : compBase === 'T' ? '#ef4444' : compBase === 'G' ? '#f59e0b' : '#06b6d4';
    (this.dntpBaseSphere.material as THREE.MeshStandardMaterial).color.set(substrateColor);

    if (frac < 0.42) {
      // Approach phase
      const approachFrac = frac / 0.42;
      this.incomingDntpGroup.position.set(4.2 * (1 - approachFrac) + 0.8, 1.5 * (1 - approachFrac), 1.6 * (1 - approachFrac));
      this.incomingDntpGroup.scale.setScalar(0.65 + approachFrac * 0.35);
      this.mgLight.intensity = 1.2;
    } else {
      // Docked & Catalytic bond formation phase
      this.incomingDntpGroup.position.set(0.8, 0, 0);
      this.incomingDntpGroup.scale.setScalar(1.0);
      // Flash of phosphodiester bond creation
      this.mgLight.intensity = 2.4 + Math.sin(timeSec * 24) * 1.0;
    }

    let reactionPhase: PolymeraseTelemetry['reactionPhase'] = 'Gắn kết dNTP';
    if (frac > 0.42 && frac < 0.85) {
      reactionPhase = 'Xúc tác liên kết Phosphodiester';
    } else if (frac >= 0.85) {
      reactionPhase = 'Tịnh tiến 5\' → 3\'';
    }

    return {
      currentBpIndex: idx0 + 1,
      templateBase,
      incomingSubstrate: substrateName,
      reactionPhase,
      proofreadingActive: true,
      fidelityRate: '99.999% (1 sai sót / 10^7 bp)',
      processivity: 'Kẹp trượt khóa vòng kép (> 5,000 bp)',
    };
  }

  public dispose() {
    this.group.traverse((obj) => {
      if ((obj as any).geometry) (obj as any).geometry.dispose();
      if ((obj as any).material) {
        if (Array.isArray((obj as any).material)) {
          (obj as any).material.forEach((m: any) => m.dispose());
        } else {
          (obj as any).material.dispose();
        }
      }
    });
  }
}
