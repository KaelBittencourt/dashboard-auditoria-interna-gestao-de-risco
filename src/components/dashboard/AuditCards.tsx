import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, BedDouble, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { AuditGroup } from '@/lib/googleSheets';

interface AuditCardsProps {
  groups: AuditGroup[];
}

function conformidadeColor(pct: number) {
  if (pct >= 80) return 'bg-conforme/15 text-conforme border-conforme/30';
  if (pct >= 50) return 'bg-atencao/15 text-atencao border-atencao/30';
  return 'bg-nao-conforme/15 text-nao-conforme border-nao-conforme/30';
}

function respostaBadge(resposta: string) {
  switch (resposta) {
    case 'Sim': return <span className="inline-flex items-center gap-1 text-xs font-medium text-conforme"><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />Conforme</span>;
    case 'Não': return <span className="inline-flex items-center gap-1 text-xs font-medium text-nao-conforme"><XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />Não Conforme</span>;
    case 'Parcialmente': return <span className="inline-flex items-center gap-1 text-xs font-medium text-atencao"><AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />Parcial</span>;
    default: return <span className="text-xs text-na">N/A</span>;
  }
}

export function AuditCards({ groups }: AuditCardsProps) {
  const [selected, setSelected] = useState<AuditGroup | null>(null);

  const metaGroups = selected
    ? Object.entries(
        selected.records.reduce((acc, r) => {
          if (!acc[r.meta]) acc[r.meta] = [];
          acc[r.meta].push(r);
          return acc;
        }, {} as Record<string, typeof selected.records>)
      ).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <>
      <div className="gradient-card border border-border rounded-xl p-5 card-shadow">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Auditorias <span className="text-muted-foreground font-mono text-sm">({groups.length})</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-dark">
          {[...groups].sort((a, b) => {
            const da = a.data.split('/').reverse().join('');
            const db = b.data.split('/').reverse().join('');
            return db.localeCompare(da);
          }).map(g => (
            <button
              key={g.id}
              onClick={() => setSelected(g)}
              className="text-left bg-secondary/50 rounded-lg border border-border p-4 hover:card-shadow-hover hover:border-primary/40 transition-all duration-300 cursor-pointer active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <Badge variant="outline" className={`text-xs font-bold font-mono border ${conformidadeColor(g.conformidade)}`}>
                  {g.conformidade.toFixed(0)}%
                </Badge>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />{g.data}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />{g.unidade}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} />Quarto {g.quarto} · Leito {g.leito}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border scrollbar-dark">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-foreground">
                  Auditoria Detalhada
                  <Badge variant="outline" className={`text-xs font-bold font-mono border ${conformidadeColor(selected.conformidade)}`}>
                    {selected.conformidade.toFixed(1)}% conforme
                  </Badge>
                </DialogTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" strokeWidth={1.5} />{selected.data}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" strokeWidth={1.5} />{selected.unidade}</span>
                  <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" strokeWidth={1.5} />Quarto {selected.quarto} · Leito {selected.leito}</span>
                </div>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {metaGroups.map(([meta, recs]) => (
                  <div key={meta}>
                    <h4 className="text-sm font-semibold text-foreground mb-2 pb-1 border-b border-border">{meta}</h4>
                    <div className="space-y-1.5">
                      {recs.map(r => (
                        <div key={r.id} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm ${
                          r.resposta === 'Sim' ? 'bg-conforme/10' :
                          r.resposta === 'Não' ? 'bg-nao-conforme/10' :
                          r.resposta === 'Parcialmente' ? 'bg-atencao/10' : 'bg-secondary/50'
                        }`}>
                          <span className="text-foreground/90 flex-1 pr-3">{r.pergunta}</span>
                          {respostaBadge(r.resposta)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {selected.observacoes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 pb-1 border-b border-border">Observações</h4>
                    {selected.observacoes.map((obs, i) => (
                      <p key={i} className="text-sm text-muted-foreground bg-atencao/10 px-3 py-2 rounded-lg mt-1">{obs}</p>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
