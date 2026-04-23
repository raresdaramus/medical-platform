import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getDoctorSchedule, updateDoctorSchedule } from '../../api/userApi';
import type { ScheduleEntry, CreateScheduleEntry, DayOfWeek } from '../../types';

const DAY_KEYS: Record<DayOfWeek, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

const DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

export default function ManageSchedulePage() {
  const { profileId } = useAuthStore();
  const { t } = useTranslation();

  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form state for adding a new entry
  const [newDay, setNewDay] = useState<DayOfWeek>(1);
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [newSlotDuration, setNewSlotDuration] = useState(30);
  const [formError, setFormError] = useState('');

  const load = async () => {
    if (!profileId) return;
    try {
      const data = await getDoctorSchedule(profileId);
      setSchedule(data);
    } catch {
      setError(t('schedule.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [profileId]);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (newStart >= newEnd) {
      setFormError(t('schedule.endAfterStart'));
      return;
    }

    // Check overlap
    const hasOverlap = schedule.some(
      (entry) =>
        entry.dayOfWeek === newDay &&
        entry.isActive &&
        !(newEnd <= entry.startTime || newStart >= entry.endTime)
    );

    if (hasOverlap) {
      setFormError(t('schedule.overlap'));
      return;
    }

    // Add locally (will be saved when user clicks Save)
    const newEntry: ScheduleEntry = {
      id: `new-${Date.now()}`,
      doctorId: profileId ?? '',
      dayOfWeek: newDay,
      startTime: newStart,
      endTime: newEnd,
      slotDurationMinutes: newSlotDuration,
      isActive: true,
    };
    setSchedule((prev) => [...prev, newEntry]);
  };

  const handleRemove = (entryId: string) => {
    setSchedule((prev) => prev.filter((e) => e.id !== entryId));
  };

  const handleSave = async () => {
    if (!profileId) return;
    setSaving(true);
    setError('');
    setSuccessMsg('');

    const createEntries: CreateScheduleEntry[] = schedule
      .filter((e) => e.isActive)
      .map((e) => ({
        dayOfWeek: e.dayOfWeek,
        startTime: e.startTime,
        endTime: e.endTime,
        slotDurationMinutes: e.slotDurationMinutes,
      }));

    try {
      const updated = await updateDoctorSchedule(profileId, createEntries);
      setSchedule(updated);
      setSuccessMsg(t('schedule.savedSuccess'));
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosError.response?.data?.error?.message ?? t('schedule.failedSave'));
    } finally {
      setSaving(false);
    }
  };

  const activeSchedule = schedule.filter((e) => e.isActive);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">{t('schedule.loading')}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('schedule.title')}</h1>
        <p className="text-slate-500 mt-1">{t('schedule.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{successMsg}</div>
      )}

      {/* Add entry form */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-slate-900">{t('schedule.addEntry')}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleAdd} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="label">{t('schedule.day')}</label>
                <select
                  className="input-field"
                  value={newDay}
                  onChange={(e) => setNewDay(parseInt(e.target.value) as DayOfWeek)}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{DAY_KEYS[d]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t('schedule.startTime')}</label>
                <input
                  type="time"
                  className="input-field"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">{t('schedule.endTime')}</label>
                <input
                  type="time"
                  className="input-field"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">{t('schedule.slotMin')}</label>
                <select
                  className="input-field"
                  value={newSlotDuration}
                  onChange={(e) => setNewSlotDuration(parseInt(e.target.value))}
                >
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={60}>60</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-secondary">
                {t('schedule.addToSchedule')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Schedule grid by day */}
      <div className="space-y-4">
        {DAYS.map((day) => {
          const dayEntries = activeSchedule
            .filter((e) => e.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day} className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-medium text-slate-800">{DAY_KEYS[day]}</h3>
                <span className="text-xs text-slate-400">
                  {dayEntries.length} {dayEntries.length !== 1 ? t('schedule.minSlots') : t('schedule.slotMin')}
                </span>
              </div>

              {dayEntries.length === 0 ? (
                <div className="card-body py-3">
                  <p className="text-slate-400 text-sm">{t('schedule.noEntries')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="px-6 py-3 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium text-slate-800">
                          {entry.startTime} – {entry.endTime}
                        </span>
                        <span className="ml-3 text-slate-500">{entry.slotDurationMinutes} {t('schedule.minSlots')}</span>
                        <span className="ml-2 text-slate-400 text-xs">
                          (~{(() => {
                            const [sh, sm] = entry.startTime.split(':').map(Number);
                            const [eh, em] = entry.endTime.split(':').map(Number);
                            const totalMin = (eh * 60 + em) - (sh * 60 + sm);
                            return Math.floor(totalMin / entry.slotDurationMinutes);
                          })()} {t('schedule.appointments')})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                        onClick={() => handleRemove(entry.id)}
                      >
                        {t('schedule.remove')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="flex justify-end gap-3 pb-8">
        <button className="btn-secondary" onClick={load} disabled={saving}>
          {t('schedule.reset')}
        </button>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? t('schedule.saving') : t('schedule.save')}
        </button>
      </div>
    </div>
  );
}
