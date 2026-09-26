'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { toLocalDateStr, todayLocalStr } from '../../utils/dateUtils';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const MONTH_NAMES = {
  ka: [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
    'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  tr: [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
};

const WEEKDAY_NAMES = {
  ka: ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  tr: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  id
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';
  const langKey = (language === 'ka' || language === 'tr') ? language : 'en';

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const todayStr = useMemo(() => todayLocalStr(), []);

  // Initialize view year & month from current value or today
  const initialDate = useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-indexed

  // When value changes from outside, sync view if popover is closed
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m] = value.split('-').map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const selectedDate = new Date(viewYear, viewMonth, day);
    const dateStr = toLocalDateStr(selectedDate);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(todayStr);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Calendar day calculation (Monday-first)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // In JS: 0 = Sun, 1 = Mon ... 6 = Sat
    // Convert to Monday = 0 ... Sunday = 6
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const days: Array<{
      day: number;
      dateStr: string;
      isDisabled: boolean;
      isCurrentMonth: boolean;
    }> = [];

    // Empty padding slots before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        day: 0,
        dateStr: '',
        isDisabled: true,
        isCurrentMonth: false
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d);
      const dateStr = toLocalDateStr(dateObj);

      let isDisabled = false;
      if (min && dateStr < min) isDisabled = true;
      if (max && dateStr > max) isDisabled = true;

      days.push({
        day: d,
        dateStr,
        isDisabled,
        isCurrentMonth: true
      });
    }

    return days;
  }, [viewYear, viewMonth, min, max]);

  // Formatted date string for input display
  const displayDateText = useMemo(() => {
    if (!value) return '';
    try {
      const [y, m, d] = value.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      if (isNaN(dateObj.getTime())) return value;

      const monthName = MONTH_NAMES[langKey][m - 1];
      if (isKa) {
        return `${d} ${monthName}, ${y}`;
      } else {
        return `${monthName} ${d}, ${y}`;
      }
    } catch {
      return value;
    }
  }, [value, langKey, isKa]);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full text-sm px-3.5 py-2.5 rounded-sm border text-left cursor-pointer flex items-center justify-between gap-2 outline-none transition-all duration-150 ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-surface-secondary border-border-subtle text-text-tertiary'
            : isOpen
            ? 'border-brand-primary bg-surface shadow-xs ring-2 ring-brand-primary/10 text-text-primary'
            : 'border-border-subtle bg-surface-secondary text-text-primary hover:border-border-medium hover:bg-surface'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Calendar
            size={15}
            className={`shrink-0 transition-colors ${
              isOpen ? 'text-brand-primary' : 'text-text-tertiary'
            }`}
          />
          <span className={`truncate ${!displayDateText ? 'text-text-tertiary' : 'font-medium'}`}>
            {displayDateText || placeholder || (isKa ? 'აირჩიეთ თარიღი' : 'Select date')}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!required && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-full text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
              title={isKa ? 'გასუფთავება' : 'Clear'}
            >
              <X size={13} />
            </span>
          )}
        </div>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1.5 left-0 p-3.5 rounded-xl bg-surface border border-border-subtle shadow-xl w-[290px] sm:w-[310px] animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-bold text-sm text-text-primary">
              {MONTH_NAMES[langKey][viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                title={isKa ? 'წინა თვე' : 'Previous month'}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                title={isKa ? 'შემდეგი თვე' : 'Next month'}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels (Monday to Sunday) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAY_NAMES[langKey].map((dayName, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold text-text-tertiary uppercase py-0.5"
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return <div key={`empty-${idx}`} className="h-8 w-8" />;
              }

              const isSelected = item.dateStr === value;
              const isToday = item.dateStr === todayStr;

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  disabled={item.isDisabled}
                  onClick={() => !item.isDisabled && handleSelectDay(item.day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                    item.isDisabled
                      ? 'text-text-tertiary/40 cursor-not-allowed bg-transparent'
                      : isSelected
                      ? 'bg-brand-primary text-white font-bold shadow-xs'
                      : isToday
                      ? 'border border-brand-primary/40 text-brand-primary font-semibold hover:bg-brand-primary/10'
                      : 'text-text-primary hover:bg-surface-secondary active:scale-95'
                  }`}
                >
                  <span>{item.day}</span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-brand-primary absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Action: Today Button */}
          <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              disabled={Boolean(min && todayStr < min) || Boolean(max && todayStr > max)}
              className="text-brand-primary font-semibold hover:underline cursor-pointer disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
            >
              {isKa ? 'დღეს' : (language === 'tr' ? 'Bugün' : 'Today')}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary cursor-pointer font-medium"
              >
                {isKa ? 'დახურვა' : 'Close'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
