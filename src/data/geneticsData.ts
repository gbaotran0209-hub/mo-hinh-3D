import { NucleotideInfo, HighSchoolMutationExample, CodonEntry, LabCase } from '../types/genetics';

export const NUCLEOTIDES_DATA: Record<string, NucleotideInfo> = {
  A: {
    type: 'A',
    fullName: 'Adenine',
    vietnameseName: 'Adenine (A)',
    category: 'Purine',
    rings: 2,
    formula: 'C₅H₅N₅',
    complementary: 'T',
    hydrogenBonds: 2,
    color: 'red',
    hexCode: '#EF4444',
    description: 'Nitrogenous base kích thước lớn (Purine gồm 2 dị vòng). Liên kết bổ sung đặc hiệu với Thymine (T) bằng 2 liên kết Hydrogen (A = T).',
    biologicalRole: 'Đơn phân cấu trúc của DNA và RNA; đồng thời là thành phần cấu tạo Adenosine Triphosphate (ATP) - chất mang năng lượng chủ đạo của tế bào.'
  },
  T: {
    type: 'T',
    fullName: 'Thymine',
    vietnameseName: 'Thymine (T)',
    category: 'Pyrimidine',
    rings: 1,
    formula: 'C₅H₆N₂O₂',
    complementary: 'A',
    hydrogenBonds: 2,
    color: 'blue',
    hexCode: '#3B82F6',
    description: 'Nitrogenous base kích thước nhỏ (Pyrimidine gồm 1 dị vòng). Đặc trưng riêng biệt của DNA (trong RNA được thay thế bằng Uracil).',
    biologicalRole: 'Duy trì tính ổn định cấu trúc chuỗi xoắn kép DNA. Dưới tác động của bức xạ cực tím UV có thể tạo liên kết chéo dimer thymine (T=T).'
  },
  G: {
    type: 'G',
    fullName: 'Guanine',
    vietnameseName: 'Guanine (G)',
    category: 'Purine',
    rings: 2,
    formula: 'C₅H₅N₅O',
    complementary: 'C',
    hydrogenBonds: 3,
    color: 'yellow',
    hexCode: '#EAB308',
    description: 'Nitrogenous base kích thước lớn (Purine gồm 2 dị vòng). Liên kết bổ sung đặc hiệu với Cytosine (C) bằng 3 liên kết Hydrogen (G ≡ C).',
    biologicalRole: 'Hình thành 3 liên kết Hydrogen có năng lượng liên kết cao; các đoạn DNA giàu cặp G-C có nhiệt độ biến tính (Tm) và độ bền phân tử cao hơn.'
  },
  C: {
    type: 'C',
    fullName: 'Cytosine',
    vietnameseName: 'Cytosine (C)',
    category: 'Pyrimidine',
    rings: 1,
    formula: 'C₄H₅N₃O',
    complementary: 'G',
    hydrogenBonds: 3,
    color: 'green',
    hexCode: '#22C55E',
    description: 'Nitrogenous base kích thước nhỏ (Pyrimidine gồm 1 dị vòng). Liên kết bổ sung đặc hiệu với Guanine (G) bằng 3 liên kết Hydrogen.',
    biologicalRole: 'Cấu tạo phân tử DNA và RNA; là vị trí diễn ra cơ chế methyl hóa DNA (5-methylcytosine) đóng vai trò chủ chốt trong điều hòa biểu hiện gen biểu sinh (epigenetics).'
  }
};

export const NUCLEOTIDES_SGK = NUCLEOTIDES_DATA;
export const NUCLEOTIDES = NUCLEOTIDES_DATA;

