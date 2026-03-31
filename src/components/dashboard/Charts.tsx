import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, Label, Sector, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartStyle, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AuditRecord, AuditGroup } from '@/lib/googleSheets';

const COLORS = {
  conforme: '#22c55e',
  naoConforme: '#ef4444',
  parcial: '#eab308',
  na: '#64748b',
  primary: '#0ea5e9',
  teal: '#14b8a6',
  purple: '#a855f7',
  grid: 'rgba(255,255,255,0.06)',
  axis: 'rgba(255,255,255,0.4)',
};

const tooltipStyle = {
  contentStyle: { background: 'hsl(220 18% 13%)', border: '1px solid hsl(220 14% 22%)', borderRadius: '8px', color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' },
};

interface ChartsProps {
  records: AuditRecord[];
  groups: AuditGroup[];
  metaKPIs: { meta: string; conformidade: number; total?: number; falhas?: number }[];
}

function parseDate(d: string): Date | null {
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
}

export function ConformidadeBarChart({ metaKPIs }: { metaKPIs: ChartsProps['metaKPIs'] }) {
  const data = React.useMemo(() => metaKPIs.map(m => ({
    name: m.meta,
    conformidade: Number(m.conformidade.toFixed(1)),
    total: m.total || 0,
    fill: m.conformidade >= 80 ? COLORS.conforme : m.conformidade >= 50 ? COLORS.parcial : COLORS.naoConforme
  })), [metaKPIs]);

  const chartConfig = {
    conformidade: { label: "Conformidade", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  return (
    <div className="gradient-card border border-border rounded-xl p-5 card-shadow flex flex-col justify-between" data-chart="bar-conformidade">
      <ChartStyle id="bar-conformidade" config={chartConfig} />
      <div className="flex flex-col mb-4">
        <h3 className="text-lg font-semibold text-foreground">Conformidade por Meta</h3>
        <p className="text-sm text-muted-foreground mt-1">Comparativo de desempenho analítico (em %)</p>
      </div>
      <div className="flex-1 mt-2">
        <ChartContainer id="bar-conformidade" config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={data} margin={{ top: 25, right: 10, left: -20, bottom: 0 }} barSize={36}>
            <CartesianGrid vertical={false} stroke={COLORS.grid} strokeDasharray="4 4" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={12} tick={{ fontSize: 11, fill: COLORS.axis }} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 11, fill: COLORS.axis }} tickFormatter={(v) => `${v}%`} />
            <ChartTooltip 
              cursor={{ fill: 'rgba(255,255,255,0.04)' }} 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border shadow-xl rounded-lg p-3.5 w-full max-w-[220px]">
                      <p className="text-[13px] font-semibold text-foreground mb-3 leading-snug break-words whitespace-normal">
                        {label}
                      </p>
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/60">
                        <div className="flex items-center w-full">
                          <div className="flex items-center gap-2 mr-6">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: payload[0].payload.fill }} />
                            <span className="text-[11px] text-muted-foreground uppercase font-medium tracking-wider">Conformidade:</span>
                          </div>
                          <span className="font-bold font-mono text-sm text-foreground ml-auto">{payload[0].value}%</span>
                        </div>
                        <div className="flex items-center w-full">
                          <div className="flex items-center gap-2 mr-6">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-primary/40" />
                            <span className="text-[11px] text-muted-foreground uppercase font-medium tracking-wider">Amostras Analisadas:</span>
                          </div>
                          <span className="font-bold font-mono text-xs text-muted-foreground ml-auto">{payload[0].payload.total} un</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="conformidade" radius={[5, 5, 0, 0]}>
              <LabelList dataKey="conformidade" position="top" formatter={(v: number) => `${v}%`} className="fill-foreground text-[11px] font-bold font-mono" offset={8} />
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} className="drop-shadow-md transition-all duration-300 hover:opacity-80" />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

