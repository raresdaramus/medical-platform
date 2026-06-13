import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, ComposedChart,
  Treemap, Tooltip as RTooltip,
} from 'recharts';
import { getStatistics } from '../../api/consultationApi';
import type { StatisticsResponse, MonthlyTrend } from '../../types';

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16','#f97316','#6366f1'];

const CATEGORY_COLORS: Record<string, string> = {
  Infectious: '#10b981', Infecțioasă: '#10b981',
  Neurological: '#8b5cf6', Neurologică: '#8b5cf6',
  Respiratory: '#3b82f6', Respiratorie: '#3b82f6',
  Digestive: '#f59e0b', Digestivă: '#f59e0b',
  Cardiovascular: '#ef4444', Cardiovasculară: '#ef4444',
  Urinary: '#06b6d4', Urinară: '#06b6d4',
  Musculoskeletal: '#84cc16', Musculoscheletală: '#84cc16',
  Dermatological: '#ec4899', Dermatologică: '#ec4899',
  Psychological: '#f97316', Psihologică: '#f97316',
};

const URGENCY_COLORS: Record<string, string> = {
  ROUTINE: '#10b981', URGENT: '#f59e0b', EMERGENCY: '#ef4444',
};

const MONTH_NAMES_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES_RO = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec'];

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'treemap',  icon: '▦', labelKey: 'stats.tabTreemap'  },
  { id: 'trends',   icon: '📈', labelKey: 'stats.tabTrends'   },
  { id: 'sankey',   icon: '⟶', labelKey: 'stats.tabSankey'   },
  { id: 'referrals',icon: '📋', labelKey: 'stats.tabReferrals'},
  { id: 'pareto',   icon: '💊', labelKey: 'stats.tabPareto'   },
  { id: 'network',  icon: '🔗', labelKey: 'stats.tabNetwork'  },
  { id: 'vitals',   icon: '🩺', labelKey: 'stats.tabVitals'   },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Empty state ──────────────────────────────────────────────────────────────

function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
      <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17v-2m3 2v-4m3 4v-6M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  );
}

// ─── 1. Disease Treemap ───────────────────────────────────────────────────────

function TreemapTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-slate-900">{d.displayName}</p>
      {d.icd10Code && <p className="text-slate-500">{d.icd10Code}</p>}
      <p className="text-blue-600 font-medium">{d.count} diagnostice</p>
    </div>
  );
}

