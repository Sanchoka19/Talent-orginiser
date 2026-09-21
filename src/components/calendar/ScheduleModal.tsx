import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, Calendar, Clock, Repeat, Check, Bus, Sparkles } from 'lucide-react';
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
          {/* Status info on left */}
          <div style={{ fontSize: '0.8rem', minHeight: '20px', display: 'flex', alignItems: 'center' }}>
            {hasBlockingConflict ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontWeight: 500 }}>
                <AlertTriangle size={14} color="#DC2626" />
                {t('booking_blocked_hint')}
              </span>
            ) : isRecurring && occurrences.length > 0 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                <Calendar size={14} color="var(--color-charcoal)" />
                {t('total_shows_preview', { count: occurrences.length })}
              </span>
            ) : null}
          </div>

          {/* Action buttons on right */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('cancel')}
            </button>
            <button
              type="submit"
              form="schedule-form"
              className="btn btn-primary"
              disabled={hasBlockingConflict || occurrences.length === 0}
              style={{
                opacity: hasBlockingConflict || occurrences.length === 0 ? 0.45 : 1,
                cursor: hasBlockingConflict || occurrences.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title={hasBlockingConflict ? t('booking_blocked_hint') : undefined}
            >
              {t('btn_book_show')}
            </button>
          </div>
        </div>
      }
    >
      <form id="schedule-form" onSubmit={handleSubmit} style={{ overflowX: 'hidden' }}>
        {/* Group & Venue in one 2-column row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
            <label className="form-label">{t('performing_group')} *</label>
            <select
              className="form-select"
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

          <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
            <label className="form-label">{t('hotel_venue')} *</label>
            <select
              className="form-select"
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} strokeWidth={2} style={{ flexShrink: 0, color: 'var(--color-text-secondary)' }} />
              <span>{t('show_date')} *</span>
            </label>
            <input
              type="date"
              required
              className="form-input"
              value={startDate}
              min={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bus size={14} strokeWidth={2} style={{ flexShrink: 0, color: 'var(--color-text-secondary)' }} />
              <span>{t('lobby_gathering_time')}</span>
            </label>
            <input
              type="time"
              required
              className="form-input"
              value={lobbyTime}
              onChange={(e) => setLobbyTime(e.target.value)}
              title={t('lobby_gathering_time')}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Show Start & End Time Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} strokeWidth={2} style={{ flexShrink: 0, color: 'var(--color-text-secondary)' }} />
              <span>{t('start_time')} *</span>
            </label>
            <input
              type="time"
              required
              className="form-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0, minWidth: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} strokeWidth={2} style={{ flexShrink: 0, color: 'var(--color-text-secondary)' }} />
              <span>{t('end_time')} *</span>
            </label>
            <input
              type="time"
              required
              className="form-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Recurrence Schedule Builder Container */}
        <div
          style={{
            marginBottom: '16px',
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            transition: 'all var(--transition-fast)'
          }}
        >
          {/* iOS-Style Toggle Switch Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onClick={() => setIsRecurring((prev) => !prev)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Repeat
                size={16}
                color={isRecurring ? 'var(--color-charcoal)' : 'var(--color-text-secondary)'}
                strokeWidth={isRecurring ? 2.2 : 2}
              />
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: isRecurring ? 'var(--color-charcoal)' : 'var(--color-text-primary)'
                }}
              >
                {t('recurring_show')}
              </span>
            </div>

            {/* iOS Toggle Switch */}
            <div
              style={{
                width: '44px',
                height: '24px',
                borderRadius: 'var(--radius-pill)',
                background: isRecurring ? 'var(--color-charcoal)' : 'var(--border-medium)',
                position: 'relative',
                transition: 'background 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  position: 'absolute',
                  top: '3px',
                  left: isRecurring ? '23px' : '3px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
          </div>

          {/* Recurrence Options Panel */}
          {isRecurring && (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              {/* Day Picker */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {t('days_of_week')}
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {DAYS.map((d) => {
                    const isSelected = selectedDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleToggleDay(d.id)}
                        style={{
                          flex: '1 1 0',
                          minWidth: '40px',
                          padding: '8px 6px',
                          borderRadius: 'var(--radius-pill)',
                          border: isSelected
                            ? '1px solid var(--color-charcoal)'
                            : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--color-charcoal)' : 'var(--bg-surface)',
                          color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 600 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                        <span>{language === 'ka' ? d.labelKa : d.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recurrence End Date & Quick Presets */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <Calendar size={13} style={{ color: 'var(--color-text-secondary)' }} />
                  <span>{t('repeat_until')}</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="date"
                    required={isRecurring}
                    min={startDate}
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  {/* Quick Preset Buttons */}
                  <div style={{ display: 'flex', gap: '6px' }}>
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
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                          e.currentTarget.style.color = 'var(--color-charcoal)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-surface)';
                          e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                      >
                        +{preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {liveSummaryText && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: '#EEF3FF',
                    border: '1px solid rgba(30, 106, 255, 0.25)',
                    color: '#1E4DB7',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Repeat size={14} style={{ flexShrink: 0, color: '#1E6AFF' }} />
                  <span>{liveSummaryText}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Show Notes */}
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">{t('show_notes')}</label>
          <textarea
            rows={2}
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="VIP attendance, technical requirements, sound check timing..."
          />
        </div>

        {/* Compact & Refined Conflict Alert Card */}
        {hasBlockingConflict && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.22)',
              color: '#991B1B',
              fontSize: '0.825rem',
              lineHeight: 1.4,
              marginBottom: '10px'
            }}
          >
            <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, color: '#B91C1C', marginBottom: '2px' }}>
                {t('conflict_compact_title')}
              </div>
              <div style={{ color: '#7F1D1D' }}>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '14px',
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              color: '#92400E',
              fontSize: '0.825rem',
              lineHeight: 1.4,
              marginBottom: '10px'
            }}
          >
            <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{conflictReport.warnings[0].reason}</div>
          </div>
        )}

        {submitError && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              background: '#FEE2E2',
              color: '#991B1B',
              fontSize: '0.8rem',
              marginTop: '8px'
            }}
          >
            {submitError}
          </div>
        )}
      </form>
    </Modal>
  );
};