export const DNA_BIOPHYSICAL_SPECS = [
  {
    name: 'Đường kính chuỗi xoắn (Helical Diameter)',
    value: '2.0 nm (20.0 Å)',
    detail: 'Khoảng cách xuyên tâm ổn định dọc theo trục do 1 Purine (vòng đôi) luôn kết cặp với 1 Pyrimidine (vòng đơn).'
  },
  {
    name: 'Bước xoắn chu kỳ (Helical Pitch)',
    value: '3.4 nm (34.0 Å)',
    detail: 'Mỗi chu kỳ xoắn hoàn chỉnh 360° gồm xấp xỉ 10.0 - 10.5 cặp base (base pairs), tương ứng 20 - 21 nucleotide.'
  },
  {
    name: 'Tịnh tiến dọc trục (Rise per Base Pair)',
    value: '0.34 nm (3.4 Å)',
    detail: 'Khoảng cách giữa hai cặp base kế tiếp dọc theo trục xoắn; góc xoay tương đối giữa 2 cặp liên tiếp là 36°.'
  },
  {
    name: 'Hướng xoắn không gian (Handedness)',
    value: 'Xoắn phải (Right-handed, B-DNA)',
    detail: 'Hai chuỗi polynucleotide chạy đối song (Antiparallel): Một chuỗi định hướng 5\' → 3\', chuỗi đối diện định hướng 3\' → 5\'.'
  },
  {
    name: 'Nguyên tắc bổ sung Watson - Crick',
    value: 'A = T (2 LK Hydrogen) ; G ≡ C (3 LK Hydrogen)',
    detail: 'Quy tắc Chargaff: [A] = [T] và [G] = [C]; do đó tổng Purine luôn bằng tổng Pyrimidine ([A+G] = [T+C]).'
  }
];

export const SGK_ADN_SPECS = DNA_BIOPHYSICAL_SPECS;

export const HIGH_SCHOOL_MUTATIONS: HighSchoolMutationExample[] = [
  {
    id: 'hb-sickle',
    name: 'Bệnh thiếu máu hồng cầu hình liềm (HbS - Sickle Cell Anemia)',
    sgkClass: 'Lớp 12',
    mutationType: 'Đột biến điểm thay thế cặp nucleotide (A-T → T-A)',
    normalCodon: 'GAG (Codon mã hóa Glutamic acid)',
    mutatedCodon: 'GUG (Codon mã hóa Valine)',
    normalPhenotype: 'Hồng cầu hình đĩa lõm hai mặt, mềm dẻo, vận chuyển oxygen tối ưu.',
    mutatedPhenotype: 'Hemoglobin kết tinh thành sợi làm biến dạng hồng cầu hình liềm, gây huyết tán và tắc nghẽn vi mạch.',
    mechanism: 'Thay thế transversion A-T thành T-A tại vị trí codon thứ 6 gen HBB, biến amino acid ưa nước (Glutamic acid mang điện tích âm) thành amino acid kỵ nước (Valine).'
  },
  {
    id: 'uv-dimer',
    name: 'Tổn thương Dimer Thymine do bức xạ cực tím (UV-induced Thymine Dimer)',
    sgkClass: 'Lớp 10',
    mutationType: 'Tổn thương quang hóa cấu trúc DNA',
    normalCodon: 'Trình tự liên tiếp ...TT... độc lập',
    mutatedCodon: 'Vòng cyclobutane thymine dimer (T=T)',
    normalPhenotype: 'Trục xoắn kép đều đặn, DNA polymerase sao chép chính xác.',
    mutatedPhenotype: 'Gây biến dạng gãy góc trục xoắn kép, cản trở sao chép và phiên mã, nguy cơ cao gây ung thư biểu mô da.',
    mechanism: 'Bức xạ tia UV kích thích phản ứng quang hóa tạo vòng cyclobutane giữa hai base Thymine liền kề trên cùng một chuỗi polynucleotide.'
  },
  {
    id: '5bu-mutation',
    name: 'Đột biến đồng đẳng base: 5-Bromouracil (5-BU)',
    sgkClass: 'Lớp 12',
    mutationType: 'Đột biến chuyển đổi (Transition): A-T → G-C',
    normalCodon: 'Cặp base chuẩn A - T',
    mutatedCodon: 'Chuyển hóa sau các vòng sao chép thành cặp G - C',
    normalPhenotype: 'Gen bình thường',
    mutatedPhenotype: 'Thay đổi codon trong chuỗi phiên mã, thay đổi cấu trúc chuỗi polypeptide.',
    mechanism: '5-BU là chất đồng đẳng của Thymine (có nguyên tử Br thay thế nhóm methyl). Ban đầu ở dạng keto bắt cặp với Adenine (A-5BU), khi chuyển sang dạng enol hiếm bắt cặp với Guanine (G-5BU), dẫn đến thay thế A-T thành G-C.'
  },
  {
    id: 'frameshift-thal',
    name: 'Đột biến dịch khung đọc mã (Frameshift Mutation)',
    sgkClass: 'Lớp 12',
    mutationType: 'Đột biến mất hoặc thêm cặp nucleotide',
    normalCodon: 'Khung đọc bộ ba: GAG - AAG - UCU...',
    mutatedCodon: 'Dịch chuyển khung đọc (Shift) toàn bộ trình tự phía sau',
    normalPhenotype: 'Protein có chiều dài và cấu trúc bậc ba hoàn chỉnh.',
    mutatedPhenotype: 'Mất hoàn toàn hoạt tính sinh học của protein hoặc xuất hiện mã kết thúc sớm (Nonsense).',
    mechanism: 'Thêm hoặc mất một số nucleotide không chia hết cho 3 làm thay đổi toàn bộ khung đọc của ribosome, biến đổi triệt để chuỗi amino acid từ vị trí đột biến.'
  }
];

