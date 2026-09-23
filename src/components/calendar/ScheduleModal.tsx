'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, Calendar, Clock, Repeat, Check, Bus } from 'lucide-react';
import { toLocalDateStr, todayLocalStr } from '../../utils/dateUtils';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

const DAYS = [
  { id: 1, labelKa: 'ორშ', labelEn: 'Mon', fullKa: 'ორშაბათს', fullEn: 'Monday' },
  { id: 2, labelKa: 'სამ', labelEn: 'Tue', fullKa: 'სამშაბათს', fullEn: 'Tuesday' },
  { id: 3, labelKa: 'ოთხ', labelEn: 'Wed', fullKa: 'ოთხშაბათს', fullEn: 'Wednesday' },
  { id: 4, labelKa: 'ხუთ', labelEn: 'Thu', fullKa: 'ხუთშაბათს', fullEn: 'Thursday' },
  { id: 5, labelKa: 'პარ', labelEn: 'Fri', fullKa: 'პარასკევს', fullEn: 'Friday' },
  { id: 6, labelKa: 'შაბ', labelEn: 'Sat', fullKa: 'შაბათს', fullEn: 'Saturday' },
  { id: 0, labelKa: 'კვი', labelEn: 'Sun', fullKa: 'კვირას', fullEn: 'Sunday' }
];

