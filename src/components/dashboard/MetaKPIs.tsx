import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface MetaKPI {
  meta: string;
  conformidade: number;
  falhas: number;
  total: number;
}

interface MetaKPIsProps {
  metaKPIs: MetaKPI[];
}

function getStatusInfo(pct: number) {
  if (pct >= 80) return {
    colorClass: 'bg-conforme',
    glowClass: 'shadow-[0_0_12px_rgba(34,197,94,0.6)]',
    textClass: 'text-conforme',
    Icon: CheckCircle2
  };
  if (pct >= 50) return {
    colorClass: 'bg-atencao',
    glowClass: 'shadow-[0_0_12px_rgba(234,179,8,0.6)]',
    textClass: 'text-amber-500', 
    Icon: AlertTriangle
  };
  return {
    colorClass: 'bg-nao-conforme',
    glowClass: 'shadow-[0_0_12px_rgba(239,68,68,0.6)]',
    textClass: 'text-nao-conforme',
    Icon: AlertCircle
  };
}

export function MetaKPIs({ metaKPIs }: MetaKPIsProps) {
  return (
    <div className="gradient-card border border-border rounded-xl p-5 card-shadow flex flex-col justify-between h-full">
      <div className="mb-5 flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">Conformidade por Meta</h3>
        <p className="text-sm text-muted-foreground">Listagem de desempenho consolidado</p>
      </div>
      <div className="flex-1 space-y-5">
        {metaKPIs.map((m) => {
          const status = getStatusInfo(m.conformidade);
          const Icon = status.Icon;
          return (
            <div key={m.meta} className="flex flex-col gap-2.5">
              <div className="flex justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg bg-secondary/40 border border-border/50 shadow-sm`}>
                    <Icon className={`w-4 h-4 ${status.textClass}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-sm font-semibold text-foreground leading-snug">{m.meta}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{m.total} registros verificados</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground hidden sm:flex items-center justify-center bg-secondary/50 px-2 py-0.5 rounded border border-border/50 h-[22px]">
                    {m.falhas} falhas
                  </span>
                  <span className="text-base font-bold font-mono text-foreground tracking-tight w-14 text-right">
                    {m.conformidade.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-secondary/80 rounded-full h-2 overflow-hidden border border-border/50 relative">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-[1200ms] ease-out ${status.colorClass} ${status.glowClass}`}
                  style={{ width: `${Math.min(m.conformidade, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