export const DNA_MOLECULAR_FORMULAS = [
  {
    title: 'Chiều dài phân tử DNA (Length - L)',
    formula: 'L = (N / 2) × 3.4 Å',
    unit: 'Ångström (1 nm = 10 Å = 10⁻⁹ m)',
    desc: 'DNA xoắn kép gồm 2 chuỗi đối song, số cặp base là N/2, mỗi cặp có bước tịnh tiến trục 3.4 Å.'
  },
  {
    title: 'Tổng số Nucleotide (N)',
    formula: 'N = 2A + 2G = 2T + 2C',
    unit: 'nucleotide (nt / bp = N/2)',
    desc: 'Hệ quả từ nguyên tắc bổ sung Watson - Crick: A = T và G = C.'
  },
  {
    title: 'Tổng số liên kết Hydrogen (H)',
    formula: 'H = 2A + 3G (hoặc 2T + 3C)',
    unit: 'liên kết (bonds)',
    desc: 'Cặp A-T liên kết bởi 2 liên kết Hydrogen; cặp G-C liên kết bởi 3 liên kết Hydrogen.'
  },
  {
    title: 'Số chu kỳ xoắn (Helical Turns - C)',
    formula: 'C = N / 20 = L / 34 Å',
    unit: 'chu kỳ (turns)',
    desc: 'Mỗi chu kỳ xoắn hoàn chỉnh B-DNA gồm xấp xỉ 10 cặp base (20 nucleotide) với chiều dài 34 Å.'
  },
  {
    title: 'Khối lượng phân tử DNA (Molecular Weight - M)',
    formula: 'M = N × 330 Da (g/mol)',
    unit: 'Dalton (Da) / g·mol⁻¹',
    desc: 'Khối lượng phân tử trung bình của một nucleotide monophosphate xấp xỉ 330 Da (g/mol).'
  },
  {
    title: 'Số liên kết Phosphodiester (Phosphodiester Bonds)',
    formula: 'LK = N - 2',
    unit: 'liên kết cộng hóa trị',
    desc: 'Mỗi chuỗi polynucleotide gồm (N/2 - 1) liên kết phosphodiester giữa nhóm 3\'-OH và 5\'-phosphate; hai chuỗi là N - 2.'
  }
];

export const SGK_FORMULAS = DNA_MOLECULAR_FORMULAS;

