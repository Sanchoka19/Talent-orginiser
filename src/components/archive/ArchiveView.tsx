'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ArchiveRecord,
  CompletionStatus,
  RehireStatus,
  TerminationReason
} from '../../types/talent';
import { ArchiveDossierDrawer } from './ArchiveDossierDrawer';
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

  // Extract all archive records from talents
  const allRecords: ArchiveRecord[] = useMemo(() => {
    const list: ArchiveRecord[] = [];

    talents.forEach((talent) => {
      if (talent.reviews && talent.reviews.length > 0) {
        talent.reviews.forEach((review) => {
          // Extract year from period or createdAt
          let year = 2026;
          const match = review.period.match(/\b(202\d)\b/);
          if (match) {
            year = parseInt(match[1], 10);
          } else if (review.createdAt) {
            year = new Date(review.createdAt).getFullYear();
          }

          list.push({
            id: review.id,
            talentId: talent.id,
            talentName: `${talent.firstName} ${talent.lastName}`,
            talentAvatar: talent.avatarUrl,
            talentRole: talent.primarySkill,
            talentEmail: talent.email,
            talentPhone: talent.phone,
            projectName: review.projectName,
            location: review.location || 'Belek Arena / Resort',
            period: review.period,
            year,
            reviewType: review.reviewType,
            completionStatus: review.completionStatus,
            terminationReason: review.terminationReason,
            terminationDate: review.terminationDate || review.createdAt.split('T')[0],
            initiator: review.initiator || (review.completionStatus === 'Terminated Early' ? 'Management' : 'Mutual'),
            scores: review.scores,
            overallRating: review.overallRating,
            rehireStatus: review.rehireStatus,
            privateNote: review.privateNote,
            reviewerName: review.reviewerName,
            createdAt: review.createdAt
          });
        });
      }
    });

    // Sort by createdAt descending (newest first)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [talents]);

  // Dynamic available years list
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(allRecords.map((r) => r.year)));
    return years.sort((a, b) => b - a);
  }, [allRecords]);

  // Overall KPI summary counts (independent of current filters)
  const totalCount = allRecords.length;
  const completedCount = allRecords.filter((r) => r.completionStatus === 'Completed Successfully').length;
  const terminatedCount = allRecords.filter((r) => r.completionStatus === 'Terminated Early').length;
  const blacklistCount = allRecords.filter((r) => r.rehireStatus === 'Do Not Rehire').length;

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
        if (record.year.toString() !== selectedYear) return false;
      }

      // Completion filter
      if (completionFilter === 'completed') {
        if (record.completionStatus !== 'Completed Successfully') return false;
      } else if (completionFilter === 'terminated') {
        if (record.completionStatus !== 'Terminated Early') return false;
      }

      // Rehire status filter
      if (rehireFilter === 'eligible') {
        if (record.rehireStatus !== 'Eligible for Rehire') return false;
      } else if (rehireFilter === 'blocked') {
        if (record.rehireStatus !== 'Do Not Rehire') return false;
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
    newStatus: RehireStatus
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

  const getTerminationReasonBadge = (reason?: TerminationReason) => {
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
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20 shadow-xs shrink-0">
                <Archive size={20} strokeWidth={2.2} />
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
            <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border-subtle text-xs font-semibold text-text-secondary shadow-xs">
              {isKa ? `არქივშია ${allRecords.length} კონტრაქტი` : `${allRecords.length} Contracts in Archive`}
            </span>
          </div>
        </div>

        {/* 4 Summary KPI Cards - Full Width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          {/* 1. Total Archive Contracts */}
          <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col justify-between hover:border-border-medium transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                {t('archive_kpi_total')}
              </span>
              <div className="w-8.5 h-8.5 rounded-lg bg-surface-secondary text-text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Archive size={16} />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-text-primary tracking-tight">
                {totalCount}
              </span>
              <span className="text-xs font-medium text-text-tertiary">
                {isKa ? 'ჩანაწერი' : 'records'}
              </span>
            </div>
          </div>

          {/* 2. Successfully Completed */}
          <div className="p-5 rounded-2xl bg-surface border border-emerald-500/20 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {t('archive_kpi_completed')}
              </span>
              <div className="w-8.5 h-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {completedCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-400/70">
                {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : '0%'}
              </span>
            </div>
          </div>

          {/* 3. Early Terminated */}
          <div className="p-5 rounded-2xl bg-surface border border-amber-500/20 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {t('archive_kpi_terminated')}
              </span>
              <div className="w-8.5 h-8.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
                {terminatedCount}
              </span>
              <span className="text-xs font-semibold text-amber-600/70 dark:text-amber-400/70">
                {totalCount > 0 ? `${Math.round((terminatedCount / totalCount) * 100)}%` : '0%'}
              </span>
            </div>
          </div>

          {/* 4. Blacklist (Do Not Rehire) */}
          <div className="p-5 rounded-2xl bg-surface border border-rose-500/20 shadow-xs flex flex-col justify-between hover:border-rose-500/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                {t('archive_kpi_blacklist')}
              </span>
              <div className="w-8.5 h-8.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserX size={16} />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                {blacklistCount}
              </span>
              <span className="text-xs font-semibold text-rose-600/70 dark:text-rose-400/70">
                {isKa ? 'შავ სიაში' : 'Blacklisted'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar - Full Width */}
      <div className="p-4 sm:p-4.5 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('archive_search_placeholder')}
            className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-surface-secondary/70 border border-border-subtle text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="py-2.5 px-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle text-xs sm:text-sm font-medium text-text-primary focus:outline-hidden focus:border-brand-primary cursor-pointer transition-all"
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
            className="py-2.5 px-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle text-xs sm:text-sm font-medium text-text-primary focus:outline-hidden focus:border-brand-primary cursor-pointer transition-all"
          >
            <option value="all">{t('archive_filter_all_results')}</option>
            <option value="completed">{t('archive_filter_completed')}</option>
            <option value="terminated">{t('archive_filter_terminated')}</option>
          </select>

          {/* Rehire Status Filter */}
          <select
            value={rehireFilter}
            onChange={(e) => setRehireFilter(e.target.value as any)}
            className="py-2.5 px-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle text-xs sm:text-sm font-medium text-text-primary focus:outline-hidden focus:border-brand-primary cursor-pointer transition-all"
          >
            <option value="all">{t('archive_filter_all_rehire')}</option>
            <option value="eligible">{t('archive_filter_rehire_ok')}</option>
            <option value="blocked">{t('archive_filter_rehire_blocked')}</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-brand-primary hover:bg-brand-primary/10 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X size={14} />
              <span>{t('clear_filters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Archive Data Table */}
      <div className="rounded-2xl bg-surface border border-border-subtle shadow-xs overflow-hidden flex flex-col w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-secondary/50 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                <th className="py-4 px-6">{t('archive_col_talent')}</th>
                <th className="py-4 px-6">{t('archive_col_project')}</th>
                <th className="py-4 px-6">{t('archive_col_period')}</th>
                <th className="py-4 px-6">{t('archive_col_status')}</th>
                <th className="py-4 px-6">{t('archive_col_score')}</th>
                <th className="py-4 px-6">{t('archive_col_rehire')}</th>
                <th className="py-4 px-6 text-right">{t('archive_col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const isCompleted = record.completionStatus === 'Completed Successfully';
                  const isBlacklist = record.rehireStatus === 'Do Not Rehire';
                  const isEligible = record.rehireStatus === 'Eligible for Rehire';

                  return (
                    <tr
                      key={record.id}
                      onClick={() => handleOpenDossier(record)}
                      className="hover:bg-surface-secondary/40 transition-colors cursor-pointer group"
                    >
                      {/* Column 1: Talent */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          {record.talentAvatar ? (
                            <img
                              src={record.talentAvatar}
                              alt={record.talentName}
                              className="w-10 h-10 rounded-full object-cover border border-border-subtle shrink-0 shadow-xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-xs shrink-0">
                              {record.talentName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-text-primary block truncate group-hover:text-brand-primary transition-colors">
                              {record.talentName}
                            </span>
                            <span className="text-xs text-text-secondary truncate block mt-0.5">
                              {record.talentRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Show / Project & Location */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-sm text-text-primary block">
                          {record.projectName}
                        </span>
                        <span className="text-xs text-text-tertiary flex items-center gap-1.5 mt-0.5">
                          <Building size={12} className="shrink-0" />
                          <span>{record.location}</span>
                        </span>
                      </td>

                      {/* Column 3: Contract Period */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-xs sm:text-sm text-text-secondary font-medium flex items-center gap-1.5">
                          <Calendar size={13} className="text-text-tertiary shrink-0" />
                          <span>{record.period}</span>
                        </span>
                      </td>

                      {/* Column 4: Status Badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={13} />
                            <span>{isKa ? '✓ დასრულდა' : 'Completed'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                            <AlertTriangle size={13} />
                            <span>
                              {isKa
                                ? `⚠ შეწყდა (${getTerminationReasonBadge(record.terminationReason)})`
                                : `Terminated (${getTerminationReasonBadge(record.terminationReason)})`}
                            </span>
                          </span>
                        )}
                      </td>

                      {/* Column 5: Rating */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center text-amber-500">
                            <Star size={14} fill="currentColor" />
                          </div>
                          <span className="font-bold text-sm text-text-primary">
                            {record.overallRating.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Future Rehire Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isBlacklist ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            <UserX size={13} />
                            <span>Do Not Rehire</span>
                          </span>
                        ) : isEligible ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <UserCheck size={13} />
                            <span>Rehire OK</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface-secondary text-text-secondary border border-border-subtle">
                            <span>{record.rehireStatus}</span>
                          </span>
                        )}
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDossier(record);
                          }}
                          className="inline-flex items-center gap-1.5 p-2 px-3.5 rounded-xl text-xs font-semibold bg-surface-secondary hover:bg-brand-primary hover:text-white text-text-primary border border-border-subtle transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye size={13} />
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
                      <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center text-text-tertiary">
                        <Archive size={22} />
                      </div>
                      <span className="text-sm font-bold text-text-primary">
                        {t('archive_empty_title')}
                      </span>
                      <p className="text-xs text-text-secondary max-w-sm">
                        {t('archive_empty_desc')}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 p-1.5 px-3 rounded-xl text-xs font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors"
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