// Helper to compute lobby time from show time minus travel minutes
const calculateLobbyTime = (timeStr: string, travelMinutes: number = 45): string => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const totalMinutes = h * 60 + m - travelMinutes;
  const normalized = (totalMinutes + 1440) % 1440;
  const newH = Math.floor(normalized / 60);
  const newM = normalized % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  defaultDate
}) => {
  const { groups, venues, addShowEvent, validateConflict } = useApp();
  const { t, language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';

  // Today's date string (YYYY-MM-DD) used as the min selectable date
  const todayStr = todayLocalStr();

  const [groupId, setGroupId] = useState<string>(groups[0]?.id || '');
  const [hotelId, setHotelId] = useState<string>(venues[0]?.id || '');
  const [startDate, setStartDate] = useState<string>(
    defaultDate && defaultDate >= todayStr ? defaultDate : todayStr
  );
  const [startTime, setStartTime] = useState<string>('19:00');
  const [endTime, setEndTime] = useState<string>('22:00');
  const [lobbyTime, setLobbyTime] = useState<string>('18:15');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-calculate lobby time when hotel or start time changes
  useEffect(() => {
    if (startTime) {
      const v = venues.find((x) => x.id === hotelId);
      const travel = v?.travelTimeMinutes ?? 45;
      setLobbyTime(calculateLobbyTime(startTime, travel));
    }
  }, [hotelId, startTime, venues]);

  // Initialize defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      if (groups.length > 0 && !groupId) setGroupId(groups[0].id);
      if (venues.length > 0 && !hotelId) setHotelId(venues[0].id);
      // Never pre-fill a past date
      const today = todayLocalStr();
      const initDate = defaultDate && defaultDate >= today ? defaultDate : today;
      setStartDate(initDate);

      // Default end date = 4 weeks from start date
      const endD = new Date(initDate + 'T00:00:00');
      endD.setDate(endD.getDate() + 28);
      setEndDate(endD.toISOString().split('T')[0]);

      // Default selected day = day of week of start date
      const startDayOfWeek = new Date(initDate + 'T00:00:00').getDay();
      setSelectedDays([startDayOfWeek]);

      setIsRecurring(false);
      setSubmitError(null);
    }
  }, [isOpen, groups, venues, defaultDate]);

  // When startDate changes, adjust endDate if it's before startDate
  useEffect(() => {
    if (startDate) {
      const startD = new Date(startDate + 'T00:00:00');
      const startDay = startD.getDay();
      if (selectedDays.length === 0) {
        setSelectedDays([startDay]);
      }
      if (!endDate || endDate < startDate) {
        const endD = new Date(startDate + 'T00:00:00');
        endD.setDate(endD.getDate() + 28);
        setEndDate(toLocalDateStr(endD));
      }
    }
  }, [startDate]);

  // Toggle day selection
  const handleToggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  // Compute all show occurrence dates based on selected days and end date
  const occurrences = useMemo(() => {
    if (!startDate) return [];
    if (!isRecurring) {
      return [startDate];
    }
    if (selectedDays.length === 0 || !endDate || endDate < startDate) {
      return [startDate];
    }

    const dates: string[] = [];
    const current = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    let loopSafety = 0;
    while (current <= end && loopSafety < 366) {
      const dayOfWeek = current.getDay();
      if (selectedDays.includes(dayOfWeek)) {
        dates.push(toLocalDateStr(current));
      }
      current.setDate(current.getDate() + 1);
      loopSafety++;
    }

    return dates;
  }, [isRecurring, startDate, endDate, selectedDays]);

  // Dynamic live summary text
  const liveSummaryText = useMemo(() => {
    if (!isRecurring) return null;
    if (selectedDays.length === 0) {
      return t('select_at_least_one_day');
    }

    const dayNames = DAYS.filter((d) => selectedDays.includes(d.id))
      .map((d) => (language === 'ka' ? d.fullKa : d.fullEn))
      .join(language === 'ka' ? ' და ' : ' and ');

    const totalCount = occurrences.length;

    if (language === 'ka') {
      return `განმეორდება ყოველ ${dayNames} • სულ ${totalCount} შოუ`;
    } else {
      return `Repeats every ${dayNames} • Total ${totalCount} shows`;
    }
  }, [isRecurring, selectedDays, occurrences.length, language, t]);

  // Check conflicts across all planned occurrences
  const conflictReport = useMemo(() => {
    if (!groupId || !hotelId || occurrences.length === 0 || !startTime || !endTime) {
      return { blocking: [], warnings: [] };
    }

    const blocking: { date: string; reason: string }[] = [];
    const warnings: { date: string; reason: string }[] = [];

    occurrences.forEach((dateStr) => {
      const start = `${dateStr}T${startTime}:00`;
      const end = `${dateStr}T${endTime}:00`;
      const lobby = lobbyTime ? `${dateStr}T${lobbyTime}:00` : undefined;

      const res = validateConflict({
        groupId,
        hotelId,
        startDateTime: start,
        endDateTime: end,
        lobbyTime,
        lobbyDateTime: lobby
      });

      if (res.hasConflict) {
        res.blockingConflicts.forEach((bc) => {
          blocking.push({ date: dateStr, reason: bc.reason });
        });
        res.warningConflicts.forEach((wc) => {
          warnings.push({ date: dateStr, reason: wc.reason });
        });
      }
    });

    return { blocking, warnings };
  }, [groupId, hotelId, occurrences, startTime, endTime, lobbyTime, validateConflict]);

  const hasBlockingConflict = conflictReport.blocking.length > 0;
  const selectedGroup = groups.find((g) => g.id === groupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !hotelId || occurrences.length === 0) {
      toast.error(isKa ? 'გთხოვთ აირჩიოთ ჯგუფი და ლოკაცია' : 'Please select a group and venue');
      return;
    }

    // Validate that the show start date+time is not in the past
    if (startDate && startTime) {
      const showStart = new Date(`${startDate}T${startTime}:00`);
      if (showStart <= new Date()) {
        const msg = isKa
          ? 'გასულ თარიღსა და დროზე შოუს დაჯავშნა შეუძლებელია'
          : 'Cannot schedule a show in the past';
        setSubmitError(msg);
        toast.error(msg);
        return;
      }
    }

    if (hasBlockingConflict) {
      const msg = t('double_booking_blocked');
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    const recurringGroupId = isRecurring && occurrences.length > 1 ? `rec-${Date.now()}` : undefined;
    const baseTitle = selectedGroup?.name || 'Show';

    // Schedule all occurrences with fair automated duty rotation
    occurrences.forEach((dateStr, index) => {
      const showTitle =
        occurrences.length > 1 && index > 0
          ? `${baseTitle} (${index + 1})`
          : baseTitle;

      addShowEvent(
        {
          title: showTitle,
          groupId,
          hotelId,
          startDateTime: `${dateStr}T${startTime}:00`,
          endDateTime: `${dateStr}T${endTime}:00`,
          lobbyTime: lobbyTime || undefined,
          lobbyDateTime: lobbyTime ? `${dateStr}T${lobbyTime}:00` : undefined,
          status: 'Scheduled',
          recurringGroupId,
          notes
        },
        true
      );
    });

    toast.success(
      isKa
        ? occurrences.length > 1
          ? `შოუს ${occurrences.length} გამოსვლა წარმატებით დაიგეგმა`
          : `შოუ „${baseTitle}“ წარმატებით დაიგეგმა`
        : occurrences.length > 1
        ? `${occurrences.length} shows scheduled successfully`
        : `Show "${baseTitle}" scheduled successfully`
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('schedule_modal_title')}
      subtitle={t('schedule_modal_sub')}
      maxWidth="640px"
      footer={
        <div className="flex items-center justify-between w-full flex-wrap gap-3">
          {/* Status info on left */}
          <div className="text-xs min-h-[20px] flex items-center">
            {hasBlockingConflict ? (
              <span className="flex items-center gap-1.5 text-danger font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                {t('booking_blocked_hint')}
              </span>
            ) : isRecurring && occurrences.length > 0 ? (
              <span className="flex items-center gap-1.5 text-text-secondary font-medium">
                <Calendar className="w-3.5 h-3.5 text-text-primary" />
                {t('total_shows_preview', { count: occurrences.length })}
              </span>
            ) : null}
          </div>

          {/* Action buttons on right */}
          <div className="flex gap-2.5 items-center">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              form="schedule-form"
              disabled={hasBlockingConflict || occurrences.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-pill text-sm font-medium bg-brand-primary text-text-inverse shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              title={hasBlockingConflict ? t('booking_blocked_hint') : undefined}
            >
              {t('btn_book_show')}
            </button>
          </div>
        </div>
      }
    >
      <form id="schedule-form" onSubmit={handleSubmit} className="overflow-x-hidden flex flex-col gap-3.5">
        {/* Group & Venue in one 2-column row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-text-secondary">{t('performing_group')} *</label>
            <select
              className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.memberTalentIds.length} {t('members')})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-text-secondary">{t('hotel_venue')} *</label>
            <select
              className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
              required
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.city}{v.travelTimeMinutes ? ` • ${v.travelTimeMinutes} ${t('minutes_short')}` : ''})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date and Gathering Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-text-secondary" strokeWidth={2} />
              <span>{t('show_date')} *</span>
            </label>
            <input
              type="date"
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              value={startDate}
              min={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 shrink-0 text-text-secondary" strokeWidth={2} />
              <span>{t('lobby_gathering_time')}</span>
            </label>
            <input
              type="time"
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              value={lobbyTime}
              onChange={(e) => setLobbyTime(e.target.value)}
              title={t('lobby_gathering_time')}
            />
          </div>
        </div>

        {/* Show Start & End Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0 text-text-secondary" strokeWidth={2} />
              <span>{t('start_time')} *</span>
            </label>
            <input
              type="time"
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0 text-text-secondary" strokeWidth={2} />
              <span>{t('end_time')} *</span>
            </label>
            <input
              type="time"
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Recurrence Schedule Builder Container */}
        <div className="p-4 rounded-md bg-surface-secondary border border-border-subtle transition-all duration-150">
          {/* iOS-Style Toggle Switch Header */}
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setIsRecurring((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <Repeat
                className={`w-4 h-4 ${isRecurring ? 'text-text-primary' : 'text-text-secondary'}`}
                strokeWidth={isRecurring ? 2.2 : 2}
              />
              <span
                className={`text-sm font-semibold ${
                  isRecurring ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {t('recurring_show')}
              </span>
            </div>

            {/* iOS Toggle Switch */}
            <div
              className={`w-11 h-6 rounded-pill relative transition-colors duration-200 ${
                isRecurring ? 'bg-brand-navy' : 'bg-border-medium'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] shadow-sm transition-all duration-200 ${
                  isRecurring ? 'left-[23px]' : 'left-[3px]'
                }`}
              />
            </div>
          </div>

          {/* Recurrence Options Panel */}
          {isRecurring && (
            <div className="mt-4 pt-3.5 border-t border-border-subtle flex flex-col gap-3.5">
              {/* Day Picker */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t('days_of_week')}
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((d) => {
                    const isSelected = selectedDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleToggleDay(d.id)}
                        className={`flex-1 min-w-[40px] py-2 px-1.5 rounded-pill text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 transition-all duration-150 outline-none ${
                          isSelected
                            ? 'border border-brand-navy bg-brand-navy text-text-inverse'
                            : 'border border-border-subtle bg-surface text-text-secondary hover:border-border-medium'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                        <span>{language === 'ka' ? d.labelKa : d.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recurrence End Date & Quick Presets */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                  <span>{t('repeat_until')}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2.5 items-center">
                  <input
                    type="date"
                    required={isRecurring}
                    min={startDate}
                    className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface text-text-primary outline-none transition-all duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {/* Quick Preset Buttons */}
                  <div className="flex gap-1.5">
                    {[
                      { label: language === 'ka' ? '2 კვ' : '2 wks', weeks: 2 },
                      { label: language === 'ka' ? '4 კვ' : '4 wks', weeks: 4 },
                      { label: language === 'ka' ? '8 კვ' : '8 wks', weeks: 8 }
                    ].map((preset) => (
                      <button
                        key={preset.weeks}
                        type="button"
                        onClick={() => {
                          const base = new Date((startDate || todayLocalStr()) + 'T00:00:00');
                          base.setDate(base.getDate() + preset.weeks * 7);
                          setEndDate(toLocalDateStr(base));
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-pill border border-border-subtle bg-surface text-text-secondary hover:bg-surface-tertiary hover:text-text-primary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
                      >
                        +{preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {liveSummaryText && (
                <div className="p-2.5 sm:p-3 rounded-md bg-tag-male-bg border border-tag-male-text/20 text-tag-male-text text-xs font-medium leading-relaxed flex items-center gap-2">
                  <Repeat className="w-3.5 h-3.5 shrink-0 text-brand-primary" />
                  <span>{liveSummaryText}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Show Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">{t('show_notes')}</label>
          <textarea
            rows={2}
            className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 resize-none placeholder:text-text-tertiary"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="VIP attendance, technical requirements, sound check timing..."
          />
        </div>

        {/* Compact & Refined Conflict Alert Card */}
        {hasBlockingConflict && (
          <div className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-md bg-danger-light border border-danger-border text-danger text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-danger mb-0.5">
                {t('conflict_compact_title')}
              </div>
              <div className="text-danger/90">
                {conflictReport.blocking.length === 1 ? (
                  <span>
                    {language === 'ka'
                      ? `ჯგუფი "${selectedGroup?.name || ''}" უკვე დაკავებულია ${conflictReport.blocking[0].date}-ს (${startTime} - ${endTime}).`
                      : `Group "${selectedGroup?.name || ''}" is already booked on ${conflictReport.blocking[0].date} (${startTime} - ${endTime}).`}
                  </span>
                ) : (
                  <span>
                    {language === 'ka'
                      ? `${conflictReport.blocking.length} თარიღზე აღმოჩენილია ორმაგი ჯავშნის კონფლიქტი (მაგ. ${conflictReport.blocking[0].date}).`
                      : `Double-booking conflict detected across ${conflictReport.blocking.length} dates (e.g. ${conflictReport.blocking[0].date}).`}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning Conflicts */}
        {conflictReport.warnings.length > 0 && !hasBlockingConflict && (
          <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-md bg-status-rest-bg border border-status-rest-dot/30 text-status-rest-text text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-status-rest-dot shrink-0 mt-0.5" />
            <div>{conflictReport.warnings[0].reason}</div>
          </div>
        )}

        {submitError && (
          <div className="p-2.5 rounded-sm bg-danger-light border border-danger-border text-danger text-xs">
            {submitError}
          </div>
        )}
      </form>
    </Modal>
  );
};
