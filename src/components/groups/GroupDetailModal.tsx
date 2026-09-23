'use client';

import React, { useState, useEffect } from 'react';
import { Group } from '../../types/group';
import { Talent } from '../../types/talent';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  ShieldCheck,
  Package,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar
} from 'lucide-react';

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  talents: Talent[];
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
}

type GroupDetailTab = 'members' | 'inventory' | 'shows';

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  isOpen,
  onClose,
  group,
  talents,
  onEdit,
  onDelete
}) => {
  const { t, language } = useLanguage();
  const { schedule, venues } = useApp();
  const { confirm } = useConfirm();
  const toast = useToast();
  const isKa = language === 'ka';

  const [activeTab, setActiveTab] = useState<GroupDetailTab>('members');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('members');
    }
  }, [isOpen, group?.id]);

  if (!group) return null;

  const members = talents.filter((tItem) => group.memberTalentIds.includes(tItem.id));
  const maleCount = members.filter((tItem) => tItem.gender === 'Male').length;
  const femaleCount = members.filter((tItem) => tItem.gender === 'Female').length;
  const activeCount = members.filter((tItem) => tItem.status === 'Active').length;
  const nonActiveCount = members.length - activeCount;

  // Find scheduled shows for this group
  const groupShows = schedule
    .filter((s) => s.groupId === group.id)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  // Find associated venue location
  const venueIds = [...new Set(groupShows.map((s) => s.hotelId))];
  const groupVenues = venues.filter((v) => venueIds.includes(v.id));
  const primaryVenue = groupVenues[0]
    ? `${groupVenues[0].name}${groupVenues[0].city ? `, ${groupVenues[0].city}` : ''}`
    : group.description || (language === 'ka' ? 'ანთალია, თურქეთი' : 'Antalya, Turkey');

  const handleDelete = () => {
    confirm({
      title: language === 'ka' ? 'ჯგუფის წაშლა' : 'Delete Group',
      message: language === 'ka'
        ? 'ნამდვილად გსურთ ამ ჯგუფის წაშლა? ჯგუფის წევრები და დაგეგმილი შოუები გათავისუფლდება.'
        : `Are you sure you want to delete this ensemble group? Performing members and scheduled shows will be affected.`,
      itemName: group.name,
      confirmLabel: language === 'ka' ? 'წაშლა' : 'Delete',
      variant: 'danger',
      onConfirm: () => {
        onDelete(group.id);
        toast.success(
          isKa
            ? `ჯგუფი „${group.name}“ წარმატებით წაიშალა`
            : `Group "${group.name}" deleted successfully`
        );
        onClose();
      }
    });
  };

  const handleOpenEdit = () => {
    onClose();
    onEdit(group);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${group.name} · ${t('season_tag')}`}
      subtitle={group.description || t('group_details_sub')}
      maxWidth="620px"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-pill text-sm font-medium border border-danger-border bg-surface text-danger hover:bg-danger-light transition-all duration-150 cursor-pointer"
          >
            <Trash2 size={15} />
            <span>{t('delete')}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer"
            >
              {t('close')}
            </button>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-pill text-sm font-medium bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
            >
              <Edit2 size={15} />
              <span>{t('edit_group')}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4.5">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Members Stat */}
          <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <Users size={14} className="text-text-primary shrink-0" />
              <span className="truncate">
                {language === 'ka' ? 'სულ წევრები' : 'Total Members'}
              </span>
            </div>
            <div className="text-xl font-extrabold text-text-primary mt-1 leading-tight">
              {members.length}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 truncate">
              {maleCount} {t('males')} • {femaleCount} {t('females')}
            </div>
          </div>

          {/* Readiness Stat */}
          <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span className="truncate">
                {language === 'ka' ? 'მზადყოფნა' : 'Readiness'}
              </span>
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
              <span className="truncate">
                {language === 'ka' ? 'როტაციის ციკლი' : 'Rotation Cycle'}
              </span>
            </div>
            <div className="text-xl font-extrabold text-text-primary mt-1 leading-tight truncate">
              {group.rotationCycleWeeks} {language === 'ka' ? 'კვირა' : 'wks'}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 truncate">
              {language === 'ka' ? 'სამართლიანი როტაცია' : 'Fair-random'}
            </div>
          </div>
        </div>

        {/* Location & Info Banner */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-sm bg-brand-primary/10 border border-brand-primary/30 text-xs text-text-primary">
          <MapPin size={15} className="text-brand-primary shrink-0" />
          <span>
            <strong className="font-bold">{language === 'ka' ? 'მთავარი ლოკაცია / ბაზირება:' : 'Primary Destination / Base:'}</strong> {primaryVenue}
          </span>
        </div>

        {/* Tab Navigation Pill - Matching Talent Modal Style */}
        <div className="flex items-center bg-surface-secondary rounded-pill p-1 border border-border-subtle gap-1.5 h-[46px] box-border">
          {/* Tab 1 Button: Members */}
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            title={language === 'ka' ? 'დასის შემადგენლობა' : 'Ensemble Roster'}
            className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-2.5 sm:px-4 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
              activeTab === 'members'
                ? 'font-bold bg-brand-primary text-white shadow-glow'
                : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users size={15} className="shrink-0" />
            <span className="truncate">{language === 'ka' ? 'შემადგენლობა' : t('ensemble_roster')}</span>
            <span
              className={`text-[0.675rem] font-bold rounded-pill px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0 transition-colors ${
                activeTab === 'members'
                  ? 'bg-white text-brand-primary shadow-xs'
                  : 'bg-surface border border-border-subtle text-text-secondary'
              }`}
            >
              {members.length}
            </span>
          </button>

          {/* Tab 2 Button: Inventory */}
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            title={language === 'ka' ? 'შოუს ინვენტარის მორიგეობა' : 'Show Inventory Duties'}
            className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-2.5 sm:px-4 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
              activeTab === 'inventory'
                ? 'font-bold bg-brand-primary text-white shadow-glow'
                : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Package size={15} className="shrink-0" />
            <span className="truncate">{language === 'ka' ? 'ინვენტარი' : t('inventory_duty')}</span>
            <span
              className={`text-[0.675rem] font-bold rounded-pill px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0 transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-white text-brand-primary shadow-xs'
                  : 'bg-surface border border-border-subtle text-text-secondary'
              }`}
            >
              {group.inventoryRequirements.length}
            </span>
          </button>

          {/* Tab 3 Button: Shows */}
          <button
            type="button"
            onClick={() => setActiveTab('shows')}
            title={language === 'ka' ? 'დაგეგმილი შოუები' : 'Scheduled Shows'}
            className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-2.5 sm:px-4 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
              activeTab === 'shows'
                ? 'font-bold bg-brand-primary text-white shadow-glow'
                : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calendar size={15} className="shrink-0" />
            <span className="truncate">{language === 'ka' ? 'შოუები' : t('scheduled_events')}</span>
            <span
              className={`text-[0.675rem] font-bold rounded-pill px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0 transition-colors ${
                activeTab === 'shows'
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
                {t('ensemble_roster')} ({members.length})
              </h4>
              <span className="text-xs text-text-secondary">
                {t('performers_count', { count: members.length })}
              </span>
            </div>

            <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface-secondary p-2.5 max-h-[380px] overflow-y-auto">
              {members.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-secondary">
                  {t('no_members_in_group')}
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
                            <span>•</span>
                            <span>{member.gender === 'Male' ? (language === 'ka' ? 'კაცი' : 'Male') : (language === 'ka' ? 'ქალი' : 'Female')}</span>
                            {member.heightCm && (
                              <>
                                <span>•</span>
                                <span>{member.heightCm} სმ</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-pill inline-flex items-center gap-1 ${
                            isActive
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

        {/* TAB 2: INVENTORY REQUIREMENTS & DUTY RULES */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div>
              <h4 className="text-sm font-bold text-text-primary m-0 uppercase tracking-wider">
                {language === 'ka' ? 'შოუს ინვენტარის მორიგეობა' : 'Show Inventory Duties'} ({group.inventoryRequirements.length})
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                {language === 'ka'
                  ? 'შოუს დროს ინვენტარის მომზადებასა და გადატანაზე პასუხისმგებელი მორიგეების წესები'
                  : 'Crew duty requirements for equipment setup and handling during shows'}
              </p>
            </div>

            {group.inventoryRequirements.length === 0 ? (
              <div className="p-6 rounded-sm bg-surface-secondary border border-dashed border-border-medium text-xs text-text-secondary text-center">
                {language === 'ka' ? 'ინვენტარის მორიგეობა არ არის კონფიგურირებული' : t('no_inventory_reqs')}
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                {group.inventoryRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 px-3.5 rounded-sm bg-surface border border-border-subtle flex items-center justify-between gap-3 shadow-xs"
                  >
                    {/* Left: Item Name with Package Icon */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-surface-secondary flex items-center justify-center text-text-primary shrink-0">
                        <Package size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-text-primary truncate">
                          {req.itemName}
                        </div>
                        <div className="text-xs text-text-secondary mt-0.5">
                          {language === 'ka' ? 'ინვენტარი / რეკვიზიტი' : 'Equipment / Prop'}
                        </div>
                      </div>
                    </div>

                    {/* Right: Duty Requirement Details */}
                    <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                      {/* Required Headcount */}
                      <span className="px-2.5 py-1 rounded-pill bg-surface-secondary border border-border-subtle text-xs font-semibold text-text-primary inline-flex items-center gap-1.5">
                        <Users size={12} />
                        <span>{language === 'ka' ? `${req.requiredHeadcount} მორიგე` : `${req.requiredHeadcount} crew`}</span>
                      </span>

                      {/* Gender Requirement Rule */}
                      <span
                        className={`px-2.5 py-1 rounded-pill text-xs font-semibold inline-flex items-center gap-1 border ${
                          req.assignedGender === 'Male Only'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : req.assignedGender === 'Female Only'
                            ? 'bg-pink-50 border-pink-200 text-pink-700'
                            : 'bg-surface-secondary border-border-subtle text-text-secondary'
                        }`}
                      >
                        <User size={12} />
                        <span>
                          {req.assignedGender === 'Male Only'
                            ? (language === 'ka' ? 'მხოლოდ კაცები' : 'Male Only')
                            : req.assignedGender === 'Female Only'
                            ? (language === 'ka' ? 'მხოლოდ ქალები' : 'Female Only')
                            : (language === 'ka' ? 'ნებისმიერი სქესი' : 'Any Gender')}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}

                {/* Explanatory Help Note */}
                <div className="mt-1 p-2 px-3 rounded-md bg-surface-secondary text-xs text-text-secondary flex items-center gap-1.5 leading-relaxed">
                  <Info size={13} className="shrink-0" />
                  <span>
                    {language === 'ka'
                      ? 'შოუს დაგეგმვისას სისტემა ამ წესების მიხედვით დასის წევრებს შორის ავტომატურად ანაწილებს მორიგეობას სამართლიანი როტაციით.'
                      : 'When scheduling shows, the system automatically rotates crew members to handle these items based on fair-round-robin rules.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SCHEDULED SHOWS */}
        {activeTab === 'shows' && (
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-text-primary m-0 uppercase tracking-wider">
                {t('scheduled_events')} ({groupShows.length})
              </h4>
              <span className="text-xs text-text-secondary font-medium">
                {language === 'ka' ? `სულ: ${groupShows.length} შოუ` : `Total: ${groupShows.length} shows`}
              </span>
            </div>

            {groupShows.length === 0 ? (
              <div className="p-6 rounded-sm bg-surface-secondary border border-dashed border-border-medium text-xs text-text-secondary text-center">
                {t('no_scheduled_shows_group')}
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
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
                          {startDate.toLocaleDateString(language === 'ka' ? 'ka-GE' : 'en-US', {
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
    </Modal>
  );
};
