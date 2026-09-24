'use client';

import React, { useState, useEffect } from 'react';
import { Group } from '../../types/group';
import { Talent } from '../../types/talent';
import { Drawer } from '../common/Drawer';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import {
  InventoryRequirement,
  TaskRotationCycle,
  COMMON_SPECIAL_TASKS,
  COMMON_STAGE_POSITIONS
} from '../../types/inventory';
import {
  Users,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  ShieldCheck,
  Package,
  Sparkles,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Plus,
  X,
  CheckSquare
} from 'lucide-react';

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  talents: Talent[];
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
}

type GroupDetailTab = 'members' | 'inventory' | 'tasks' | 'shows';

const DICT = {
  ka: {
    seasonTag: 'სეზონი 2026',
    assignTask: 'დავალების დამატება',
    totalMembers: 'სულ წევრები',
    readiness: 'მზადყოფნა',
    rotationCycle: 'როტაციის ციკლი',
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
    // Task modal
    newTaskTitle: 'ახალი დავალების დამატება',
    newTaskSubtitle: 'მიუთითეთ დავალების სახელი, პოზიცია, შემსრულებელი და როტაციის ციკლი',
    taskNameLabel: 'დავალების დასახელება',
    taskNamePlaceholder: 'მაგ. ფარდის გაწევა, სცენის მომზადება...',
    positionLabel: 'პოზიცია / ლოკაცია',
    positionPlaceholder: 'მაგ. სცენის მარცხენა, კულისები...',
    performerLabel: 'შემსრულებლის არჩევა',
    autoRotateOption: 'ავტომატური როტაცია (ნებისმიერი წევრი)',
    rotationCycleLabel: 'როტაციის ციკლი',
    cycleEveryShow: 'ყოველ შოუზე (Every Show)',
    cycleWeekly: 'ყოველკვირეული (1 კვირა)',
    cycleMonthly: 'ყოველთვიური (1 თვე)',
    cycleFixed: 'ფიქსირებული (არ როტირებს)',
    suggestions: 'შემოთავაზებები:',
    cancel: 'გაუქმება',
    saveTask: 'დავალების დამატება',
    taskAddedSuccess: 'დავალება წარმატებით დაემატა!',
    taskDeletedSuccess: 'დავალება წაიშალა',
    assignedTo: 'შემსრულებელი',
    notAssigned: 'ავტო-როტაცია',
    delete: 'წაშლა',
    close: 'დახურვა',
    editGroup: 'ჯგუფის რედაქტირება',
    deleteGroupTitle: 'ჯგუფის წაშლა',
    deleteGroupConfirm: 'ნამდვილად გსურთ ამ ჯგუფის წაშლა? ჯგუფის წევრები და დაგეგმილი შოუები გათავისუფლდება.',
    groupDeletedSuccess: (name: string) => `ჯგუფი „${name}“ წარმატებით წაიშალა`,
  },
  en: {
    seasonTag: 'Season 2026',
    assignTask: 'Assign Task',
    totalMembers: 'Total Members',
    readiness: 'Readiness',
    rotationCycle: 'Rotation Cycle',
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
    // Task modal
    newTaskTitle: 'Assign Special Task',
    newTaskSubtitle: 'Specify task title, stage position, performer, and rotation cycle',
    taskNameLabel: 'Task Name',
    taskNamePlaceholder: 'e.g. Stage Curtain Cue, Prop Setup...',
    positionLabel: 'Position / Stage Location',
    positionPlaceholder: 'e.g. Stage Left, Backstage...',
    performerLabel: 'Select Performer',
    autoRotateOption: 'Auto-rotation (Any group member)',
    rotationCycleLabel: 'Rotation Cycle',
    cycleEveryShow: 'Every Show',
    cycleWeekly: 'Weekly (1 Week)',
    cycleMonthly: 'Monthly',
    cycleFixed: 'Fixed (No Rotation)',
    suggestions: 'Quick Suggestions:',
    cancel: 'Cancel',
    saveTask: 'Assign Task',
    taskAddedSuccess: 'Special task assigned successfully!',
    taskDeletedSuccess: 'Task removed successfully',
    assignedTo: 'Assigned to',
    notAssigned: 'Auto-rotation',
    delete: 'Delete',
    close: 'Close',
    editGroup: 'Edit Group',
    deleteGroupTitle: 'Delete Group',
    deleteGroupConfirm: 'Are you sure you want to delete this ensemble group? Performing members and scheduled shows will be affected.',
    groupDeletedSuccess: (name: string) => `Group "${name}" deleted successfully`,
  },
  tr: {
    seasonTag: 'Sezon 2026',
    assignTask: 'Görev Ata',
    totalMembers: 'Toplam Sanatçı',
    readiness: 'Hazır Olma Durumu',
    rotationCycle: 'Rotasyon Döngüsü',
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
    // Task modal
    newTaskTitle: 'Özel Görev Ata',
    newTaskSubtitle: 'Görev adı, sahne konumu, sanatçı ve rotasyon döngüsü belirleyin',
    taskNameLabel: 'Görev Adı',
    taskNamePlaceholder: 'Örn. Perde Açma, Sahne Hazırlığı...',
    positionLabel: 'Pozisyon / Sahne Konumu',
    positionPlaceholder: 'Örn. Sahne Solu, Kulise...',
    performerLabel: 'Sanatçı Seçimi',
    autoRotateOption: 'Otomatik Rotasyon (Tüm Üyeler)',
    rotationCycleLabel: 'Rotasyon Döngüsü',
    cycleEveryShow: 'Her Gösteride',
    cycleWeekly: 'Haftalık (1 Hafta)',
    cycleMonthly: 'Aylık',
    cycleFixed: 'Sabit (Rotasyonsuz)',
    suggestions: 'Hızlı Öneriler:',
    cancel: 'İptal',
    saveTask: 'Görevi Kaydet',
    taskAddedSuccess: 'Görev başarıyla eklendi!',
    taskDeletedSuccess: 'Görev kaldırıldı',
    assignedTo: 'Atanan',
    notAssigned: 'Oto-rotasyon',
    delete: 'Sil',
    close: 'Kapat',
    editGroup: 'Grubu Düzenle',
    deleteGroupTitle: 'Grubu Sil',
    deleteGroupConfirm: 'Bu grubu silmek istediğinizden emin misiniz? Grup üyeleri ve planlanmış gösteriler etkilenecektir.',
    groupDeletedSuccess: (name: string) => `"${name}" grubu başarıyla silindi`,
  }
};

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  isOpen,
  onClose,
  group,
  talents,
  onEdit,
  onDelete
}) => {
  const { t, language } = useLanguage();
  const { groups, updateGroup, schedule, venues } = useApp();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';
  const dict = DICT[(language as 'ka' | 'en' | 'tr')] || DICT.en;

  const [activeTab, setActiveTab] = useState<GroupDetailTab>('members');

  // Task creation dialog state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskPosition, setTaskPosition] = useState('');
  const [taskPerformerId, setTaskPerformerId] = useState('');
  const [taskRotationCycle, setTaskRotationCycle] = useState<TaskRotationCycle>('every_show');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('members');
      setIsTaskModalOpen(false);
    }
  }, [isOpen, group?.id]);

  if (!group) return null;

  // Always use the latest group from context if available
  const currentGroup = groups.find((g) => g.id === group.id) || group;

  const members = talents.filter((tItem) => currentGroup.memberTalentIds.includes(tItem.id));
  const maleCount = members.filter((tItem) => tItem.gender === 'Male').length;
  const femaleCount = members.filter((tItem) => tItem.gender === 'Female').length;
  const activeCount = members.filter((tItem) => tItem.status === 'Active').length;
  const nonActiveCount = members.length - activeCount;

  // Split inventory and special tasks
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
  const primaryVenue = groupVenues[0]
    ? `${groupVenues[0].name}${groupVenues[0].city ? `, ${groupVenues[0].city}` : ''}`
    : currentGroup.description || (isKa ? 'ანთალია, თურქეთი' : 'Antalya, Turkey');

  const handleDelete = () => {
    confirm({
      title: dict.deleteGroupTitle,
      message: dict.deleteGroupConfirm,
      itemName: currentGroup.name,
      confirmLabel: dict.delete,
      variant: 'danger',
      onConfirm: () => {
        onDelete(currentGroup.id);
        toast.success(dict.groupDeletedSuccess(currentGroup.name));
        onClose();
      }
    });
  };

  const handleOpenEdit = () => {
    onClose();
    onEdit(currentGroup);
  };

  // Task creation handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      toast.error(isKa ? 'გთხოვთ მიუთითოთ დავალების დასახელება' : 'Please enter a task name');
      return;
    }

    const newTask: InventoryRequirement = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      itemName: taskName.trim(),
      category: 'special_task',
      assignedGender: 'Any',
      requiredHeadcount: 1,
      position: taskPosition.trim() || undefined,
      rotationCycle: taskRotationCycle,
      assignedTalentId: taskPerformerId || undefined
    };

    const updatedRequirements = [...allReqs, newTask];

    updateGroup(currentGroup.id, {
      inventoryRequirements: updatedRequirements
    });

    toast.success(dict.taskAddedSuccess);
    setActiveTab('tasks');
    setIsTaskModalOpen(false);

    // Reset inputs
    setTaskName('');
    setTaskPosition('');
    setTaskPerformerId('');
    setTaskRotationCycle('every_show');
  };

  // Task delete handler
  const handleDeleteTask = (taskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updatedRequirements = allReqs.filter((req) => req.id !== taskId);
    updateGroup(currentGroup.id, {
      inventoryRequirements: updatedRequirements
    });
    toast.success(dict.taskDeletedSuccess);
  };

  const getCycleLabel = (cycle?: TaskRotationCycle) => {
    switch (cycle) {
      case 'every_show':
        return dict.cycleEveryShow;
      case 'weekly':
        return dict.cycleWeekly;
      case 'monthly':
        return dict.cycleMonthly;
      case 'fixed':
        return dict.cycleFixed;
      default:
        return dict.cycleEveryShow;
    }
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        width="680px"
      >
        <div className="flex flex-col h-full bg-surface text-text-primary">
          {/* Top Sticky Header with Permanent Quick Action Button */}
          <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-border-subtle p-5 sm:p-6 pr-14">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-text-primary truncate">
                    {currentGroup.name}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-pill bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                    {dict.seasonTag}
                  </span>
                </div>
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {currentGroup.description || t('group_details_sub')}
                </p>
              </div>

              {/* Header Action: + დავალების დამატება / + Assign Task */}
              <div className="shrink-0 flex items-center">
                <button
                  type="button"
                  id="btn-drawer-assign-task"
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  <Plus size={14} className="shrink-0" strokeWidth={2.2} />
                  <span>{dict.assignTask}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Members Stat */}
              <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                  <Users size={14} className="text-text-primary shrink-0" />
                  <span className="truncate">{dict.totalMembers}</span>
                </div>
                <div className="text-xl font-extrabold text-text-primary mt-1 leading-tight">
                  {members.length}
                </div>
                <div className="text-xs text-text-secondary mt-0.5 truncate">
                  {maleCount} {t('males')}, {femaleCount} {t('females')}
                </div>
              </div>

              {/* Readiness Stat */}
              <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span className="truncate">{dict.readiness}</span>
                </div>
                <div className={`text-xl font-extrabold mt-1 leading-tight truncate ${nonActiveCount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {activeCount} {t('filter_active')}
                </div>
                <div className={`text-xs mt-0.5 truncate ${nonActiveCount > 0 ? 'text-danger' : 'text-text-secondary'}`}>
                  {nonActiveCount > 0 ? `${nonActiveCount} ${t('unavailable')}` : t('all_active')}
                </div>
              </div>

              {/* Rotation Cycle */}
              <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                  <Clock size={14} className="text-text-primary shrink-0" />
                  <span className="truncate">{dict.rotationCycle}</span>
                </div>
                <div className="text-xl font-extrabold text-text-primary mt-1 leading-tight truncate">
                  {currentGroup.rotationCycleWeeks} {isKa ? 'კვირა' : 'wks'}
                </div>
                <div className="text-xs text-text-secondary mt-0.5 truncate">
                  {isKa ? 'სამართლიანი როტაცია' : 'Fair-random'}
                </div>
              </div>
            </div>

            {/* Location & Info Banner */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-sm bg-brand-primary/10 border border-brand-primary/30 text-xs text-text-primary">
              <MapPin size={15} className="text-brand-primary shrink-0" />
              <span>
                <strong className="font-bold">{dict.primaryLocation}</strong> {primaryVenue}
              </span>
            </div>

            {/* Tab Navigation: 4 Tabs Pill Bar */}
            <div className="flex items-center bg-surface-secondary rounded-pill p-1 border border-border-subtle gap-1 h-[46px] box-border">
              {/* Tab 1: Members */}
              <button
                type="button"
                onClick={() => setActiveTab('members')}
                title={dict.ensembleRoster}
                className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-2 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${activeTab === 'members'
                    ? 'font-bold bg-brand-primary text-white shadow-glow'
                    : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                <Users size={14} className="shrink-0" />
                <span className="truncate">{dict.tabMembers}</span>
                <span
                  className={`text-[0.675rem] font-bold rounded-pill px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0 transition-colors ${activeTab === 'members'
                      ? 'bg-white text-brand-primary shadow-xs'
                      : 'bg-surface border border-border-subtle text-text-secondary'
                    }`}
                >
                  {members.length}
                </span>
              </button>

              {/* Tab 2: Inventory */}
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                title={dict.inventoryDuties}
                className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-2 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${activeTab === 'inventory'
                    ? 'font-bold bg-brand-primary text-white shadow-glow'
                    : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                <Package size={14} className="shrink-0" />
                <span className="truncate">{dict.tabInventory}</span>
                <span
                  className={`text-[0.675rem] font-bold rounded-pill px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0 transition-colors ${activeTab === 'inventory'
                      ? 'bg-white text-brand-primary shadow-xs'
                      : 'bg-surface border border-border-subtle text-text-secondary'
                    }`}
                >
                  {inventoryReqs.length}
                </span>
              </button>

              {/* Tab 3: Tasks */}
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                title={dict.specialTasks}
                className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-2 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${activeTab === 'tasks'
                    ? 'font-bold bg-brand-primary text-white shadow-glow'
                    : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                <CheckSquare size={14} className="shrink-0" />
                <span className="truncate">{dict.tabTasks}</span>
                <span
                  className={`text-[0.675rem] font-bold rounded-pill px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0 transition-colors ${activeTab === 'tasks'
                      ? 'bg-white text-brand-primary shadow-xs'
                      : 'bg-surface border border-border-subtle text-text-secondary'
                    }`}
                >
                  {specialTasks.length}
                </span>
              </button>

              {/* Tab 4: Shows */}
              <button
                type="button"
                onClick={() => setActiveTab('shows')}
                title={dict.scheduledEvents}
                className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-2 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${activeTab === 'shows'
                    ? 'font-bold bg-brand-primary text-white shadow-glow'
                    : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                <Calendar size={14} className="shrink-0" />
                <span className="truncate">{dict.tabShows}</span>
                <span
                  className={`text-[0.675rem] font-bold rounded-pill px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0 transition-colors ${activeTab === 'shows'
                      ? 'bg-white text-brand-primary shadow-xs'
                      : 'bg-surface border border-border-subtle text-text-secondary'
                    }`}
                >
                  {groupShows.length}
                </span>
              </button>
            </div>

            {/* TAB 1: ENSEMBLE ROSTER */}
            {activeTab === 'members' && (
              <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-primary m-0 uppercase tracking-wider">
                    {dict.ensembleRoster} ({members.length})
                  </h4>
                  <span className="text-xs text-text-secondary">
                    {t('performers_count', { count: members.length })}
                  </span>
                </div>

                <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface-secondary p-2.5">
                  {members.length === 0 ? (
                    <div className="p-8 text-center text-xs text-text-secondary">
                      {dict.noMembers}
                    </div>
                  ) : (
                    members.map((member) => {
                      const isActive = member.status === 'Active';
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2.5 sm:px-3 bg-surface rounded-sm border border-border-subtle gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={
                                member.avatarUrl ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}${member.lastName}`
                              }
                              alt={member.firstName}
                              className="w-9 h-9 rounded-full object-cover border-2 border-border-subtle shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-text-primary truncate">
                                {member.firstName} {member.lastName}
                              </div>
                              <div className="text-xs text-text-secondary flex items-center gap-1.5 flex-wrap">
                                <span>{member.primarySkill}</span>
                                {member.primarySkill && <span className="opacity-40">/</span>}
                                <span>{member.gender === 'Male' ? (isKa ? 'კაცი' : 'Male') : (isKa ? 'ქალი' : 'Female')}</span>
                                {member.heightCm && (
                                  <>
                                    <span className="opacity-40">/</span>
                                    <span>{member.heightCm} სმ</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-pill inline-flex items-center gap-1 ${isActive
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-danger/10 text-danger'
                                }`}
                            >
                              {isActive ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                              <span>{member.status}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: INVENTORY REQUIREMENTS */}
            {activeTab === 'inventory' && (
              <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
                <div>
                  <h4 className="text-sm font-bold text-text-primary m-0 uppercase tracking-wider">
                    {dict.inventoryDuties} ({inventoryReqs.length})
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    {isKa
                      ? 'შოუს დროს ინვენტარის მომზადებასა და გადატანაზე პასუხისმგებელი მორიგეების წესები'
                      : 'Crew duty requirements for equipment setup and handling during shows'}
                  </p>
                </div>

                {inventoryReqs.length === 0 ? (
                  <div className="p-8 rounded-sm bg-surface-secondary border border-dashed border-border-medium text-xs text-text-secondary text-center">
                    {dict.noInventory}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {inventoryReqs.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 px-3.5 rounded-sm bg-surface border border-border-subtle flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Package size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-text-primary truncate">
                              {req.itemName}
                            </div>
                            <div className="text-xs text-text-secondary mt-0.5">
                              {isKa ? 'ინვენტარი / რეკვიზიტი' : 'Equipment / Prop'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                          <span className="px-2.5 py-1 rounded-pill bg-surface-secondary border border-border-subtle text-xs font-semibold text-text-primary inline-flex items-center gap-1.5">
                            <Users size={12} />
                            <span>{isKa ? `${req.requiredHeadcount} მორიგე` : `${req.requiredHeadcount} crew`}</span>
                          </span>

                          <span
                            className={`px-2.5 py-1 rounded-pill text-xs font-semibold inline-flex items-center gap-1 border ${req.assignedGender === 'Male Only'
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                                : req.assignedGender === 'Female Only'
                                  ? 'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-300'
                                  : 'bg-surface-secondary border-border-subtle text-text-secondary'
                              }`}
                          >
                            <User size={12} />
                            <span>
                              {req.assignedGender === 'Male Only'
                                ? (isKa ? 'მხოლოდ კაცები' : 'Male Only')
                                : req.assignedGender === 'Female Only'
                                  ? (isKa ? 'მხოლოდ ქალები' : 'Female Only')
                                  : (isKa ? 'ნებისმიერი სქესი' : 'Any Gender')}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="mt-1 p-2.5 px-3 rounded-md bg-surface-secondary text-xs text-text-secondary flex items-center gap-1.5 leading-relaxed">
                      <Info size={13} className="shrink-0 text-text-secondary" />
                      <span>{dict.dutyRulesExplanation}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TASKS (SPECIAL TASKS) */}
            {activeTab === 'tasks' && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary m-0 uppercase tracking-wider">
                      {dict.specialTasks} ({specialTasks.length})
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      {isKa
                        ? 'შოუს დროს არტისტებზე განაწილებული ინდივიდუალური მოვალეობები და პოზიციები'
                        : 'Custom duties, stage positions, and assigned performers for shows'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTaskModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-white transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>{dict.assignTask}</span>
                  </button>
                </div>

                {specialTasks.length === 0 ? (
                  <div className="p-8 rounded-lg bg-surface-secondary border border-dashed border-border-medium flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-primary">
                        {dict.noTasksTitle}
                      </div>
                      <div className="text-xs text-text-secondary mt-1 max-w-sm">
                        {dict.noTasksDesc}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTaskModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>{dict.assignTask}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {specialTasks.map((task) => {
                      const assignedMember = task.assignedTalentId
                        ? talents.find((tItem) => tItem.id === task.assignedTalentId)
                        : null;

                      return (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-lg bg-surface border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-border-medium transition-all"
                        >
                          {/* Task Info & Badges */}
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                              <Sparkles size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-text-primary truncate">
                                {task.itemName}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap mt-1.5">
                                {task.position && (
                                  <span className="inline-flex items-center gap-1 text-[0.725rem] font-medium px-2 py-0.5 rounded-md bg-surface-secondary border border-border-subtle text-text-secondary">
                                    <MapPin size={11} className="text-text-primary" />
                                    <span>{task.position}</span>
                                  </span>
                                )}

                                <span className="inline-flex items-center gap-1 text-[0.725rem] font-medium px-2 py-0.5 rounded-md bg-surface-secondary border border-border-subtle text-text-secondary">
                                  <Clock size={11} className="text-text-primary" />
                                  <span>{getCycleLabel(task.rotationCycle)}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Performer Assignment & Delete Action */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle shrink-0">
                            {assignedMember ? (
                              <div className="flex items-center gap-2 bg-surface-secondary px-2.5 py-1.5 rounded-lg border border-border-subtle">
                                <img
                                  src={
                                    assignedMember.avatarUrl ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedMember.firstName}${assignedMember.lastName}`
                                  }
                                  alt={assignedMember.firstName}
                                  className="w-6 h-6 rounded-full object-cover border border-border-subtle shrink-0"
                                />
                                <div className="text-left">
                                  <div className="text-xs font-semibold text-text-primary leading-none truncate max-w-[120px]">
                                    {assignedMember.firstName} {assignedMember.lastName}
                                  </div>
                                  <div className="text-[0.675rem] text-text-secondary leading-none mt-0.5 truncate max-w-[120px]">
                                    {assignedMember.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer')}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-surface-secondary border border-border-subtle text-xs text-text-secondary">
                                <Users size={12} />
                                <span>{dict.notAssigned}</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              title={dict.delete}
                              className="w-7 h-7 rounded-md inline-flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="mt-1 p-2.5 px-3 rounded-md bg-surface-secondary text-xs text-text-secondary flex items-center gap-1.5 leading-relaxed">
                      <Info size={13} className="shrink-0 text-text-secondary" />
                      <span>{dict.tasksExplanation}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SCHEDULED SHOWS */}
            {activeTab === 'shows' && (
              <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-primary m-0 uppercase tracking-wider">
                    {dict.scheduledEvents} ({groupShows.length})
                  </h4>
                  <span className="text-xs text-text-secondary font-medium">
                    {isKa ? `სულ: ${groupShows.length} შოუ` : `Total: ${groupShows.length} shows`}
                  </span>
                </div>

                {groupShows.length === 0 ? (
                  <div className="p-8 rounded-sm bg-surface-secondary border border-dashed border-border-medium text-xs text-text-secondary text-center">
                    {dict.noShows}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {groupShows.map((show) => {
                      const venue = venues.find((v) => v.id === show.hotelId);
                      const startDate = new Date(show.startDateTime);
                      return (
                        <div
                          key={show.id}
                          className="flex items-center justify-between p-2.5 px-3.5 bg-surface rounded-sm border border-border-subtle gap-3 shadow-xs"
                        >
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-text-primary">
                              {show.title}
                            </div>
                            <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5">
                              <MapPin size={12} />
                              <span>{venue?.name || 'Hotel'} ({venue?.city || ''})</span>
                            </div>
                          </div>

                          <div className="text-right text-xs">
                            <div className="font-semibold text-text-primary">
                              {startDate.toLocaleDateString(isKa ? 'ka-GE' : 'en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-text-secondary">
                              {show.startDateTime.split('T')[1]?.slice(0, 5)} - {show.endDateTime.split('T')[1]?.slice(0, 5)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Drawer Footer */}
          <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border-t border-border-subtle p-4 sm:px-6 flex items-center justify-between gap-3 z-10">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-danger-border bg-surface text-danger hover:bg-danger/10 transition-all duration-150 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>{dict.delete}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer"
              >
                {dict.close}
              </button>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
              >
                <Edit2 size={14} />
                <span>{dict.editGroup}</span>
              </button>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Task Creation Dialog Modal */}
      {isTaskModalOpen && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-surface-overlay backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsTaskModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-surface border border-border-subtle rounded-xl shadow-modal overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-start justify-between gap-3 bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary leading-tight">
                    {dict.newTaskTitle}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {dict.newTaskSubtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="w-8 h-8 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTask} className="p-4 sm:p-5 flex flex-col gap-4">
              {/* Field 1: Task Name */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  {dict.taskNameLabel} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder={dict.taskNamePlaceholder}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />

                {/* Suggestions Chips */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[0.7rem] text-text-secondary font-medium">
                    {dict.suggestions}
                  </span>
                  {COMMON_SPECIAL_TASKS.slice(0, 4).map((taskPreset) => (
                    <button
                      key={taskPreset}
                      type="button"
                      onClick={() => setTaskName(taskPreset)}
                      className="text-[0.7rem] px-2 py-0.5 rounded-md bg-surface-secondary hover:bg-surface-tertiary border border-border-subtle text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                    >
                      {taskPreset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Position */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  {dict.positionLabel}
                </label>
                <input
                  type="text"
                  value={taskPosition}
                  onChange={(e) => setTaskPosition(e.target.value)}
                  placeholder={dict.positionPlaceholder}
                  list="positions-datalist"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
                <datalist id="positions-datalist">
                  {COMMON_STAGE_POSITIONS.map((pos) => (
                    <option key={pos} value={pos} />
                  ))}
                </datalist>

                {/* Quick Position Chips */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[0.7rem] text-text-secondary font-medium">
                    {dict.suggestions}
                  </span>
                  {COMMON_STAGE_POSITIONS.slice(0, 4).map((posPreset) => (
                    <button
                      key={posPreset}
                      type="button"
                      onClick={() => setTaskPosition(posPreset)}
                      className="text-[0.7rem] px-2 py-0.5 rounded-md bg-surface-secondary hover:bg-surface-tertiary border border-border-subtle text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                    >
                      {posPreset.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Assign Performer (Group Member) */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  {dict.performerLabel}
                </label>
                <select
                  value={taskPerformerId}
                  onChange={(e) => setTaskPerformerId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-border-subtle bg-surface text-sm text-text-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all cursor-pointer"
                >
                  <option value="">{dict.autoRotateOption}</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.primarySkill || member.gender})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 4: Rotation Cycle */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  {dict.rotationCycleLabel}
                </label>
                <select
                  value={taskRotationCycle}
                  onChange={(e) => setTaskRotationCycle(e.target.value as TaskRotationCycle)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-border-subtle bg-surface text-sm text-text-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all cursor-pointer"
                >
                  <option value="every_show">{dict.cycleEveryShow}</option>
                  <option value="weekly">{dict.cycleWeekly}</option>
                  <option value="monthly">{dict.cycleMonthly}</option>
                  <option value="fixed">{dict.cycleFixed}</option>
                </select>
              </div>

              {/* Form Footer */}
              <div className="pt-3.5 border-t border-border-subtle flex items-center justify-end gap-2.5 mt-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary transition-all cursor-pointer"
                >
                  {dict.cancel}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>{dict.saveTask}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export const GroupDetailDrawer = GroupDetailModal;
