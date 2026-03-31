import Papa from 'papaparse';

const SHEET_ID = '1mO_OXLcCBLY3GV2Z8sRj0EnO9MOoyCogtsYPlmGm-fY';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export interface AuditRecord {
  id: string;
  timestamp: string;
  data: string;
  unidade: string;
  quarto: string;
  leito: string;
  meta: string;
  pergunta: string;
  resposta: string;
  observacoes: string;
}

export interface AuditGroup {
  id: string;
  data: string;
  unidade: string;
  quarto: string;
  leito: string;
  records: AuditRecord[];
  conformidade: number;
  observacoes: string[];
}

// Column mapping based on spreadsheet structure
// Columns that repeat for multiple beds - we coalesce them
const COLUMN_MAP: { startIdx: number; count: number; meta: string; pergunta: string; conditional?: { questionIdx: number; requiredAnswer: string } }[] = [
  { startIdx: 9, count: 4, meta: 'Meta 1', pergunta: 'Paciente usa pulseira de identificação correta?' },
  { startIdx: 13, count: 3, meta: 'Meta 1', pergunta: 'Dupla checagem realizada antes da administração de medicamentos?' },
  { startIdx: 16, count: 4, meta: 'Meta 1', pergunta: 'Identificação conferida antes de procedimentos?' },
  { startIdx: 20, count: 3, meta: 'Meta 3', pergunta: 'Via de administração por AVP' },
  { startIdx: 23, count: 2, meta: 'Meta 3', pergunta: 'Curativos de acessos identificados corretamente?' },
  // Conditional: Soroterapia
  { startIdx: 25, count: 2, meta: '_condition', pergunta: 'Pacientes com Soroterapia?' },
  { startIdx: 27, count: 2, meta: 'Meta 3', pergunta: 'Soroterapia identificada corretamente e instalada no horário programado?', conditional: { questionIdx: 25, requiredAnswer: 'Sim' } },
  // Conditional: SNE/SNG
  { startIdx: 29, count: 2, meta: '_condition', pergunta: 'Paciente em uso de SNE/SNG?' },
  { startIdx: 31, count: 2, meta: 'Meta 3', pergunta: 'SNG/SNE identificada e com fixação adequada na marcação?' },
  { startIdx: 33, count: 2, meta: 'Meta 3', pergunta: 'Equipo datado e na validade?' },
  { startIdx: 35, count: 4, meta: 'Meta 6', pergunta: 'Paciente com pulseira de risco de queda' },
  { startIdx: 39, count: 3, meta: 'Meta 6', pergunta: 'Barras de apoio e sinalização no banheiro disponíveis' },
  { startIdx: 42, count: 3, meta: 'Meta 6', pergunta: 'Superfície de apoio adequada (colchão piramidal ou pneumático, coxins)' },
];

// Single columns (not repeated per bed)
const SINGLE_COLUMNS: { idx: number; meta: string; pergunta: string }[] = [
  { idx: 45, meta: 'Meta 2', pergunta: 'Evolução Médica nas últimas 24hrs?' },
  { idx: 46, meta: 'Meta 2', pergunta: 'Evolução de enfermagem nas últimas 24hrs?' },
  { idx: 47, meta: 'Meta 2', pergunta: 'Uso de protocolo SBAR na comunicação entre equipes?' },
  { idx: 48, meta: 'Meta 3', pergunta: 'Medicamentos prescritos de forma legível e completa?' },
  { idx: 49, meta: 'Meta 3', pergunta: 'Checagem correta das prescrições médicas' },
  { idx: 50, meta: 'Meta 6', pergunta: 'Avaliação de risco de queda documentada' },
  { idx: 51, meta: 'Meta 6', pergunta: 'Realizada escala de Morse?' },
  { idx: 52, meta: 'Meta 6', pergunta: 'Realizada escala de Braden nas últimas 24hrs?' },
  { idx: 53, meta: 'Meta 6', pergunta: 'Realizada escala de avaliação de lesão de pele' },
  { idx: 54, meta: 'Meta 6', pergunta: 'Realizada escala de Fugulin' },
  { idx: 55, meta: 'Meta 6', pergunta: 'Realizada escala de Grau de dependência de Saúde mental' },
  { idx: 56, meta: 'Meta 4', pergunta: 'Checklist de cirurgia segura (time out) é realizado antes do procedimento' },
  { idx: 57, meta: 'Meta 4', pergunta: 'Local de intervenção é marcado conforme protocolo' },
  { idx: 58, meta: 'Meta 4', pergunta: 'Registro de confirmação de equipe e paciente antes da anestesia?' },
];

// Conditional columns
const CONDITIONAL_SINGLE: { idx: number; meta: string; pergunta: string; conditionIdx: number; requiredAnswer: string }[] = [
  { idx: 63, meta: '_condition', pergunta: 'Paciente acamado', conditionIdx: -1, requiredAnswer: '' },
  { idx: 64, meta: 'Meta 6', pergunta: 'Para paciente acamado, possui relógio de mudança de decúbito?', conditionIdx: 63, requiredAnswer: 'Sim' },
  { idx: 65, meta: 'Meta 6', pergunta: 'Paciente em posição correta de decúbito?', conditionIdx: 63, requiredAnswer: 'Sim' },
];

function coalesce(row: string[], startIdx: number, count: number): string {
  for (let i = startIdx; i < startIdx + count && i < row.length; i++) {
    const val = (row[i] || '').trim();
    if (val) return val;
  }
  return '';
}

