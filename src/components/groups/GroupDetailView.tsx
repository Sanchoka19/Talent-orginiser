'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { GroupFormModal } from './GroupFormModal';
import { AddMemberModal } from './AddMemberModal';
import { TaskAssignmentModal } from './TaskAssignmentModal';
import { InventoryDutyModal } from './InventoryDutyModal';
import { GroupRosterTab } from './tabs/GroupRosterTab';
import { GroupInventoryTab } from './tabs/GroupInventoryTab';
import { GroupTasksTab } from './tabs/GroupTasksTab';
import { GroupShowsTab } from './tabs/GroupShowsTab';
import { StatCard } from '../common/StatCard';
import { RotationCycleType } from '../../types/group';
import {
  InventoryRequirement,
  TaskRotationCycle,
  DutySlot,
  SpecialDutyTask,
  DutyGenderRequirement
} from '../../types/inventory';
import {
  ArrowLeft,
  Users,
  UserPlus,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  ShieldCheck,
  Package,
  PackagePlus,
  Sparkles,
  Calendar,
  CalendarPlus,
  Plus
} from 'lucide-react';

type GroupDetailTab = 'members' | 'inventory' | 'tasks' | 'shows';

const DICT = {
  ka: {
    backToGroups: 'ჯგუფებსა და დასებში დაბრუნება',
    seasonTag: 'სეზონი 2026',
    assignTask: 'დავალების დამატება',
    addMember: 'წევრის დამატება',
    addItem: 'ნივთის დამატება',
    bookShow: 'შოუს დაგეგმვა',
    addInventory: 'ინვენტარის დამატება',
    totalMembers: 'სულ წევრები',
    readiness: 'მზადყოფნა',
    rotationCycle: 'როტაციის ციკლი',
    scheduledShowsCount: 'დაგეგმილი შოუები',
    primaryLocation: 'მთავარი ლოკაცია / ბაზირება:',
    tabMembers: 'შემადგენლობა',
    tabInventory: 'ინვენტარი',
    tabTasks: 'დავალებები',
    tabShows: 'შოუები',
    ensembleRoster: 'დასის შემადგენლობა',
    inventoryDuties: 'შოუს ინვენტარის მორიგეობა',
    specialTasks: 'სპეციალური დავალებები',
    scheduledEvents: 'დაგეგმილი შოუები',
    noMembers: 'ჯგუფში წევრები არ არის',
    noInventory: 'ინვენტარის მორიგეობა არ არის კონფიგურირებული',
    noTasksTitle: 'სპეციალური დავალებები არ არის',
    noTasksDesc: 'დაამატეთ სცენის სპეციალური დავალებები და მიაბით ჯგუფის წევრები.',
    noShows: 'დაგეგმილი შოუები ჯერ არ მოიძებნა',
    dutyRulesExplanation: 'შოუს დაგეგმვისას სისტემა ამ წესების მიხედვით დასის წევრებს შორის ავტომატურად ანაწილებს მორიგეობას სამართლიანი როტაციით.',
    tasksExplanation: 'სპეციალური დავალებები ავტომატურად მონაცვლეობს შოუების განმავლობაში არჩეული ციკლისა და დანიშნული არტისტების მიხედვით.',
    newTaskTitle: 'სასცენო დავალების შექმნა',
    newTaskSubtitle: 'სასცენო ფორმაციები, მრავალპოზიციური სლოტები და შემსრულებლის მიბმა',
    addInventoryTitle: 'ინვენტარის მორიგეობის დამატება',
    addInventorySubtitle: 'შოუს ინვენტარისა და რეკვიზიტების მორიგეობის წესები',
    taskTypeSpecial: 'სასცენო მოვალეობები & ფორმაციები',
    taskTypeInventory: 'ინვენტარის მორიგეობა',
    taskNameLabel: 'დავალების დასახელება',
    taskNamePlaceholder: 'მაგ. ფარდის გაწევა, სცენის მომზადება, ზღვის ტალღა...',
    positionLabel: 'პოზიცია / ლოკაცია',
    positionPlaceholder: 'მაგ. სცენის მარცხენა, კულისები...',
    slotPositionPlaceholder: 'მაგ. სცენის მარცხენა, კულისები...',
    stagePositionsAndSlots: 'სასცენო პოზიციები და სლოტები',
    addSlot: 'სლოტის დამატება',
    inventoryItemsList: 'ინვენტარისა და რეკვიზიტების სია',
    addInventoryItem: 'ნივთის დამატება',
    itemNameLabel: 'ნივთის / რეკვიზიტის დასახელება',
    itemNamePlaceholder: 'მაგ. Cyr Wheel, Heavy Audio Rig, განათება...',
    genderRequirement: 'სქესის მოთხოვნა',
    genderAny: 'ნებისმიერი',
    genderFemaleOnly: 'მხოლოდ ქალი',
    genderMaleOnly: 'მხოლოდ კაცი',
    headcount: 'რაოდენობა (Headcount)',
    rotationCycleLabel: 'როტაციის ციკლი',
    slotCycleLabel: 'როტაციის ციკლი',
    slotCycleEveryShow: 'ყოველ შოუზე',
    slotCycleWeekly: '1 კვირა',
    slotCycleMonthly: 'თვიური',
    slotCycleFixed: 'ფიქსირებული / უცვლელი',
    inventoryCycleLabel: 'ინვენტარის ერთიანი როტაციის ციკლი',
    cycleEveryShow: 'ყოველ შოუზე (Every Show)',
    cycleWeekly: '1 კვირიანი ციკლი (Weekly)',
    cycleMonthly: 'თვიური (Monthly)',
    cycleFixed: 'ფიქსირებული (არ როტირებს)',
    autoRotationOption: 'ავტომატური როტაცია (Round-Robin / Fairness Pool)',
    autoRotationDesc: 'სისტემა თავად ანაწილებს ჯგუფის წევრებს სლოტებზე მათი დასწრებისა და სქესის მიხედვით.',
    manualOption: 'კონკრეტული წევრის ხელით არჩევა (ფიქსირებული)',
    manualOptionDesc: 'დავალება მიებმება კონკრეტულ არტისტს ავტო-როტაციის გარეშე.',
    performerLabel: 'შემსრულებლის არჩევა',
    selectPerformerPlaceholder: 'აირჩიეთ ჯგუფის წევრი...',
    suggestions: 'შემოთავაზებები:',
    cancel: 'გაუქმება',
    saveTask: 'დავალების შენახვა',
    saveInventory: 'ინვენტარის შენახვა',
    taskAddedSuccess: 'სასცენო დავალება წარმატებით დაემატა!',
    inventoryAddedSuccess: 'ინვენტარის მორიგეობა წარმატებით დაემატა!',
    taskDeletedSuccess: 'დავალება წაიშალა',
    inventoryDeletedSuccess: 'ინვენტარის მორიგეობა წაიშალა',
    assignedTo: 'შემსრულებელი',
    notAssigned: 'ავტო-როტაცია',
    delete: 'წაშლა',
    editGroup: 'ჯგუფის რედაქტირება',
    deleteGroupTitle: 'ჯგუფის წაშლა',
    deleteGroupConfirm: 'ნამდვილად გსურთ ამ ჯგუფის წაშლა? ჯგუფის წევრები და დაგეგმილი შოუები გათავისუფლდება.',
    groupDeletedSuccess: (name: string) => `ჯგუფი „${name}“ წარმატებით წაიშალა`,
    groupNotFound: 'ჯგუფი ვერ მოიძებნა',
    groupNotFoundDesc: 'მოთხოვნილი ჯგუფი არ არსებობს ან უკვე წაშლილია.',
  },
  en: {
    backToGroups: 'Back to Groups and Ensembles',
    seasonTag: 'Season 2026',
    assignTask: 'Add Task',
    addMember: 'Add Member',
    addItem: 'Add Item',
    bookShow: 'Schedule Show',
    addInventory: 'Add Inventory',
    totalMembers: 'Total Members',
    readiness: 'Readiness',
    rotationCycle: 'Rotation Cycle',
    scheduledShowsCount: 'Scheduled Shows',
    primaryLocation: 'Primary Destination / Base:',
    tabMembers: 'Roster',
    tabInventory: 'Inventory',
    tabTasks: 'Tasks',
    tabShows: 'Shows',
    ensembleRoster: 'Ensemble Roster',
    inventoryDuties: 'Show Inventory Duties',
    specialTasks: 'Special Tasks',
    scheduledEvents: 'Scheduled Shows',
    noMembers: 'No members in this group yet',
    noInventory: 'No inventory duties configured',
    noTasksTitle: 'No special tasks assigned yet',
    noTasksDesc: 'Define special stage duties and link performers using the button above.',
    noShows: 'No scheduled shows found for this group',
    dutyRulesExplanation: 'When scheduling shows, the system automatically rotates crew members to handle these items based on fair-round-robin rules.',
    tasksExplanation: 'Special stage tasks are rotated across scheduled performances according to selected cycle parameters and performers.',
    newTaskTitle: 'Create Stage Task',
    newTaskSubtitle: 'Multi-slot stage formations, positions, and performer assignment',
    addInventoryTitle: 'Add Inventory Duty',
    addInventorySubtitle: 'Equipment handling and rotation rules',
    taskTypeSpecial: 'Special Tasks & Formations',
    taskTypeInventory: 'Inventory & Props Duty',
    taskNameLabel: 'Task Name',
    taskNamePlaceholder: 'e.g. Stage Curtain Cue, Prop Setup, Wave Formation...',
    positionLabel: 'Position / Location',
    positionPlaceholder: 'e.g. Stage Left, Center, Backstage...',
    slotPositionPlaceholder: 'e.g. Stage Left, Center, Backstage...',
    stagePositionsAndSlots: 'Stage Positions & Slots',
    addSlot: '+ Add Slot',
    inventoryItemsList: 'Inventory & Props List',
    addInventoryItem: '+ Add Item',
    itemNameLabel: 'Item / Prop Name',
    itemNamePlaceholder: 'e.g. Cyr Wheel, Heavy Audio Rig, Lighting...',
    genderRequirement: 'Gender Requirement',
    genderAny: 'Any',
    genderFemaleOnly: 'Female Only',
    genderMaleOnly: 'Male Only',
    headcount: 'Headcount',
    rotationCycleLabel: 'Rotation Cycle',
    slotCycleLabel: 'Rotation Cycle',
    slotCycleEveryShow: 'Every Show',
    slotCycleWeekly: '1 Week',
    slotCycleMonthly: 'Monthly',
    slotCycleFixed: 'Fixed / Constant',
    inventoryCycleLabel: 'Shared Inventory Rotation Cycle',
    cycleEveryShow: 'Every Show',
    cycleWeekly: 'Weekly (1 Week Cycle)',
    cycleMonthly: 'Monthly Cycle',
    cycleFixed: 'Fixed (No Rotation)',
    autoRotationOption: 'Auto-rotation (Round-Robin / Fairness Pool)',
    autoRotationDesc: 'System automatically balances roster members based on attendance and gender.',
    manualOption: 'Manual Selection (Fixed Performer)',
    manualOptionDesc: 'Task is permanently bound to a designated performer without auto-rotation.',
    performerLabel: 'Select Performer',
    selectPerformerPlaceholder: 'Select a group member...',
    suggestions: 'Quick Suggestions:',
    cancel: 'Cancel',
    saveTask: 'Save Task & Slots',
    saveInventory: 'Save Inventory Duty',
    taskAddedSuccess: 'Special task & formations added successfully!',
    inventoryAddedSuccess: 'Inventory duties added successfully!',
    taskDeletedSuccess: 'Task removed successfully',
    inventoryDeletedSuccess: 'Inventory duty removed successfully',
    assignedTo: 'Assigned to',
    notAssigned: 'Auto-rotation',
    delete: 'Delete',
    editGroup: 'Edit Group',
    deleteGroupTitle: 'Delete Group',
    deleteGroupConfirm: 'Are you sure you want to delete this ensemble group? Performing members and scheduled shows will be affected.',
    groupDeletedSuccess: (name: string) => `Group "${name}" deleted successfully`,
    groupNotFound: 'Group Not Found',
    groupNotFoundDesc: 'The requested ensemble group does not exist or has been removed.',
  },
  tr: {
    backToGroups: 'Gruplara ve Kadrolara Dön',
    seasonTag: 'Sezon 2026',
    assignTask: 'Görev Ekle',
    addMember: 'Üye Ekle',
    addItem: 'Nesne Ekle',
    bookShow: 'Gösteri Planla',
    addInventory: 'Envanter Ekle',
    totalMembers: 'Toplam Sanatçı',
    readiness: 'Hazır Olma Durumu',
    rotationCycle: 'Rotasyon Döngüsü',
    scheduledShowsCount: 'Planlanan Gösteriler',
    primaryLocation: 'Ana Lokasyon / Konaklama:',
    tabMembers: 'Kadro',
    tabInventory: 'Envanter',
    tabTasks: 'Görevler',
    tabShows: 'Gösteriler',
    ensembleRoster: 'Grup Kadrosu',
    inventoryDuties: 'Sahne Envanter Nöbeti',
    specialTasks: 'Özel Görevler',
    scheduledEvents: 'Planlanmış Gösteriler',
    noMembers: 'Bu grupta henüz sanatçı yok',
    noInventory: 'Envanter nöbeti yapılandırılmamış',
    noTasksTitle: 'Henüz özel görev atanmadı',
    noTasksDesc: 'Yukarıdaki butonla sahne görevleri ekleyebilir ve sanatçılara atayabilirsiniz.',
    noShows: 'Bu grup için planlanmış gösteri bulunamadı',
    dutyRulesExplanation: 'Gösteri planlanırken sistem, bu kurallara göre ekip üyeleri arasında adil rotasyonla nöbet dağıtır.',
    tasksExplanation: 'Özel sahne görevleri, seçilen döngü ve atanan sanatçılara göre gösteriler arasında sırayla atanır.',
    newTaskTitle: 'Sahne Görevi Oluştur',
    newTaskSubtitle: 'Çoklu sahne yuvaları ve sanatçı atamaları',
    addInventoryTitle: 'Envanter Nöbeti Ekle',
    addInventorySubtitle: 'Ekipman yönetimi ve rotasyon kuralları',
    taskTypeSpecial: 'Sahne Görevleri ve Formasyonlar',
    taskTypeInventory: 'Envanter ve Donanım Nöbeti',
    taskNameLabel: 'Görev Adı',
    taskNamePlaceholder: 'Örn. Perde Açma, Sahne Hazırlığı...',
    positionLabel: 'Pozisyon / Sahne Konumu',
    positionPlaceholder: 'Örn. Sahne Solu, Kulise...',
    slotPositionPlaceholder: 'Örn. Sahne Solu, Kulise...',
    stagePositionsAndSlots: 'Sahne Pozisyonları ve Yuvalar',
    addSlot: '+ Yuva Ekle',
    inventoryItemsList: 'Envanter ve Donanım Listesi',
    addInventoryItem: '+ Nesne Ekle',
    itemNameLabel: 'Nesne / Donanım Adı',
    itemNamePlaceholder: 'Örn. Cyr Wheel, Heavy Audio Rig...',
    genderRequirement: 'Cinsiyet Gereksinimi',
    genderAny: 'Herhangi',
    genderFemaleOnly: 'Yalnızca Kadın',
    genderMaleOnly: 'Yalnızca Erkek',
    headcount: 'Kişi Sayısı',
    rotationCycleLabel: 'Rotasyon Döngüsü',
    slotCycleLabel: 'Rotasyon Döngüsü',
    slotCycleEveryShow: 'Her Gösteride',
    slotCycleWeekly: '1 Hafta',
    slotCycleMonthly: 'Aylık',
    slotCycleFixed: 'Sabit / Değişmez',
    inventoryCycleLabel: 'Ortak Envanter Rotasyon Döngüsü',
    cycleEveryShow: 'Her Gösteride',
    cycleWeekly: 'Haftalık (1 Hafta)',
    cycleMonthly: 'Aylık',
    cycleFixed: 'Sabit (Rotasyonsuz)',
    autoRotationOption: 'Otomatik Rotasyon (Round-Robin / Adil Havuz)',
    autoRotationDesc: 'Sistem, sanatçıları devamlılık ve cinsiyete göre dengeli dağıtır.',
    manualOption: 'Manuel Seçim (Sabit Görevli)',
    manualOptionDesc: 'Görev otomatik rotasyona girmeden belirli sanatçıya atanır.',
    performerLabel: 'Sanatçı Seçimi',
    selectPerformerPlaceholder: 'Grup üyesi seçin...',
    suggestions: 'Hızlı Öneriler:',
    cancel: 'İptal',
    saveTask: 'Görevi Kaydet',
    saveInventory: 'Envanteri Kaydet',
    taskAddedSuccess: 'Görev ve yuvalar başarıyla eklendi!',
    inventoryAddedSuccess: 'Envanter nöbeti başarıyla eklendi!',
    taskDeletedSuccess: 'Görev kaldırıldı',
    inventoryDeletedSuccess: 'Envanter nöbeti silindi',
    assignedTo: 'Atanan',
    notAssigned: 'Oto-rotasyon',
    delete: 'Sil',
    editGroup: 'Grubu Düzenle',
    deleteGroupTitle: 'Grubu Sil',
    deleteGroupConfirm: 'Bu grubu silmek istediğinizden emin misiniz? Grup üyeleri ve planlanmış gösteriler etkilenecektir.',
    groupDeletedSuccess: (name: string) => `"${name}" grubu başarıyla silindi`,
    groupNotFound: 'Grup Bulunamadı',
    groupNotFoundDesc: 'İstenen grup mevcut değil veya silinmiş.',
  }
};

