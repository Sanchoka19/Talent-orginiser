'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Group, RotationCycleType } from '../../types/group';
import { Talent } from '../../types/talent';
import {
  InventoryRequirement,
  DutyGenderRequirement,
  TaskRotationCycle,
  DutySlot,
  SpecialDutyTask,
  COMMON_INVENTORY_ITEMS,
  COMMON_SPECIAL_TASKS,
  COMMON_STAGE_POSITIONS
} from '../../types/inventory';
import { Drawer } from '../common/Drawer';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Users,
  User,
  Package,
  Sparkles,
  MapPin,
  Clock,
  Trash2,
  SlidersHorizontal,
  Search
} from 'lucide-react';

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup?: Group | null;
}

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  onClose,
  editingGroup
}) => {
  const { talents, addGroup, updateGroup } = useApp();
  const { t, language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';
  const isTr = language === 'tr';

  const lbl = {
    dutyConfig: isKa ? 'მოვალეობების და როტაციის კონფიგურაცია' : isTr ? 'Görev ve Rotasyon Yapılandırması' : 'Duty & Rotation Configuration',
    dutyConfigDesc: isKa
      ? 'განსაზღვრეთ ინვენტარის ნივთები ან სპეციალური სცენური დავალებები, რომლებიც შოუების დროს როტაციით განაწილდება წევრებზე.'
      : isTr
        ? 'Gösteriler sırasında oyuncular arasında rotasyonla dağıtılacak envanter veya özel sahne görevlerini belirleyin.'
        : 'Specify inventory gear or special stage assignments to be rotated among cast members during shows.',
    addInventory: isKa ? 'ინვენტარის დამატება' : isTr ? 'Envanter Ekle' : 'Add Inventory',
    addSpecialTask: isKa ? 'სპეციალური თასქის დამატება' : isTr ? 'Özel Görev Ekle' : 'Add Special Task',
    addAnotherItem: isKa ? 'კიდევ ერთი ნივთის დამატება' : isTr ? 'Bir Öğe Daha Ekle' : 'Add Another Item',
    inventoryMgmt: isKa ? 'ინვენტარის მართვა' : isTr ? 'Envanter Yönetimi' : 'Inventory Management',
    specialDuties: isKa ? 'სპეციალური მოვალეობები' : isTr ? 'Özel Sahne Görevleri' : 'Special Stage Duties',
    stagePositionsAndSlots: isKa ? 'სასცენო პოზიციები და სლოტები' : isTr ? 'Sahne Pozisyonları ve Yuvalar' : 'Stage Positions & Slots',
    addSlot: isKa ? 'სლოტის დამატება' : isTr ? 'Yuva Ekle' : 'Add Slot',
    slotPositionPlaceholder: isKa ? 'მაგ. მარჯვნივ, კულისები...' : isTr ? 'ör. Sahne Solu, Kuliste...' : 'e.g. Stage Left, Backstage...',
    taskCycleLabel: isKa ? 'როტაციის ციკლი (ერთიანი ამ დავალებისთვის)' : isTr ? 'Rotasyon Döngüsü (Bu Görev İçin)' : 'Unified Task Rotation Cycle',
    minSlotWarning: isKa ? 'დავალებას უნდა ჰქონდეს მინიმუმ 1 სლოტი' : isTr ? 'Görevin en az 1 yuvası olmalıdır' : 'Task must have at least 1 slot',
    slotsCount: (n: number) => isKa ? `${n} სლოტი` : isTr ? `${n} yuva` : `${n} slots`,
    itemsCount: (n: number) => isKa ? `${n} ნივთი` : isTr ? `${n} öğe` : `${n} items`,
    tasksCount: (n: number) => isKa ? `${n} თასქი` : isTr ? `${n} görev` : `${n} tasks`,
    itemNamePlaceholder: isKa ? 'ნივთის დასახელება (მაგ. Heavy Audio Rig, Stage Props...)' : isTr ? 'Öğe adı (ör. Heavy Audio Rig)' : 'Item name (e.g. Heavy Audio Rig)',
    taskNamePlaceholder: isKa ? 'დავალების დასახელება (მაგ. ფარდის გაწევა, განათების მართვა...)' : isTr ? 'Görev adı (ör. Perde Kontrolü)' : 'Task name (e.g. Stage Curtain Cue)',
    positionLabel: isKa ? 'პოზიცია / სცენური ლოკაცია' : isTr ? 'Pozisyon / Sahne Konumu' : 'Position / Cue Location',
    positionPlaceholder: isKa ? 'მაგ. სცენის მარცხენა, კულისები...' : isTr ? 'ör. Sahne Solu, Kuliste...' : 'e.g. Stage Left, Backstage...',
    genderReq: isKa ? 'სქესის მოთხოვნა' : isTr ? 'Cinsiyet Gereksinimi' : 'Gender Requirement',
    headcount: isKa ? 'საჭირო რაოდენობა' : isTr ? 'Gerekli Kişi Sayısı' : 'Required Headcount',
    rotationCycle: isKa ? 'როტაციის ციკლი' : isTr ? 'Rotasyon Döngüsü' : 'Rotation Cycle',
    inventoryCycleTitle: isKa ? 'ინვენტარის როტაციის ციკლი' : isTr ? 'Envanter Rotasyon Döngüsü' : 'Inventory Rotation Cycle',
    inventoryCycleSub: isKa ? 'ერთიანი წესი მთელი ინვენტარისთვის' : isTr ? 'Tüm envanter için tek döngü' : 'Single unified cycle for all inventory',
    genderAny: isKa ? 'ნებისმიერი' : isTr ? 'Fark etmez' : 'Any Gender',
    genderMaleOnly: isKa ? 'მხოლოდ კაცი' : isTr ? 'Sadece Erkek' : 'Male Only',
    genderFemaleOnly: isKa ? 'მხოლოდ ქალი' : isTr ? 'Sadece Kadın' : 'Female Only',
    cycleEveryShow: isKa ? 'თითო შოუზე' : isTr ? 'Her Gösteride' : 'Every Show',
    cycleWeekly: isKa ? '1 კვირიანი ციკლი' : isTr ? '1 Haftalık Döngü' : '1 Week Cycle',
    cycleMonthly: isKa ? 'თვიური' : isTr ? 'Aylık' : 'Monthly',
    cycleFixed: isKa ? 'ფიქსირებული / უცვლელი' : isTr ? 'Sabit / Değişmez' : 'Fixed / Static',
    remove: isKa ? 'წაშლა' : isTr ? 'Kaldır' : 'Remove',
  };

  // Section 1: Basic Group Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);

  // Progressive Disclosure Duty Lists
  const [inventoryItems, setInventoryItems] = useState<InventoryRequirement[]>([]);
  const [specialTasks, setSpecialTasks] = useState<SpecialDutyTask[]>([]);

  // Overall Inventory Rotation Cycle (Common to all inventory items)
  const [inventoryRotationCycle, setInventoryRotationCycle] = useState<RotationCycleType>('weekly');

  // Fairness Pool
  const [fairnessPoolEnabled, setFairnessPoolEnabled] = useState(true);

  // Performer selection combobox state
  const [talentSearch, setTalentSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'male' | 'female' | 'active'>('all');
  const [inactiveNotice, setInactiveNotice] = useState<string | null>(null);

  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close member dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize or reset form state
  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name || '');
      setDescription(editingGroup.description || '');
      setSelectedTalentIds(editingGroup.memberTalentIds || []);
      setFairnessPoolEnabled(editingGroup.fairnessPoolEnabled ?? true);

      const cycle: RotationCycleType =
        editingGroup.rotationCycleType ||
        (editingGroup.rotationCycleWeeks === 4
          ? 'monthly'
          : editingGroup.rotationCycleWeeks === 0
            ? 'every_show'
            : 'weekly');
      setInventoryRotationCycle(cycle);

      const allReqs = editingGroup.inventoryRequirements || [];
      setInventoryItems(allReqs.filter((r) => !r.category || r.category === 'inventory'));

      if (editingGroup.specialDutyTasks && editingGroup.specialDutyTasks.length > 0) {
        setSpecialTasks(editingGroup.specialDutyTasks);
      } else {
        const specialReqs = allReqs.filter((r) => r.category === 'special_task');
        const taskMap = new Map<string, SpecialDutyTask>();
        specialReqs.forEach((r, idx) => {
          const key = r.parentTaskId || r.itemName || `task-${idx}`;
          if (!taskMap.has(key)) {
            taskMap.set(key, {
              id: r.parentTaskId || `task-${idx}`,
              name: r.itemName,
              rotationCycle: r.rotationCycle || 'every_show',
              slots: []
            });
          }
          taskMap.get(key)!.slots.push({
            id: r.id || `slot-${idx}`,
            position: r.position || '',
            assignedGender: r.assignedGender || 'Any',
            headcount: r.requiredHeadcount || 1
          });
        });
        setSpecialTasks(Array.from(taskMap.values()));
      }
    } else {
      setName('');
      setDescription('');
      setSelectedTalentIds([]);
      setInventoryItems([]);
      setSpecialTasks([]);
      setInventoryRotationCycle('weekly');
      setFairnessPoolEnabled(true);
    }
    setInactiveNotice(null);
    setTalentSearch('');
  }, [editingGroup, isOpen]);

  // Performer roster actions
  const toggleTalentSelection = (id: string) => {
    setSelectedTalentIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  // Inventory Items Handlers
  const handleAddInventoryItem = () => {
    setInventoryItems((prev) => [
      ...prev,
      {
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemName: '',
        category: 'inventory',
        assignedGender: 'Any',
        requiredHeadcount: 1
      }
    ]);
  };

  const handleUpdateInventoryItem = (index: number, updated: Partial<InventoryRequirement>) => {
    setInventoryItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updated } : item))
    );
  };

  const handleRemoveInventoryItem = (index: number) => {
    setInventoryItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Special Tasks Handlers (Multi-Slot Formation Builder)
  const handleAddSpecialTask = () => {
    setSpecialTasks((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        rotationCycle: 'every_show',
        slots: [
          {
            id: `slot-${Date.now()}-1`,
            position: '',
            assignedGender: 'Any',
            headcount: 1
          }
        ]
      }
    ]);
  };

  const handleUpdateSpecialTask = (index: number, updated: Partial<SpecialDutyTask>) => {
    setSpecialTasks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updated } : item))
    );
  };

  const handleRemoveSpecialTask = (index: number) => {
    setSpecialTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSlot = (taskIndex: number) => {
    setSpecialTasks((prev) =>
      prev.map((t, idx) => {
        if (idx !== taskIndex) return t;
        const newSlot: DutySlot = {
          id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          position: '',
          assignedGender: 'Any',
          headcount: 1
        };
        return {
          ...t,
          slots: [...t.slots, newSlot]
        };
      })
    );
  };

  const handleUpdateSlot = (taskIndex: number, slotIndex: number, updated: Partial<DutySlot>) => {
    setSpecialTasks((prev) =>
      prev.map((t, idx) => {
        if (idx !== taskIndex) return t;
        const updatedSlots = t.slots.map((s, sIdx) => {
          if (sIdx !== slotIndex) return s;
          return { ...s, ...updated };
        });
        return { ...t, slots: updatedSlots };
      })
    );
  };

  const handleRemoveSlot = (taskIndex: number, slotIndex: number) => {
    setSpecialTasks((prev) =>
      prev.map((t, idx) => {
        if (idx !== taskIndex) return t;
        if (t.slots.length <= 1) {
          toast.info(lbl.minSlotWarning);
          return t;
        }
        return {
          ...t,
          slots: t.slots.filter((_, sIdx) => sIdx !== slotIndex)
        };
      })
    );
  };

  // Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(isKa ? 'გთხოვთ შეიყვანოთ ჯგუფის დასახელება' : 'Please enter a group name');
      return;
    }

    // Filter out blank entries
    const validInventory = inventoryItems
      .filter((r) => r.itemName.trim() !== '')
      .map((r) => ({ ...r, category: 'inventory' as const }));

    // Valid special tasks
    const validSpecial = specialTasks
      .filter((t) => t.name.trim() !== '')
      .map((t) => ({
        ...t,
        name: t.name.trim(),
        slots: t.slots.length > 0 ? t.slots : [{ id: `slot-${Date.now()}`, position: '', assignedGender: 'Any' as const, headcount: 1 }]
      }));

    // Flatten special task slots to InventoryRequirement for engine/compatibility
    const flattenedSpecialReqs: InventoryRequirement[] = [];
    validSpecial.forEach((task) => {
      task.slots.forEach((slot, sIdx) => {
        flattenedSpecialReqs.push({
          id: `${task.id}-slot-${slot.id || sIdx}`,
          itemName: task.name,
          category: 'special_task',
          assignedGender: slot.assignedGender,
          requiredHeadcount: slot.headcount,
          position: slot.position,
          rotationCycle: task.rotationCycle,
          parentTaskId: task.id
        });
      });
    });

    const combined = [...validInventory, ...flattenedSpecialReqs];

    const cycleWeeks =
      inventoryRotationCycle === 'monthly' ? 4 : inventoryRotationCycle === 'every_show' ? 0 : 1;

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: name.trim(),
        description: description.trim(),
        rotationCycleWeeks: cycleWeeks,
        rotationCycleType: inventoryRotationCycle,
        fairnessPoolEnabled,
        memberTalentIds: selectedTalentIds,
        inventoryRequirements: combined,
        specialDutyTasks: validSpecial
      });
      toast.success(
        isKa ? `ჯგუფის „${name.trim()}“ ცვლილებები შენახულია` : `Changes to group "${name.trim()}" saved`
      );
    } else {
      addGroup({
        name: name.trim(),
        description: description.trim(),
        rotationCycleWeeks: cycleWeeks,
        rotationCycleType: inventoryRotationCycle,
        fairnessPoolEnabled,
        memberTalentIds: selectedTalentIds,
        inventoryRequirements: combined,
        specialDutyTasks: validSpecial,
        colorAccent: '#FF6C41'
      });
      toast.success(
        isKa ? `ჯგუფი „${name.trim()}“ წარმატებით შეიქმნა` : `Group "${name.trim()}" created successfully`
      );
    }

    onClose();
  };

  // Filtered talent options with quick filters and search
  const filteredTalents = useMemo(() => {
    return talents.filter((tItem) => {
      if (quickFilter === 'male' && tItem.gender !== 'Male') return false;
      if (quickFilter === 'female' && tItem.gender !== 'Female') return false;
      if (quickFilter === 'active' && tItem.status !== 'Active') return false;

      if (!talentSearch.trim()) return true;
      const q = talentSearch.toLowerCase();
      const fullName = `${tItem.firstName} ${tItem.lastName}`.toLowerCase();
      const skill = tItem.primarySkill.toLowerCase();
      return fullName.includes(q) || skill.includes(q);
    });
  }, [talents, quickFilter, talentSearch]);

  // Breakdown of selected talents
  const selectedTalents = useMemo(
    () => talents.filter((tItem) => selectedTalentIds.includes(tItem.id)),
    [talents, selectedTalentIds]
  );
  const selectedMales = selectedTalents.filter((tItem) => tItem.gender === 'Male').length;
  const selectedFemales = selectedTalents.filter((tItem) => tItem.gender === 'Female').length;

  const hasInventory = inventoryItems.length > 0;
  const hasSpecialTasks = specialTasks.length > 0;
  const isBothEmpty = !hasInventory && !hasSpecialTasks;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="640px"
    >
      {/* Drawer Header */}
      <div className="p-5 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-border-subtle shrink-0 pr-16 bg-white dark:bg-surface">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-text-primary m-0 tracking-tight">
          {editingGroup ? t('edit_group') : t('create_group')}
        </h2>
        <p className="text-xs text-slate-600 dark:text-text-secondary mt-1 m-0">
          {isKa
            ? 'შეარჩიეთ შემსრულებლები, დააკონფიგურირეთ ციკლი და განსაზღვრეთ როტაციული წესები'
            : t('group_form_subtitle')}
        </p>
      </div>

      <form
        id="group-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-canvas flex flex-col gap-4"
      >
        {/* ========================================================
            CARD 1: ჯგუფის საბაზისო მონაცემები (Basic Data & Members)
           ======================================================== */}
        <div className="bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-border-subtle p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-border-subtle">
            <Users size={16} className="text-brand-primary shrink-0" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-text-primary">
              {isKa ? 'ჯგუფის საბაზისო მონაცემები' : 'Basic Group Information'}
            </span>
          </div>

          {/* 1. Group Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-text-primary mb-1.5">
              {isKa ? 'ჯგუფის სახელი' : t('group_name')}
              <span className="text-brand-primary ml-1 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-border-medium bg-white dark:bg-surface text-slate-900 dark:text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-slate-400 dark:placeholder:text-text-tertiary transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Solaris Cirque Troupe"
            />
          </div>

          {/* 2. Group Description (Single-line input) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-text-primary mb-1.5">
              {isKa ? 'მოკლე აღწერა' : t('group_desc')}
            </label>
            <input
              type="text"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-border-medium bg-white dark:bg-surface text-slate-900 dark:text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-slate-400 dark:placeholder:text-text-tertiary transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isKa
                  ? 'მაგ. საგასტროლო აკრობატული და თანამედროვე ქორეოგრაფიული დასი'
                  : 'e.g. Aerial acrobatic and contemporary dance touring ensemble'
              }
            />
          </div>

          {/* 3. Members Selector / Dropdown with Compact Avatars & Stats Badges */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <label className="block text-xs font-bold text-slate-800 dark:text-text-primary mb-0">
                {isKa ? 'წევრების დამატება' : t('group_members')}
              </label>

              {/* Roster Validation Stats Badges (High contrast, clearly visible) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 dark:bg-surface-secondary dark:text-text-primary border border-slate-300 dark:border-border-medium text-xs font-bold">
                  <Users size={12} className="text-slate-600 dark:text-text-secondary shrink-0" />
                  <span>
                    {isKa ? 'სულ' : 'Total'}:{' '}
                    <strong className="text-slate-950 dark:text-white font-extrabold">
                      {selectedTalentIds.length}
                    </strong>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100/80 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800 text-xs font-bold">
                  <User size={12} className="shrink-0" />
                  <span>
                    {selectedMales} {isKa ? 'კაცი' : t('males')}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-100/80 text-pink-900 dark:bg-pink-950 dark:text-pink-200 border border-pink-300 dark:border-pink-800 text-xs font-bold">
                  <User size={12} className="shrink-0" />
                  <span>
                    {selectedFemales} {isKa ? 'ქალი' : t('females')}
                  </span>
                </span>
              </div>
            </div>

            {/* Combobox Wrapper */}
            <div ref={comboboxRef} className="relative w-full">
              {/* Trigger Input Box */}
              <div
                onClick={() => {
                  setIsDropdownOpen(true);
                  inputRef.current?.focus();
                }}
                className={`flex items-center gap-2 p-2 px-3 rounded-lg border bg-white dark:bg-surface cursor-pointer transition-all ${isDropdownOpen
                  ? 'border-brand-primary ring-2 ring-brand-primary/10'
                  : 'border-slate-300 dark:border-border-medium hover:border-slate-400 dark:hover:border-border-medium'
                  }`}
              >
                <Search size={15} className="text-slate-500 dark:text-text-tertiary shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={talentSearch}
                  onChange={(e) => {
                    setTalentSearch(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder={
                    selectedTalents.length === 0
                      ? isKa
                        ? 'მოძებნეთ ან აირჩიეთ შემსრულებლები...'
                        : 'Search or select performers...'
                      : isKa
                        ? 'მოძებნეთ დამატებითი წევრი...'
                        : 'Search more performers...'
                  }
                  className="flex-1 border-none outline-none bg-transparent text-xs text-slate-900 dark:text-text-primary placeholder:text-slate-400 dark:placeholder:text-text-tertiary font-medium"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                    if (!isDropdownOpen) inputRef.current?.focus();
                  }}
                  className="bg-transparent border-none cursor-pointer p-0.5 text-slate-500 hover:text-slate-800 dark:text-text-secondary dark:hover:text-text-primary flex items-center ml-auto"
                >
                  {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Selected Compact Avatars List */}
              {selectedTalents.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-surface-secondary border border-slate-200 dark:border-border-subtle">
                  {selectedTalents.map((tItem) => (
                    <div
                      key={tItem.id}
                      className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-white dark:bg-surface border border-slate-200 dark:border-border-subtle shadow-xs text-xs text-slate-800 dark:text-text-primary group"
                    >
                      {tItem.avatarUrl ? (
                        <img
                          src={tItem.avatarUrl}
                          alt={tItem.firstName}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {tItem.firstName[0]}
                          {tItem.lastName ? tItem.lastName[0] : ''}
                        </div>
                      )}

                      <span className="font-semibold text-[11px] truncate max-w-[110px] text-slate-900 dark:text-text-primary">
                        {tItem.firstName} {tItem.lastName ? `${tItem.lastName[0]}.` : ''}
                      </span>

                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${tItem.gender === 'Male'
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
                          : 'bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-200'
                          }`}
                      >
                        {tItem.gender === 'Male' ? (isKa ? 'კაცი' : 'Male') : (isKa ? 'ქალი' : 'Female')}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTalentIds((prev) => prev.filter((id) => id !== tItem.id));
                        }}
                        className="bg-transparent border-none p-0 cursor-pointer text-slate-400 hover:text-red-600 flex items-center transition-colors ml-0.5"
                        title={isKa ? 'წაშლა' : 'Remove'}
                      >
                        <X size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSelectedTalentIds([])}
                    className="ml-auto bg-transparent border-none text-[11px] text-slate-600 hover:text-slate-900 dark:text-text-secondary dark:hover:text-text-primary cursor-pointer font-bold underline py-0.5 px-1"
                  >
                    {isKa ? 'ყველას გასუფთავება' : t('clear_all')}
                  </button>
                </div>
              )}

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white dark:bg-surface rounded-xl border border-slate-300 dark:border-border-medium shadow-xl p-2.5 flex flex-col gap-2">
                  {/* Quick Filters */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-slate-100 dark:border-border-subtle">
                    <div className="flex items-center gap-1">
                      {(['all', 'male', 'female', 'active'] as const).map((filterKey) => {
                        const labels: Record<string, string> = {
                          all: isKa ? 'ყველა' : t('filter_all'),
                          male: isKa ? 'კაცები' : t('filter_men'),
                          female: isKa ? 'ქალები' : t('filter_women'),
                          active: isKa ? 'აქტიური' : t('filter_active')
                        };
                        const isActive = quickFilter === filterKey;
                        return (
                          <button
                            key={filterKey}
                            type="button"
                            onClick={() => setQuickFilter(filterKey)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border ${isActive
                              ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                              : 'border-slate-300 dark:border-border-medium bg-slate-50 dark:bg-surface-secondary text-slate-700 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-tertiary'
                              }`}
                          >
                            {labels[filterKey]}
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-[11px] font-semibold text-slate-600 dark:text-text-secondary">
                      {filteredTalents.length} {isKa ? 'შემსრულებელი' : 'performers'}
                    </span>
                  </div>

                  {/* Inactive Performer Alert Banner */}
                  {inactiveNotice && (
                    <div className="flex items-center justify-between p-2 px-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={13} className="shrink-0" />
                        <span>{inactiveNotice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInactiveNotice(null)}
                        className="bg-transparent border-none cursor-pointer text-red-600 p-0 hover:opacity-80"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {/* Scrollable Single-Line List of Performers */}
                  <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 pr-1">
                    {filteredTalents.length === 0 ? (
                      <div className="p-4 text-center text-xs font-semibold text-slate-500 dark:text-text-secondary">
                        {isKa ? 'შემსრულებლები ვერ მოიძებნა' : 'No performers found'}
                      </div>
                    ) : (
                      filteredTalents.map((tItem) => {
                        const isSelected = selectedTalentIds.includes(tItem.id);
                        const isInactive = tItem.status !== 'Active';

                        const statusBgColor =
                          tItem.status === 'Active'
                            ? 'bg-emerald-500'
                            : tItem.status === 'Rest'
                              ? 'bg-amber-500'
                              : 'bg-red-500';

                        return (
                          <div
                            key={tItem.id}
                            onClick={() => {
                              if (isInactive) {
                                setInactiveNotice(
                                  isKa
                                    ? `შემსრულებელი არააქტიურია (${tItem.status}) და ვერ დაემატება ჯგუფს.`
                                    : t('performer_inactive_warning', { status: tItem.status })
                                );
                                return;
                              }
                              setInactiveNotice(null);
                              toggleTalentSelection(tItem.id);
                            }}
                            className={`flex items-center justify-between p-2 px-2.5 rounded-lg select-none transition-colors ${isInactive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                              } ${isSelected
                                ? 'bg-slate-100 dark:bg-surface-secondary border border-slate-300 dark:border-border-medium'
                                : 'hover:bg-slate-50 dark:hover:bg-surface-secondary border border-transparent'
                              }`}
                          >
                            {/* Left: Checkbox + Avatar + Name & Details */}
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected
                                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                                  : 'border-slate-300 dark:border-border-medium bg-white dark:bg-surface text-transparent'
                                  }`}
                              >
                                {isSelected && <Check size={11} strokeWidth={3} />}
                              </div>

                              {tItem.avatarUrl ? (
                                <img
                                  src={tItem.avatarUrl}
                                  alt={tItem.firstName}
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {tItem.firstName[0]}
                                  {tItem.lastName[0]}
                                </div>
                              )}

                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-bold text-slate-900 dark:text-text-primary truncate">
                                  {tItem.firstName} {tItem.lastName}
                                </span>
                                <span className="text-[11px] font-medium text-slate-600 dark:text-text-secondary truncate">
                                  {tItem.primarySkill}
                                </span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-surface-tertiary text-slate-700 dark:text-text-secondary shrink-0">
                                  {tItem.gender === 'Male' ? (isKa ? 'კაცი' : 'Male') : (isKa ? 'ქალი' : 'Female')}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 dark:text-text-tertiary shrink-0">
                                  {tItem.heightCm} {isKa ? 'სმ' : 'cm'}
                                </span>
                              </div>
                            </div>

                            {/* Right: Status Indicator Dot */}
                            <div
                              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-text-secondary shrink-0"
                              title={tItem.status}
                            >
                              <span className={`w-2 h-2 rounded-full ${statusBgColor} shrink-0`} />
                              {isInactive && <span>{tItem.status}</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            1. საწყისი მდგომარეობა (EMPTY STATE)
            Visible ONLY when neither inventory nor special tasks exist
           ======================================================== */}
        {isBothEmpty && (
          <div className="bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-border-subtle p-6 shadow-xs flex flex-col items-center justify-center text-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-surface-secondary flex items-center justify-center text-slate-700 dark:text-text-primary">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-text-primary m-0">
                {lbl.dutyConfig}
              </h3>
              <p className="text-xs text-slate-600 dark:text-text-secondary mt-1.5 max-w-md m-0 leading-relaxed font-medium">
                {lbl.dutyConfigDesc}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center pt-1.5">
              <button
                type="button"
                onClick={handleAddInventoryItem}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Package size={15} className="shrink-0" />
                <span>{lbl.addInventory}</span>
              </button>

              <button
                type="button"
                onClick={handleAddSpecialTask}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Sparkles size={15} className="shrink-0 text-amber-400 dark:text-purple-400" />
                <span>{lbl.addSpecialTask}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            2. კონტეინერი 1: ინვენტარის მართვა
            Visible when inventory items exist
           ======================================================== */}
        {hasInventory && (
          <div className="bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-border-subtle p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
            {/* Header (Clean, no duplicate button) */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-border-subtle">
              <Package size={16} className="text-brand-primary shrink-0" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-text-primary">
                {lbl.inventoryMgmt}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-800 dark:bg-surface-secondary dark:text-text-primary border border-slate-300 dark:border-border-medium">
                {lbl.itemsCount(inventoryItems.length)}
              </span>
            </div>

            {/* Inventory Items List */}
            <div className="flex flex-col gap-3">
              {inventoryItems.map((item, index) => {
                const datalistId = `inv-suggestions-${index}`;
                return (
                  <div
                    key={item.id || index}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 dark:bg-surface-secondary border border-slate-200 dark:border-border-medium flex flex-col gap-3 shadow-xs"
                  >
                    {/* Row 1: Full-Width Item Name + Trash Button */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 min-w-0">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-text-secondary">
                          <Package size={14} className="text-brand-primary" />
                        </div>
                        <input
                          type="text"
                          list={datalistId}
                          placeholder={lbl.itemNamePlaceholder}
                          value={item.itemName}
                          onChange={(e) => handleUpdateInventoryItem(index, { itemName: e.target.value })}
                          className="w-full text-xs font-medium pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-border-medium bg-white dark:bg-surface text-slate-900 dark:text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-slate-400 dark:placeholder:text-text-tertiary transition-all"
                          required
                        />
                        <datalist id={datalistId}>
                          {COMMON_INVENTORY_ITEMS.map((ci, idx) => (
                            <option key={idx} value={ci} />
                          ))}
                        </datalist>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveInventoryItem(index)}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-border-subtle hover:border-red-200 dark:hover:border-red-900/50 transition-all cursor-pointer shrink-0"
                        title={lbl.remove}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Row 2: Gender Requirement + Headcount (Spacious 2-column grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 dark:text-text-primary mb-1">
                          {lbl.genderReq}
                        </label>
                        <div className="relative flex items-center">
                          <div className="absolute left-2.5 pointer-events-none text-slate-500">
                            <User size={13} />
                          </div>
                          <select
                            value={item.assignedGender || 'Any'}
                            onChange={(e) =>
                              handleUpdateInventoryItem(index, {
                                assignedGender: e.target.value as DutyGenderRequirement
                              })
                            }
                            className="w-full text-xs font-semibold pl-7 pr-3 py-2 rounded-lg border border-slate-300 dark:border-border-medium bg-white dark:bg-surface text-slate-900 dark:text-text-primary outline-none focus:border-brand-primary cursor-pointer shadow-xs"
                          >
                            <option value="Any">{lbl.genderAny}</option>
                            <option value="Male Only">{lbl.genderMaleOnly}</option>
                            <option value="Female Only">{lbl.genderFemaleOnly}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 dark:text-text-primary mb-1">
                          {lbl.headcount}
                        </label>
                        <div className="relative flex items-center">
                          <div className="absolute left-2.5 pointer-events-none text-slate-500">
                            <Users size={13} />
                          </div>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={item.requiredHeadcount}
                            onChange={(e) =>
                              handleUpdateInventoryItem(index, {
                                requiredHeadcount: Math.max(1, Math.min(10, Number(e.target.value) || 1))
                              })
                            }
                            className="w-full text-xs font-bold pl-7 pr-3 py-2 rounded-lg border border-slate-300 dark:border-border-medium bg-white dark:bg-surface text-slate-900 dark:text-text-primary outline-none focus:border-brand-primary shadow-xs"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: Common Rotation Cycle for Entire Inventory */}
            <div className="pt-3 border-t border-slate-200 dark:border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100/70 dark:bg-surface-secondary p-3.5 rounded-xl border border-slate-200 dark:border-border-medium">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-brand-primary shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-text-primary block">
                    {lbl.inventoryCycleTitle}
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-text-secondary block mt-0.5">
                    {lbl.inventoryCycleSub}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-[210px]">
                <select
                  value={inventoryRotationCycle}
                  onChange={(e) => setInventoryRotationCycle(e.target.value as RotationCycleType)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 dark:border-border-medium bg-white dark:bg-surface text-slate-900 dark:text-text-primary outline-none focus:border-brand-primary cursor-pointer shadow-xs"
                >
                  <option value="every_show">{lbl.cycleEveryShow}</option>
                  <option value="weekly">{lbl.cycleWeekly}</option>
                  <option value="monthly">{lbl.cycleMonthly}</option>
                </select>
              </div>
            </div>

            {/* Bottom of Container 1: ONLY One Button to Add Another Item */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddInventoryItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-800 dark:text-text-primary bg-white dark:bg-surface hover:bg-slate-100 dark:hover:bg-surface-secondary border border-slate-300 dark:border-border-medium transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>{lbl.addAnotherItem}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            გარე ზონა: თუ ინვენტარი უკვე არის, მაგრამ სპეციალური თასქი არა
           ======================================================== */}
        {hasInventory && !hasSpecialTasks && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleAddSpecialTask}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-text-primary bg-white dark:bg-surface hover:bg-slate-50 dark:hover:bg-surface-secondary border border-slate-300 dark:border-border-medium shadow-xs transition-all cursor-pointer active:scale-[0.98]"
            >
              <Sparkles size={15} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <span>{lbl.addSpecialTask}</span>
            </button>
          </div>
        )}

        {/* ========================================================
            3. კონტეინერი 2: სპეციალური მოვალეობები (Multi-Slot Formation Builder)
            Visible when special tasks exist
           ======================================================== */}
        {hasSpecialTasks && (
          <div className="bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-border-subtle p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
            {/* Header: Special Duties */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-border-subtle">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-text-primary">
                  {lbl.specialDuties}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {lbl.tasksCount(specialTasks.length)}
                </span>
              </div>

              <span className="text-xs font-semibold text-slate-500 dark:text-text-secondary">
                {lbl.slotsCount(specialTasks.reduce((acc, t) => acc + t.slots.length, 0))}
              </span>
            </div>

            {/* Special Tasks Multi-Slot Formation List */}
            <div className="flex flex-col gap-4">
              {specialTasks.map((task, taskIndex) => {
                const taskDatalistId = `task-suggestions-${taskIndex}`;
                return (
                  <div
                    key={task.id || taskIndex}
                    className="p-4 sm:p-5 rounded-xl bg-slate-50/90 dark:bg-surface-secondary border border-slate-200 dark:border-border-medium flex flex-col gap-4 shadow-xs"
                  >
                    {/* ა) ზედა ძირითადი პარამეტრები (Header & Scope) */}
                    <div className="flex flex-col gap-3">
                      {/* Row 1: დავალების დასახელება + წაშლის ღილაკი */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 min-w-0">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-600 dark:text-purple-400">
                            <Sparkles size={14} />
                          </div>
                          <input
                            type="text"
                            list={taskDatalistId}
                            placeholder={lbl.taskNamePlaceholder}
                            value={task.name}
                            onChange={(e) =>
                              handleUpdateSpecialTask(taskIndex, { name: e.target.value })
                            }
                            className="w-full text-xs font-medium pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-border-medium bg-white dark:bg-surface text-slate-900 dark:text-text-primary outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 placeholder:text-slate-400 dark:placeholder:text-text-tertiary transition-all"
                            required
                          />
                          <datalist id={taskDatalistId}>
                            {COMMON_SPECIAL_TASKS.map((st, sIdx) => (
                              <option key={sIdx} value={st} />
                            ))}
                          </datalist>
                        </div>

                        {/* Task Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialTask(taskIndex)}
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-border-subtle hover:border-red-200 dark:hover:border-red-900/50 transition-all cursor-pointer shrink-0"
                          title={lbl.remove}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Row 2: როტაციის ციკლი (ერთიანი ამ კონკრეტული დავალებისთვის) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-surface border border-slate-200 dark:border-border-medium">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-purple-600 dark:text-purple-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-text-primary">
                              {lbl.taskCycleLabel}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-text-tertiary">
                              {lbl.inventoryCycleSub}
                            </div>
                          </div>
                        </div>

                        <select
                          value={task.rotationCycle}
                          onChange={(e) =>
                            handleUpdateSpecialTask(taskIndex, {
                              rotationCycle: e.target.value as TaskRotationCycle
                            })
                          }
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border-medium bg-slate-50 dark:bg-surface-secondary text-slate-900 dark:text-text-primary outline-none focus:border-purple-600 cursor-pointer"
                        >
                          <option value="every_show">{lbl.cycleEveryShow}</option>
                          <option value="weekly">{lbl.cycleWeekly}</option>
                          <option value="monthly">{lbl.cycleMonthly}</option>
                          <option value="fixed">{lbl.cycleFixed}</option>
                        </select>
                      </div>
                    </div>

                    {/* ბ) სლოტების ბლოკი (Multi-Slot Formation Builder) */}
                    <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-200 dark:border-border-medium">
                      {/* Sub-header: სასცენო პოზიციები და სლოტები + [ + სლოტის დამატება ] */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-text-primary">
                          <SlidersHorizontal size={13} className="text-purple-600 dark:text-purple-400" />
                          <span>{lbl.stagePositionsAndSlots}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            {task.slots.length}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddSlot(taskIndex)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-surface text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 shadow-xs cursor-pointer transition-all active:scale-95"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                          <span>{lbl.addSlot}</span>
                        </button>
                      </div>

                      {/* Slots List */}
                      <div className="flex flex-col gap-2">
                        {task.slots.map((slot, slotIndex) => {
                          const slotDatalistId = `slot-pos-${taskIndex}-${slotIndex}`;
                          return (
                            <div
                              key={slot.id || slotIndex}
                              className="p-2.5 rounded-lg bg-white dark:bg-surface border border-slate-200 dark:border-border-subtle flex flex-col sm:flex-row sm:items-center gap-2.5 shadow-2xs hover:border-slate-300 dark:hover:border-border-medium transition-all"
                            >
                              {/* 1. პოზიცია / ლოკაცია */}
                              <div className="flex-1 min-w-0 relative">
                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-text-tertiary">
                                  <MapPin size={13} />
                                </div>
                                <input
                                  type="text"
                                  list={slotDatalistId}
                                  placeholder={lbl.slotPositionPlaceholder}
                                  value={slot.position}
                                  onChange={(e) =>
                                    handleUpdateSlot(taskIndex, slotIndex, { position: e.target.value })
                                  }
                                  className="w-full text-xs font-medium pl-7 pr-2.5 py-1.5 rounded-md border border-slate-200 dark:border-border-medium bg-slate-50/50 dark:bg-surface-secondary text-slate-900 dark:text-text-primary outline-none focus:border-purple-600 focus:bg-white dark:focus:bg-surface transition-all placeholder:text-slate-400"
                                  required
                                />
                                <datalist id={slotDatalistId}>
                                  {COMMON_STAGE_POSITIONS.map((pos, pIdx) => (
                                    <option key={pIdx} value={pos} />
                                  ))}
                                </datalist>
                              </div>

                              {/* 2. სქესის მოთხოვნა */}
                              <div className="w-full sm:w-36 shrink-0">
                                <select
                                  value={slot.assignedGender}
                                  onChange={(e) =>
                                    handleUpdateSlot(taskIndex, slotIndex, {
                                      assignedGender: e.target.value as DutyGenderRequirement
                                    })
                                  }
                                  className="w-full text-xs font-semibold px-2 py-1.5 rounded-md border border-slate-200 dark:border-border-medium bg-slate-50/50 dark:bg-surface-secondary text-slate-800 dark:text-text-primary outline-none focus:border-purple-600 cursor-pointer"
                                >
                                  <option value="Any">{lbl.genderAny}</option>
                                  <option value="Female Only">{lbl.genderFemaleOnly}</option>
                                  <option value="Male Only">{lbl.genderMaleOnly}</option>
                                </select>
                              </div>

                              {/* 3. რაოდენობა (Headcount) */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-text-tertiary">
                                  <Users size={12} className="inline mr-1" />
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={slot.headcount}
                                  onChange={(e) =>
                                    handleUpdateSlot(taskIndex, slotIndex, {
                                      headcount: Math.max(1, Math.min(10, Number(e.target.value) || 1))
                                    })
                                  }
                                  className="w-14 text-xs font-bold px-2 py-1.5 rounded-md border border-slate-200 dark:border-border-medium bg-slate-50/50 dark:bg-surface-secondary text-slate-900 dark:text-text-primary text-center outline-none focus:border-purple-600"
                                  required
                                />
                              </div>

                              {/* 4. სლოტის წაშლის ღილაკი */}
                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(taskIndex, slotIndex)}
                                disabled={task.slots.length <= 1}
                                className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition-all shrink-0 ${task.slots.length <= 1
                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer'
                                  }`}
                                title={lbl.remove}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom of Container 2: ONLY One Button to Add Another Special Task */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddSpecialTask}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-800 dark:text-text-primary bg-white dark:bg-surface hover:bg-slate-100 dark:hover:bg-surface-secondary border border-slate-300 dark:border-border-medium transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>{lbl.addSpecialTask}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            გარე ზონა: თუ სპეციალური თასქები უკვე არის, მაგრამ ინვენტარი არა
           ======================================================== */}
        {!hasInventory && hasSpecialTasks && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleAddInventoryItem}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-text-primary bg-white dark:bg-surface hover:bg-slate-50 dark:hover:bg-surface-secondary border border-slate-300 dark:border-border-medium shadow-xs transition-all cursor-pointer active:scale-[0.98]"
            >
              <Package size={15} className="text-brand-primary shrink-0" />
              <span>{lbl.addInventory}</span>
            </button>
          </div>
        )}

        {/* ========================================================
            4. CARD 3: მხოლოდ სამართლიანი გადანაწილების ალგორითმი (Fairness Pool)
            (Global rotation cycle completely removed as requested)
           ======================================================== */}
        <div className="bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-border-subtle p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="fairness-pool-toggle"
              checked={fairnessPoolEnabled}
              onChange={(e) => setFairnessPoolEnabled(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 cursor-pointer shrink-0"
            />
            <label
              htmlFor="fairness-pool-toggle"
              className="flex-1 text-xs cursor-pointer select-none"
            >
              <div className="font-bold text-slate-900 dark:text-text-primary flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500 shrink-0" />
                <span>
                  {isKa
                    ? 'სქესისა და დასწრების ავტომატური ბალანსი (Fairness Pool)'
                    : t('fairness_pool_label')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-text-secondary mt-1 m-0 leading-normal font-medium">
                {isKa
                  ? 'Round-Robin ალგორითმი უზრუნველყოფს მოვალეობების თანაბარ გადანაწილებას დასის წევრებს შორის მათი აქტიურობისა და სქესის გათვალისწინებით.'
                  : t('fairness_pool_desc')}
              </p>
            </label>
          </div>
        </div>
      </form>

      {/* Drawer Sticky Footer */}
      <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-border-subtle bg-white dark:bg-surface flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-border-medium text-slate-700 hover:bg-slate-50 dark:text-text-secondary dark:hover:bg-surface-secondary transition-all cursor-pointer"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          form="group-form"
          className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-bold bg-brand-primary text-white shadow-sm hover:bg-brand-primary-hover active:translate-y-0 transition-all cursor-pointer min-w-[130px]"
        >
          {editingGroup ? t('save_changes') : t('create_group')}
        </button>
      </div>
    </Drawer>
  );
};
