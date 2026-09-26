'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  extractHoursAndMinutes,
  formatTimeWithFormat,
  parseManualTimeString
} from '../../utils/timeFormat';
import { Clock, ChevronDown } from 'lucide-react';

interface TimePickerInputProps {
  value: string; // 'HH:mm' in 24h format, e.g. '19:00'
  onChange: (time24h: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
  placeholder?: string;
}

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  value,
  onChange,
  required,
  disabled,
  className = '',
  title,
  placeholder
}) => {
  const { timeFormat } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hoursColRef = useRef<HTMLDivElement>(null);
  const minutesColRef = useRef<HTMLDivElement>(null);

  // Compute canonical display value (e.g. "19:00" or "07:00 PM")
  const canonicalDisplay = useMemo(() => {
    if (!value) return '';
    return formatTimeWithFormat(value, timeFormat);
  }, [value, timeFormat]);

  // Local text input state for manual typing
  const [inputText, setInputText] = useState(canonicalDisplay);

  // Sync inputText whenever external canonical value or timeFormat changes
  useEffect(() => {
    setInputText(canonicalDisplay);
  }, [canonicalDisplay]);

  // Close dropdown on click outside and commit typed value
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        commitTypedValue();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, inputText, value, timeFormat]);

  // Smart boundary check to prevent cutting off at bottom of screen/modal
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 200 && rect.top > 200) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  const parsed = useMemo(
    () => extractHoursAndMinutes(value) || { hours: 19, minutes: 0 },
    [value]
  );

  const current12Hour = parsed.hours % 12 || 12;
  const currentPeriod = parsed.hours >= 12 ? 'PM' : 'AM';

  // Hours list: 00..23 for 24h mode; 12, 1..11 for 12h mode
  const hoursList = useMemo(() => {
    if (timeFormat === '12h') {
      return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    return Array.from({ length: 24 }, (_, i) => i);
  }, [timeFormat]);

  // Minutes list: 5-minute step (:00, :05, ..., :55)
  const minutesList = useMemo(() => {
    return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  }, []);

  // Auto-scroll selected elements to center when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (hoursColRef.current) {
          const selectedHourEl = hoursColRef.current.querySelector('[data-selected="true"]');
          if (selectedHourEl) {
            selectedHourEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
        if (minutesColRef.current) {
          const selectedMinuteEl = minutesColRef.current.querySelector('[data-selected="true"]');
          if (selectedMinuteEl) {
            selectedMinuteEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, timeFormat]);

  // Commit manual input
  const commitTypedValue = () => {
    if (!inputText.trim()) {
      if (!required) {
        onChange('');
        setInputText('');
      } else {
        setInputText(canonicalDisplay);
      }
      return;
    }

    const parsedTime = parseManualTimeString(inputText);
    if (parsedTime) {
      const hStr = String(parsedTime.hours).padStart(2, '0');
      const mStr = String(parsedTime.minutes).padStart(2, '0');
      const time24 = `${hStr}:${mStr}`;
      onChange(time24);
      setInputText(formatTimeWithFormat(time24, timeFormat));
    } else {
      // Revert if invalid
      setInputText(canonicalDisplay);
    }
  };

  // Keyboard events on input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTypedValue();
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputText(canonicalDisplay);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Live input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    // If fully valid time is recognized live, update underlying state
    const parsedLive = parseManualTimeString(val);
    if (parsedLive && val.length >= 4) {
      const hStr = String(parsedLive.hours).padStart(2, '0');
      const mStr = String(parsedLive.minutes).padStart(2, '0');
      onChange(`${hStr}:${mStr}`);
    }
  };

  // Fast selection handlers: clicking hour updates hour; clicking minute updates & closes immediately!
  const handleHourSelect = (selectedH: number) => {
    let actual24 = selectedH;
    if (timeFormat === '12h') {
      actual24 = selectedH % 12;
      if (currentPeriod === 'PM') actual24 += 12;
    }
    const hStr = String(actual24).padStart(2, '0');
    const mStr = String(parsed.minutes).padStart(2, '0');
    const newTime = `${hStr}:${mStr}`;
    onChange(newTime);
    setInputText(formatTimeWithFormat(newTime, timeFormat));
  };

  const handleMinuteSelect = (newM: number) => {
    const hStr = String(parsed.hours).padStart(2, '0');
    const mStr = String(newM).padStart(2, '0');
    const newTime = `${hStr}:${mStr}`;
    onChange(newTime);
    setInputText(formatTimeWithFormat(newTime, timeFormat));
    // Fast desktop UX: Instant selection and auto-close!
    setIsOpen(false);
  };

  const handleAmPmToggle = (period: 'AM' | 'PM') => {
    let h = parsed.hours;
    if (period === 'AM' && h >= 12) {
      h -= 12;
    } else if (period === 'PM' && h < 12) {
      h += 12;
    }
    const hStr = String(h).padStart(2, '0');
    const mStr = String(parsed.minutes).padStart(2, '0');
    const newTime = `${hStr}:${mStr}`;
    onChange(newTime);
    setInputText(formatTimeWithFormat(newTime, timeFormat));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Real editable text input for manual typing + clock button */}
      <div
        className={`w-full relative flex items-center rounded-sm border border-border-subtle bg-surface-secondary text-text-primary transition-all duration-150 ${
          isOpen
            ? 'bg-surface border-brand-primary ring-2 ring-brand-primary/10'
            : 'hover:border-border-medium'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          disabled={disabled}
          required={required}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={commitTypedValue}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (timeFormat === '24h' ? '19:00' : '07:00 PM')}
          className="w-full text-sm font-semibold px-3.5 py-2.5 bg-transparent text-text-primary outline-none pr-12 select-text"
          title={title}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            if (disabled) return;
            setIsOpen((prev) => !prev);
            if (!isOpen) {
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2.5 p-1 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer outline-none"
        >
          <Clock size={15} className="text-text-tertiary" />
          <ChevronDown
            size={12}
            className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Clean Single-Border Popover without nested double frames and without separate confirm button */}
      {isOpen && (
        <div
          className={`absolute left-0 z-[1300] w-52 sm:w-56 bg-surface border border-border-subtle rounded-xl shadow-modal p-2 animate-in zoom-in-95 duration-150 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
          onMouseDown={(e) => {
            // Prevent input blur when clicking inside the popover
            e.preventDefault();
          }}
        >
          {/* AM / PM Segmented Control for 12h mode only */}
          {timeFormat === '12h' && (
            <div className="grid grid-cols-2 p-0.5 mb-1.5 bg-surface-secondary rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => handleAmPmToggle('AM')}
                className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                  currentPeriod === 'AM'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                AM (დილა)
              </button>
              <button
                type="button"
                onClick={() => handleAmPmToggle('PM')}
                className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                  currentPeriod === 'PM'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                PM (საღამო)
              </button>
            </div>
          )}

          {/* Clean 2-column scroll list with single divider line (No nested border frame!) */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle">
            {/* Left Column: Hours */}
            <div className="flex flex-col pr-1 min-w-0">
              <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider text-center py-1">
                საათი
              </div>
              <div
                ref={hoursColRef}
                className="h-36 overflow-y-auto pr-0.5 flex flex-col gap-0.5 overscroll-contain scroll-smooth scrollbar-thin"
              >
                {hoursList.map((hVal) => {
                  const isSelected =
                    timeFormat === '12h'
                      ? current12Hour === hVal
                      : parsed.hours === hVal;

                  return (
                    <button
                      key={hVal}
                      type="button"
                      data-selected={isSelected ? 'true' : undefined}
                      onClick={() => handleHourSelect(hVal)}
                      className={`w-full py-1 px-1 rounded-md font-mono text-xs font-semibold text-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-brand-primary text-white font-bold shadow-xs'
                          : 'text-text-primary hover:bg-surface-secondary active:bg-brand-primary/10'
                      }`}
                    >
                      {String(hVal).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Minutes (Clicking minute auto-selects and closes instantly!) */}
            <div className="flex flex-col pl-1 min-w-0">
              <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider text-center py-1">
                წუთი
              </div>
              <div
                ref={minutesColRef}
                className="h-36 overflow-y-auto pl-0.5 flex flex-col gap-0.5 overscroll-contain scroll-smooth scrollbar-thin"
              >
                {minutesList.map((mVal) => {
                  const isSelected = parsed.minutes === mVal;

                  return (
                    <button
                      key={mVal}
                      type="button"
                      data-selected={isSelected ? 'true' : undefined}
                      onClick={() => handleMinuteSelect(mVal)}
                      className={`w-full py-1 px-1 rounded-md font-mono text-xs font-semibold text-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-brand-primary text-white font-bold shadow-xs'
                          : 'text-text-primary hover:bg-surface-secondary active:bg-brand-primary/10'
                      }`}
                    >
                      :{String(mVal).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
