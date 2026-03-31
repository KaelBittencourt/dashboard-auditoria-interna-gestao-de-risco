import { Activity, ClipboardCheck, AlertTriangle, FileCheck } from 'lucide-react';

interface KPICardsProps {
  conformidadeGeral: number;
  totalAuditorias: number;
  totalItens: number;
  totalNaoConformidades: number;
}

const kpiConfig = [
  { key: 'conformidade', icon: Activity, label: 'Conformidade Geral', suffix: '%', glowClass: 'glow-success', iconBg: 'bg-conforme/20 text-conforme' },
  { key: 'auditorias', icon: ClipboardCheck, label: 'Total de Auditorias', suffix: '', glowClass: 'glow-primary', iconBg: 'bg-primary/20 text-primary' },
  { key: 'itens', icon: FileCheck, label: 'Itens Avaliados', suffix: '', glowClass: '', iconBg: 'bg-atencao/20 text-atencao' },
  { key: 'naoConformidades', icon: AlertTriangle, label: 'Não Conformidades', suffix: '', glowClass: 'glow-danger', iconBg: 'bg-nao-conforme/20 text-nao-conforme' },
] as const;

export function KPICards({ conformidadeGeral, totalAuditorias, totalItens, totalNaoConformidades }: KPICardsProps) {
  const values = [conformidadeGeral.toFixed(1), totalAuditorias, totalItens, totalNaoConformidades];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiConfig.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.key} className="gradient-card border border-border rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${kpi.iconBg} flex-shrink-0 shadow-sm shadow-black/10`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-xl lg:text-2xl font-bold font-mono text-foreground tracking-tight">
                  {values[i]}{kpi.suffix}
                </p>
                <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                  {kpi.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
