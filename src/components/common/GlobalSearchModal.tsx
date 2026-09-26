'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Users,
  Building,
  Calendar,
  Archive,
  LayoutDashboard,
  Plus,
  ArrowRight,
  CornerDownLeft,
  ArrowUpDown,
  User,
  MapPin,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { useLanguage } from '../../context/LanguageContext';
import { Talent } from '../../types/talent';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { ShowEvent } from '../../types/schedule';

export type SearchCategoryFilter = 'ALL' | 'TALENTS' | 'SHOWS' | 'VENUES' | 'GROUPS';

interface SearchResultItem {
  id: string;
  type: 'TALENT' | 'SHOW' | 'VENUE' | 'GROUP' | 'NAV' | 'ACTION';
  title: string;
  subtitle: string;
  categoryLabel: string;
  badge?: string;
  statusBadge?: {
    text: string;
    variant: 'active' | 'rest' | 'sick' | 'neutral' | 'brand';
  };
  extraInfo?: string;
  avatarUrl?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = ''
}) => {
  const router = useRouter();
  const { talents, groups, venues, schedule, setSelectedTalent, formatTime } = useApp();
  const {
    openTalentModal,
    openGroupModal,
    openVenueModal,
    openScheduleModal
  } = useModal();
  const { t, language } = useLanguage();
  const isKa = language === 'ka';

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<SearchCategoryFilter>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset and autofocus when opening
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setActiveFilter('ALL');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Map and filter items
  const { filteredItems, counts } = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Talents
    const talentMatches: SearchResultItem[] = talents
      .filter((talent) => {
        if (!q) return true;
        const fullName = `${talent.firstName} ${talent.lastName}`.toLowerCase();
        const skill = (talent.primarySkill || '').toLowerCase();
        const secSkills = (talent.secondarySkills || []).join(' ').toLowerCase();
        const email = (talent.email || '').toLowerCase();
        const phone = (talent.phone || '').toLowerCase();
        const notes = (talent.notes || '').toLowerCase();
        return (
          fullName.includes(q) ||
          skill.includes(q) ||
          secSkills.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          notes.includes(q)
        );
      })
      .map((talent) => ({
        id: `talent-${talent.id}`,
        type: 'TALENT' as const,
        title: `${talent.firstName} ${talent.lastName}`,
        subtitle: talent.primarySkill || (isKa ? 'შემსრულებელი' : 'Performer'),
        categoryLabel: isKa ? 'ტალანტი' : t('global_search_talents'),
        avatarUrl: talent.avatarUrl,
        statusBadge: {
          text:
            talent.status === 'Active'
              ? isKa ? 'აქტიური' : 'Active'
              : talent.status === 'Rest'
              ? isKa ? 'დასვენება' : 'Rest'
              : isKa ? 'ტრავმა' : 'Sick/Injured',
          variant:
            talent.status === 'Active'
              ? 'active'
              : talent.status === 'Rest'
              ? 'rest'
              : 'sick'
        },
        extraInfo: talent.phone || talent.email,
        onSelect: () => {
          setSelectedTalent(talent);
          router.push('/talents');
          onClose();
        }
      }));

    // 2. Shows / Events
    const groupMap = new Map(groups.map((g) => [g.id, g.name]));
    const venueMap = new Map(venues.map((v) => [v.id, v]));

    const showMatches: SearchResultItem[] = schedule
      .filter((event) => {
        if (!q) return true;
        const title = (event.title || '').toLowerCase();
        const groupName = (groupMap.get(event.groupId) || '').toLowerCase();
        const venue = venueMap.get(event.hotelId);
        const venueName = (venue?.name || '').toLowerCase();
        const venueCity = (venue?.city || '').toLowerCase();
        const status = (event.status || '').toLowerCase();
        const notes = (event.notes || '').toLowerCase();
        const dateStr = event.startDateTime || '';
        return (
          title.includes(q) ||
          groupName.includes(q) ||
          venueName.includes(q) ||
          venueCity.includes(q) ||
          status.includes(q) ||
          notes.includes(q) ||
          dateStr.includes(q)
        );
      })
      .map((event) => {
        const groupName = groupMap.get(event.groupId) || (isKa ? 'ჯგუფი' : 'Group');
        const venue = venueMap.get(event.hotelId);
        const venueName = venue?.name || (isKa ? 'სასტუმრო' : 'Venue');
        const startDate = event.startDateTime ? new Date(event.startDateTime) : null;
        const dateFormatted = startDate
          ? `${startDate.toLocaleDateString(isKa ? 'ka-GE' : 'en-US', {
              month: 'short',
              day: 'numeric'
            })} • ${formatTime(startDate)}`
          : '';

        return {
          id: `show-${event.id}`,
          type: 'SHOW' as const,
          title: event.title || groupName,
          subtitle: `${groupName} @ ${venueName}`,
          categoryLabel: isKa ? 'შოუ' : t('global_search_shows'),
          extraInfo: dateFormatted,
          statusBadge: {
            text:
              event.status === 'Scheduled'
                ? isKa ? 'დაგეგმილი' : 'Scheduled'
                : event.status === 'Completed'
                ? isKa ? 'დასრულებული' : 'Completed'
                : isKa ? 'გაუქმებული' : 'Cancelled',
            variant:
              event.status === 'Scheduled'
                ? 'brand'
                : event.status === 'Completed'
                ? 'active'
                : 'sick'
          },
          onSelect: () => {
            router.push('/calendar');
            onClose();
          }
        };
      });

    // 3. Hotel Venues
    const venueMatches: SearchResultItem[] = venues
      .filter((venue) => {
        if (!q) return true;
        const name = (venue.name || '').toLowerCase();
        const city = (venue.city || '').toLowerCase();
        const address = (venue.address || '').toLowerCase();
        const contact = (venue.contactName || '').toLowerCase();
        const room = (venue.roomOrBallroom || '').toLowerCase();
        return (
          name.includes(q) ||
          city.includes(q) ||
          address.includes(q) ||
          contact.includes(q) ||
          room.includes(q)
        );
      })
      .map((venue) => ({
        id: `venue-${venue.id}`,
        type: 'VENUE' as const,
        title: venue.name,
        subtitle: `${venue.city}${venue.address ? ` • ${venue.address}` : ''}`,
        categoryLabel: isKa ? 'ლოკაცია' : t('global_search_venues'),
        extraInfo: venue.contactName ? `${venue.contactName}` : undefined,
        onSelect: () => {
          router.push('/venues');
          onClose();
        }
      }));

    // 4. Groups
    const groupMatches: SearchResultItem[] = groups
      .filter((group) => {
        if (!q) return true;
        const name = (group.name || '').toLowerCase();
        const desc = (group.description || '').toLowerCase();
        return name.includes(q) || desc.includes(q);
      })
      .map((group) => ({
        id: `group-${group.id}`,
        type: 'GROUP' as const,
        title: group.name,
        subtitle: group.description || (isKa ? 'საესტრადო ჯგუფი' : 'Performing Group'),
        categoryLabel: isKa ? 'ჯგუფი' : t('global_search_groups'),
        extraInfo: `${group.memberTalentIds?.length || 0} ${
          isKa ? 'შემსრულებელი' : 'performers'
        }`,
        onSelect: () => {
          router.push(`/groups/${group.id}`);
          onClose();
        }
      }));

    const counts = {
      all: talentMatches.length + showMatches.length + venueMatches.length + groupMatches.length,
      talents: talentMatches.length,
      shows: showMatches.length,
      venues: venueMatches.length,
      groups: groupMatches.length
    };

    let items: SearchResultItem[] = [];
    if (activeFilter === 'TALENTS') {
      items = talentMatches;
    } else if (activeFilter === 'SHOWS') {
      items = showMatches;
    } else if (activeFilter === 'VENUES') {
      items = venueMatches;
    } else if (activeFilter === 'GROUPS') {
      items = groupMatches;
    } else {
      // Interleave or section items
      items = [...talentMatches, ...showMatches, ...venueMatches, ...groupMatches];
    }

    return { filteredItems: items, counts };
  }, [
    query,
    activeFilter,
    talents,
    groups,
    venues,
    schedule,
    isKa,
    t,
    router,
    setSelectedTalent,
    onClose
  ]);

  // Default Quick Navigation and Quick Actions when query is empty
  const quickNavItems: SearchResultItem[] = useMemo(() => {
    return [
      {
        id: 'nav-dashboard',
        type: 'NAV' as const,
        title: isKa ? 'მთავარი დეშბორდი' : 'Dashboard',
        subtitle: isKa ? 'სისტემის ზოგადი მიმოხილვა და სტატისტიკა' : 'Overview & statistics',
        categoryLabel: isKa ? 'გვერდი' : 'Page',
        icon: <LayoutDashboard size={18} className="text-brand-primary" />,
        onSelect: () => {
          router.push('/');
          onClose();
        }
      },
      {
        id: 'nav-talents',
        type: 'NAV' as const,
        title: isKa ? 'ტალანტების სია' : 'Talent Roster',
        subtitle: `${talents.length} ${isKa ? 'რეგისტრირებული არტისტი' : 'registered talents'}`,
        categoryLabel: isKa ? 'გვერდი' : 'Page',
        icon: <Users size={18} className="text-amber-500" />,
        onSelect: () => {
          router.push('/talents');
          onClose();
        }
      },
      {
        id: 'nav-groups',
        type: 'NAV' as const,
        title: isKa ? 'ჯგუფები და დასები' : 'Groups & Casts',
        subtitle: `${groups.length} ${isKa ? 'მოქმედი ანსამბლი' : 'active groups'}`,
        categoryLabel: isKa ? 'გვერდი' : 'Page',
        icon: <Users size={18} className="text-blue-500" />,
        onSelect: () => {
          router.push('/groups');
          onClose();
        }
      },
      {
        id: 'nav-venues',
        type: 'NAV' as const,
        title: isKa ? 'სასტუმრო ლოკაციები' : 'Hotel Venues',
        subtitle: `${venues.length} ${isKa ? 'პარტნიორი სასტუმრო' : 'partner hotels'}`,
        categoryLabel: isKa ? 'გვერდი' : 'Page',
        icon: <Building size={18} className="text-emerald-500" />,
        onSelect: () => {
          router.push('/venues');
          onClose();
        }
      },
      {
        id: 'nav-calendar',
        type: 'NAV' as const,
        title: isKa ? 'შოუების განრიგი' : 'Show Timeline',
        subtitle: `${schedule.length} ${isKa ? 'ჩანიშნული ღონისძიება' : 'scheduled events'}`,
        categoryLabel: isKa ? 'გვერდი' : 'Page',
        icon: <Calendar size={18} className="text-violet-500" />,
        onSelect: () => {
          router.push('/calendar');
          onClose();
        }
      },
      {
        id: 'nav-archive',
        type: 'NAV' as const,
        title: isKa ? 'არქივი და ისტორია' : 'Archive & History',
        subtitle: isKa ? 'სეზონის შეფასებები და კონტრაქტები' : 'Past contracts and reviews',
        categoryLabel: isKa ? 'გვერდი' : 'Page',
        icon: <Archive size={18} className="text-slate-500" />,
        onSelect: () => {
          router.push('/archive');
          onClose();
        }
      }
    ];
  }, [isKa, router, onClose, talents.length, groups.length, venues.length, schedule.length]);

  const quickActionItems: SearchResultItem[] = useMemo(() => {
    return [
      {
        id: 'act-talent',
        type: 'ACTION' as const,
        title: t('global_search_action_new_talent'),
        subtitle: isKa ? 'ახალი შემსრულებლის პროფილის შექმნა' : 'Add new performer profile',
        categoryLabel: isKa ? 'მოქმედება' : 'Action',
        icon: <Plus size={18} className="text-emerald-500" />,
        onSelect: () => {
          onClose();
          openTalentModal();
        }
      },
      {
        id: 'act-group',
        type: 'ACTION' as const,
        title: t('global_search_action_new_group'),
        subtitle: isKa ? 'ახალი ანსამბლის ან დასის ფორმირება' : 'Create new troupe or cast',
        categoryLabel: isKa ? 'მოქმედება' : 'Action',
        icon: <Plus size={18} className="text-blue-500" />,
        onSelect: () => {
          onClose();
          openGroupModal();
        }
      },
      {
        id: 'act-venue',
        type: 'ACTION' as const,
        title: t('global_search_action_new_venue'),
        subtitle: isKa ? 'ახალი სასტუმროს ლოკაციის დარეგისტრირება' : 'Add new hotel location',
        categoryLabel: isKa ? 'მოქმედება' : 'Action',
        icon: <Plus size={18} className="text-amber-500" />,
        onSelect: () => {
          onClose();
          openVenueModal();
        }
      },
      {
        id: 'act-show',
        type: 'ACTION' as const,
        title: t('global_search_action_new_show'),
        subtitle: isKa ? 'ახალი შოუს ჩანიშვნა კალენდარში' : 'Schedule a new show event',
        categoryLabel: isKa ? 'მოქმედება' : 'Action',
        icon: <Plus size={18} className="text-violet-500" />,
        onSelect: () => {
          onClose();
          openScheduleModal();
        }
      }
    ];
  }, [
    isKa,
    t,
    onClose,
    openTalentModal,
    openGroupModal,
    openVenueModal,
    openScheduleModal
  ]);

  const displayedItems = query.trim()
    ? filteredItems
    : [...quickActionItems, ...quickNavItems];

  // Scroll active item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Keydown handler inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        displayedItems.length > 0 ? (prev + 1) % displayedItems.length : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        displayedItems.length > 0
          ? (prev - 1 + displayedItems.length) % displayedItems.length
          : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayedItems[selectedIndex]) {
        displayedItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-20 px-4 pb-6 overflow-y-auto animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150 my-auto sm:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 sm:px-5 py-3.5 border-b border-border-subtle gap-3 bg-surface">
          <Search size={20} className="text-brand-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('global_search_modal_placeholder')}
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-text-primary placeholder:text-text-tertiary focus:ring-0 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-text-tertiary hover:text-text-primary p-1 rounded-md transition-colors cursor-pointer"
              title={isKa ? 'გასუფთავება' : 'Clear'}
            >
              <X size={17} />
            </button>
          ) : null}
          <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-semibold text-text-secondary bg-surface-secondary border border-border-subtle rounded shadow-2xs shrink-0 select-none">
            ESC
          </kbd>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 border-b border-border-subtle/80 bg-surface-secondary/40 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'ALL' as const, label: t('global_search_all'), count: counts.all },
            { id: 'TALENTS' as const, label: t('global_search_talents'), count: counts.talents },
            { id: 'SHOWS' as const, label: t('global_search_shows'), count: counts.shows },
            { id: 'VENUES' as const, label: t('global_search_venues'), count: counts.venues },
            { id: 'GROUPS' as const, label: t('global_search_groups'), count: counts.groups }
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-tertiary border border-border-subtle'
                }`}
              >
                <span>{tab.label}</span>
                {query.trim() && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/25 text-white' : 'bg-surface-tertiary text-text-tertiary'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results / Navigation Body */}
        <div className="max-h-[58vh] overflow-y-auto p-2 sm:p-2.5 divide-y divide-border-subtle/40">
          {displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center mb-3 text-text-tertiary">
                <Search size={24} />
              </div>
              <h4 className="text-sm font-semibold text-text-primary mb-1">
                {t('global_search_no_results')}
              </h4>
              <p className="text-xs text-text-secondary max-w-sm">
                "{query}" {t('global_search_no_results_desc')}
              </p>
            </div>
          ) : (
            <>
              {!query.trim() && (
                <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                  {t('global_search_quick_actions')} & {t('global_search_quick_nav')}
                </div>
              )}

              {displayedItems.map((item, idx) => {
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    onClick={item.onSelect}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-primary/10 border border-brand-primary/25 shadow-xs'
                        : 'hover:bg-surface-secondary border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar / Icon */}
                      {item.type === 'TALENT' ? (
                        item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.title}
                            className="w-9 h-9 rounded-full object-cover border border-border-subtle shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0 border border-brand-primary/20">
                            {item.title.charAt(0)}
                          </div>
                        )
                      ) : item.type === 'SHOW' ? (
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
                          <Calendar size={18} />
                        </div>
                      ) : item.type === 'VENUE' ? (
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Building size={18} />
                        </div>
                      ) : item.type === 'GROUP' ? (
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                          <Users size={18} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-surface-secondary text-text-primary flex items-center justify-center shrink-0 border border-border-subtle">
                          {item.icon || <Search size={18} />}
                        </div>
                      )}

                      {/* Title & Subtitle */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-text-primary truncate">
                            {item.title}
                          </span>

                          {/* Status Badge */}
                          {item.statusBadge && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                                item.statusBadge.variant === 'active'
                                  ? 'bg-status-active-bg text-status-active-text'
                                  : item.statusBadge.variant === 'rest'
                                  ? 'bg-status-rest-bg text-status-rest-text'
                                  : item.statusBadge.variant === 'brand'
                                  ? 'bg-brand-primary/10 text-brand-primary'
                                  : 'bg-status-sick-bg text-status-sick-text'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.statusBadge.variant === 'active'
                                    ? 'bg-status-active-dot'
                                    : item.statusBadge.variant === 'rest'
                                    ? 'bg-status-rest-dot'
                                    : item.statusBadge.variant === 'brand'
                                    ? 'bg-brand-primary'
                                    : 'bg-status-sick-dot'
                                }`}
                              />
                              {item.statusBadge.text}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] sm:text-xs text-text-secondary truncate mt-0.5">
                          {item.subtitle}
                          {item.extraInfo && (
                            <span className="text-text-tertiary ml-1.5">
                              • {item.extraInfo}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Right Tag & Action */}
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-secondary text-text-tertiary border border-border-subtle/80 uppercase tracking-wider hidden sm:inline-block">
                        {item.categoryLabel}
                      </span>
                      {isSelected ? (
                        <span className="flex items-center text-brand-primary text-xs font-semibold">
                          <CornerDownLeft size={14} className="ml-1" />
                        </span>
                      ) : (
                        <ArrowRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Modal Footer with Keyboard Shortcuts */}
        <div className="px-4 py-2.5 bg-surface-secondary/70 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-secondary">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[10px] font-semibold text-text-primary">
                ↑↓
              </kbd>
              <span>{t('global_search_hint_navigate')}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[10px] font-semibold text-text-primary">
                ↵
              </kbd>
              <span>{t('global_search_hint_select')}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[10px] font-semibold text-text-primary">
                ESC
              </kbd>
              <span>{t('global_search_hint_close')}</span>
            </span>
          </div>

          <div className="font-medium text-text-tertiary hidden sm:block">
            {query.trim()
              ? `${displayedItems.length} ${isKa ? 'შედეგი' : 'results'}`
              : isKa
              ? 'გლობალური მენიუ'
              : 'Command Palette'}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
