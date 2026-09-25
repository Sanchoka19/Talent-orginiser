'use client';

import React, { useState, useMemo } from 'react';
import { ShowEvent } from '../../types/schedule';
import { Group } from '../../types/group';
import { HotelVenue } from '../../types/venue';
import { Talent } from '../../types/talent';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Package,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Users
} from 'lucide-react';

export interface ShowEventCardProps {
  event: ShowEvent;
  group?: Group;
  venue?: HotelVenue;
  talentsMap?: Map<string, Talent>;
  onSelectEvent: (event: ShowEvent) => void;
  onSelectTalent?: (talent: Talent) => void;
  defaultExpandedDuties?: boolean; // სურვილისამებრ, აკორდეონი დეფოლტად გახსნილი იყოს თუ დახურული
}

export const ShowEventCard: React.FC<ShowEventCardProps> = ({
  event,
  group,
  venue,
  talentsMap,
  onSelectEvent,
  onSelectTalent,
  defaultExpandedDuties = false
}) => {
  const { language, t } = useLanguage();
  const { talents, groups, venues } = useApp();

  const [isDutiesExpanded, setIsDutiesExpanded] = useState<boolean>(defaultExpandedDuties);

  // Fallback lookups from AppContext if not directly passed via props
  const resolvedTalentsMap = useMemo(() => {
    if (talentsMap) return talentsMap;
    return new Map(talents.map((tal) => [tal.id, tal]));
  }, [talentsMap, talents]);

  const resolvedGroup = useMemo(() => {
    if (group) return group;
    return groups.find((g) => g.id === event.groupId);
  }, [group, groups, event.groupId]);

  const resolvedVenue = useMemo(() => {
    if (venue) return venue;
    return venues.find((v) => v.id === event.hotelId);
  }, [venue, venues, event.hotelId]);

  const format24HourTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);
  const startTime = format24HourTime(startDate);
  const endTime = format24HourTime(endDate);

  const effectiveLobby =
    event.lobbyTime ||
    (() => {
      const travel = resolvedVenue?.travelTimeMinutes ?? 45;
      const totalM = (startDate.getHours() * 60 + startDate.getMinutes() - travel + 1440) % 1440;
      return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
    })();

  const dutyCount = event.dutyAssignments?.length || 0;

  const assignedTalentIds = useMemo(() => {
    return Array.from(
      new Set([
        ...(event.dutyAssignments?.flatMap((d) => d.assignedTalentIds) || []),
        ...(resolvedGroup?.memberTalentIds || [])
      ])
    );
  }, [event.dutyAssignments, resolvedGroup?.memberTalentIds]);

  const performerObjects = useMemo(() => {
    return assignedTalentIds
      .map((id) => resolvedTalentsMap.get(id))
      .filter(Boolean) as Talent[];
  }, [assignedTalentIds, resolvedTalentsMap]);

  const getLiveTimeBadge = () => {
    const now = Date.now();
    const start = new Date(event.startDateTime).getTime();
    const end = new Date(event.endDateTime).getTime();

    if (now >= start && now <= end) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span>{language === 'ka' ? 'მიმდინარეობს' : language === 'tr' ? 'Canlı' : 'Live'}</span>
        </span>
      );
    }

    if (now > end) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-secondary text-text-tertiary border border-border-subtle">
          <span>{language === 'ka' ? 'დასრულდა' : language === 'tr' ? 'Tamamlandı' : 'Completed'}</span>
        </span>
      );
    }

    const diffMs = start - now;
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins <= 60 && diffMins > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>
            {language === 'ka'
              ? `იწყება ${diffMins} წთ-ში`
              : language === 'tr'
              ? `${diffMins} dk içinde`
              : `In ${diffMins}m`}
          </span>
        </span>
      );
    }

    return null;
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-secondary/30 p-4 transition-all hover:border-border-medium">
      {/* Title, Badge & Navigation */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className="min-w-0 cursor-pointer group flex-1"
          onClick={() => onSelectEvent(event)}
        >
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm sm:text-base font-bold text-text-primary m-0 truncate group-hover:text-brand-primary transition-colors">
              {event.title}
            </h3>
            {getLiveTimeBadge()}
          </div>

          <div className="flex items-center gap-2 text-xs text-text-secondary flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin size={13} className="text-text-tertiary shrink-0" />
              <span>
                {resolvedVenue?.name || (language === 'ka' ? 'ლოკაცია მითითებული არაა' : 'Venue not specified')}
                {resolvedVenue?.roomOrBallroom ? ` (${resolvedVenue.roomOrBallroom})` : ''}
              </span>
            </div>
            {resolvedGroup?.name && (
              <>
                <span className="text-text-tertiary hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <Users size={13} className="text-text-tertiary shrink-0" />
                  <span>{resolvedGroup.name}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectEvent(event);
          }}
          className="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary hover:border-brand-primary/40 transition-all shrink-0 cursor-pointer shadow-xs"
          title={language === 'ka' ? 'მართვა & დეტალები' : language === 'tr' ? 'Yönet ve Detaylar' : 'Manage & Details'}
        >
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Operational Times & Cast Avatars */}
      <div className="flex items-center justify-between bg-surface rounded-xl p-3 border border-border-subtle mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={14} />
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">
                {t('gathering_label')}
              </div>
              <div className="text-xs font-extrabold text-text-primary">{effectiveLobby}</div>
            </div>
          </div>

          <div className="w-px h-6 bg-border-subtle hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-500/10 text-brand-primary flex items-center justify-center shrink-0">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">
                {t('show_time_label')}
              </div>
              <div className="text-xs font-extrabold text-text-primary">
                {startTime} - {endTime}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Group */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] font-semibold text-text-tertiary hidden sm:inline">
            {language === 'ka' ? 'შემადგენლობა:' : language === 'tr' ? 'Kadro:' : 'Cast:'}
          </span>
          <div className="flex items-center">
            {performerObjects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTalent?.(p);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-surface overflow-hidden -ml-2 first:ml-0 shadow-xs bg-surface-secondary shrink-0 relative ${
                  onSelectTalent ? 'cursor-pointer hover:z-10 hover:scale-110 transition-transform' : ''
                }`}
                title={`${p.firstName} ${p.lastName} (${p.primarySkill})`}
              >
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={`${p.firstName} ${p.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-brand-primary">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                )}
              </div>
            ))}
            {performerObjects.length > 4 && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-surface bg-surface-secondary text-text-secondary font-bold text-[10px] flex items-center justify-center -ml-2 shadow-xs shrink-0">
                +{performerObjects.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory & Duties Accordion */}
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDutiesExpanded((prev) => !prev);
          }}
          className="flex items-center justify-between w-full px-3.5 py-2 bg-surface border border-border-subtle rounded-lg text-xs font-semibold text-text-primary hover:border-border-medium transition-all cursor-pointer shadow-xs"
        >
          <span className="inline-flex items-center gap-2">
            <Package size={14} className="text-brand-primary shrink-0" />
            <span>
              {language === 'ka'
                ? `ინვენტარისა და პოზიციების მორიგეობა (${dutyCount} ნივთი)`
                : language === 'tr'
                ? `Envanter ve Sahne Nöbeti (${dutyCount} öğe)`
                : `Inventory & Stage Duties (${dutyCount} items)`}
            </span>
          </span>

          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="text-[11px] font-normal text-text-tertiary">
              {isDutiesExpanded
                ? language === 'ka'
                  ? 'აკეცვა'
                  : language === 'tr'
                  ? 'Daralt'
                  : 'Collapse'
                : language === 'ka'
                ? 'დეტალების ნახვა'
                : language === 'tr'
                ? 'Genişlet'
                : 'Expand'}
            </span>
            {isDutiesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {isDutiesExpanded && (
          <div className="mt-2 flex flex-col gap-2 pt-1 animate-in fade-in duration-150">
            {event.dutyAssignments && event.dutyAssignments.length > 0 ? (
              event.dutyAssignments.map((duty) => {
                const assignedTalents = duty.assignedTalentIds
                  .map((id) => resolvedTalentsMap.get(id))
                  .filter(Boolean) as Talent[];

                return (
                  <div
                    key={duty.requirementId || duty.itemName}
                    className="flex items-center justify-between text-xs px-3 py-2 bg-surface rounded-lg border border-border-subtle flex-wrap gap-2 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Package size={13} className="text-text-tertiary shrink-0" />
                      <span className="font-bold text-text-primary">{duty.itemName}</span>
                      {duty.assignedGender && (
                        <span className="text-[11px] font-medium text-text-tertiary">
                          ({duty.assignedGender})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {assignedTalents.length > 0 ? (
                        <div className="flex items-center">
                          {assignedTalents.map((tal) => {
                            const isMale = tal.gender === 'Male';
                            const isFemale = tal.gender === 'Female';
                            const genderBorderClass = isMale
                              ? 'border-blue-400 dark:border-blue-500'
                              : isFemale
                              ? 'border-pink-400 dark:border-pink-500'
                              : 'border-border-subtle';

                            return (
                              <div
                                key={tal.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectTalent?.(tal);
                                }}
                                className={`w-7 h-7 rounded-full border-2 ${genderBorderClass} overflow-hidden -ml-2 first:ml-0 shadow-xs bg-surface-secondary shrink-0 relative ${
                                  onSelectTalent ? 'cursor-pointer hover:z-10 hover:scale-110 transition-transform' : ''
                                }`}
                                title={`${tal.firstName} ${tal.lastName} (${tal.primarySkill})`}
                              >
                                {tal.avatarUrl ? (
                                  <img
                                    src={tal.avatarUrl}
                                    alt={`${tal.firstName} ${tal.lastName}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className={`w-full h-full flex items-center justify-center font-bold text-[10px] ${
                                      isMale
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10'
                                        : isFemale
                                        ? 'text-pink-600 dark:text-pink-400 bg-pink-500/10'
                                        : 'text-brand-primary bg-brand-primary/10'
                                    }`}
                                  >
                                    {tal.firstName[0]}{tal.lastName[0]}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-rose-600 text-xs font-bold inline-flex items-center gap-1">
                            <AlertTriangle size={12} className="shrink-0" />
                            <span>{t('insufficient_performers')}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEvent(event);
                            }}
                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 cursor-pointer"
                          >
                            {t('btn_replace')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-text-secondary italic px-2 py-1">
                {t('no_shifts_yet')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