export const CODON_TABLE: Record<string, CodonEntry> = {
  UUU: { codon: 'UUU', aminoAcid: 'Phe', aminoAcidFullName: 'Phenylalanine', letterCode: 'F', property: 'Hydrophobic', vietnameseName: 'Phenylalanin' },
  UUC: { codon: 'UUC', aminoAcid: 'Phe', aminoAcidFullName: 'Phenylalanine', letterCode: 'F', property: 'Hydrophobic', vietnameseName: 'Phenylalanin' },
  UUA: { codon: 'UUA', aminoAcid: 'Leu', aminoAcidFullName: 'Leucine', letterCode: 'L', property: 'Hydrophobic', vietnameseName: 'Lơxin' },
  UUG: { codon: 'UUG', aminoAcid: 'Leu', aminoAcidFullName: 'Leucine', letterCode: 'L', property: 'Hydrophobic', vietnameseName: 'Lơxin' },
  UCU: { codon: 'UCU', aminoAcid: 'Ser', aminoAcidFullName: 'Serine', letterCode: 'S', property: 'Polar', vietnameseName: 'Xêrin' },
  UCC: { codon: 'UCC', aminoAcid: 'Ser', aminoAcidFullName: 'Serine', letterCode: 'S', property: 'Polar', vietnameseName: 'Xêrin' },
  UCA: { codon: 'UCA', aminoAcid: 'Ser', aminoAcidFullName: 'Serine', letterCode: 'S', property: 'Polar', vietnameseName: 'Xêrin' },
  UCG: { codon: 'UCG', aminoAcid: 'Ser', aminoAcidFullName: 'Serine', letterCode: 'S', property: 'Polar', vietnameseName: 'Xêrin' },
  UAU: { codon: 'UAU', aminoAcid: 'Tyr', aminoAcidFullName: 'Tyrosine', letterCode: 'Y', property: 'Polar', vietnameseName: 'Tyrozin' },
  UAC: { codon: 'UAC', aminoAcid: 'Tyr', aminoAcidFullName: 'Tyrosine', letterCode: 'Y', property: 'Polar', vietnameseName: 'Tyrozin' },
  UAA: { codon: 'UAA', aminoAcid: 'STOP', aminoAcidFullName: 'Mã kết thúc (Ochre)', letterCode: '*', property: 'Stop', vietnameseName: 'Mã kết thúc' },
  UAG: { codon: 'UAG', aminoAcid: 'STOP', aminoAcidFullName: 'Mã kết thúc (Amber)', letterCode: '*', property: 'Stop', vietnameseName: 'Mã kết thúc' },
  UGU: { codon: 'UGU', aminoAcid: 'Cys', aminoAcidFullName: 'Cysteine', letterCode: 'C', property: 'Special', vietnameseName: 'Xistêin' },
  UGC: { codon: 'UGC', aminoAcid: 'Cys', aminoAcidFullName: 'Cysteine', letterCode: 'C', property: 'Special', vietnameseName: 'Xistêin' },
  UGA: { codon: 'UGA', aminoAcid: 'STOP', aminoAcidFullName: 'Mã kết thúc (Opal)', letterCode: '*', property: 'Stop', vietnameseName: 'Mã kết thúc' },
  UGG: { codon: 'UGG', aminoAcid: 'Trp', aminoAcidFullName: 'Tryptophan', letterCode: 'W', property: 'Hydrophobic', vietnameseName: 'Triptophan' },
  CUU: { codon: 'CUU', aminoAcid: 'Leu', aminoAcidFullName: 'Leucine', letterCode: 'L', property: 'Hydrophobic', vietnameseName: 'Lơxin' },
  CUC: { codon: 'CUC', aminoAcid: 'Leu', aminoAcidFullName: 'Leucine', letterCode: 'L', property: 'Hydrophobic', vietnameseName: 'Lơxin' },
  CUA: { codon: 'CUA', aminoAcid: 'Leu', aminoAcidFullName: 'Leucine', letterCode: 'L', property: 'Hydrophobic', vietnameseName: 'Lơxin' },
  CUG: { codon: 'CUG', aminoAcid: 'Leu', aminoAcidFullName: 'Leucine', letterCode: 'L', property: 'Hydrophobic', vietnameseName: 'Lơxin' },
  CCU: { codon: 'CCU', aminoAcid: 'Pro', aminoAcidFullName: 'Proline', letterCode: 'P', property: 'Special', vietnameseName: 'Prôlin' },
  CCC: { codon: 'CCC', aminoAcid: 'Pro', aminoAcidFullName: 'Proline', letterCode: 'P', property: 'Special', vietnameseName: 'Prôlin' },
  CCA: { codon: 'CCA', aminoAcid: 'Pro', aminoAcidFullName: 'Proline', letterCode: 'P', property: 'Special', vietnameseName: 'Prôlin' },
  CCG: { codon: 'CCG', aminoAcid: 'Pro', aminoAcidFullName: 'Proline', letterCode: 'P', property: 'Special', vietnameseName: 'Prôlin' },
  CAU: { codon: 'CAU', aminoAcid: 'His', aminoAcidFullName: 'Histidine', letterCode: 'H', property: 'Basic', vietnameseName: 'Hixtiđin' },
  CAC: { codon: 'CAC', aminoAcid: 'His', aminoAcidFullName: 'Histidine', letterCode: 'H', property: 'Basic', vietnameseName: 'Hixtiđin' },
  CAA: { codon: 'CAA', aminoAcid: 'Gln', aminoAcidFullName: 'Glutamine', letterCode: 'Q', property: 'Polar', vietnameseName: 'Glutamin' },
  CAG: { codon: 'CAG', aminoAcid: 'Gln', aminoAcidFullName: 'Glutamine', letterCode: 'Q', property: 'Polar', vietnameseName: 'Glutamin' },
  CGU: { codon: 'CGU', aminoAcid: 'Arg', aminoAcidFullName: 'Arginine', letterCode: 'R', property: 'Basic', vietnameseName: 'Acginin' },
  CGC: { codon: 'CGC', aminoAcid: 'Arg', aminoAcidFullName: 'Arginine', letterCode: 'R', property: 'Basic', vietnameseName: 'Acginin' },
  CGA: { codon: 'CGA', aminoAcid: 'Arg', aminoAcidFullName: 'Arginine', letterCode: 'R', property: 'Basic', vietnameseName: 'Acginin' },
  CGG: { codon: 'CGG', aminoAcid: 'Arg', aminoAcidFullName: 'Arginine', letterCode: 'R', property: 'Basic', vietnameseName: 'Acginin' },
  AUU: { codon: 'AUU', aminoAcid: 'Ile', aminoAcidFullName: 'Isoleucine', letterCode: 'I', property: 'Hydrophobic', vietnameseName: 'Izolơxin' },
  AUC: { codon: 'AUC', aminoAcid: 'Ile', aminoAcidFullName: 'Isoleucine', letterCode: 'I', property: 'Hydrophobic', vietnameseName: 'Izolơxin' },
  AUA: { codon: 'AUA', aminoAcid: 'Ile', aminoAcidFullName: 'Isoleucine', letterCode: 'I', property: 'Hydrophobic', vietnameseName: 'Izolơxin' },
  AUG: { codon: 'AUG', aminoAcid: 'Met', aminoAcidFullName: 'Methionine (Mã mở đầu)', letterCode: 'M', property: 'Special', vietnameseName: 'Mêtiônin (Mở đầu)' },
  ACU: { codon: 'ACU', aminoAcid: 'Thr', aminoAcidFullName: 'Threonine', letterCode: 'T', property: 'Polar', vietnameseName: 'Trêônin' },
  ACC: { codon: 'ACC', aminoAcid: 'Thr', aminoAcidFullName: 'Threonine', letterCode: 'T', property: 'Polar', vietnameseName: 'Trêônin' },
  ACA: { codon: 'ACA', aminoAcid: 'Thr', aminoAcidFullName: 'Threonine', letterCode: 'T', property: 'Polar', vietnameseName: 'Trêônin' },
  ACG: { codon: 'ACG', aminoAcid: 'Thr', aminoAcidFullName: 'Threonine', letterCode: 'T', property: 'Polar', vietnameseName: 'Trêônin' },
  AAU: { codon: 'AAU', aminoAcid: 'Asn', aminoAcidFullName: 'Asparagine', letterCode: 'N', property: 'Polar', vietnameseName: 'Asparagin' },
  AAC: { codon: 'AAC', aminoAcid: 'Asn', aminoAcidFullName: 'Asparagine', letterCode: 'N', property: 'Polar', vietnameseName: 'Asparagin' },
  AAA: { codon: 'AAA', aminoAcid: 'Lys', aminoAcidFullName: 'Lysine', letterCode: 'K', property: 'Basic', vietnameseName: 'Lizin' },
  AAG: { codon: 'AAG', aminoAcid: 'Lys', aminoAcidFullName: 'Lysine', letterCode: 'K', property: 'Basic', vietnameseName: 'Lizin' },
  AGU: { codon: 'AGU', aminoAcid: 'Ser', aminoAcidFullName: 'Serine', letterCode: 'S', property: 'Polar', vietnameseName: 'Xêrin' },
  AGC: { codon: 'AGC', aminoAcid: 'Ser', aminoAcidFullName: 'Serine', letterCode: 'S', property: 'Polar', vietnameseName: 'Xêrin' },
  AGA: { codon: 'AGA', aminoAcid: 'Arg', aminoAcidFullName: 'Arginine', letterCode: 'R', property: 'Basic', vietnameseName: 'Acginin' },
  AGG: { codon: 'AGG', aminoAcid: 'Arg', aminoAcidFullName: 'Arginine', letterCode: 'R', property: 'Basic', vietnameseName: 'Acginin' },
  GUU: { codon: 'GUU', aminoAcid: 'Val', aminoAcidFullName: 'Valine', letterCode: 'V', property: 'Hydrophobic', vietnameseName: 'Valin' },
  GUC: { codon: 'GUC', aminoAcid: 'Val', aminoAcidFullName: 'Valine', letterCode: 'V', property: 'Hydrophobic', vietnameseName: 'Valin' },
  GUA: { codon: 'GUA', aminoAcid: 'Val', aminoAcidFullName: 'Valine', letterCode: 'V', property: 'Hydrophobic', vietnameseName: 'Valin' },
  GUG: { codon: 'GUG', aminoAcid: 'Val', aminoAcidFullName: 'Valine', letterCode: 'V', property: 'Hydrophobic', vietnameseName: 'Valin' },
  GCU: { codon: 'GCU', aminoAcid: 'Ala', aminoAcidFullName: 'Alanine', letterCode: 'A', property: 'Hydrophobic', vietnameseName: 'Alanin' },
  GCC: { codon: 'GCC', aminoAcid: 'Ala', aminoAcidFullName: 'Alanine', letterCode: 'A', property: 'Hydrophobic', vietnameseName: 'Alanin' },
  GCA: { codon: 'GCA', aminoAcid: 'Ala', aminoAcidFullName: 'Alanine', letterCode: 'A', property: 'Hydrophobic', vietnameseName: 'Alanin' },
  GCG: { codon: 'GCG', aminoAcid: 'Ala', aminoAcidFullName: 'Alanine', letterCode: 'A', property: 'Hydrophobic', vietnameseName: 'Alanin' },
  GAU: { codon: 'GAU', aminoAcid: 'Asp', aminoAcidFullName: 'Aspartic Acid', letterCode: 'D', property: 'Acidic', vietnameseName: 'Axit Aspartic' },
  GAC: { codon: 'GAC', aminoAcid: 'Asp', aminoAcidFullName: 'Aspartic Acid', letterCode: 'D', property: 'Acidic', vietnameseName: 'Axit Aspartic' },
  GAA: { codon: 'GAA', aminoAcid: 'Glu', aminoAcidFullName: 'Glutamic Acid', letterCode: 'E', property: 'Acidic', vietnameseName: 'Axit Glutamic' },
  GAG: { codon: 'GAG', aminoAcid: 'Glu', aminoAcidFullName: 'Glutamic Acid', letterCode: 'E', property: 'Acidic', vietnameseName: 'Axit Glutamic' },
  GGU: { codon: 'GGU', aminoAcid: 'Gly', aminoAcidFullName: 'Glycine', letterCode: 'G', property: 'Special', vietnameseName: 'Glixin' },
  GGC: { codon: 'GGC', aminoAcid: 'Gly', aminoAcidFullName: 'Glycine', letterCode: 'G', property: 'Special', vietnameseName: 'Glixin' },
  GGA: { codon: 'GGA', aminoAcid: 'Gly', aminoAcidFullName: 'Glycine', letterCode: 'G', property: 'Special', vietnameseName: 'Glixin' },
  GGG: { codon: 'GGG', aminoAcid: 'Gly', aminoAcidFullName: 'Glycine', letterCode: 'G', property: 'Special', vietnameseName: 'Glixin' }
};