function normalizeResposta(val: string): string {
  const lower = val.toLowerCase().trim();
  if (lower === 'sim' || lower === 'conforme') return 'Sim';
  if (lower === 'não' || lower === 'nao' || lower === 'não conforme' || lower === 'nao conforme') return 'Não';
  if (lower.includes('parcialmente')) return 'Parcialmente';
  if (lower.includes('não se aplica') || lower.includes('nao se aplica')) return 'N/A';
  if (val.trim() === '') return '';
  return val.trim();
}

function isApplicable(resposta: string): boolean {
  const norm = normalizeResposta(resposta);
  return norm !== '' && norm !== 'N/A';
}

function isConforme(resposta: string): boolean {
  const norm = normalizeResposta(resposta);
  return norm === 'Sim';
}

export function parseSheetData(csvText: string): AuditRecord[] {
  const result = Papa.parse<string[]>(csvText, { header: false, skipEmptyLines: true });
  const rows = result.data;
  if (rows.length < 2) return [];

  const records: AuditRecord[] = [];
  let id = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const timestamp = (row[0] || '').trim();
    const data = (row[1] || '').trim();
    const unidade = (row[2] || '').trim();
    const quarto = coalesce(row, 3, 3) || '-';
    const leito = coalesce(row, 6, 3) || '-';

    // Observations
    const obs: string[] = [];
    for (let oi = 59; oi <= 62 && oi < row.length; oi++) {
      const o = (row[oi] || '').trim();
      if (o) obs.push(o);
    }
    const observacoes = obs.join(' | ');

    // Repeated columns (coalesced)
    const conditionValues: Record<number, string> = {};

    for (const col of COLUMN_MAP) {
      const val = coalesce(row, col.startIdx, col.count);
      if (col.meta === '_condition') {
        conditionValues[col.startIdx] = normalizeResposta(val);
        continue;
      }

      const normVal = normalizeResposta(val);
      if (!normVal) continue;

      // Check conditional
      if (col.conditional) {
        const condVal = conditionValues[col.conditional.questionIdx];
        if (condVal !== 'Sim') continue;
      }

      records.push({
        id: `${r}-${id++}`,
        timestamp, data, unidade, quarto, leito,
        meta: col.meta,
        pergunta: col.pergunta,
        resposta: normVal,
        observacoes,
      });
    }

    // Single columns
    for (const col of SINGLE_COLUMNS) {
      const val = normalizeResposta((row[col.idx] || '').trim());
      if (!val) continue;
      records.push({
        id: `${r}-${id++}`,
        timestamp, data, unidade, quarto, leito,
        meta: col.meta,
        pergunta: col.pergunta,
        resposta: val,
        observacoes,
      });
    }

    // Conditional single columns
    const acamadoVal = row[63] ? normalizeResposta(row[63].trim()) : '';
    for (const col of CONDITIONAL_SINGLE) {
      if (col.meta === '_condition') continue;
      if (col.conditionIdx === 63 && acamadoVal !== 'Sim') continue;
      const val = normalizeResposta((row[col.idx] || '').trim());
      if (!val) continue;
      records.push({
        id: `${r}-${id++}`,
        timestamp, data, unidade, quarto, leito,
        meta: col.meta,
        pergunta: col.pergunta,
        resposta: val,
        observacoes,
      });
    }
  }

  return records;
}

export function groupByAudit(records: AuditRecord[]): AuditGroup[] {
  const map = new Map<string, AuditRecord[]>();

  for (const rec of records) {
    const key = `${rec.data}|${rec.unidade}|${rec.quarto}|${rec.leito}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(rec);
  }

  return Array.from(map.entries()).map(([key, recs]) => {
    const [data, unidade, quarto, leito] = key.split('|');
    const applicable = recs.filter(r => isApplicable(r.resposta));
    const conformes = applicable.filter(r => isConforme(r.resposta));
    const conformidade = applicable.length > 0 ? (conformes.length / applicable.length) * 100 : 0;
    const observacoes = [...new Set(recs.map(r => r.observacoes).filter(Boolean))];

    return { id: key, data, unidade, quarto, leito, records: recs, conformidade, observacoes };
  });
}

export function calcKPIs(records: AuditRecord[], groups: AuditGroup[]) {
  const applicable = records.filter(r => isApplicable(r.resposta));
  const conformes = applicable.filter(r => isConforme(r.resposta));
  const naoConformes = applicable.filter(r => !isConforme(r.resposta));

  const conformidadeGeral = applicable.length > 0 ? (conformes.length / applicable.length) * 100 : 0;

  const metas = ['Meta 1', 'Meta 2', 'Meta 3', 'Meta 4', 'Meta 6'];
  const metaKPIs = metas.map(meta => {
    const metaRecords = applicable.filter(r => r.meta === meta);
    const metaConformes = metaRecords.filter(r => isConforme(r.resposta));
    const falhas = metaRecords.length - metaConformes.length;
    const pct = metaRecords.length > 0 ? (metaConformes.length / metaRecords.length) * 100 : 0;
    return { meta, conformidade: pct, falhas, total: metaRecords.length };
  });

  // Worst meta insight (only metas with data)
  const metasWithData = metaKPIs.filter(m => m.total > 0);
  const worstMeta = metasWithData.length > 0
    ? metasWithData.reduce((a, b) => a.conformidade < b.conformidade ? a : b)
    : null;

  return {
    conformidadeGeral,
    totalAuditorias: groups.length,
    totalItens: applicable.length,
    totalNaoConformidades: naoConformes.length,
    metaKPIs,
    insight: worstMeta ? `${worstMeta.meta} possui o maior índice de falhas (${worstMeta.falhas} não conformidades, ${worstMeta.conformidade.toFixed(1)}% conforme)` : '',
  };
}

export async function fetchSheetData(): Promise<string> {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error('Falha ao carregar dados');
  return res.text();
}