function DiseaseTreemap({ data, lang }: { data: StatisticsResponse['diseaseFrequency']; lang: string }) {
  const { t } = useTranslation();
  if (!data.length) return <Empty label={t('stats.noData')} />;

  const treemapData = data.map(d => ({
    name: d.name,
    displayName: lang === 'ro' ? (d.nameRo ?? d.name) : d.name,
    icd10Code: d.icd10Code,
    category: d.category,
    count: d.count,
    size: d.count,
    fill: CATEGORY_COLORS[d.category ?? ''] ?? '#94a3b8',
  }));

  const CustomContent = (props: any) => {
    const { x, y, width, height, fill, displayName, count } = props;
    if (width < 30 || height < 20) return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} opacity={0.85} />
        <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={Math.min(13, width / 7)} fontWeight={600}>
          {displayName?.length > width / 7 ? displayName.slice(0, Math.floor(width / 7)) + '…' : displayName}
        </text>
        <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={11}>
          {count}
        </text>
      </g>
    );
  };

  const categories = [...new Set(data.map(d => d.category).filter(Boolean))] as string[];

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {categories.map(cat => (
          <span key={cat} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: CATEGORY_COLORS[cat] ?? '#94a3b8' }} />
            {t('diseaseCategory.' + cat, cat)}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={treemapData}
          dataKey="size"
          isAnimationActive={false}
          content={<CustomContent />}
        >
          <RTooltip content={<TreemapTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 2. Monthly Trends ────────────────────────────────────────────────────────

function MonthlyTrendsChart({ data, lang }: { data: MonthlyTrend[]; lang: string }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>('');

  if (!data.length) return <Empty label={t('stats.noData')} />;

  const monthNames  = lang === 'ro' ? MONTH_NAMES_RO : MONTH_NAMES_EN;
  const allDiseases = [...new Set(data.map(d => d.diseaseName))];
  const diseases    = selected ? [selected] : allDiseases;

  const monthKeys = [...new Set(data.map(d => `${d.year}-${String(d.month).padStart(2,'0')}`))]
    .sort()
    .slice(-18);

  const chartData = monthKeys.map(key => {
    const [y, m] = key.split('-');
    const row: Record<string, any> = { label: monthNames[parseInt(m) - 1] + ' ' + y.slice(2) };
    for (const dis of allDiseases) {
      const pt = data.find(d => d.diseaseName === dis && d.year === parseInt(y) && d.month === parseInt(m));
      row[dis] = pt?.count ?? 0;
    }
    return row;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-slate-600 font-medium">{t('stats.filterDisease')}</label>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('stats.allDiseases')}</option>
          {allDiseases.map(dis => {
            const d = data.find(x => x.diseaseName === dis);
            const label = lang === 'ro' ? (d?.diseaseNameRo ?? dis) : dis;
            return <option key={dis} value={dis}>{label}</option>;
          })}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => {
              const d = data.find(x => x.diseaseName === value);
              return lang === 'ro' ? (d?.diseaseNameRo ?? value) : value;
            }}
          />
          {diseases.map((dis) => (
            <Line key={dis} type="monotone" dataKey={dis} stroke={PALETTE[allDiseases.indexOf(dis) % PALETTE.length]}
              strokeWidth={selected ? 2.5 : 2} dot={selected ? { r: 3 } : false} activeDot={{ r: 4 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 3. Sankey (SVG manual) ───────────────────────────────────────────────────

function SankeyChart({ data }: { data: StatisticsResponse['sankey'] }) {
  const { t } = useTranslation();
  if (!data || data.total === 0) return <Empty label={t('stats.noData')} />;

  const total = data.total;
  const nodes = [
    { label: t('stats.sankeyAll'),          value: data.total,            color: '#64748b' },
    { label: t('stats.sankeyCompleted'),    value: data.completed,        color: '#3b82f6' },
    { label: t('stats.sankeyDiagnosis'),    value: data.withDiagnosis,    color: '#8b5cf6' },
    { label: t('stats.sankeyPrescription'), value: data.withPrescription, color: '#10b981' },
    { label: t('stats.sankeyReferral'),     value: data.withReferral,     color: '#f59e0b' },
    { label: t('stats.sankeyFollowUp'),     value: data.withFollowUp,     color: '#ef4444' },
  ];

  // Layout constants — bars never exceed maxBarH so they always fit in their slot
  const W = 680, H = 400;
  const colX  = [30, 150, 270, 400, 530];
  const BAR_W = 26;
  const TOP   = 20;
  const BOT   = 20;
  const usableH  = H - TOP - BOT;  // 360px  (2-node slot = 180 > maxBarH ✓)
  const maxBarH  = 160;

  const cols = [
    [nodes[0]],
    [nodes[1]],
    [nodes[2]],
    [nodes[3], nodes[4]],
    [nodes[5]],
  ];

  const getH = (v: number) => Math.max(10, Math.round((v / total) * maxBarH));

  // y = top of bar, guaranteed to stay within [TOP, H - BOT]
  const getY = (ci: number, ni: number, v: number) => {
    const col = cols[ci];
    const h   = getH(v);
    if (col.length === 1) {
      return TOP + Math.round((usableH - h) / 2);
    }
    const slotH  = Math.floor(usableH / col.length);
    const center = TOP + ni * slotH + Math.round(slotH / 2);
    return Math.max(TOP, Math.min(center - Math.round(h / 2), H - BOT - h));
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl mx-auto">
        {cols.map((col, ci) =>
          col.map((node, ni) => {
            const x   = colX[ci];
            const h   = getH(node.value);
            const y   = getY(ci, ni, node.value);
            const pct = total > 0 ? Math.round((node.value / total) * 100) : 0;
            const cx  = x + BAR_W / 2;

            // Flow paths to next column
            const flows: JSX.Element[] = [];
            if (ci < cols.length - 1) {
              cols[ci + 1].forEach((nextNode, nni) => {
                const nx  = colX[ci + 1];
                const nh  = getH(nextNode.value);
                const ny  = getY(ci + 1, nni, nextNode.value);
                const fh  = Math.min(h, nh) * 0.7;
                const x1  = x + BAR_W, y1 = y + h / 2 - fh / 2;
                const x2  = nx,        y2 = ny + nh / 2 - fh / 2;
                const mx  = (x1 + x2) / 2;
                flows.push(
                  <path key={`f-${ci}-${ni}-${nni}`}
                    d={`M${x1} ${y1} C${mx} ${y1},${mx} ${y2},${x2} ${y2} L${x2} ${y2+fh} C${mx} ${y2+fh},${mx} ${y1+fh},${x1} ${y1+fh}Z`}
                    fill={node.color} opacity={0.18} />
                );
              });
            }

            return (
              <g key={`${ci}-${ni}`}>
                {flows}
                <rect x={x} y={y} width={BAR_W} height={h} rx={4} fill={node.color} />
                {/* Count + % inside bar when tall enough, otherwise above */}
                {h >= 26 ? (
                  <>
                    <text x={cx} y={y + h / 2 - 4} textAnchor="middle" dominantBaseline="middle"
                      fontSize={9} fill="#fff" fontWeight={700}>{node.value}</text>
                    <text x={cx} y={y + h / 2 + 8} textAnchor="middle" dominantBaseline="middle"
                      fontSize={8} fill="rgba(255,255,255,0.85)">{pct}%</text>
                  </>
                ) : (
                  <text x={cx} y={y - 4} textAnchor="middle" fontSize={8} fill="#64748b" fontWeight={600}>
                    {node.value} ({pct}%)
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
      {/* Labels in HTML — no SVG clipping, no truncation */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
        {nodes.map(n => (
          <div key={n.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: n.color }} />
            <span className="text-slate-600">{n.label}:</span>
            <span className="font-semibold text-slate-800">{n.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. Referral Urgency Stacked Bar ─────────────────────────────────────────

function ReferralUrgencyChart({ data, lang }: { data: StatisticsResponse['referralUrgency']; lang: string }) {
  const { t } = useTranslation();
  if (!data.length) return <Empty label={t('stats.noData')} />;

  const monthNames = lang === 'ro' ? MONTH_NAMES_RO : MONTH_NAMES_EN;
  const monthKeys = [...new Set(data.map(d => `${d.year}-${String(d.month).padStart(2,'0')}`))]
    .sort().slice(-12);

  const chartData = monthKeys.map(key => {
    const [y, m] = key.split('-');
    const row: Record<string, any> = { label: monthNames[parseInt(m) - 1] + "'" + y.slice(2) };
    for (const u of ['ROUTINE', 'URGENT', 'EMERGENCY']) {
      const pt = data.find(d => d.urgency === u && d.year === parseInt(y) && d.month === parseInt(m));
      row[u] = pt?.count ?? 0;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }}
          formatter={(v: string) => String(t('stats.urgency.' + v, v))} />
        {(['ROUTINE','URGENT','EMERGENCY'] as const).map(u => (
          <Bar key={u} dataKey={u} stackId="a" fill={URGENCY_COLORS[u]} radius={u === 'EMERGENCY' ? [4,4,0,0] : [0,0,0,0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 5. Pareto Medications ────────────────────────────────────────────────────

function ParetoChart({ data }: { data: StatisticsResponse['topMedications'] }) {
  const { t } = useTranslation();
  if (!data.length) return <Empty label={t('stats.noData')} />;

  const total = data.reduce((s, d) => s + d.count, 0);
  let cum = 0;
  const chartData = data.map(d => {
    cum += d.count;
    return { name: d.medicationName, count: d.count, cumPct: Math.round((cum / total) * 100) };
  });

  return (
    <div>
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-800">
        <span className="text-base mt-0.5">💡</span>
        <span>{t('stats.paretoInfo')}</span>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 40, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
          <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            formatter={(value, name) => name === 'cumPct' ? `${value}%` : value} />
          <Bar yAxisId="left" dataKey="count" radius={[4,4,0,0]}>
            {chartData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="cumPct" stroke="#ef4444"
            strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} name="Pareto %" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 6. Symptom–Disease Network ───────────────────────────────────────────────

function NetworkGraph({ data, lang }: { data: StatisticsResponse['symptomNetwork']; lang: string }) {
  const { t } = useTranslation();
  const [hoveredDisease, setHoveredDisease] = useState<string | null>(null);
  const [lockedDisease,  setLockedDisease]  = useState<string | null>(null);

  if (!data.length) return <Empty label={t('stats.noData')} />;

  const activeDisease = lockedDisease ?? hoveredDisease;

  const diseases = useMemo(() => [...new Set(data.map(d => d.diseaseId))].slice(0, 14), [data]);

  // Pick the 20 symptoms most shared across diseases
  const symptoms = useMemo(() => {
    const cnt = new Map<string, number>();
    for (const d of data) cnt.set(d.symptomId, (cnt.get(d.symptomId) ?? 0) + 1);
    return [...new Set(data.map(d => d.symptomId))]
      .sort((a, b) => (cnt.get(b) ?? 0) - (cnt.get(a) ?? 0))
      .slice(0, 20);
  }, [data]);

  const W = 680, H = 560;
  const disR = 28, symR = 15;
  const disX = 110, symX = W - 110;
  const marginY = 40;

  const disPos = diseases.map((_, i) => ({
    x: disX,
    y: marginY + (i / Math.max(diseases.length - 1, 1)) * (H - marginY * 2),
  }));
  const symPos = symptoms.map((_, i) => ({
    x: symX,
    y: marginY + (i / Math.max(symptoms.length - 1, 1)) * (H - marginY * 2),
  }));

  const links = data.filter(d => diseases.includes(d.diseaseId) && symptoms.includes(d.symptomId));
  const activeLinks    = activeDisease ? links.filter(l => l.diseaseId === activeDisease) : links;
  const activeSymptoms = new Set(activeLinks.map(l => l.symptomId));

  const handleDiseaseClick = (dId: string) => {
    setLockedDisease(prev => prev === dId ? null : dId);
    setHoveredDisease(null);
  };

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3 text-center">
        {t('stats.networkHint')}
        {lockedDisease && (
          <button onClick={() => setLockedDisease(null)}
            className="ml-3 text-blue-500 underline hover:text-blue-700">{t('stats.clearSelection', 'Clear')}</button>
        )}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl mx-auto">
        {/* Edges */}
        {links.map((link, i) => {
          const di = diseases.indexOf(link.diseaseId);
          const si = symptoms.indexOf(link.symptomId);
          if (di < 0 || si < 0) return null;
          const dp = disPos[di], sp = symPos[si];
          const isActive = activeLinks.includes(link);
          return (
            <line key={i}
              x1={dp.x + disR} y1={dp.y}
              x2={sp.x - symR} y2={sp.y}
              stroke={link.isPathognomonic ? '#8b5cf6' : '#3b82f6'}
              strokeWidth={link.isPathognomonic ? 2 : 1}
              opacity={isActive ? (link.isPathognomonic ? 0.8 : 0.45) : 0.05}
              strokeDasharray={link.isPathognomonic ? '' : '4 2'}
            />
          );
        })}
        {/* Disease nodes */}
        {diseases.map((dId, i) => {
          const link  = data.find(l => l.diseaseId === dId);
          const label = lang === 'ro' ? (link?.diseaseNameRo ?? link?.diseaseName ?? dId) : (link?.diseaseName ?? dId);
          const { x, y } = disPos[i];
          const isActive = activeDisease === dId;
          const fill = PALETTE[i % PALETTE.length];
          return (
            <g key={dId} style={{ cursor: 'pointer' }}
              onMouseEnter={() => !lockedDisease && setHoveredDisease(dId)}
              onMouseLeave={() => !lockedDisease && setHoveredDisease(null)}
              onClick={() => handleDiseaseClick(dId)}>
              <circle cx={x} cy={y} r={disR + (isActive ? 4 : 0)} fill={fill}
                opacity={!activeDisease || isActive ? 0.9 : 0.3}
                stroke={isActive ? '#1e40af' : 'none'} strokeWidth={2} />
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={isActive ? 9 : 8} fill="#fff" fontWeight={600}>
                {label.length > 10 ? label.slice(0, 9) + '…' : label}
              </text>
            </g>
          );
        })}
        {/* Symptom nodes */}
        {symptoms.map((sId, i) => {
          const link  = data.find(l => l.symptomId === sId);
          const label = lang === 'ro' ? (link?.symptomNameRo ?? link?.symptomName ?? sId) : (link?.symptomName ?? sId);
          const { x, y } = symPos[i];
          const isActive = !activeDisease || activeSymptoms.has(sId);
          const shortLabel = label.length > 12 ? label.slice(0, 11) + '…' : label;
          return (
            <g key={sId}>
              <circle cx={x} cy={y} r={symR} fill="#e2e8f0"
                stroke={isActive && activeDisease ? '#3b82f6' : '#cbd5e1'}
                strokeWidth={isActive && activeDisease ? 1.5 : 0.5}
                opacity={isActive ? 1 : 0.25} />
              <text x={x - symR - 5} y={y + 1} textAnchor="end" dominantBaseline="middle"
                fontSize={activeDisease && isActive ? 9 : 7.5}
                fill={isActive && activeDisease ? '#1e40af' : '#94a3b8'}
                fontWeight={activeDisease && isActive ? 600 : 400}
                opacity={isActive ? 1 : 0.4}>
                {shortLabel}
              </text>
            </g>
          );
        })}
        {/* Column labels */}
        <text x={disX} y={14} textAnchor="middle" fontSize={11} fill="#64748b" fontWeight={600}>
          {t('stats.diseases')}
        </text>
        <text x={symX} y={14} textAnchor="middle" fontSize={11} fill="#64748b" fontWeight={600}>
          {t('stats.symptoms')}
        </text>
      </svg>
      <div className="flex justify-center gap-6 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#8b5cf6" strokeWidth="2" /></svg>
          {t('stats.pathognomonic')}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 2" /></svg>
          {t('stats.associated')}
        </span>
      </div>
    </div>
  );
}

// ─── 7. Vitals per Disease ────────────────────────────────────────────────────

function VitalsChart({ data, lang }: { data: StatisticsResponse['vitalsPerDisease']; lang: string }) {
  const { t } = useTranslation();
  if (!data.length) return <Empty label={t('stats.noData')} />;

  const name = (d: StatisticsResponse['vitalsPerDisease'][0]) =>
    lang === 'ro' ? (d.diseaseNameRo ?? d.diseaseName) : d.diseaseName;

  const tempData = data.filter(d => d.avgTemperature > 0).map(d => ({ name: name(d), value: d.avgTemperature, count: d.count }));
  const glucData = data.filter(d => d.avgGlucose > 0).map(d => ({ name: name(d), value: d.avgGlucose, count: d.count }));
  const bpData   = data.filter(d => d.avgSystolic > 0).map(d => ({ name: name(d), value: d.avgSystolic, count: d.count }));

  interface SubRow { name: string; value: number; count: number }
  const SubChart = ({ rows, unit, refLow, refHigh, scaleMin, scaleMax, color, title }: {
    rows: SubRow[]; unit: string; refLow: number; refHigh: number;
    scaleMin?: number; scaleMax?: number; color: string; title: string;
  }) => {
    if (!rows.length) return null;
    const dMin = scaleMin ?? 0;
    const dMax = scaleMax ?? Math.max(...rows.map(r => r.value), refHigh * 1.05);
    const range = dMax - dMin;
    const toPct = (v: number) => Math.max(0, Math.min(100, ((v - dMin) / range) * 100));
    const lowPct  = toPct(refLow);
    const highPct = toPct(refHigh);
    return (
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">{title}</p>
        <div className="space-y-2.5">
          {rows.map(r => {
            const barPct = toPct(r.value);
            const aboveNormal = r.value > refHigh;
            const barColor = aboveNormal ? color : `${color}99`;
            return (
              <div key={r.name} className="flex items-center gap-2 text-sm">
                <span className="w-36 text-slate-600 truncate text-right flex-shrink-0" title={r.name}>{r.name}</span>
                <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden relative">
                  {/* Normal range band */}
                  <div className="absolute top-0 bottom-0 bg-emerald-200/50 z-[1]"
                    style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }} />
                  {/* Low ref line */}
                  <div className="absolute top-0 bottom-0 w-px bg-emerald-400 z-[2]"
                    style={{ left: `${lowPct}%` }} />
                  {/* High ref line */}
                  <div className="absolute top-0 bottom-0 w-px bg-emerald-400 z-[2]"
                    style={{ left: `${highPct}%` }} />
                  {/* Value bar */}
                  <div className="h-full relative z-[3]"
                    style={{ width: `${barPct}%`, background: barColor }} />
                </div>
                <span className={`w-16 text-right font-semibold tabular-nums flex-shrink-0 ${aboveNormal ? 'text-red-600' : 'text-slate-700'}`}>
                  {r.value.toFixed(1)} {unit}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 rounded-sm bg-emerald-200/70 border border-emerald-400" />
            {t('stats.normalRange')}: {refLow}–{refHigh} {unit}
          </p>
          {scaleMin !== undefined && (
            <p className="text-xs text-slate-400">{dMin} – {dMax} {unit}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <SubChart rows={tempData} unit="°C"    refLow={36.5} refHigh={37.0} scaleMin={30} scaleMax={40} color="#ef4444" title={t('stats.avgTemp')} />
      <SubChart rows={glucData} unit="mg/dL" refLow={70}   refHigh={100}  color="#f59e0b" title={t('stats.avgGlucose')} />
      <SubChart rows={bpData}   unit="mmHg"  refLow={100}  refHigh={120}  color="#8b5cf6" title={t('stats.avgBP')} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [stats, setStats]         = useState<StatisticsResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('treemap');

  useEffect(() => {
    setLoading(true);
    getStatistics()
      .then(setStats)
      .catch(() => setError(t('stats.loadError')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        {t('stats.loading')}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error || t('stats.loadError')}</div>
    );
  }

  const tabContent: Record<TabId, JSX.Element> = {
    treemap:  <DiseaseTreemap       data={stats.diseaseFrequency} lang={lang} />,
    trends:   <MonthlyTrendsChart   data={stats.monthlyTrends}   lang={lang} />,
    sankey:   <SankeyChart          data={stats.sankey} />,
    referrals:<ReferralUrgencyChart data={stats.referralUrgency} lang={lang} />,
    pareto:   <ParetoChart          data={stats.topMedications} />,
    network:  <NetworkGraph         data={stats.symptomNetwork}  lang={lang} />,
    vitals:   <VitalsChart          data={stats.vitalsPerDisease} lang={lang} />,
  };

  const tabDescriptions: Record<TabId, string> = {
    treemap:   t('stats.descTreemap'),
    trends:    t('stats.descTrends'),
    sankey:    t('stats.descSankey'),
    referrals: t('stats.descReferrals'),
    pareto:    t('stats.descPareto'),
    network:   t('stats.descNetwork'),
    vitals:    t('stats.descVitals'),
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('stats.title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('stats.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            <span>{tab.icon}</span>
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="card card-body">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900 text-lg">
            {TABS.find(t => t.id === activeTab)?.icon} {t(TABS.find(t => t.id === activeTab)!.labelKey)}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">{tabDescriptions[activeTab]}</p>
        </div>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
