import { useSheetData } from '@/hooks/useSheetData';
import { KPICards } from '@/components/dashboard/KPICards';
import { MetaKPIs } from '@/components/dashboard/MetaKPIs';
import { ConformidadeBarChart, EvolucaoLineChart, DistribuicaoPieChart, RankingUnidades } from '@/components/dashboard/Charts';
import { DashboardFilters } from '@/components/dashboard/Filters';
import { AuditCards } from '@/components/dashboard/AuditCards';
import { BarChart2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isLoading, error, records, groups, kpis, filters, setFilters, unidades, leitos, quartos, metas, refetch, isRefetching, dataUpdatedAt } = useSheetData();

  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Carregando dados da planilha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center gradient-card border border-nao-conforme/30 rounded-xl p-8">
          <p className="text-nao-conforme font-medium">Erro ao carregar dados</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header border-b border-border py-4 md:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary glow-primary">
              <BarChart2 className="w-5 h-5 text-background" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground truncate max-w-[200px] sm:max-w-none">Auditoria Interna Gestão de Risco</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Dashboard de Conformidade por Metas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {updatedAt && <span className="hidden md:inline-block text-xs text-muted-foreground">Atualizado às {updatedAt}</span>}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              disabled={isRefetching}
              className="h-8 bg-secondary/50 border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : 'sm:mr-2'}`} />
              <span className="hidden sm:inline-block">{isRefetching ? 'Carregando...' : 'Recarregar'}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10 space-y-6 md:space-y-8">
        <DashboardFilters filters={filters} setFilters={setFilters} unidades={unidades} leitos={leitos} quartos={quartos} metas={metas} />

        <KPICards
          conformidadeGeral={kpis.conformidadeGeral}
          totalAuditorias={kpis.totalAuditorias}
          totalItens={kpis.totalItens}
          totalNaoConformidades={kpis.totalNaoConformidades}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConformidadeBarChart metaKPIs={kpis.metaKPIs} />
          <EvolucaoLineChart groups={groups} />
          <DistribuicaoPieChart records={records} />
          <div className="grid grid-cols-1 gap-6">
            <MetaKPIs metaKPIs={kpis.metaKPIs} />
            <RankingUnidades records={records} />
          </div>
        </div>

        <AuditCards groups={groups} />
      </main>
    </div>
  );
};

export default Index;