export const LAB_CASES: LabCase[] = [
  {
    id: 'case-hbs',
    title: 'Nghiên cứu 01: Đột biến thay thế cặp nucleotide (Bệnh hồng cầu hình liềm HbS)',
    patientProfile: 'Bệnh nhân có hồng cầu bị biến dạng hình lưỡi liềm gây thiếu máu tán huyết và tắc nghẽn vi mạch. Đột biến xảy ra ở codon thứ 6 của gen Beta-Globin.',
    symptoms: ['Thiếu máu tán huyết mạn tính', 'Hồng cầu biến dạng hình liềm', 'Cơn đau tắc mạch vi tuần hoàn'],
    geneName: 'Gen Beta-Globin (HBB - Codon 6)',
    wildtypeSequence: 'ACTCCTGAGGAG', // GAG (Glu)
    patientSequence:  'ACTCCTGTGGAG', // GTG (Val)
    targetIndex: 6,
    mutationKind: 'substitution_missense',
    diagnosis: 'Đột biến thay thế transversion cặp A-T thành T-A tại codon thứ 6 làm biến đổi Glutamic acid (ưa nước) thành Valine (kỵ nước).',
    fixAction: 'substitute',
    solutionDescription: 'Thay thế base Thymine (T) bằng base Adenine (A) để khôi phục codon GAG chuẩn mã hóa Glutamic acid.'
  },
  {
    id: 'case-uv',
    title: 'Nghiên cứu 02: Tổn thương quang hóa DNA do bức xạ cực tím (Dimer Thymine T=T)',
    patientProfile: 'Tế bào biểu bì da phơi nhiễm dưới bức xạ cực tím (UV) liều cao bị tổn thương cấu trúc chuỗi xoắn kép.',
    symptoms: ['Tổn thương quang hóa biểu bì', 'Biến dạng uốn góc trục xoắn kép DNA', 'Nguy cơ đột biến sinh ung thư biểu mô'],
    geneName: 'Đoạn gen biểu mô da (Vùng Thymine liên tiếp)',
    wildtypeSequence: 'GCCATTTCGGAT',
    patientSequence:  'GCCAT=TTCGGAT', // Crosslinked T=T
    targetIndex: 4,
    mutationKind: 'uv_thymine_dimer',
    diagnosis: 'Bức xạ UV kích hoạt phản ứng quang hóa giữa 2 base Thymine liền kề tạo vòng cyclobutane dimer thymine (T=T), làm gãy gập trục xoắn kép DNA.',
    fixAction: 'repair_dimer',
    solutionDescription: 'Kích hoạt cơ chế sửa sai cắt bỏ nucleotide (Nucleotide Excision Repair - NER) để loại bỏ dimer hỏng và tái tổng hợp đoạn bù chuẩn.'
  }
];

