'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Talent, Gender, TalentStatus, TalentDocument } from '../../types/talent';
import { Modal } from '../common/Modal';
import { PhoneInput } from '../common/PhoneInput';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { Plus, Trash2, FileText, ChevronDown, Check, X, UploadCloud, Calendar, CheckCircle2, Loader2, Camera, User } from 'lucide-react';
import { DatePicker } from '../common/DatePicker';
import { extractContractExpiryDate } from '../../utils/contractParser';
import { getTalentAvatar } from '../../utils/avatarUtils';

interface TalentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTalent?: Talent | null;
}

interface FormDocItem {
  id: string;
  name: string;
  type: 'Passport' | 'Visa' | 'ID Card' | 'Medical' | 'Contract' | 'Other';
  file?: File | null;
  expiryDate?: string;
  isParsing?: boolean;
  parseDetected?: boolean | null;
}

const DEFAULT_SPECIALIZATIONS = [
  'Aerialist & Silk Performer',
  'Acrobatic Base & Porter',
  'Acrobatic Flyer',
  'Contemporary & Jazz Dancer',
  'Ballet Dancer',
  'Commercial Jazz Dancer',
  'Breakdancer & Tumbler',
  'Lead Soul Vocalist',
  'Backing Vocalist',
  'Fire Manipulator & Juggler',
  'Cyr Wheel & Acrobatic Flyer',
  'Contortion & Hand Balance',
  'Rhythmic Gymnast & Hoop Artist',
  'Magician & Illusionist',
  'Stilt Walker & LED Performer',
  'Aerial Straps & Hoop Specialist',
  'Pole Acrobat & Aerialist',
  'Martial Arts & Stunt Performer'
];

