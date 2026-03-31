import { Lightbulb } from 'lucide-react';

export function InsightBanner({ insight }: { insight: string }) {
  if (!insight) return null;
  return (
    <div className="bg-atencao/10 border border-atencao/20 rounded-xl px-5 py-3 flex items-center gap-3">
      <Lightbulb className="w-5 h-5 text-atencao flex-shrink-0" strokeWidth={1.5} />
      <p className="text-sm text-foreground font-medium">{insight}</p>
    </div>
  );
}