export const SCIENTIFIC_REFERENCES = [
  {
    title: 'RCSB Protein Data Bank - PDB ID: 1BNA (B-DNA Dodecamer)',
    authors: 'Drew, H.R., Wing, R.M., Takano, T., Broka, C., Tanaka, S., Itakura, K., Dickerson, R.E.',
    journal: 'Proc. Natl. Acad. Sci. USA (1981) - Độ phân giải tinh thể học 1.90 Å',
    year: '1981',
    doi: '10.1073/pnas.78.4.2179',
    description: 'Cấu trúc tinh thể học tia X giải mã nguyên tử chuỗi xoắn kép B-DNA tự nhiên d(CGCGAATTCGCG)₂ - nền tảng của mô hình 3D tương tác trong GeneCraft 3D.'
  },
  {
    title: 'Molecular Structure of Nucleic Acids: A Structure for Deoxyribose Nucleic Acid',
    authors: 'J. D. Watson & F. H. C. Crick',
    journal: 'Nature (1953) - Giải Nobel Sinh lý học và Y khoa 1962',
    year: '1953',
    doi: '10.1038/171737a0',
    description: 'Công trình lịch sử khám phá cấu trúc chuỗi xoắn kép đối song và nguyên tắc bổ sung bắt cặp đặc hiệu giữa các base nitơ (A=T, G≡C).'
  },
  {
    title: 'Campbell Biology (12th Edition) & Chuẩn Danh Pháp Quốc Tế IUPAC',
    authors: 'Lisa A. Urry, Michael L. Cain, Steven A. Wasserman, Peter V. Minorsky, Rebecca Orr',
    journal: 'Pearson Education & International Union of Pure and Applied Chemistry (IUPAC)',
    year: '2021 - 2024',
    description: 'Quy chuẩn danh pháp quốc tế về phân tử di truyền: Purine, Pyrimidine, Deoxyribonucleic acid, liên kết Hydrogen và cơ chế đột biến gen.'
  }
];