export const TalentFormModal: React.FC<TalentFormModalProps> = ({
  isOpen,
  onClose,
  editingTalent
}) => {
  const { talents, addTalent, updateTalent } = useApp();
  const { t, language } = useLanguage();
  const toast = useToast();
  const { confirm } = useConfirm();
  const isKa = language === 'ka';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('Female');
  const [heightCm, setHeightCm] = useState<number | ''>(170);
  const [weightKg, setWeightKg] = useState<number | ''>(60);
  const [status, setStatus] = useState<TalentStatus>('Active');
  const [primarySkill, setPrimarySkill] = useState('');
  const [customSpecializations, setCustomSpecializations] = useState<string[]>([]);
  const [isSpecDropdownOpen, setIsSpecDropdownOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isCreatingCustomSpec, setIsCreatingCustomSpec] = useState(false);
  const [newCustomSpecInput, setNewCustomSpecInput] = useState('');
  const specDropdownRef = useRef<HTMLDivElement>(null);
  const specInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<FormDocItem[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Aggregate all unique specializations: defaults + existing talents' skills + dynamically added
  const allSpecializations = useMemo(() => {
    const set = new Set<string>(DEFAULT_SPECIALIZATIONS);
    talents.forEach((tal) => {
      if (tal.primarySkill) set.add(tal.primarySkill.trim());
    });
    customSpecializations.forEach((s) => set.add(s.trim()));
    return Array.from(set);
  }, [talents, customSpecializations]);

  // Filtered list based on primarySkill input when actively filtering
  const filteredSpecializations = useMemo(() => {
    if (!isFiltering) return allSpecializations;
    const query = primarySkill.trim().toLowerCase();
    if (!query) return allSpecializations;
    return allSpecializations.filter((s) => s.toLowerCase().includes(query));
  }, [allSpecializations, primarySkill, isFiltering]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (specDropdownRef.current && !specDropdownRef.current.contains(e.target as Node)) {
        setIsSpecDropdownOpen(false);
        setIsFiltering(false);
        setIsCreatingCustomSpec(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingTalent) {
      setFirstName(editingTalent.firstName);
      setLastName(editingTalent.lastName);
      setEmail(editingTalent.email);
      setPhone(editingTalent.phone);
      setGender(editingTalent.gender);
      setHeightCm(editingTalent.heightCm);
      setWeightKg(editingTalent.weightKg || '');
      setStatus(editingTalent.status);
      setPrimarySkill(editingTalent.primarySkill);
      setNotes(editingTalent.notes || '');
      setAvatarUrl(editingTalent.avatarUrl || '');
      setDocuments(
        editingTalent.documents.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          file: null,
          expiryDate: d.expiryDate || '',
          parseDetected: null
        }))
      );
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setGender('Female');
      setHeightCm(170);
      setWeightKg(60);
      setStatus('Active');
      setPrimarySkill('');
      setNotes('');
      setAvatarUrl('');
      setDocuments([]);
    }
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = '';
    }
    setIsSpecDropdownOpen(false);
    setIsFiltering(false);
    setIsCreatingCustomSpec(false);
    setNewCustomSpecInput('');
  }, [editingTalent, isOpen]);

  const handleSelectSpec = (spec: string) => {
    setPrimarySkill(spec);
    if (!allSpecializations.includes(spec)) {
      setCustomSpecializations((prev) => [...prev, spec]);
    }
    setIsSpecDropdownOpen(false);
    setIsFiltering(false);
    setIsCreatingCustomSpec(false);
    setNewCustomSpecInput('');
  };

  const handleAddDocField = () => {
    const newId = `doc-${Date.now()}`;
    const usedTypes = new Set(documents.map((d) => d.type));
    const allTypes: FormDocItem['type'][] = ['Passport', 'Visa', 'ID Card', 'Medical', 'Contract', 'Other'];
    const nextType = allTypes.find((t) => !usedTypes.has(t)) || 'Other';
    const defaultName = nextType === 'Passport' ? 'Passport Copy' : nextType === 'Visa' ? 'P-1 / Work Visa' : `${nextType} Document`;

    setDocuments((prev) => [
      ...prev,
      {
        id: newId,
        name: defaultName,
        type: nextType,
        file: null,
        expiryDate: '',
        parseDetected: null
      }
    ]);
  };

  const handleRemoveDoc = (id: string, name: string) => {
    confirm({
      title: isKa ? 'დოკუმენტის წაშლა' : 'Remove Document',
      message: isKa
        ? `დარწმუნებული ხართ, რომ გსურთ დოკუმენტის „${name || 'Untitled'}“ ამოშლა?`
        : `Are you sure you want to remove the document "${name || 'Untitled'}"?`,
      itemName: name,
      confirmLabel: isKa ? 'წაშლა' : 'Delete',
      cancelLabel: isKa ? 'გაუქმება' : 'Cancel',
      variant: 'danger',
      icon: 'trash',
      onConfirm: () => {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    });
  };

  const handleDocChange = (id: string, field: keyof FormDocItem, value: any) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleDocFileChange = async (id: string, file: File) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              file,
              name: d.name === 'Passport Copy' || d.name.endsWith('Document') ? file.name.replace(/\.[^/.]+$/, '') : d.name,
              isParsing: d.type === 'Contract'
            }
          : d
      )
    );

    const doc = documents.find((d) => d.id === id);
    if (doc?.type === 'Contract') {
      try {
        const result = await extractContractExpiryDate(file);
        const detected = result.date;
        setDocuments((prev) =>
          prev.map((d) => {
            if (d.id !== id) return d;
            return {
              ...d,
              isParsing: false,
              parseDetected: Boolean(detected),
              expiryDate: detected || d.expiryDate || ''
            };
          })
        );
        if (detected) {
          toast.success(
            isKa
              ? `კონტრაქტის ვადის გასვლის თარიღი ავტომატურად ამოცნობილია: ${detected}`
              : `Contract expiry date auto-detected: ${detected}`
          );
        } else {
          toast.warning(
            isKa
              ? 'თარიღი ავტომატურად ვერ მოიძებნა. გთხოვთ მიუთითოთ ხელით.'
              : 'Expiry date could not be automatically detected. Please enter manually.'
          );
        }
      } catch {
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isParsing: false, parseDetected: false } : d))
        );
      }
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isKa ? 'გთხოვთ აირჩიოთ სურათის ფორმატის ფაილი (PNG, JPG, WEBP)' : 'Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isKa ? 'ფაილის ზომა არ უნდა აღემატებოდეს 5MB-ს' : 'Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        toast.success(isKa ? 'ავატარი წარმატებით განახლდა' : 'Avatar updated successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !primarySkill.trim()) {
      toast.error(isKa ? 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი' : 'Please fill in all required fields');
      return;
    }

    const payloadDocs: TalentDocument[] = documents.map((d) => ({
      id: d.id,
      name: d.name.trim() || `${d.type} Document`,
      type: d.type,
      url: d.file ? URL.createObjectURL(d.file) : undefined,
      uploadedAt: new Date().toISOString(),
      expiryDate: d.expiryDate || undefined
    }));

    if (editingTalent) {
      updateTalent(editingTalent.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gender,
        heightCm: Number(heightCm) || 170,
        weightKg: weightKg === '' ? undefined : Number(weightKg),
        status,
        primarySkill: primarySkill.trim(),
        notes: notes.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        documents: payloadDocs
      });
      toast.success(
        isKa
          ? `არტისტის „${firstName} ${lastName}“ მონაცემები განახლდა`
          : `Performer "${firstName} ${lastName}" updated successfully`
      );
    } else {
      addTalent({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gender,
        heightCm: Number(heightCm) || 170,
        weightKg: weightKg === '' ? undefined : Number(weightKg),
        status,
        primarySkill: primarySkill.trim(),
        notes: notes.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        documents: payloadDocs
      });
      toast.success(
        isKa
          ? `არტისტი „${firstName} ${lastName}“ წარმატებით დაემატა`
          : `Performer "${firstName} ${lastName}" added successfully`
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTalent ? t('edit_performer') : t('add_new_performer')}
      subtitle={t('performer_form_subtitle')}
      maxWidth="600px"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="talent-form"
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold bg-brand-primary text-white shadow-xs hover:bg-brand-primary-hover transition-all duration-150 cursor-pointer outline-none"
          >
            {editingTalent ? t('save_changes') : t('add_performer')}
          </button>
        </div>
      }
    >
      <form id="talent-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Avatar Upload / Change Section */}
        {(() => {
          const displayAvatar =
            avatarUrl ||
            getTalentAvatar({
              avatarUrl,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              gender
            });

          return (
            <div className="flex items-center gap-4 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50 transition-all duration-200 hover:border-border-medium">
              {/* Avatar circle with hover overlay */}
              <div className="relative group shrink-0">
                <div
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-border-subtle bg-surface shadow-xs cursor-pointer group-hover:border-brand-primary group-hover:shadow-md transition-all duration-200"
                  title={isKa ? 'დააჭირეთ ავატარის ასატვირთად ან შესაცვლელად' : 'Click to upload or change avatar'}
                >
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-tertiary text-text-tertiary">
                      <User size={30} className="text-text-tertiary/60 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                  )}

                  {/* Hover Overlay with Change Icon and Label */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[1px]">
                    <Camera size={20} className="mb-0.5 transform group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-[10px] font-semibold tracking-wide">
                      {avatarUrl || editingTalent ? (isKa ? 'შეცვლა' : 'Change') : (isKa ? 'ატვირთვა' : 'Upload')}
                    </span>
                  </div>
                </div>

                {/* Badge button in corner */}
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-6.5 h-6.5 rounded-full bg-brand-primary text-white border-2 border-surface flex items-center justify-center cursor-pointer shadow-sm hover:bg-brand-primary-hover hover:scale-105 active:scale-95 transition-all duration-150"
                  title={isKa ? 'ავატარის შეცვლა' : 'Change avatar'}
                >
                  <Camera size={12} />
                </button>

                {/* Hidden File Input */}
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>

              {/* Avatar Info & Actions */}
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-text-primary">
                    {isKa ? 'პროფილის ავატარი' : 'Profile Avatar'}
                  </span>
                  {editingTalent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                      {isKa ? 'რედაქტირება' : 'Edit Mode'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {isKa
                    ? 'დააჭირეთ ფოტოს ან გადაატარეთ კურსორი შესაცვლელად (PNG, JPG, WEBP)'
                    : 'Click photo or hover to change profile picture (PNG, JPG, WEBP)'}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary hover:border-brand-primary hover:text-brand-primary transition-all duration-150 cursor-pointer shadow-2xs"
                  >
                    <UploadCloud size={13} />
                    <span>
                      {avatarUrl
                        ? (isKa ? 'ფოტოს შეცვლა' : 'Change Photo')
                        : (isKa ? 'ფოტოს ატვირთვა' : 'Upload Photo')}
                    </span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-status-critical-text hover:bg-status-critical-bg transition-colors duration-150 cursor-pointer"
                      title={isKa ? 'ფოტოს წაშლა' : 'Remove photo'}
                    >
                      <Trash2 size={12} />
                      <span>{isKa ? 'წაშლა' : 'Remove'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Name Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">{t('first_name')} *</label>
            <input
              type="text"
              required
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-md border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 placeholder:text-text-tertiary"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Amélie"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">{t('last_name')} *</label>
            <input
              type="text"
              required
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-md border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 placeholder:text-text-tertiary"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Laurent"
            />
          </div>
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">{t('email_address')}</label>
            <input
              type="email"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-md border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 placeholder:text-text-tertiary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amelie@artistent.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">{t('phone_number')}</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
        </div>

        {/* Gender, Height, Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">{t('gender')} *</label>
            <select
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-md border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 cursor-pointer font-medium"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="Female">{t('gender_female')}</option>
              <option value="Male">{t('gender_male')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">{t('height_cm')} *</label>
            <input
              type="number"
              required
              min={120}
              max={230}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-md border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 placeholder:text-text-tertiary"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => {
                if (heightCm === '' || Number(heightCm) < 120) {
                  setHeightCm(170);
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">{t('weight_kg')}</label>
            <input
              type="number"
              min={30}
              max={200}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-md border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 placeholder:text-text-tertiary"
              placeholder="e.g. 58"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => {
                if (weightKg !== '' && Number(weightKg) < 30) {
                  setWeightKg(30);
                }
              }}
            />
          </div>
        </div>

        {/* Primary Role / Specialization Dropdown */}
        <div className="flex flex-col gap-1.5 relative" ref={specDropdownRef}>
          <label className="text-xs font-semibold text-text-secondary">{t('primary_role_spec')} *</label>

          {/* Main Dropdown Input with Chevron */}
          <div
            className="relative flex items-center cursor-pointer"
            onClick={() => {
              setIsSpecDropdownOpen((prev) => !prev);
              setIsFiltering(false);
              setIsCreatingCustomSpec(false);
            }}
          >
            <input
              ref={specInputRef}
              type="text"
              required
              className="w-full text-xs sm:text-sm px-3 py-2 pr-9 rounded-md border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 cursor-pointer placeholder:text-text-tertiary"
              value={primarySkill}
              readOnly={!isSpecDropdownOpen}
              onChange={(e) => {
                setPrimarySkill(e.target.value);
                setIsFiltering(true);
              }}
              onFocus={() => setIsSpecDropdownOpen(true)}
              placeholder={t('select_specialization')}
            />
            <div className="absolute right-3 pointer-events-none text-text-secondary flex items-center justify-center">
              <ChevronDown
                size={16}
                className={`transition-transform duration-150 ${isSpecDropdownOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>

          {/* Dropdown Menu */}
          {isSpecDropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-surface rounded-md border border-border-medium shadow-modal z-50 overflow-hidden flex flex-col">
              {/* Options List */}
              <div className="max-h-[230px] overflow-y-auto thin-scrollbar flex flex-col">
                {filteredSpecializations.length > 0 ? (
                  filteredSpecializations.map((spec) => {
                    const isSelected = spec.toLowerCase() === primarySkill.trim().toLowerCase();
                    return (
                      <div
                        key={spec}
                        onClick={() => handleSelectSpec(spec)}
                        className={`px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-brand-primary text-white font-semibold'
                            : 'text-text-primary hover:bg-surface-secondary'
                        }`}
                      >
                        <span>{spec}</span>
                        {isSelected && <Check size={14} className="text-white" strokeWidth={2.5} />}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3.5 text-xs text-text-secondary text-center italic">
                    {t('no_performers_match')}
                  </div>
                )}
              </div>

              {/* Add New Specialization Footer */}
              <div className="p-2.5 border-t border-border-subtle bg-surface-secondary">
                {!isCreatingCustomSpec ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const trimmed = primarySkill.trim();
                      if (trimmed && !allSpecializations.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
                        handleSelectSpec(trimmed);
                      } else {
                        setIsCreatingCustomSpec(true);
                        setNewCustomSpecInput(trimmed);
                      }
                    }}
                    className="w-full py-2 px-3.5 bg-surface border border-border-subtle rounded-md text-xs font-semibold text-text-primary hover:border-brand-primary hover:bg-brand-primary-light transition-all duration-150 flex items-center justify-center cursor-pointer"
                  >
                    <span>
                      {primarySkill.trim() && !allSpecializations.some((s) => s.toLowerCase() === primarySkill.trim().toLowerCase())
                        ? `${t('add_new_specialty_btn')}: "${primarySkill.trim()}"`
                        : t('add_new_specialty_btn')}
                    </span>
                  </button>
                ) : (
                  <div
                    className="flex gap-1.5 items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder={t('enter_new_specialty')}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-border-subtle bg-surface text-text-primary outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                      value={newCustomSpecInput}
                      onChange={(e) => setNewCustomSpecInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newCustomSpecInput.trim()) {
                            handleSelectSpec(newCustomSpecInput.trim());
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCustomSpecInput.trim()) {
                          handleSelectSpec(newCustomSpecInput.trim());
                        }
                      }}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-50 transition-colors"
                      disabled={!newCustomSpecInput.trim()}
                    >
                      {t('btn_add')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustomSpec(false)}
                      className="w-7 h-7 p-0 rounded-md inline-flex items-center justify-center border border-border-subtle bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Documents Section */}
        <div className="p-4 rounded-lg bg-surface-secondary border border-border-subtle mb-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <FileText size={15} className="text-text-secondary" />
              <label className="text-xs font-semibold text-text-primary">
                {t('docs_and_credentials')} ({documents.length})
              </label>
            </div>

            <button
              type="button"
              onClick={handleAddDocField}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-md border border-border-subtle bg-surface text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer shadow-xs"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>{t('add_document_field')}</span>
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="text-xs text-text-secondary italic py-2">
              {t('no_documents_added')}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {documents.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  className="bg-surface p-3 rounded-lg border border-border-subtle flex flex-col gap-2.5"
                >
                  {/* File Upload area */}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    id={`doc-file-${doc.id}`}
                    ref={(el) => {
                      fileInputRefs.current[doc.id] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocFileChange(doc.id, file);
                    }}
                  />

                  {!doc.file ? (
                    <div
                      onClick={() => fileInputRefs.current[doc.id]?.click()}
                      className="border-2 border-dashed border-border-medium rounded-md py-3 px-3 text-center cursor-pointer bg-surface-secondary hover:border-brand-primary hover:bg-brand-primary-light/50 transition-all duration-150"
                    >
                      <UploadCloud size={20} className="text-brand-primary mx-auto mb-1" />
                      <div className="text-xs font-semibold text-text-primary">
                        {language === 'ka' ? `დააკლიკეთ „${doc.type}“-ის ასარჩევად` : `Click to select "${doc.type}" file`}
                      </div>
                      <div className="text-[11px] text-text-secondary mt-0.5">
                        PDF, DOC, DOCX, JPG, PNG (მაქს. 10MB)
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 px-2.5 bg-surface-secondary border border-border-medium rounded-md">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-brand-primary shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate text-text-primary">
                            {doc.file.name}
                          </div>
                          <div className="text-[11px] text-text-secondary flex items-center gap-1.5">
                            <span className="font-semibold text-brand-primary">{doc.type}</span>
                            <span>•</span>
                            <span>{(doc.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[doc.id]?.click()}
                          className="bg-transparent border border-border-subtle rounded px-2 py-0.5 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:border-border-medium cursor-pointer"
                        >
                          {language === 'ka' ? 'შეცვლა' : 'Change'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            confirm({
                              title: isKa ? 'ფაილის წაშლა' : 'Remove File',
                              message: isKa
                                ? `დარწმუნებული ხართ, რომ გსურთ ატვირთული ფაილის „${doc.file?.name}“ წაშლა?`
                                : `Are you sure you want to remove the uploaded file "${doc.file?.name}"?`,
                              itemName: doc.file?.name,
                              confirmLabel: isKa ? 'წაშლა' : 'Delete',
                              cancelLabel: isKa ? 'გაუქმება' : 'Cancel',
                              variant: 'danger',
                              icon: 'trash',
                              onConfirm: () => {
                                setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, file: null } : d)));
                                if (fileInputRefs.current[doc.id]) fileInputRefs.current[doc.id]!.value = '';
                              }
                            });
                          }}
                          className="bg-transparent border-none text-rose-600 hover:text-rose-700 cursor-pointer p-0.5 flex"
                          title={isKa ? 'ფაილის წაშლა' : 'Remove File'}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Title + Type + Remove */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={t('doc_title_placeholder')}
                      className="flex-[2] text-xs px-2.5 py-1.5 rounded-md border border-border-subtle bg-surface text-text-primary outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                      value={doc.name}
                      onChange={(e) => handleDocChange(doc.id, 'name', e.target.value)}
                      required
                    />
                    <select
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-border-subtle bg-surface text-text-primary outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 cursor-pointer font-medium"
                      value={doc.type}
                      onChange={(e) => handleDocChange(doc.id, 'type', e.target.value as any)}
                    >
                      {(['Passport', 'Visa', 'ID Card', 'Medical', 'Contract', 'Other'] as const).map((tVal) => {
                        const isTaken = documents.some((other) => other.id !== doc.id && other.type === tVal);
                        return (
                          <option key={tVal} value={tVal} disabled={isTaken}>
                            {tVal} {isTaken ? (language === 'ka' ? '— (არჩეულია)' : '— (Used)') : ''}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id, doc.name)}
                      className="w-7 h-7 p-0 rounded-md inline-flex items-center justify-center border border-border-subtle bg-surface text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all duration-150 cursor-pointer shrink-0"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Contract Expiration Date (ONLY when doc.type === 'Contract') */}
                  {doc.type === 'Contract' && (
                    <div className="mt-2 p-2.5 rounded-md bg-brand-primary-light/40 border border-brand-primary/20 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                          <Calendar size={13} className="text-brand-primary" />
                          <span>{t('contract_expiry_date')} *</span>
                        </label>
                        {doc.isParsing && (
                          <span className="text-[11px] text-brand-primary font-semibold flex items-center gap-1">
                            <Loader2 size={11} className="animate-spin" />
                            <span>{t('analyzing_file')}</span>
                          </span>
                        )}
                        {!doc.isParsing && doc.parseDetected === true && (
                          <span className="text-[11px] text-status-active-text font-semibold flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span>{t('auto_detected_date')}</span>
                          </span>
                        )}
                      </div>

                      <DatePicker
                        value={doc.expiryDate || ''}
                        onChange={(val) => handleDocChange(doc.id, 'expiryDate', val)}
                        required
                      />

                      <div className="text-[11px] text-text-secondary">
                        {doc.parseDetected === false ? (
                          <span className="text-amber-600 font-medium">{t('manual_date_hint')}</span>
                        ) : (
                          <span>{t('contract_expiry_hint')}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">{t('internal_notes')}</label>
          <textarea
            rows={2}
            className="w-full text-xs sm:text-sm px-3 py-2 rounded-md border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 placeholder:text-text-tertiary resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Performance style, restrictions, costume sizing notes..."
          />
        </div>
      </form>
    </Modal>
  );
};
