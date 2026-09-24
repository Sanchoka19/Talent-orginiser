'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ContractRecord,
  ArchiveRecord,
  CompletionStatus,
  RehireStatus,
  TerminationReason
} from '../../types/talent';
import { ArchiveDossierDrawer } from './ArchiveDossierDrawer';
import { RehireBadge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import {
  Archive,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserX,
  UserCheck,
  Star,
  Building,
  Calendar,
  ChevronRight,
  Eye,
  X,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  FileCheck
} from 'lucide-react';

export const ArchiveView: React.FC = () => {
  const { talents, updateTalent } = useApp();
  const { t, language } = useLanguage();
  const isKa = language === 'ka';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'terminated'>('all');
  const [rehireFilter, setRehireFilter] = useState<'all' | 'eligible' | 'blocked'>('all');

  // Selected record for Dossier Drawer
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Extract all archive contract records from talents (Single Source of Truth)
  const allRecords: ContractRecord[] = useMemo(() => {
    const list: ContractRecord[] = [];

    talents.forEach((talent) => {
      if (talent.reviews && talent.reviews.length > 0) {
        talent.reviews.forEach((review) => {
          // Extract year from period, reviewDate or createdAt
          let year = 2026;
          const match = review.period.match(/\b(202\d)\b/);
          if (match) {
            year = parseInt(match[1], 10);
          } else if (review.reviewDate) {
            year = parseInt(review.reviewDate.split('-')[0], 10);
          } else if (review.createdAt) {
            year = new Date(review.createdAt).getFullYear();
          }

          list.push({
            ...review,
            year,
            talentId: review.talentId || talent.id,
            talentName: review.talentName || `${talent.firstName} ${talent.lastName}`,
            talentRole: review.talentRole || talent.primarySkill,
            talentAvatar: review.avatarUrl || talent.avatarUrl,
            avatarUrl: review.avatarUrl || talent.avatarUrl,
            talentEmail: talent.email,
            talentPhone: talent.phone,
            rating: review.rating ?? review.overallRating ?? 5.0,
            contractStatus: review.contractStatus ?? (review.completionStatus === 'Terminated Early' ? 'terminated' : 'completed'),
            rehireStatus: review.rehireStatus || 'eligible',
            internalNote: review.internalNote ?? review.privateNote ?? '',
            reviewedBy: review.reviewedBy ?? review.reviewerName ?? 'Sandro Chokoraia',
            reviewDate: review.reviewDate ?? (review.createdAt ? review.createdAt.split('T')[0] : '2026-01-01')
          });
        });
      }
    });

    // Sort by reviewDate descending (newest first)
    return list.sort((a, b) => new Date(b.reviewDate || b.createdAt || '').getTime() - new Date(a.reviewDate || a.createdAt || '').getTime());
  }, [talents]);

  // Dynamic available years list
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(allRecords.map((r) => r.year || 2026)));
    return years.sort((a, b) => b - a);
  }, [allRecords]);

  // Overall KPI summary counts (independent of current filters)
  const totalCount = allRecords.length;
  const completedCount = allRecords.filter((r) => r.contractStatus === 'completed' || r.completionStatus === 'Completed Successfully').length;
  const terminatedCount = allRecords.filter((r) => r.contractStatus === 'terminated' || r.completionStatus === 'Terminated Early').length;
  const blacklistCount = allRecords.filter((r) => r.rehireStatus === 'do_not_rehire').length;

  // Filtered records
  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      // Search query filter (matches talent name, role, or project name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = record.talentName.toLowerCase().includes(q);
        const matchesRole = record.talentRole.toLowerCase().includes(q);
        const matchesProject = record.projectName.toLowerCase().includes(q);
        const matchesLocation = record.location.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesProject && !matchesLocation) {
          return false;
        }
      }

      // Year filter
      if (selectedYear !== 'all') {
        if (record.year?.toString() !== selectedYear) return false;
      }

      // Completion filter
      if (completionFilter === 'completed') {
        if (record.contractStatus !== 'completed' && record.completionStatus !== 'Completed Successfully') return false;
      } else if (completionFilter === 'terminated') {
        if (record.contractStatus !== 'terminated' && record.completionStatus !== 'Terminated Early') return false;
      }

      // Rehire status filter
      if (rehireFilter === 'eligible') {
        if (record.rehireStatus !== 'eligible') return false;
      } else if (rehireFilter === 'blocked') {
        if (record.rehireStatus !== 'do_not_rehire') return false;
      }

      return true;
    });
  }, [allRecords, searchQuery, selectedYear, completionFilter, rehireFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedYear !== 'all' ||
    completionFilter !== 'all' ||
    rehireFilter !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedYear('all');
    setCompletionFilter('all');
    setRehireFilter('all');
  };

  // Open Dossier Drawer
  const handleOpenDossier = (record: ArchiveRecord) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

  // Update Rehire Status from Drawer
  const handleUpdateRehireStatus = (
    talentId: string,
    reviewId: string,
    newStatus: 'eligible' | 'neutral' | 'do_not_rehire'
  ) => {
    const talent = talents.find((t) => t.id === talentId);
    if (!talent) return;

    const currentReviews = talent.reviews || [];
    const updatedReviews = currentReviews.map((r) =>
      r.id === reviewId ? { ...r, rehireStatus: newStatus } : r
    );

    updateTalent(talentId, {
      reviews: updatedReviews,
      rehireStatus: newStatus
    });

    if (selectedRecord && selectedRecord.id === reviewId) {
      setSelectedRecord({
        ...selectedRecord,
        rehireStatus: newStatus
      });
    }
  };

  const getTerminationReasonBadge = (reason?: string) => {
    switch (reason) {
      case 'Discipline':
        return isKa ? 'დისციპლინა' : 'Discipline';
      case 'Conflict':
        return isKa ? 'კონფლიქტი' : 'Conflict';
      case 'Injury':
        return isKa ? 'ტრავმა' : 'Injury';
      default:
        return isKa ? 'შეწყვეტილი' : 'Early End';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-none pb-16">
      {/* 1. Header & Summary KPI Cards */}
      <div className="flex flex-col gap-5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20 shadow-xs shrink-0">
                <Archive size={18} strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                  {t('archive_title')}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  {t('archive_subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-md bg-surface border border-border-subtle text-xs font-medium text-text-secondary shadow-xs">
              {isKa ? `არქივშია ${allRecords.length} კონტრაქტი` : `${allRecords.length} Contracts in Archive`}
            </span>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* 1. Total Archive Contracts */}
          <StatCard
            title={t('archive_kpi_total')}
            value={totalCount}
            subtitle={isKa ? 'ჩანაწერი' : 'records'}
            icon={<Archive size={18} strokeWidth={2.2} />}
            iconBgColor="bg-brand-primary/10 text-brand-primary"
            isActive={completionFilter === 'all' && rehireFilter === 'all'}
            activeBorderColor="border-brand-primary ring-2 ring-brand-primary/20"
            onClick={() => {
              setCompletionFilter('all');
              setRehireFilter('all');
            }}
          />

          {/* 2. Successfully Completed */}
          <StatCard
            title={t('archive_kpi_completed')}
            value={completedCount}
            subtitle={totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : '0%'}
            subtitleColor="text-emerald-600 dark:text-emerald-400 font-semibold"
            icon={<CheckCircle2 size={18} strokeWidth={2.2} />}
            iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            isActive={completionFilter === 'completed'}
            activeBorderColor="border-emerald-500 ring-2 ring-emerald-500/20"
            onClick={() => {
              setCompletionFilter(completionFilter === 'completed' ? 'all' : 'completed');
            }}
          />

          {/* 3. Early Terminated */}
          <StatCard
            title={t('archive_kpi_terminated')}
            value={terminatedCount}
            subtitle={totalCount > 0 ? `${Math.round((terminatedCount / totalCount) * 100)}%` : '0%'}
            subtitleColor="text-amber-600 dark:text-amber-400 font-semibold"
            icon={<AlertTriangle size={18} strokeWidth={2.2} />}
            iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            isActive={completionFilter === 'terminated'}
            activeBorderColor="border-amber-500 ring-2 ring-amber-500/20"
            onClick={() => {
              setCompletionFilter(completionFilter === 'terminated' ? 'all' : 'terminated');
            }}
          />

          {/* 4. Blacklist (Do Not Rehire) */}
          <StatCard
            title={t('archive_kpi_blacklist')}
            value={blacklistCount}
            subtitle={isKa ? 'შავ სიაში' : 'Blacklisted'}
            subtitleColor="text-rose-600 dark:text-rose-400 font-semibold"
            icon={<UserX size={18} strokeWidth={2.2} />}
            iconBgColor="bg-rose-500/10 text-rose-600 dark:text-rose-400"
            isActive={rehireFilter === 'blocked'}
            activeBorderColor="border-rose-500 ring-2 ring-rose-500/20"
            onClick={() => {
              setRehireFilter(rehireFilter === 'blocked' ? 'all' : 'blocked');
            }}
          />
        </div>
      </div>

      {/* 2. Filter & Search Bar - Full Width */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-surface border border-border-subtle shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('archive_search_placeholder')}
            className="w-full pl-10 pr-9 py-2 rounded-md bg-surface-secondary/70 border border-border-subtle text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:outline-hidden focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="py-2 px-3 rounded-md bg-surface-secondary/70 border border-border-subtle text-xs sm:text-sm font-medium text-text-primary focus:outline-hidden focus:border-brand-primary cursor-pointer transition-all"
          >
            <option value="all">{t('archive_filter_all_years')}</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr.toString()}>
                {yr}
              </option>
            ))}
          </select>

          {/* Completion Status Filter */}
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value as any)}
            className="py-2 px-3 rounded-md bg-surface-secondary/70 border border-border-subtle text-xs sm:text-sm font-medium text-text-primary focus:outline-hidden focus:border-brand-primary cursor-pointer transition-all"
          >
            <option value="all">{t('archive_filter_all_results')}</option>
            <option value="completed">{t('archive_filter_completed')}</option>
            <option value="terminated">{t('archive_filter_terminated')}</option>
          </select>

          {/* Rehire Status Filter */}
          <select
            value={rehireFilter}
            onChange={(e) => setRehireFilter(e.target.value as any)}
            className="py-2 px-3 rounded-md bg-surface-secondary/70 border border-border-subtle text-xs sm:text-sm font-medium text-text-primary focus:outline-hidden focus:border-brand-primary cursor-pointer transition-all"
          >
            <option value="all">{t('archive_filter_all_rehire')}</option>
            <option value="eligible">{t('archive_filter_rehire_ok')}</option>
            <option value="blocked">{t('archive_filter_rehire_blocked')}</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="py-2 px-3 rounded-md text-xs sm:text-sm font-medium text-brand-primary hover:bg-brand-primary/10 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X size={13} />
              <span>{t('clear_filters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Archive Data Table */}
      <div className="rounded-xl bg-surface border border-border-subtle shadow-xs overflow-hidden flex flex-col w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-secondary/50 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                <th className="py-3.5 px-5">{t('archive_col_talent')}</th>
                <th className="py-3.5 px-5">{t('archive_col_project')}</th>
                <th className="py-3.5 px-5">{t('archive_col_period')}</th>
                <th className="py-3.5 px-5">{t('archive_col_status')}</th>
                <th className="py-3.5 px-5">{t('archive_col_score')}</th>
                <th className="py-3.5 px-5">{t('archive_col_rehire')}</th>
                <th className="py-3.5 px-5 text-right">{t('archive_col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const isCompleted = record.contractStatus === 'completed' || record.completionStatus === 'Completed Successfully';
                  const isBlacklist = record.rehireStatus === 'do_not_rehire';
                  const isEligible = record.rehireStatus === 'eligible';

                  return (
                    <tr
                      key={record.id}
                      onClick={() => handleOpenDossier(record)}
                      className="hover:bg-surface-secondary/40 transition-colors cursor-pointer group"
                    >
                      {/* Column 1: Talent */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {record.talentAvatar ? (
                            <img
                              src={record.talentAvatar}
                              alt={record.talentName}
                              className="w-9 h-9 rounded-full object-cover border border-border-subtle shrink-0 shadow-xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-xs shrink-0">
                              {record.talentName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-sm text-text-primary block truncate group-hover:text-brand-primary transition-colors">
                              {record.talentName}
                            </span>
                            <span className="text-xs text-text-secondary truncate block mt-0.5">
                              {record.talentRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Show / Project & Location */}
                      <td className="py-3.5 px-5">
                        <span className="font-medium text-sm text-text-primary block">
                          {record.projectName}
                        </span>
                        <span className="text-xs text-text-tertiary flex items-center gap-1.5 mt-0.5">
                          <Building size={12} className="shrink-0" />
                          <span>{record.location}</span>
                        </span>
                      </td>

                      {/* Column 3: Contract Period */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="text-xs sm:text-sm text-text-secondary font-medium flex items-center gap-1.5">
                          <Calendar size={13} className="text-text-tertiary shrink-0" />
                          <span>{record.period}</span>
                        </span>
                      </td>

                      {/* Column 4: Status Badge */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={12} />
                            <span>{isKa ? 'დასრულდა' : 'Completed'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                            <AlertTriangle size={12} />
                            <span>
                              {isKa
                                ? `შეწყდა (${getTerminationReasonBadge(record.terminationReason)})`
                                : `Terminated (${getTerminationReasonBadge(record.terminationReason)})`}
                            </span>
                          </span>
                        )}
                      </td>

                      {/* Column 5: Rating */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold">
                          <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                          <span>{(record.rating ?? record.overallRating ?? 5.0).toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Column 6: Future Rehire Status */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <RehireBadge status={record.rehireStatus} />
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDossier(record);
                          }}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium bg-surface-secondary hover:bg-brand-primary hover:text-white text-text-primary border border-border-subtle transition-all cursor-pointer shadow-xs"
                        >
                          <Eye size={12} />
                          <span>{t('archive_btn_details')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center text-text-tertiary">
                        <Archive size={18} />
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {t('archive_empty_title')}
                      </span>
                      <p className="text-xs text-text-secondary max-w-sm">
                        {t('archive_empty_desc')}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 py-1.5 px-3 rounded-md text-xs font-medium text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors"
                        >
                          {t('clear_filters')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer with counts */}
        <div className="p-3 px-6 border-t border-border-subtle bg-surface flex items-center justify-between text-xs text-text-tertiary">
          <span>
            {isKa
              ? `ნაჩვენებია ${filteredRecords.length} ჩანაწერი ${allRecords.length}-დან`
              : `Showing ${filteredRecords.length} of ${allRecords.length} records`}
          </span>
          <span className="text-[11px] hidden sm:inline">
            {isKa
              ? 'დააჭირეთ ჩანაწერს სრული საარქივო დოსიეს სანახავად'
              : 'Click any row to open the complete dossier'}
          </span>
        </div>
      </div>

      {/* 4. Archive Dossier Drawer (Side Panel) */}
      <ArchiveDossierDrawer
        record={selectedRecord}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateRehireStatus={handleUpdateRehireStatus}
      />
    </div>
  );
};