export const GroupDetailView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const rawId = (params?.id as string) || '';
  const groupId = rawId ? decodeURIComponent(rawId) : '';

  const { groups, talents, deleteGroup, updateGroup, schedule, venues } = useApp();
  const { openScheduleModal } = useModal();
  const { t, language } = useLanguage();
  const { confirm } = useConfirm();
  const toast = useToast();

  const isKa = language === 'ka';
  const dict = DICT[(language as 'ka' | 'en' | 'tr')] || DICT.en;

  const [activeTab, setActiveTab] = useState<GroupDetailTab>('members');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Task and Inventory creation modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [inventoryModalPerformerId, setInventoryModalPerformerId] = useState('');

  const currentGroup = groups.find((g) => g.id === groupId);

  if (!currentGroup) {
    return (
      <div className="w-full py-12">
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors duration-150 mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-150 shrink-0" />
          <span>{dict.backToGroups}</span>
        </Link>

        <div className="p-12 text-center bg-surface border border-border-subtle rounded-xl shadow-xs">
          <Users size={48} className="mx-auto mb-3 opacity-30 text-text-secondary" />
          <h2 className="text-xl font-bold text-text-primary mb-2">{dict.groupNotFound}</h2>
          <p className="text-sm text-text-secondary mb-6">{dict.groupNotFoundDesc}</p>
          <Link
            href="/groups"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-brand-primary text-white text-sm font-semibold shadow-glow hover:bg-brand-primary-hover transition-all"
          >
            {dict.backToGroups}
          </Link>
        </div>
      </div>
    );
  }

  const members = talents.filter((tItem) => currentGroup.memberTalentIds.includes(tItem.id));
  const maleCount = members.filter((tItem) => tItem.gender === 'Male').length;
  const femaleCount = members.filter((tItem) => tItem.gender === 'Female').length;
  const activeCount = members.filter((tItem) => tItem.status === 'Active').length;
  const nonActiveCount = members.length - activeCount;

  // Split inventory requirements and special tasks
  const allReqs = currentGroup.inventoryRequirements || [];
  const inventoryReqs = allReqs.filter((r) => r.category !== 'special_task');
  const specialTasks = allReqs.filter((r) => r.category === 'special_task');

  // Find scheduled shows for this group
  const groupShows = schedule
    .filter((s) => s.groupId === currentGroup.id)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  // Find associated venue location
  const venueIds = [...new Set(groupShows.map((s) => s.hotelId))];
  const groupVenues = venues.filter((v) => venueIds.includes(v.id));
  const baseVenue = groupVenues[0];
  const primaryVenue = baseVenue
    ? `${baseVenue.name}${baseVenue.city ? `, ${baseVenue.city}` : ''}`
    : null;

  const displayDescription = currentGroup.description?.trim() || '';

  const handleDelete = () => {
    confirm({
      title: dict.deleteGroupTitle,
      message: dict.deleteGroupConfirm,
      itemName: currentGroup.name,
      confirmLabel: dict.delete,
      variant: 'danger',
      onConfirm: () => {
        deleteGroup(currentGroup.id);
        toast.success(dict.groupDeletedSuccess(currentGroup.name));
        router.push('/groups');
      }
    });
  };

  const handleRemoveMember = (talentId: string) => {
    const talent = talents.find((t) => t.id === talentId);
    if (!talent) return;
    const talentName = `${talent.firstName} ${talent.lastName}`;
    confirm({
      title: isKa ? 'დასიდან ამოშლა' : 'Remove from Group',
      message: isKa
        ? `ნამდვილად გსურთ „${talentName}"-ის ამოშლა დასიდან?`
        : `Are you sure you want to remove "${talentName}" from this group?`,
      itemName: talentName,
      confirmLabel: isKa ? 'ამოშლა' : 'Remove',
      variant: 'danger',
      onConfirm: () => {
        updateGroup(currentGroup.id, {
          memberTalentIds: currentGroup.memberTalentIds.filter((id) => id !== talentId)
        });
        toast.success(
          isKa
            ? `„${talentName}" დასიდან ამოიშალა`
            : `"${talentName}" removed from group`
        );
      }
    });
  };


  // Open modal helpers
  const openTaskModal = (initialPerformerId?: string | string[]) => {
    if (Array.isArray(initialPerformerId)) {
      setSelectedTalentIds(initialPerformerId);
    } else if (initialPerformerId) {
      setSelectedTalentIds([initialPerformerId]);
    } else {
      setSelectedTalentIds([]);
    }
    setIsTaskModalOpen(true);
  };

  const openInventoryModal = (initialPerformerId: string = '') => {
    setInventoryModalPerformerId(initialPerformerId);
    setIsInventoryModalOpen(true);
  };

  // Save Special Task
  const handleSaveSpecialTask = (taskName: string, slots: DutySlot[], performerIds?: string[] | string) => {
    if (!taskName.trim()) {
      toast.error(isKa ? 'გთხოვთ მიუთითოთ დავალების დასახელება' : 'Please enter a task name');
      return;
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const validSlots = slots.map((s, idx) => ({
      id: s.id || `slot_${idx + 1}`,
      position: s.position.trim(),
      assignedGender: s.assignedGender,
      rotationCycle: s.rotationCycle || 'every_show',
      headcount: Math.max(1, s.headcount || 1)
    }));

    const talentIdsArray: string[] = Array.isArray(performerIds)
      ? performerIds
      : performerIds
      ? [performerIds]
      : [];

    const newSpecialDutyTask: SpecialDutyTask = {
      id: taskId,
      name: taskName.trim(),
      rotationCycle: validSlots[0]?.rotationCycle || 'every_show',
      slots: validSlots,
      assignedTalentIds: talentIdsArray.length > 0 ? talentIdsArray : undefined,
      assignedTalentId: talentIdsArray.length === 1 ? talentIdsArray[0] : (talentIdsArray.length > 0 ? talentIdsArray[0] : undefined)
    };

    // Flatten slots to inventoryRequirements
    const newSlotRequirements: InventoryRequirement[] = validSlots.map((s, idx) => ({
      id: `${taskId}_slot_${s.id || idx}`,
      itemName: taskName.trim(),
      category: 'special_task',
      position: s.position || undefined,
      assignedGender: s.assignedGender,
      requiredHeadcount: s.headcount,
      rotationCycle: s.rotationCycle || 'every_show',
      assignedTalentId: talentIdsArray.length === 1 ? talentIdsArray[0] : (talentIdsArray.length > 0 ? talentIdsArray[0] : undefined),
      assignedTalentIds: talentIdsArray.length > 0 ? talentIdsArray : undefined,
      parentTaskId: taskId
    }));

    updateGroup(currentGroup.id, {
      inventoryRequirements: [...allReqs, ...newSlotRequirements],
      specialDutyTasks: [...(currentGroup.specialDutyTasks || []), newSpecialDutyTask]
    });

    toast.success(dict.taskAddedSuccess);
    setActiveTab('tasks');
    setIsTaskModalOpen(false);
  };

  // Save Inventory
  const handleSaveInventory = (
    items: Array<{ itemName: string; assignedGender: DutyGenderRequirement; requiredHeadcount: number }>,
    cycle: RotationCycleType,
    performerId?: string
  ) => {
    const validItems = items.filter((i) => i.itemName.trim() !== '');
    if (validItems.length === 0) {
      toast.error(isKa ? 'გთხოვთ შეიყვანოთ მინიმუმ ერთი ნივთი' : 'Please enter at least one inventory item');
      return;
    }

    const newInventoryRequirements: InventoryRequirement[] = validItems.map((item, idx) => ({
      id: `inv_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      itemName: item.itemName.trim(),
      category: 'inventory',
      assignedGender: item.assignedGender,
      requiredHeadcount: Math.max(1, item.requiredHeadcount || 1),
      rotationCycle: cycle,
      assignedTalentId: performerId
    }));

    updateGroup(currentGroup.id, {
      inventoryRequirements: [...allReqs, ...newInventoryRequirements],
      rotationCycleType: cycle
    });

    toast.success(dict.inventoryAddedSuccess);
    setActiveTab('inventory');
    setIsInventoryModalOpen(false);
  };

  // Task delete handler
  const handleDeleteTask = (taskId: string, parentTaskId?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updatedRequirements = allReqs.filter((req) => {
      if (parentTaskId && req.parentTaskId === parentTaskId) return false;
      return req.id !== taskId;
    });
    const updatedSpecialTasks = (currentGroup.specialDutyTasks || []).filter(
      (st) => st.id !== parentTaskId && st.id !== taskId
    );
    updateGroup(currentGroup.id, {
      inventoryRequirements: updatedRequirements,
      specialDutyTasks: updatedSpecialTasks
    });
    toast.success(dict.taskDeletedSuccess);
  };

  // Inventory delete handler
  const handleDeleteInventoryItem = (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updatedRequirements = allReqs.filter((req) => req.id !== itemId);
    updateGroup(currentGroup.id, {
      inventoryRequirements: updatedRequirements
    });
    toast.success(dict.inventoryDeletedSuccess);
  };

  const getCycleLabel = (cycle?: TaskRotationCycle) => {
    switch (cycle) {
      case 'every_show':
        return dict.slotCycleEveryShow;
      case 'weekly':
        return dict.slotCycleWeekly;
      case 'monthly':
        return dict.slotCycleMonthly;
      case 'fixed':
        return dict.slotCycleFixed;
      default:
        return dict.slotCycleEveryShow;
    }
  };

  const tabs: { id: GroupDetailTab; label: string; icon: React.FC<{ size?: number; className?: string }>; count: number }[] = [
    { id: 'members', label: dict.tabMembers, icon: Users, count: members.length },
    { id: 'inventory', label: dict.tabInventory, icon: Package, count: inventoryReqs.length },
    { id: 'tasks', label: dict.tabTasks, icon: Sparkles, count: specialTasks.length },
    { id: 'shows', label: dict.tabShows, icon: Calendar, count: groupShows.length }
  ];

  const getPrimaryAction = () => {
    switch (activeTab) {
      case 'members':
        return {
          label: dict.addMember,
          icon: UserPlus,
          onClick: () => setIsAddMemberModalOpen(true),
        };
      case 'inventory':
        return {
          label: dict.addItem,
          icon: PackagePlus,
          onClick: () => openInventoryModal(),
        };
      case 'shows':
        return {
          label: dict.bookShow,
          icon: CalendarPlus,
          onClick: () => openScheduleModal(),
        };
      case 'tasks':
      default:
        return {
          label: dict.assignTask,
          icon: Plus,
          onClick: () => openTaskModal(),
        };
    }
  };

  const primaryAction = getPrimaryAction();
  const ActionIcon = primaryAction.icon;

  return (
    <div className="w-full pb-16">
      {/* 1. Back Navigation Button */}
      <div className="mb-4">
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors duration-150 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-150 shrink-0" />
          <span>{dict.backToGroups}</span>
        </Link>
      </div>

      {/* 2. Page Header Area */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 sm:p-6 mb-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Header Left */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary m-0">
              {currentGroup.name}
            </h1>

            {displayDescription && (
              <p className="text-sm text-text-secondary mt-1.5 max-w-2xl leading-relaxed m-0">
                {displayDescription}
              </p>
            )}

            {primaryVenue && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-2">
                <MapPin size={14} className="text-danger shrink-0" />
                <span className="font-medium text-text-secondary">{primaryVenue}</span>
              </div>
            )}
          </div>

          {/* Header Right Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Context-Aware Primary Action Button */}
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold rounded-pill px-4 py-2.5 bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none whitespace-nowrap"
            >
              <ActionIcon size={16} strokeWidth={2.2} />
              <span>{primaryAction.label}</span>
            </button>

            {/* Secondary Action: ჯგუფის რედაქტირება */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium rounded-pill px-4 py-2.5 border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary hover:border-border-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none whitespace-nowrap"
            >
              <Edit2 size={15} />
              <span>{dict.editGroup}</span>
            </button>

            {/* Danger Action: წაშლა */}
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium rounded-pill px-3.5 py-2.5 border border-danger/30 bg-surface text-danger hover:bg-danger/10 hover:border-danger hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none whitespace-nowrap"
            >
              <Trash2 size={15} />
              <span>{dict.delete}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. KPI / Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title={dict.totalMembers}
          value={members.length}
          subtitle={`${maleCount} ${t('males')}, ${femaleCount} ${t('females')}`}
          icon={<Users size={18} strokeWidth={2.2} />}
          iconBgColor="bg-brand-primary/10 text-brand-primary"
        />

        <StatCard
          title={dict.readiness}
          value={activeCount}
          subtitle={nonActiveCount > 0 ? `${nonActiveCount} ${t('unavailable')}` : (isKa ? 'ყველა აქტიური' : 'All active')}
          subtitleColor={nonActiveCount > 0 ? 'text-danger font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}
          icon={<ShieldCheck size={18} strokeWidth={2.2} />}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title={dict.rotationCycle}
          value={`${currentGroup.rotationCycleWeeks} ${isKa ? 'კვირა' : 'weeks'}`}
          subtitle={isKa ? 'სამართლიანი როტაცია' : 'Fair rotation'}
          icon={<Clock size={18} strokeWidth={2.2} />}
          iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* 4. Full-Width Border-Bottom Tab Strip */}
      <div className="border-b border-border-subtle mb-6">
        <nav className="flex items-center gap-6 sm:gap-8 -mb-px overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 py-3 px-1 border-b-2 text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-medium'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-primary' : 'text-text-secondary'} />
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-pill font-bold transition-colors ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'bg-surface-secondary text-text-secondary'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 5. Tab Content Area */}
      <div>
        {activeTab === 'members' && (
          <GroupRosterTab
            members={members}
            currentGroup={currentGroup}
            onAssignTask={(performerId) => openTaskModal(performerId)}
            onRemoveMember={handleRemoveMember}
            dict={dict}
            isKa={isKa}
          />
        )}

        {activeTab === 'inventory' && (
          <GroupInventoryTab
            inventoryReqs={inventoryReqs}
            onAddInventory={() => openInventoryModal()}
            onDeleteInventory={handleDeleteInventoryItem}
            dict={dict}
            isKa={isKa}
          />
        )}

        {activeTab === 'tasks' && (
          <GroupTasksTab
            specialTasks={specialTasks}
            talents={talents}
            onAddTask={() => openTaskModal()}
            onDeleteTask={handleDeleteTask}
            getCycleLabel={getCycleLabel}
            dict={dict}
            isKa={isKa}
          />
        )}

        {activeTab === 'shows' && (
          <GroupShowsTab
            groupShows={groupShows}
            venues={venues}
            dict={dict}
            isKa={isKa}
          />
        )}
      </div>

      {/* Edit Group Modal (Name, Description, Cast Members only) */}
      <GroupFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingGroup={currentGroup}
      />

      {/* Add Member Modal (compact, available-talents-only) */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        currentGroup={currentGroup}
      />

      {/* Special Task Assignment Modal (Multi-Slot Builder) */}
      <TaskAssignmentModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        currentGroup={currentGroup}
        members={members}
        initialTalentIds={selectedTalentIds}
        selectedTalentIds={selectedTalentIds}
        onSaveSpecialTask={handleSaveSpecialTask}
        dict={dict}
        isKa={isKa}
      />

      {/* Inventory Duty Modal */}
      <InventoryDutyModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        currentGroup={currentGroup}
        members={members}
        initialPerformerId={inventoryModalPerformerId}
        onSaveInventory={handleSaveInventory}
        dict={dict}
        isKa={isKa}
      />
    </div>
  );
};
