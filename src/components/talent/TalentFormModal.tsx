import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Talent, Gender, TalentStatus, TalentDocument } from '../../types/talent';
import { Modal } from '../common/Modal';
import { PhoneInput } from '../common/PhoneInput';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { Plus, Trash2, FileText, ChevronDown, Check, X, UploadCloud, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { extractContractExpiryDate } from '../../utils/contractParser';

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
  const [heightCm, setHeightCm] = useState(170);
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
  // One hidden file input ref per doc – keyed by doc id
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<FormDocItem[]>([]);

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
      setWeightKg(editingTalent.weightKg ?? 60);
      setStatus(editingTalent.status);
      setPrimarySkill(editingTalent.primarySkill);
      setNotes(editingTalent.notes || '');
      setDocuments(
        editingTalent.documents?.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          expiryDate: d.expiryDate || ''
        })) || []
      );
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setGender('Female');
      setHeightCm(170);
      setWeightKg(60);
      setStatus('Active'); // Defaults strictly to Active for new performers
      setPrimarySkill('');
      setNotes('');
      setDocuments([]); // Initially empty - user adds fields dynamically with button
    }
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
    const usedTypes = new Set(documents.map((d) => d.type));
    const allDocTypes: TalentDocument['type'][] = ['Passport', 'Visa', 'ID Card', 'Medical', 'Contract', 'Other'];
    const nextType = allDocTypes.find((t) => !usedTypes.has(t)) || 'Other';
    setDocuments((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: '',
        type: nextType,
        file: null,
        expiryDate: '',
        isParsing: false,
        parseDetected: null
      }
    ]);
  };

  const handleDocChange = async (id: string, field: 'name' | 'type' | 'expiryDate', value: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        if (field === 'type') {
          const nextType = value as TalentDocument['type'];
          return {
            ...d,
            type: nextType,
            expiryDate: nextType === 'Contract' ? d.expiryDate : '',
            parseDetected: nextType === 'Contract' ? d.parseDetected : null
          };
        }
        return { ...d, [field]: value };
      })
    );

    if (field === 'type' && value === 'Contract') {
      const doc = documents.find((d) => d.id === id);
      if (doc?.file && !doc.expiryDate) {
        setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, isParsing: true, parseDetected: null } : d)));
        try {
          const result = await extractContractExpiryDate(doc.file);
          setDocuments((prev) =>
            prev.map((d) => {
              if (d.id !== id) return d;
              return {
                ...d,
                expiryDate: result.date || d.expiryDate || '',
                isParsing: false,
                parseDetected: !!result.date
              };
            })
          );
          if (result.date) {
            toast.success(
              language === 'ka'
                ? `კონტრაქტის ვადა ავტომატურად ამოიცნო: ${result.date}`
                : `Contract expiry date auto-detected: ${result.date}`
            );
          }
        } catch {
          setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, isParsing: false, parseDetected: false } : d)));
        }
      }
    }
  };

  const handleDocFileChange = async (id: string, file: File) => {
    const autoName = file.name.replace(/\.[^/.]+$/, '');
    const doc = documents.find((d) => d.id === id);
    const isContract = doc?.type === 'Contract';

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        return {
          ...d,
          file,
          name: autoName || file.name,
          isParsing: isContract,
          parseDetected: null
        };
      })
    );

    if (isContract) {
      try {
        const result = await extractContractExpiryDate(file);
        setDocuments((prev) =>
          prev.map((d) => {
            if (d.id !== id) return d;
            return {
              ...d,
              expiryDate: result.date || d.expiryDate || '',
              isParsing: false,
              parseDetected: !!result.date
            };
          })
        );
        if (result.date) {
          toast.success(
            language === 'ka'
              ? `კონტრაქტის ვადა ავტომატურად ამოიცნო: ${result.date}`
              : `Contract expiry date auto-detected: ${result.date}`
          );
        } else {
          setDocuments((prev) =>
            prev.map((d) => (d.id === id ? { ...d, parseDetected: false } : d))
          );
        }
      } catch {
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isParsing: false, parseDetected: false } : d))
        );
      }
    }
  };

  const handleRemoveDoc = (id: string, name?: string) => {
    const doc = documents.find((d) => d.id === id);
    const docName = name?.trim() || doc?.name?.trim() || (isKa ? 'დოკუმენტი' : 'Document');
    confirm({
      title: isKa ? 'დოკუმენტის წაშლა' : 'Delete Document',
      message: isKa
        ? `დარწმუნებული ხართ, რომ გსურთ დოკუმენტის „${docName}“ წაშლა?`
        : `Are you sure you want to delete the document "${docName}"?`,
      itemName: docName,
      confirmLabel: isKa ? 'წაშლა' : 'Delete',
      cancelLabel: isKa ? 'გაუქმება' : 'Cancel',
      variant: 'danger',
      icon: 'trash',
      onConfirm: () => {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !primarySkill.trim()) {
      toast.error(isKa ? 'გთხოვთ შეავსოთ სავალდებულო ველები' : 'Please fill all required fields');
      return;
    }

    // Filter valid documents
    const validDocs = documents
      .filter((d) => d.name.trim() !== '')
      .map((d) => ({
        id: d.id,
        name: d.name.trim(),
        type: d.type,
        fileSize: '1.8 MB',
        expiryDate: d.type === 'Contract' && d.expiryDate?.trim() ? d.expiryDate.trim() : undefined,
        uploadedAt: new Date().toISOString()
      }));

    // Validate uniqueness of document types per performer
    const docTypesList = validDocs.map((d) => d.type);
    if (new Set(docTypesList).size !== docTypesList.length) {
      toast.error(
        isKa
          ? 'თითოეული ტიპის დოკუმენტი (პასპორტი, ვიზა და ა.შ.) შეიძლება დაემატოს მხოლოდ ერთხელ!'
          : 'Each document type can only be added once per performer!'
      );
      return;
    }

    if (editingTalent) {
      updateTalent(editingTalent.id, {
        firstName,
        lastName,
        email,
        phone,
        gender,
        heightCm: Number(heightCm),
        weightKg: weightKg === '' ? undefined : Number(weightKg),
        status,
        primarySkill,
        notes,
        documents: validDocs
      });
      toast.success(
        isKa
          ? `თანამშრომლის „${firstName} ${lastName}“ მონაცემები განახლდა`
          : `Performer "${firstName} ${lastName}" updated successfully`
      );
    } else {
      addTalent({
        firstName,
        lastName,
        email,
        phone,
        gender,
        heightCm: Number(heightCm),
        weightKg: weightKg === '' ? undefined : Number(weightKg),
        status: 'Active', // Strictly default to Active on creation
        primarySkill,
        notes,
        documents: validDocs,
        avatarUrl: `https://images.unsplash.com/photo-${
          gender === 'Female' ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'
        }?w=400&auto=format&fit=crop&q=80`
      });
      toast.success(
        isKa
          ? `თანამშრომელი „${firstName} ${lastName}“ წარმატებით დაემატა`
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
      maxWidth="640px"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {t('cancel')}
          </button>
          <button type="submit" form="talent-form" className="btn btn-primary">
            {editingTalent ? t('save_changes') : t('add_performer')}
          </button>
        </>
      }
    >
      <form id="talent-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">{t('first_name')} *</label>
            <input
              type="text"
              required
              className="form-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Amélie"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('last_name')} *</label>
            <input
              type="text"
              required
              className="form-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Laurent"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">{t('email_address')}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amelie@artistent.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('phone_number')}</label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
            />
          </div>
        </div>

        {/* Gender, Height, Weight */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}
        >
          <div className="form-group">
            <label className="form-label">{t('gender')} *</label>
            <select
              className="form-select"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="Female">{t('gender_female')}</option>
              <option value="Male">{t('gender_male')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('height_cm')} *</label>
            <input
              type="number"
              required
              min={120}
              max={230}
              className="form-input"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('weight_kg')}</label>
            <input
              type="number"
              min={30}
              max={200}
              className="form-input"
              placeholder="e.g. 58"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        </div>

        {/* Primary Role / Specialization Dropdown (Clean, Searchable & Creatable) */}
        <div className="form-group" ref={specDropdownRef} style={{ position: 'relative' }}>
          <label className="form-label">{t('primary_role_spec')} *</label>
          
          {/* Main Dropdown Input with Chevron */}
          <div
            style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
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
              className="form-input"
              value={primarySkill}
              readOnly={!isSpecDropdownOpen}
              onChange={(e) => {
                setPrimarySkill(e.target.value);
                setIsFiltering(true);
              }}
              onFocus={() => {
                setIsSpecDropdownOpen(true);
              }}
              placeholder={t('select_specialization')}
              style={{
                width: '100%',
                paddingRight: '36px',
                background: isSpecDropdownOpen ? 'var(--bg-surface)' : 'var(--bg-surface-secondary)',
                borderColor: isSpecDropdownOpen ? 'var(--brand-primary)' : 'var(--border-subtle)',
                boxShadow: isSpecDropdownOpen ? '0 0 0 3px var(--brand-primary-light)' : 'none',
                cursor: 'pointer'
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '12px',
                pointerEvents: 'none',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronDown
                size={16}
                style={{
                  transform: isSpecDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform var(--transition-fast)'
                }}
              />
            </div>
          </div>

          {/* Dropdown Menu */}
          {isSpecDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                zIndex: 1000,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Options List */}
              <div
                style={{
                  maxHeight: '230px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {filteredSpecializations.length > 0 ? (
                  filteredSpecializations.map((spec) => {
                    const isSelected = spec.toLowerCase() === primarySkill.trim().toLowerCase();
                    return (
                      <div
                        key={spec}
                        onClick={() => handleSelectSpec(spec)}
                        style={{
                          padding: '10px 14px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--brand-primary)' : 'transparent',
                          color: isSelected ? '#FFFFFF' : 'var(--color-text-primary)',
                          fontWeight: isSelected ? 600 : 400,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span>{spec}</span>
                        {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={2.5} />}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      padding: '14px',
                      fontSize: '0.825rem',
                      color: 'var(--color-text-secondary)',
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}
                  >
                    {t('no_performers_match')}
                  </div>
                )}
              </div>

              {/* Dedicated "Add New Specialization" Button / Form inside Dropdown */}
              <div
                style={{
                  padding: '10px 12px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-secondary)'
                }}
              >
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
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: 'var(--color-charcoal)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--brand-primary)';
                      e.currentTarget.style.background = 'var(--brand-primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'var(--bg-surface)';
                    }}
                  >
                    <span>
                      {primarySkill.trim() && !allSpecializations.some((s) => s.toLowerCase() === primarySkill.trim().toLowerCase())
                        ? `${t('add_new_specialty_btn')}: "${primarySkill.trim()}"`
                        : t('add_new_specialty_btn')}
                    </span>
                  </button>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder={t('enter_new_specialty')}
                      className="form-input"
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        flex: 1,
                        background: '#FFFFFF'
                      }}
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
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.785rem' }}
                      disabled={!newCustomSpecInput.trim()}
                    >
                      {t('btn_add')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustomSpec(false)}
                      className="btn btn-secondary btn-icon"
                      style={{ width: '30px', height: '30px' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Documents Section with "+ Add Document" Button */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: documents.length > 0 ? '12px' : '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} color="var(--color-text-secondary)" />
              <label className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>
                {t('docs_and_credentials')} ({documents.length})
              </label>
            </div>

            <button
              type="button"
              onClick={handleAddDocField}
              className="btn btn-secondary"
              style={{ fontSize: '0.785rem', padding: '5px 12px' }}
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>{t('add_document_field')}</span>
            </button>
          </div>

          {documents.length === 0 ? (
            <div
              style={{
                fontSize: '0.785rem',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
                padding: '8px 0 4px 0'
              }}
            >
              {t('no_documents_added')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {documents.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  style={{
                    background: 'var(--bg-surface)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* File Upload area */}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id={`doc-file-${doc.id}`}
                    ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocFileChange(doc.id, file);
                    }}
                  />

                  {!doc.file ? (
                    <div
                      onClick={() => fileInputRefs.current[doc.id]?.click()}
                      style={{
                        border: '2px dashed var(--border-medium)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '14px 12px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--bg-surface-secondary)',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--brand-primary, #FF6C41)';
                        e.currentTarget.style.background = 'rgba(255,108,65,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                        e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                      }}
                    >
                      <UploadCloud size={20} style={{ color: 'var(--brand-primary, #FF6C41)', margin: '0 auto 4px auto' }} />
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                        {language === 'ka' ? `დააკლიკეთ „${doc.type}“-ის ასარჩევად` : `Click to select "${doc.type}" file`}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        PDF, DOC, DOCX, JPG, PNG (მაქს. 10MB)
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', background: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <FileText size={16} style={{ color: 'var(--brand-primary, #FF6C41)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-charcoal)' }}>
                            {doc.file.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{doc.type}</span>
                            <span>•</span>
                            <span>{(doc.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[doc.id]?.click()}
                          style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                        >{language === 'ka' ? 'შეცვლა' : 'Change'}</button>
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
                                setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, file: null } : d));
                                if (fileInputRefs.current[doc.id]) fileInputRefs.current[doc.id]!.value = '';
                              }
                            });
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px', display: 'flex' }}
                          title={isKa ? 'ფაილის წაშლა' : 'Remove File'}
                        ><X size={13} /></button>
                      </div>
                    </div>
                  )}

                  {/* Title + Type + Remove */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder={t('doc_title_placeholder')}
                      className="form-input"
                      style={{ flex: 2, padding: '6px 10px', fontSize: '0.825rem' }}
                      value={doc.name}
                      onChange={(e) => handleDocChange(doc.id, 'name', e.target.value)}
                      required
                    />
                    <select
                      className="form-select"
                      style={{ flex: 1, padding: '6px 10px', fontSize: '0.825rem' }}
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
                      className="btn btn-secondary btn-icon"
                      style={{ width: '30px', height: '30px', color: '#EF4444', flexShrink: 0 }}
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Contract Expiration Date (ONLY when doc.type === 'Contract') */}
                  {doc.type === 'Contract' && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(30, 106, 255, 0.04)',
                        border: '1px solid rgba(30, 106, 255, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--color-charcoal)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} style={{ color: 'var(--brand-primary)' }} />
                          <span>{t('contract_expiry_date')} *</span>
                        </label>
                        {doc.isParsing && (
                          <span style={{ fontSize: '0.685rem', color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Loader2 size={11} className="animate-spin" />
                            <span>{t('analyzing_file')}</span>
                          </span>
                        )}
                        {!doc.isParsing && doc.parseDetected === true && (
                          <span style={{ fontSize: '0.685rem', color: '#16A34A', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={11} />
                            <span>{t('auto_detected_date')} ✓</span>
                          </span>
                        )}
                      </div>

                      <input
                        type="date"
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        value={doc.expiryDate || ''}
                        onChange={(e) => handleDocChange(doc.id, 'expiryDate', e.target.value)}
                        required
                      />

                      <div style={{ fontSize: '0.675rem', color: 'var(--color-text-secondary)' }}>
                        {doc.parseDetected === false ? (
                          <span style={{ color: '#D97706', fontWeight: 500 }}>⚠️ {t('manual_date_hint')}</span>
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

        <div className="form-group">
          <label className="form-label">{t('internal_notes')}</label>
          <textarea
            rows={2}
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Performance style, restrictions, costume sizing notes..."
          />
        </div>
      </form>
    </Modal>
  );
};
