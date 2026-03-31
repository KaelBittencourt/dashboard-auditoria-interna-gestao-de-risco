import { useQuery } from '@tanstack/react-query';
import { fetchSheetData, parseSheetData, groupByAudit, calcKPIs, type AuditRecord, type AuditGroup } from '@/lib/googleSheets';
import { useMemo, useState } from 'react';

export interface Filters {
  dateFrom: string;
  dateTo: string;
  unidade: string;
  meta: string;
  tipoResposta: string;
  leito: string;
  quarto: string;
}

const defaultFilters: Filters = {
  dateFrom: '',
  dateTo: '',
  unidade: '',
  meta: '',
  tipoResposta: '',
  leito: '',
  quarto: '',
};

function parseDate(dateStr: string): Date | null {
  // Format: DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  return new Date(y, m - 1, d);
}

function applyFilters(records: AuditRecord[], filters: Filters): AuditRecord[] {
  return records.filter(r => {
    if (filters.unidade && r.unidade !== filters.unidade) return false;
    if (filters.meta && r.meta !== filters.meta) return false;
    if (filters.leito && r.leito !== filters.leito) return false;
    if (filters.quarto && r.quarto !== filters.quarto) return false;
    if (filters.tipoResposta && r.resposta !== filters.tipoResposta) return false;

    if (filters.dateFrom || filters.dateTo) {
      const d = parseDate(r.data);
      if (!d) return false;
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (d < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        if (d > to) return false;
      }
    }

    return true;
  });
}

export function useSheetData() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const { data: csvText, isLoading, error, refetch, isRefetching, dataUpdatedAt } = useQuery({
    queryKey: ['sheet-data'],
    queryFn: fetchSheetData,
    staleTime: 5 * 60 * 1000,
  });

  const allRecords = useMemo(() => {
    if (!csvText) return [];
    return parseSheetData(csvText);
  }, [csvText]);

  const filteredRecords = useMemo(() => applyFilters(allRecords, filters), [allRecords, filters]);
  const groups = useMemo(() => groupByAudit(filteredRecords), [filteredRecords]);
  const kpis = useMemo(() => calcKPIs(filteredRecords, groups), [filteredRecords, groups]);

  // Filter options
  const unidades = useMemo(() => [...new Set(allRecords.map(r => r.unidade))].sort(), [allRecords]);
  const leitos = useMemo(() => [...new Set(allRecords.map(r => r.leito))].filter(l => l !== '-').sort(), [allRecords]);
  const quartos = useMemo(() => [...new Set(allRecords.map(r => r.quarto))].filter(q => q !== '-').sort(), [allRecords]);
  const metas = ['Meta 1', 'Meta 2', 'Meta 3', 'Meta 4', 'Meta 6'];

  return {
    isLoading, error, refetch, isRefetching, dataUpdatedAt,
    records: filteredRecords,
    allRecords,
    groups, kpis,
    filters, setFilters,
    unidades, leitos, quartos, metas,
  };
}
