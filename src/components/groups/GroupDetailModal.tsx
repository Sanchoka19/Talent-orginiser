import React from 'react';
import { Group } from '../../types/group';
import { Talent } from '../../types/talent';
import { Modal } from '../common/Modal';
import { DutyBadge } from '../common/Badge';
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
  AlertCircle,
  Package,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  talents: Talent[];
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
}

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-secondary"
            style={{ color: '#EF4444' }}
          >
            <Trash2 size={15} />
            <span>{t('delete')}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('close')}
            </button>
            <button type="button" onClick={handleOpenEdit} className="btn btn-primary">
              <Edit2 size={15} />
              <span>{t('edit_group')}</span>
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Top Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {/* Members Stat */}
          <div
            style={{
              padding: '14px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '94px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <Users size={14} color="var(--color-charcoal)" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {language === 'ka' ? 'სულ წევრები' : 'Total Members'}
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-charcoal)', marginTop: '4px', lineHeight: 1.2 }}>
              {members.length}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {maleCount} {t('males')} • {femaleCount} {t('females')}
            </div>
          </div>

          {/* Readiness Stat */}
          <div
            style={{
              padding: '14px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '94px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <ShieldCheck size={14} color="#16A34A" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {language === 'ka' ? 'მზადყოფნა' : 'Readiness'}
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: nonActiveCount === 0 ? '#16A34A' : '#D97706', marginTop: '4px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeCount} {t('filter_active')}
            </div>
            <div style={{ fontSize: '0.725rem', color: nonActiveCount > 0 ? '#EF4444' : 'var(--color-text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nonActiveCount > 0 ? `${nonActiveCount} ${t('unavailable')}` : t('all_active')}
            </div>
          </div>

          {/* Rotation Cycle */}
          <div
            style={{
              padding: '14px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '94px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <Clock size={14} color="var(--color-charcoal)" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {language === 'ka' ? 'როტაციის ციკლი' : 'Rotation Cycle'}
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-charcoal)', marginTop: '4px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {group.rotationCycleWeeks} {language === 'ka' ? 'კვირა' : 'wks'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {language === 'ka' ? 'სამართლიანი როტაცია' : 'Fair-random'}
            </div>
          </div>
        </div>

        {/* Location & Info Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--brand-primary-light)',
            border: '1px solid rgba(255, 108, 65, 0.35)',
            fontSize: '0.825rem',
            color: 'var(--color-charcoal)'
          }}
        >
          <MapPin size={15} color="var(--color-charcoal)" style={{ flexShrink: 0 }} />
          <span>
            <strong>{language === 'ka' ? 'მთავარი ლოკაცია / ბაზირება:' : 'Primary Destination / Base:'}</strong> {primaryVenue}
          </span>
        </div>

        {/* Section 1: Ensemble Roster */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('ensemble_roster')} ({members.length})
            </h4>
            <span style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
              {t('performers_count', { count: members.length })}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              padding: '10px'
            }}
          >
            {members.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                {t('no_members_in_group')}
              </div>
            ) : (
              members.map((member) => {
                const isActive = member.status === 'Active';
                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <img
                        src={
                          member.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.firstName}${member.lastName}`
                        }
                        alt={member.firstName}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--border-subtle)',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.firstName} {member.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: isActive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: isActive ? '#16A34A' : '#EF4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
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

        {/* Section 2: Inventory Requirements & Duty Rules */}
        <div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {language === 'ka' ? 'შოუს ინვენტარის მორიგეობა' : 'Show Inventory Duties'} ({group.inventoryRequirements.length})
              </h4>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', margin: '3px 0 0 0' }}>
              {language === 'ka'
                ? 'შოუს დროს ინვენტარის მომზადებასა და გადატანაზე პასუხისმგებელი მორიგეების წესები'
                : 'Crew duty requirements for equipment setup and handling during shows'}
            </p>
          </div>

          {group.inventoryRequirements.length === 0 ? (
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-secondary)',
                border: '1px dashed var(--border-medium)',
                fontSize: '0.825rem',
                color: 'var(--color-text-secondary)',
                textAlign: 'center'
              }}
            >
              {language === 'ka' ? 'ინვენტარის მორიგეობა არ არის კონფიგურირებული' : t('no_inventory_reqs')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {group.inventoryRequirements.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Left: Item Name with Package Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'var(--bg-surface-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-charcoal)',
                        flexShrink: 0
                      }}
                    >
                      <Package size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                        {req.itemName}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {language === 'ka' ? 'ინვენტარი / რეკვიზიტი' : 'Equipment / Prop'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Duty Requirement Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {/* Required Headcount */}
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--color-charcoal)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Users size={12} />
                      <span>{language === 'ka' ? `${req.requiredHeadcount} მორიგე` : `${req.requiredHeadcount} crew`}</span>
                    </span>

                    {/* Gender Requirement Rule */}
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        background:
                          req.assignedGender === 'Male Only'
                            ? '#EFF6FF'
                            : req.assignedGender === 'Female Only'
                            ? '#FDF2F8'
                            : 'var(--bg-surface-secondary)',
                        border:
                          req.assignedGender === 'Male Only'
                            ? '1px solid #BFDBFE'
                            : req.assignedGender === 'Female Only'
                            ? '1px solid #FBCFE8'
                            : '1px solid var(--border-subtle)',
                        color:
                          req.assignedGender === 'Male Only'
                            ? '#1D4ED8'
                            : req.assignedGender === 'Female Only'
                            ? '#BE185D'
                            : 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
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
              <div
                style={{
                  marginTop: '4px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface-secondary)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  lineHeight: 1.4
                }}
              >
                <Info size={13} style={{ flexShrink: 0 }} />
                <span>
                  {language === 'ka'
                    ? 'შოუს დაგეგმვისას სისტემა ამ წესების მიხედვით დასის წევრებს შორის ავტომატურად ანაწილებს მორიგეობას სამართლიანი როტაციით.'
                    : 'When scheduling shows, the system automatically rotates crew members to handle these items based on fair-round-robin rules.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Scheduled Shows */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('scheduled_events')} ({groupShows.length})
            </h4>
          </div>

          {groupShows.length === 0 ? (
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-secondary)',
                border: '1px dashed var(--border-medium)',
                fontSize: '0.825rem',
                color: 'var(--color-text-secondary)',
                textAlign: 'center'
              }}
            >
              {t('no_scheduled_shows_group')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {groupShows.slice(0, 5).map((show) => {
                const venue = venues.find((v) => v.id === show.hotelId);
                const startDate = new Date(show.startDateTime);
                return (
                  <div
                    key={show.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                        {show.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={12} />
                        <span>{venue?.name || 'Hotel'} ({venue?.city || ''})</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.775rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                        {startDate.toLocaleDateString(language === 'ka' ? 'ka-GE' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>
                        {show.startDateTime.split('T')[1]?.slice(0, 5)} - {show.endDateTime.split('T')[1]?.slice(0, 5)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {groupShows.length > 5 && (
                <div style={{ textAlign: 'center', fontSize: '0.775rem', color: 'var(--color-text-secondary)', padding: '4px' }}>
                  +{groupShows.length - 5} {language === 'ka' ? 'დამატებითი შოუ კალენდარში' : 'more shows in calendar'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
