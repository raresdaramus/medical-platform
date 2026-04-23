import { useEffect, useState } from 'react';
import { getConsultation } from '../../api/consultationApi';
import type { ConsultationResponse, ConsultationStatus } from '../../types';

interface Props {
  consultations: ConsultationResponse[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ConsultationStatus, string> = {
  PENDING:     '#f59e0b',
  CONFIRMED:   '#3b82f6',
  IN_PROGRESS: '#10b981',
  COMPLETED:   '#6b7280',
  CANCELLED:   '#ef4444',
};

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  PENDING:     'Pending',
  CONFIRMED:   'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  CANCELLED:   'Cancelled',
};

const BAR_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#60a5fa', '#93c5fd', '#c4b5fd', '#818cf8'];

// ─── Donut ────────────────────────────────────────────────────────────────────

function DonutChart({ consultations }: { consultations: ConsultationResponse[] }) {
  const counts: Partial<Record<ConsultationStatus, number>> = {};
  for (const c of consultations) {
    counts[c.status] = (counts[c.status] ?? 0) + 1;
  }

  const total = consultations.length;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        No consultations yet
      </div>
    );
  }

  const entries = Object.entries(counts) as [ConsultationStatus, number][];
  const R = 60;
  const r = 38;
  const cx = 75;
  const cy = 75;

  let angle = -Math.PI / 2;

  const arcs = entries.map(([status, count]) => {
    const sweep = (count / total) * 2 * Math.PI;
    const start = angle;
    const end = angle + sweep;
    angle = end;

    const x1 = cx + R * Math.cos(start);
    const y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end);
    const y2 = cy + R * Math.sin(end);
    const ix1 = cx + r * Math.cos(end);
    const iy1 = cy + r * Math.sin(end);
    const ix2 = cx + r * Math.cos(start);
    const iy2 = cy + r * Math.sin(start);
    const large = sweep > Math.PI ? 1 : 0;

    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${large} 0 ${ix2} ${iy2} Z`;

    return { d, status, count };
  });

  return (
    <div className="flex items-center gap-8">
      <svg width="150" height="150" viewBox="0 0 150 150" className="flex-shrink-0">
        {arcs.map(({ d, status }) => (
          <path key={status} d={d} fill={STATUS_COLORS[status]} />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="700">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="11">
          total
        </text>
      </svg>

      <div className="space-y-2.5 min-w-0">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center gap-2.5 text-sm">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            <span className="text-slate-600 truncate">{STATUS_LABELS[status]}</span>
            <span className="font-semibold text-slate-800 ml-auto pl-3 tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Symptoms ─────────────────────────────────────────────────────────────

function TopSymptomsChart({ consultations }: { consultations: ConsultationResponse[] }) {
  const [symptomCounts, setSymptomCounts] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const completed = consultations.filter((c) => c.status === 'COMPLETED');
    if (completed.length === 0) {
      setLoading(false);
      return;
    }

    Promise.allSettled(completed.map((c) => getConsultation(c.id))).then((results) => {
      const freq: Record<string, number> = {};
      for (const r of results) {
        if (r.status !== 'fulfilled' || !r.value.intake) continue;
        for (const s of r.value.intake.symptoms) {
          const name = s.symptomName ?? s.customText;
          if (!name) continue;
          freq[name] = (freq[name] ?? 0) + 1;
        }
      }

      const sorted = Object.entries(freq)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setSymptomCounts(sorted);
      setLoading(false);
    });
  }, [consultations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  if (symptomCounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        No completed consultations with symptoms yet
      </div>
    );
  }

  const max = symptomCounts[0].count;

  return (
    <div className="space-y-3">
      {symptomCounts.map(({ name, count }, i) => (
        <div key={name} className="flex items-center gap-3 text-sm">
          <span className="w-36 text-slate-600 truncate flex-shrink-0 text-right" title={name}>
            {name}
          </span>
          <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(count / max) * 100}%`,
                backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
              }}
            />
          </div>
          <span className="w-6 text-right font-semibold text-slate-700 tabular-nums flex-shrink-0">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function DoctorChartsSection({ consultations }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card card-body">
        <h2 className="font-semibold text-slate-900 mb-5">Consultation Status</h2>
        <DonutChart consultations={consultations} />
      </div>

      <div className="card card-body">
        <h2 className="font-semibold text-slate-900 mb-5">Top Reported Symptoms</h2>
        <TopSymptomsChart consultations={consultations} />
      </div>
    </div>
  );
}
