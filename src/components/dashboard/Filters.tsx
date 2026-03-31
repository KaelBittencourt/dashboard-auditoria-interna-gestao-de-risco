import type { Filters } from '@/hooks/useSheetData';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw, Calendar } from 'lucide-react';

interface FiltersProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
  unidades: string[];
  leitos: string[];
  quartos: string[];
  metas: string[];
}

export function DashboardFilters({ filters, setFilters, unidades, leitos, quartos, metas }: FiltersProps) {
  const update = (key: keyof Filters, val: string) => setFilters({ ...filters, [key]: val });
  const clearAll = () => setFilters({ dateFrom: '', dateTo: '', unidade: '', meta: '', tipoResposta: '', leito: '', quarto: '' });

  return (
    <div className="gradient-card border border-border rounded-xl p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
        </div>
        <Button variant="outline" size="sm" onClick={clearAll} className="h-8 bg-secondary/50 border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors text-xs">
          <RotateCcw className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> Limpar
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Data Início</label>
          <Input 
            type="date" 
            value={filters.dateFrom} 
            onChange={e => update('dateFrom', e.target.value)} 
            className="h-9 text-sm bg-secondary border-border relative pl-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Data Fim</label>
          <Input 
            type="date" 
            value={filters.dateTo} 
            onChange={e => update('dateTo', e.target.value)} 
            className="h-9 text-sm bg-secondary border-border relative pl-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Unidade</label>
          <Select value={filters.unidade} onValueChange={v => update('unidade', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-9 text-sm bg-secondary border-border"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {unidades.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Meta</label>
          <Select value={filters.meta} onValueChange={v => update('meta', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-9 text-sm bg-secondary border-border"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {metas.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Resposta</label>
          <Select value={filters.tipoResposta} onValueChange={v => update('tipoResposta', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-9 text-sm bg-secondary border-border"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Sim">Conforme</SelectItem>
              <SelectItem value="Não">Não Conforme</SelectItem>
              <SelectItem value="Parcialmente">Parcial</SelectItem>
              <SelectItem value="N/A">N/A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Quarto</label>
          <Select value={filters.quarto} onValueChange={v => update('quarto', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-9 text-sm bg-secondary border-border"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {quartos.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Leito</label>
          <Select value={filters.leito} onValueChange={v => update('leito', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-9 text-sm bg-secondary border-border"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {leitos.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