export function EvolucaoLineChart({ groups }: { groups: AuditGroup[] }) {
  const dateMap = new Map<string, { total: number; sum: number }>();
  for (const g of groups) {
    const existing = dateMap.get(g.data) || { total: 0, sum: 0 };
    existing.total++;
    existing.sum += g.conformidade;
    dateMap.set(g.data, existing);
  }

  const data = Array.from(dateMap.entries())
    .map(([date, v]) => ({ date, conformidade: Number((v.sum / v.total).toFixed(1)) }))
    .sort((a, b) => {
      const da = parseDate(a.date);
      const db = parseDate(b.date);
      return (da?.getTime() || 0) - (db?.getTime() || 0);
    });

  const chartConfig = {
    conformidade: { label: "Conformidade", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  return (
    <div className="gradient-card border border-border rounded-xl p-5 card-shadow flex flex-col justify-between" data-chart="line-evolucao">
      <ChartStyle id="line-evolucao" config={chartConfig} />
      <div className="flex flex-col mb-4">
        <h3 className="text-lg font-semibold text-foreground">Evolução por Data</h3>
        <p className="text-sm text-muted-foreground mt-1">Curva média de conformidade diária geral</p>
      </div>
      <div className="flex-1 mt-2">
        <ChartContainer id="line-evolucao" config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart data={data} margin={{ top: 15, right: 15, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke={COLORS.grid} strokeDasharray="4 4" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={12} minTickGap={24} tick={{ fontSize: 11, fill: COLORS.axis }} tickFormatter={(val: string) => val.substring(0, 5)} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 11, fill: COLORS.axis }} tickFormatter={(v) => `${v}%`} />
            <ChartTooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }} 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border shadow-xl rounded-lg p-3.5 w-full max-w-[220px]">
                      <p className="text-[13px] font-semibold text-foreground mb-3 leading-snug break-words whitespace-normal">
                        Data: {label}
                      </p>
                      <div className="flex items-center w-full mt-2 pt-2 border-t border-border/60">
                        <div className="flex items-center gap-2 mr-6">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(var(--primary))" }} />
                          <span className="text-[11px] text-muted-foreground uppercase font-medium tracking-wider">Conformidade:</span>
                        </div>
                        <span className="font-bold font-mono text-sm text-foreground ml-auto">{payload[0].value}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="conformidade"
              stroke="var(--color-conformidade)"
              strokeWidth={4}
              dot={{ r: 4, fill: "var(--color-conformidade)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: COLORS.primary, stroke: "#f8fafc", strokeWidth: 3 }}
              style={{ filter: "drop-shadow(0px 8px 12px rgba(14, 165, 233, 0.45))" }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}

export function DistribuicaoPieChart({ records }: { records: AuditRecord[] }) {
  const counts = { Sim: 0, Não: 0, Parcialmente: 0, 'N/A': 0 };
  for (const r of records) {
    if (r.resposta === 'Sim') counts.Sim++;
    else if (r.resposta === 'Não') counts['Não']++;
    else if (r.resposta === 'Parcialmente') counts.Parcialmente++;
    else if (r.resposta === 'N/A') counts['N/A']++;
  }

  const chartConfig = React.useMemo(() => ({
    conforme: { label: "Conforme", color: COLORS.conforme },
    naoConforme: { label: "Não Conforme", color: COLORS.naoConforme },
    parcial: { label: "Parcial", color: COLORS.parcial },
    na: { label: "N/A", color: COLORS.na },
  } satisfies ChartConfig), []);

  const data = React.useMemo(() => [
    { status: 'conforme', count: counts.Sim, fill: COLORS.conforme },
    { status: 'naoConforme', count: counts['Não'], fill: COLORS.naoConforme },
    { status: 'parcial', count: counts.Parcialmente, fill: COLORS.parcial },
    { status: 'na', count: counts['N/A'], fill: COLORS.na },
  ].filter(d => d.count > 0), [counts]);

  const id = "pie-interactive-respostas";
  const [activeStatus, setActiveStatus] = React.useState(data[0]?.status);

  React.useEffect(() => {
    if (data.length > 0 && !data.find(d => d.status === activeStatus)) {
      setActiveStatus(data[0].status);
    }
  }, [data, activeStatus]);

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.status === activeStatus),
    [activeStatus, data]
  );

  const statuses = React.useMemo(() => data.map((item) => item.status), [data]);

  const renderPieShape = React.useCallback(
    (props: any) => {
      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, index } = props;
      if (index === activeIndex) {
        return (
          <g>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 11} outerRadius={outerRadius + 20} startAngle={startAngle} endAngle={endAngle} fill={fill} />
          </g>
        )
      }
      return <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    },
    [activeIndex]
  );

  if (data.length === 0) return (
    <div className="gradient-card border border-border rounded-xl p-5 card-shadow flex items-center justify-center min-h-[350px]">
      <p className="text-muted-foreground">Nenhum dado disponível.</p>
    </div>
  );

  return (
    <div className="gradient-card border border-border rounded-xl p-5 card-shadow flex flex-col justify-between" data-chart={id}>
      <ChartStyle id={id} config={chartConfig} />
      <div className="flex flex-row items-center justify-between mb-2">
        <div className="grid gap-1">
          <h3 className="text-lg font-semibold text-foreground">Distribuição</h3>
          <p className="text-xs text-muted-foreground hidden sm:block">Volume total por status</p>
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger className="w-[140px] h-8 rounded-lg pl-2.5 bg-secondary border-border text-xs" aria-label="Select a status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl border-border bg-background">
            {statuses.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];
              if (!config) return null;
              return (
                <SelectItem key={key} value={key} className="rounded-lg [&_span]:flex cursor-pointer">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex h-3 w-3 shrink-0 rounded-[2px]" style={{ backgroundColor: config.color }} />
                    {config.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 mt-2 flex items-center justify-center">
        <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-square w-full max-w-[240px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={70}
              outerRadius={105}
              strokeWidth={4}
              stroke="transparent"
              // @ts-ignore
              shape={renderPieShape}
              paddingAngle={2}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold font-mono">
                          {data[activeIndex > -1 ? activeIndex : 0]?.count.toLocaleString() || '0'}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 26} className="fill-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                          {chartConfig[data[activeIndex > -1 ? activeIndex : 0]?.status as keyof typeof chartConfig]?.label || ''}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}

export function RankingUnidades({ records }: { records: AuditRecord[] }) {
  const map = new Map<string, { total: number; naoConformes: number }>();
  for (const r of records) {
    if (r.resposta === 'N/A' || !r.resposta) continue;
    const existing = map.get(r.unidade) || { total: 0, naoConformes: 0 };
    existing.total++;
    if (r.resposta !== 'Sim') existing.naoConformes++;
    map.set(r.unidade, existing);
  }

  const ranked = Array.from(map.entries())
    .map(([unidade, v]) => ({ unidade, naoConformes: v.naoConformes, total: v.total }))
    .sort((a, b) => b.naoConformes - a.naoConformes);

  return (
    <div className="gradient-card border border-border rounded-xl p-5 card-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ranking de Não Conformidades</h3>
      <div className="space-y-3">
        {ranked.map((item, idx) => (
          <div key={item.unidade} className="flex items-center gap-3">
            <span className="text-sm font-bold font-mono text-muted-foreground w-6">{idx + 1}°</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.unidade}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-nao-conforme/15 text-nao-conforme font-medium font-mono">
                  {item.naoConformes} falhas
                </span>
                <span className="text-xs text-muted-foreground font-mono">{item.total} itens</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
