export type NucleotideType = 'A' | 'T' | 'G' | 'C';

export interface NucleotideInfo {
  type: NucleotideType;
  fullName: string;
  vietnameseName: string;
  category: 'Purine' | 'Pyrimidine';
  rings: number;
  formula: string;
  molarMass?: string;
  complementary: NucleotideType;
  hydrogenBonds: number;
  color: string;
  hexCode: string;
  description: string;
  iupacRole?: string;
  sgkRole?: string;
  biologicalRole?: string;
}

export interface BasePairData {
  index: number;
  baseA: NucleotideType;
  baseB: NucleotideType;
  isMutated?: boolean;
  mutationType?: MutationKind;
  isDimer?: boolean;
  positionY: number;
  rotationY: number;
  notes?: string;
}

export type MutationKind =
  | 'none'
  | 'substitution_missense' // Thay thế 1 cặp nucleotide
  | 'insertion_frameshift'  // Thêm 1 cặp nucleotide
  | 'deletion_frameshift'   // Mất 1 cặp nucleotide
  | 'uv_thymine_dimer';     // Đột biến do tia UV: Dimer Thymine (T=T)

export type DNAViewMode = 
  | 'normal'
  | 'mutation_substitute'
  | 'mutation_insert'
  | 'mutation_delete'
  | 'mutation_uv_dimer'
  | 'replication_fork';

// 3 Kiểu hiển thị phân tử chuẩn 3Dmol.js / PDB:
// 1. ballstick: Que & Bi (Covalent bonds & Atom spheres)
// 2. sphere: Không Gian (Van der Waals CPK Surface)
// 3. cartoon: Dải (Ribbon secondary structure)
export type RenderStyle = 'ballstick' | 'sphere' | 'cartoon';

// Chế độ màu sắc: Chuẩn IUPAC / 2 Chuỗi Polynucleotide / Nguyên tử CPK
export type SphereColorMode = 'iupac' | 'strands' | 'cpk' | 'sgk';

// Độ gần của 2 dải ở Mô hình 3 (Dải Cartoon): 'close' = Gần nhau (Compact B-DNA), 'wide' = Mở rộng
export type RibbonTightness = 'close' | 'wide';

export type HelixForm = 'b-dna' | 'a-dna' | 'z-dna';

export interface HighSchoolMutationExample {
  id: string;
  name: string;
  sgkClass: 'Lớp 10' | 'Lớp 12';
  mutationType: string;
  normalCodon: string;
  mutatedCodon: string;
  normalPhenotype: string;
  mutatedPhenotype: string;
  mechanism: string;
}

export interface CodonEntry {
  codon: string;
  aminoAcid: string;
  aminoAcidFullName: string;
  letterCode: string;
  property: 'Hydrophobic' | 'Polar' | 'Acidic' | 'Basic' | 'Special' | 'Stop';
  vietnameseName: string;
}

export interface LabCase {
  id: string;
  title: string;
  patientProfile: string;
  symptoms: string[];
  wildtypeSequence: string;
  patientSequence: string;
  geneName: string;
  targetIndex: number;
  mutationKind: string;
  diagnosis: string;
  fixAction: 'substitute' | 'repair_dimer';
  solutionDescription: string;
}
