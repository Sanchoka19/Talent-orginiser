'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface CountryInfo {
  code: string;
  name: string;
  nameKa: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'GE', name: 'Georgia', nameKa: 'საქართველო', dialCode: '+995', flag: '🇬🇪', placeholder: '599 12 34 56' },
  { code: 'TR', name: 'Turkey', nameKa: 'თურქეთი', dialCode: '+90', flag: '🇹🇷', placeholder: '532 123 4567' },
  { code: 'UA', name: 'Ukraine', nameKa: 'უკრაინა', dialCode: '+380', flag: '🇺🇦', placeholder: '50 123 4567' },
  { code: 'US', name: 'United States', nameKa: 'აშშ', dialCode: '+1', flag: '🇺🇸', placeholder: '(702) 555-0100' },
  { code: 'GB', name: 'United Kingdom', nameKa: 'გაერთიანებული სამეფო', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: 'FR', name: 'France', nameKa: 'საფრანგეთი', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: 'DE', name: 'Germany', nameKa: 'გერმანია', dialCode: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { code: 'ES', name: 'Spain', nameKa: 'ესპანეთი', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { code: 'IT', name: 'Italy', nameKa: 'იტალია', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { code: 'BR', name: 'Brazil', nameKa: 'ბრაზილია', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234-5678' },
  { code: 'CO', name: 'Colombia', nameKa: 'კოლუმბია', dialCode: '+57', flag: '🇨🇴', placeholder: '300 1234567' },
  { code: 'AR', name: 'Argentina', nameKa: 'არგენტინა', dialCode: '+54', flag: '🇦🇷', placeholder: '9 11 1234-5678' },
  { code: 'MX', name: 'Mexico', nameKa: 'მექსიკა', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { code: 'CA', name: 'Canada', nameKa: 'კანადა', dialCode: '+1', flag: '🇨🇦', placeholder: '(416) 555-0199' },
  { code: 'KZ', name: 'Kazakhstan', nameKa: 'ყაზახეთი', dialCode: '+7', flag: '🇰🇿', placeholder: '701 123 4567' },
  { code: 'UZ', name: 'Uzbekistan', nameKa: 'უზბეკეთი', dialCode: '+998', flag: '🇺🇿', placeholder: '90 123 45 67' },
  { code: 'AM', name: 'Armenia', nameKa: 'სომხეთი', dialCode: '+374', flag: '🇦🇲', placeholder: '91 123456' },
  { code: 'AZ', name: 'Azerbaijan', nameKa: 'აზერბაიჯანი', dialCode: '+994', flag: '🇦🇿', placeholder: '50 123 45 67' },
  { code: 'PL', name: 'Poland', nameKa: 'პოლონეთი', dialCode: '+48', flag: '🇵🇱', placeholder: '512 345 678' },
  { code: 'RO', name: 'Romania', nameKa: 'რუმინეთი', dialCode: '+40', flag: '🇷🇴', placeholder: '712 345 678' },
  { code: 'BG', name: 'Bulgaria', nameKa: 'ბულგარეთი', dialCode: '+359', flag: '🇧🇬', placeholder: '87 123 4567' },
  { code: 'HU', name: 'Hungary', nameKa: 'უნგრეთი', dialCode: '+36', flag: '🇭🇺', placeholder: '20 123 4567' },
  { code: 'CZ', name: 'Czech Republic', nameKa: 'ჩეხეთი', dialCode: '+420', flag: '🇨🇿', placeholder: '601 123 456' },
  { code: 'GR', name: 'Greece', nameKa: 'საბერძნეთი', dialCode: '+30', flag: '🇬🇷', placeholder: '691 234 5678' },
  { code: 'CY', name: 'Cyprus', nameKa: 'კვიპროსი', dialCode: '+357', flag: '🇨🇾', placeholder: '96 123456' },
  { code: 'AE', name: 'United Arab Emirates', nameKa: 'არაბთა გაერთიანებული საამიროები', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: 'EG', name: 'Egypt', nameKa: 'ეგვიპტე', dialCode: '+20', flag: '🇪🇬', placeholder: '10 1234 5678' },
  { code: 'CN', name: 'China', nameKa: 'ჩინეთი', dialCode: '+86', flag: '🇨🇳', placeholder: '138 0013 8000' },
  { code: 'JP', name: 'Japan', nameKa: 'იაპონია', dialCode: '+81', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { code: 'KR', name: 'South Korea', nameKa: 'სამხრეთ კორეა', dialCode: '+82', flag: '🇰🇷', placeholder: '10 1234 5678' },
  { code: 'IN', name: 'India', nameKa: 'ინდოეთი', dialCode: '+91', flag: '🇮🇳', placeholder: '98123 45678' },
  { code: 'IL', name: 'Israel', nameKa: 'ისრაელი', dialCode: '+972', flag: '🇮🇱', placeholder: '50 123 4567' },
  { code: 'MA', name: 'Morocco', nameKa: 'მაროკო', dialCode: '+212', flag: '🇲🇦', placeholder: '612 345 678' },
  { code: 'ZA', name: 'South Africa', nameKa: 'სამხრეთ აფრიკა', dialCode: '+27', flag: '🇿🇦', placeholder: '82 123 4567' },
  { code: 'AU', name: 'Australia', nameKa: 'ავსტრალია', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { code: 'NL', name: 'Netherlands', nameKa: 'ნიდერლანდები', dialCode: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  { code: 'BE', name: 'Belgium', nameKa: 'ბელგია', dialCode: '+32', flag: '🇧🇪', placeholder: '470 12 34 56' },
  { code: 'CH', name: 'Switzerland', nameKa: 'შვეიცარია', dialCode: '+41', flag: '🇨🇭', placeholder: '78 123 45 67' },
  { code: 'AT', name: 'Austria', nameKa: 'ავსტრია', dialCode: '+43', flag: '🇦🇹', placeholder: '664 1234567' },
  { code: 'PT', name: 'Portugal', nameKa: 'პორტუგალია', dialCode: '+351', flag: '🇵🇹', placeholder: '912 345 678' },
  { code: 'SE', name: 'Sweden', nameKa: 'შვედეთი', dialCode: '+46', flag: '🇸🇪', placeholder: '70 123 45 67' },
  { code: 'NO', name: 'Norway', nameKa: 'ნორვეგია', dialCode: '+47', flag: '🇳🇴', placeholder: '412 34 567' },
  { code: 'DK', name: 'Denmark', nameKa: 'დანია', dialCode: '+45', flag: '🇩🇰', placeholder: '20 12 34 56' },
  { code: 'FI', name: 'Finland', nameKa: 'ფინეთი', dialCode: '+358', flag: '🇫🇮', placeholder: '40 1234567' },
  { code: 'TH', name: 'Thailand', nameKa: 'ტაილანდი', dialCode: '+66', flag: '🇹🇭', placeholder: '81 234 5678' },
  { code: 'VN', name: 'Vietnam', nameKa: 'ვიეტნამი', dialCode: '+84', flag: '🇻🇳', placeholder: '91 234 56 78' },
  { code: 'PH', name: 'Philippines', nameKa: 'ფილიპინები', dialCode: '+63', flag: '🇵🇭', placeholder: '917 123 4567' },
  { code: 'ID', name: 'Indonesia', nameKa: 'ინდონეზია', dialCode: '+62', flag: '🇮🇩', placeholder: '812 3456 7890' },
  { code: 'CU', name: 'Cuba', nameKa: 'კუბა', dialCode: '+53', flag: '🇨🇺', placeholder: '5 1234567' },
  { code: 'MN', name: 'Mongolia', nameKa: 'მონღოლეთი', dialCode: '+976', flag: '🇲🇳', placeholder: '8812 3456' },
  { code: 'MD', name: 'Moldova', nameKa: 'მოლდოვა', dialCode: '+373', flag: '🇲🇩', placeholder: '69 123456' },
  { code: 'RS', name: 'Serbia', nameKa: 'სერბეთი', dialCode: '+381', flag: '🇷🇸', placeholder: '60 1234567' },
  { code: 'HR', name: 'Croatia', nameKa: 'ხორვატია', dialCode: '+385', flag: '🇭🇷', placeholder: '91 123 4567' }
];

// Helper to detect country from an international phone string
export const getCountryFromPhone = (phone?: string): CountryInfo | undefined => {
  if (!phone) return undefined;
  const clean = phone.trim();
  if (!clean.startsWith('+')) return undefined;
  // Sort descending by dialCode length to match longer codes (+995, +380) before shorter ones (+1, +7)
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  return sorted.find((c) => clean.startsWith(c.dialCode));
};

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  id
}) => {
  const { language } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine selected country from current value, defaulting to Georgia (+995)
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(() => {
    return getCountryFromPhone(value) || COUNTRIES[0]; // Georgia
  });

  const [isFocused, setIsFocused] = useState(false);

  // Extract national part from value
  const nationalNumber = useMemo(() => {
    if (!value) return '';
    const trimmed = value.trim();
    if (trimmed.startsWith(selectedCountry.dialCode)) {
      return trimmed.slice(selectedCountry.dialCode.length).trim();
    }
    return trimmed;
  }, [value, selectedCountry]);

  // Sync if value changes externally
  useEffect(() => {
    const matched = getCountryFromPhone(value);
    if (matched && matched.code !== selectedCountry.code) {
      setSelectedCountry(matched);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameKa.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectCountry = (country: CountryInfo) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    // Combine new country dial code with existing national number
    const updated = nationalNumber ? `${country.dialCode} ${nationalNumber}` : country.dialCode;
    onChange(updated);
    setTimeout(() => phoneInputRef.current?.focus(), 10);
  };

  const handleNationalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    if (!inputVal.trim()) {
      onChange('');
    } else {
      onChange(`${selectedCountry.dialCode} ${inputVal.trimStart()}`);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative flex items-stretch w-full h-[42px] bg-surface rounded-sm transition-all duration-150 border ${
        isFocused
          ? 'border-brand-primary ring-2 ring-brand-primary/10'
          : 'border-border-subtle hover:border-border-medium'
      }`}
    >
      {/* Country Code Trigger Button (Locked Width: 92px) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => {
              const next = !prev;
              if (next) {
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }
              return next;
            });
          }
        }}
        className="inline-flex items-center justify-center gap-1.5 w-[92px] min-w-[92px] shrink-0 border-r border-border-subtle rounded-l-[9px] bg-surface-secondary text-text-primary text-sm font-semibold outline-none px-2 h-full transition-colors cursor-pointer disabled:cursor-not-allowed hover:bg-surface-tertiary"
        title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
      >
        <span className="text-lg leading-none">{selectedCountry.flag}</span>
        <span className="text-xs text-text-primary font-semibold">{selectedCountry.dialCode}</span>
        <ChevronDown
          size={13}
          className={`text-text-secondary transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* National Phone Input (Fluid Width, Never Resizes when Country Changes) */}
      <input
        ref={phoneInputRef}
        id={id}
        type="tel"
        disabled={disabled}
        required={required}
        value={nationalNumber}
        onChange={handleNationalNumberChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || selectedCountry.placeholder}
        className="flex-1 min-w-0 border-none outline-none bg-transparent px-3 h-full text-sm text-text-primary placeholder:text-text-tertiary"
      />

      {/* Floating Country Picker Dropdown - Anchored to right with zIndex 2000 */}
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] right-0 w-[300px] max-w-[90vw] max-h-[300px] bg-surface border border-border-subtle rounded-md shadow-xl z-[2000] flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Search Box */}
          <div className="p-2 px-2.5 border-b border-border-subtle bg-surface-secondary flex items-center gap-2">
            <Search size={14} className="text-text-secondary shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ka' ? 'მოძებნეთ ქვეყანა ან კოდი...' : 'Search country or code...'}
              className="w-full border-none bg-transparent outline-none text-xs text-text-primary placeholder:text-text-tertiary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary p-0"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto max-h-[240px] p-1 flex flex-col gap-0.5">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-secondary">
                {language === 'ka' ? 'ქვეყანა ვერ მოიძებნა' : 'No country found'}
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between p-2 px-2.5 rounded-xs border-none text-xs cursor-pointer transition-colors text-left ${
                      isSelected
                        ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                        : 'text-text-primary hover:bg-surface-secondary font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none">{c.flag}</span>
                      <span className="truncate">
                        {language === 'ka' ? c.nameKa : c.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold ml-2 shrink-0 ${
                        isSelected ? 'text-brand-primary' : 'text-text-secondary'
                      }`}
                    >
                      {c.dialCode}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
