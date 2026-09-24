'use client';

import React, { useState, useEffect } from 'react';
import { HotelVenue } from '../../types/venue';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import {
  Building,
  MapPin,
  Calendar,
  Bus,
  User,
  Phone,
  Mail,
  Edit2,
  Trash2,
  ShieldCheck,
  Clock,
  Users,
  Copy,
  Check,
  ExternalLink,
  Search,
  Sparkles,
  Info,
  Navigation,
  MessageSquare
} from 'lucide-react';

interface VenueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: HotelVenue | null;
  onEdit: (venue: HotelVenue) => void;
  onDelete: (venueId: string) => void;
}

type VenueDetailTab = 'shows' | 'contact' | 'location';

const DICT = {
  ka: {
    // Tabs
    tabShows: 'შოუები',
    tabContact: 'საკონტაქტო',
    tabLocation: 'ლოკაცია და რუკა',

    // Overview Stats
    scheduledShows: 'დაგეგმილი შოუები',
    transitTime: 'სამგზავრო დრო',
    venueStatus: 'სტატუსი',
    activeRepertoire: 'აქტიური რეპერტუარი',
    noShowsCurrently: 'შოუები არ არის',
    fromBaseHub: 'ბაზიდან / ცენტრიდან',
    bookedDestination: 'დაკავებული ლოკაცია',
    readyToBook: 'თავისუფალია',
    
    // Shows Tab
    showsTitle: 'სასტუმროში დაგეგმილი შოუები',
    filterAll: 'ყველა',
    filterScheduled: 'დაგეგმილი',
    filterCompleted: 'დასრულებული',
    filterCancelled: 'გაუქმებული',
    searchShowsPlaceholder: 'მოძებნეთ შოუ ან ჯგუფი...',
    noShowsFound: 'შოუები არ მოიძებნა',
    noShowsAtVenue: 'ამ ლოკაციაზე შოუები ჯერ არ არის დაგეგმილი',
    statusScheduled: 'დაგეგმილი',
    statusCompleted: 'დასრულებული',
    statusCancelled: 'გაუქმებული',
    lobbyTime: 'შეკრება (Lobby)',
    performingGroup: 'ჯგუფი',
    noGroup: 'ჯგუფის გარეშე',

    // Contact Tab
    primaryContactTitle: 'მთავარი საკონტაქტო პირი',
    contactRole: 'სასტუმროს ოფიციალური წარმომადგენელი / კოორდინატორი',
    phoneLabel: 'ტელეფონის ნომერი',
    emailLabel: 'ელ-ფოსტის მისამართი',
    callNow: 'დარეკვა',
    sendEmail: 'წერილის მიწერა',
    openWhatsApp: 'WhatsApp',
    copyPhone: 'ნომრის კოპირება',
    copyEmail: 'ელ-ფოსტის კოპირება',
    phoneCopied: 'ტელეფონის ნომერი დაკოპირდა',
    emailCopied: 'ელ-ფოსტა დაკოპირდა',
    noPhoneSpecified: 'ტელეფონი მითითებული არ არის',
    noEmailSpecified: 'ელ-ფოსტა მითითებული არ არის',
    noContactSpecified: 'საკონტაქტო პირი არ არის მითითებული',
    notesTitle: 'სპეციფიკაცია და შენიშვნები',
    coordinationNotesTitle: 'კოორდინაცია და რეკომენდაციები',
    coordinationNotesText: 'შოუს დაწყებამდე 2 საათით ადრე საკონტაქტო პირთან დაკავშირება რეკომენდებულია დარბაზის მზადყოფნის, ხმისა და განათების პარამეტრების დასადასტურებლად.',
    receptionFallbackTitle: 'ადმინისტრაცია / მისაღები',
    receptionFallbackText: 'თუ საკონტაქტო პირი მიუწვდომელია, მიმართეთ სასტუმროს მთავარ მისაღებს (Front Desk / Concierge).',

    // Location Tab
    locationAndRouteTitle: 'მისამართი და ნავიგაცია',
    openGoogleMaps: 'გახსნა Google Maps-ში',
    copyAddress: 'მისამართის კოპირება',
    addressCopied: 'მისამართი დაკოპირდა',
    transitAndLogisticsTitle: 'სამგზავრო ლოჯისტიკა',
    departurePoint: 'გასვლის წერტილი',
    departurePointValue: 'ცენტრალური არტისტების ბაზა / Hub',
    recommendedDeparture: 'რეკომენდებული გასვლა',
    recommendedDepartureValue: 'შოუს დაწყებამდე მინიმუმ 2.5 საათით ადრე',
    parkingAndUnloadingTitle: 'პარკირება და ტრანსპორტი',
    parkingAndUnloadingDesc: 'სასტუმროს სატვირთო ზონა განკუთვნილია ინვენტარის ტრანსპორტისთვის. დასის ავტობუსის პარკირება შეთანხმებულია ადმინისტრაციასთან.',

    // General
    delete: 'წაშლა',
    close: 'დახურვა',
    editVenue: 'სასტუმროს რედაქტირება',
    deleteTitle: 'ლოკაციის წაშლა',
    deleteConfirm: 'ნამდვილად გსურთ ამ სასტუმრო ლოკაციის წაშლა? მასთან დაკავშირებული მონაცემები წაიშლება.',
    deletedSuccess: (name: string) => `სასტუმრო „${name}“ წარმატებით წაიშალა`,
  },
  en: {
    // Tabs
    tabShows: 'Shows',
    tabContact: 'Contact',
    tabLocation: 'Location & Map',

    // Overview Stats
    scheduledShows: 'Scheduled Shows',
    transitTime: 'Transit Time',
    venueStatus: 'Status',
    activeRepertoire: 'Active repertoire',
    noShowsCurrently: 'No shows currently',
    fromBaseHub: 'From base hub',
    bookedDestination: 'Booked destination',
    readyToBook: 'Ready to book',
    
    // Shows Tab
    showsTitle: 'Shows Scheduled at Venue',
    filterAll: 'All',
    filterScheduled: 'Scheduled',
    filterCompleted: 'Completed',
    filterCancelled: 'Cancelled',
    searchShowsPlaceholder: 'Search show title or group...',
    noShowsFound: 'No shows match your query',
    noShowsAtVenue: 'No shows currently scheduled at this venue',
    statusScheduled: 'Scheduled',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    lobbyTime: 'Lobby Call',
    performingGroup: 'Cast / Group',
    noGroup: 'No group assigned',

    // Contact Tab
    primaryContactTitle: 'Primary Point of Contact',
    contactRole: 'Hotel Venue Representative / Event Coordinator',
    phoneLabel: 'Phone Number',
    emailLabel: 'Email Address',
    callNow: 'Call Now',
    sendEmail: 'Send Email',
    openWhatsApp: 'WhatsApp',
    copyPhone: 'Copy Phone',
    copyEmail: 'Copy Email',
    phoneCopied: 'Phone number copied to clipboard',
    emailCopied: 'Email copied to clipboard',
    noPhoneSpecified: 'No phone number specified',
    noEmailSpecified: 'No email address specified',
    noContactSpecified: 'No contact person specified',
    notesTitle: 'Specifications & Notes',
    coordinationNotesTitle: 'Coordination & Briefing',
    coordinationNotesText: 'Contacting the venue coordinator 2 hours prior to curtain call is advised to confirm stage readiness, sound, and lighting configurations.',
    receptionFallbackTitle: 'Front Desk / Concierge',
    receptionFallbackText: 'If the primary contact is unreachable, please contact the main hotel reception desk.',

    // Location Tab
    locationAndRouteTitle: 'Address & Navigation',
    openGoogleMaps: 'Open in Google Maps',
    copyAddress: 'Copy Address',
    addressCopied: 'Address copied to clipboard',
    transitAndLogisticsTitle: 'Transit & Fleet Logistics',
    departurePoint: 'Departure Hub',
    departurePointValue: 'Central Base Hub / Artists Quarters',
    recommendedDeparture: 'Recommended Departure',
    recommendedDepartureValue: 'At least 2.5 hours before show start',
    parkingAndUnloadingTitle: 'Parking & Load-In',
    parkingAndUnloadingDesc: 'Designated loading bay access for equipment vans. Troupe coach parking arranged with hotel security.',

    // General
    delete: 'Delete',
    close: 'Close',
    editVenue: 'Edit Hotel Venue',
    deleteTitle: 'Delete Venue',
    deleteConfirm: 'Are you sure you want to delete this hotel venue? Associated data and schedules will be affected.',
    deletedSuccess: (name: string) => `Hotel venue "${name}" deleted successfully`,
  },
  tr: {
    // Tabs
    tabShows: 'Gösteriler',
    tabContact: 'İletişim',
    tabLocation: 'Konum & Harita',

    // Overview Stats
    scheduledShows: 'Planlanmış Gösteriler',
    transitTime: 'Ulaşım Süresi',
    venueStatus: 'Durum',
    activeRepertoire: 'Aktif repertuar',
    noShowsCurrently: 'Henüz gösteri yok',
    fromBaseHub: 'Merkezden / Üsten',
    bookedDestination: 'Rezerve lokasyon',
    readyToBook: 'Müsait',
    
    // Shows Tab
    showsTitle: 'Ot짓e Planlanan Gösteriler',
    filterAll: 'Tümü',
    filterScheduled: 'Planlandı',
    filterCompleted: 'Tamamlandı',
    filterCancelled: 'İptal',
    searchShowsPlaceholder: 'Gösteri veya grup ara...',
    noShowsFound: 'Eşleşen gösteri bulunamadı',
    noShowsAtVenue: 'Bu otelde henüz planlanmış gösteri yok',
    statusScheduled: 'Planlandı',
    statusCompleted: 'Tamamlandı',
    statusCancelled: 'İptal',
    lobbyTime: 'Toplanma',
    performingGroup: 'Topluluk / Grup',
    noGroup: 'Grup atanmadı',

    // Contact Tab
    primaryContactTitle: 'Ana İletişim Kişisi',
    contactRole: 'Otel Yetkilisi / Etkinlik Koordinatörü',
    phoneLabel: 'Telefon Numarası',
    emailLabel: 'E-posta Adresi',
    callNow: 'Hemen Ara',
    sendEmail: 'E-posta Gönder',
    openWhatsApp: 'WhatsApp',
    copyPhone: 'Numarayı Kopyala',
    copyEmail: 'E-postayı Kopyala',
    phoneCopied: 'Telefon numarası kopyalandı',
    emailCopied: 'E-posta kopyalandı',
    noPhoneSpecified: 'Telefon belirtilmedi',
    noEmailSpecified: 'E-posta belirtilmedi',
    noContactSpecified: 'İletişim kişisi belirtilmedi',
    notesTitle: 'Özellikler ve Notlar',
    coordinationNotesTitle: 'Koordinasyon ve Öneriler',
    coordinationNotesText: 'Gösteriden 2 saat önce yetkiliyle iletişime geçerek sahne ve ışık düzenini teyit etmeniz önerilir.',
    receptionFallbackTitle: 'Resepsiyon / Danışma',
    receptionFallbackText: 'Yetkiliye ulaşılamazsa otel ana resepsiyonuna danışın.',

    // Location Tab
    locationAndRouteTitle: 'Adres ve Yol Tarifi',
    openGoogleMaps: 'Google Maps\'te Aç',
    copyAddress: 'Adresi Kopyala',
    addressCopied: 'Adres kopyalandı',
    transitAndLogisticsTitle: 'Ulaşım ve Lojistik',
    departurePoint: 'Kalkış Noktası',
    departurePointValue: 'Sanatçı Ana Üssü / Merkez',
    recommendedDeparture: 'Önerilen Çıkış',
    recommendedDepartureValue: 'Gösteriden en az 2.5 saat önce',
    parkingAndUnloadingTitle: 'Park ve Yük Boşaltma',
    parkingAndUnloadingDesc: 'Ekipman araçları için yük boşaltma alanı mevcuttur. Otobüs parkı otel güvenliği ile koordine edilir.',

    // General
    delete: 'Sil',
    close: 'Kapat',
    editVenue: 'Oteli Düzenle',
    deleteTitle: 'Lokasyonu Sil',
    deleteConfirm: 'Bu otel lokasyonunu silmek istediğinizden emin misiniz?',
    deletedSuccess: (name: string) => `"${name}" oteli başarıyla silindi`,
  }
};

export const VenueDetailModal: React.FC<VenueDetailModalProps> = ({
  isOpen,
  onClose,
  venue,
  onEdit,
  onDelete
}) => {
  const { t, language } = useLanguage();
  const { schedule, groups } = useApp();
  const { confirm } = useConfirm();
  const toast = useToast();
  const dict = DICT[(language as 'ka' | 'en' | 'tr')] || DICT.en;

  const [activeTab, setActiveTab] = useState<VenueDetailTab>('shows');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Scheduled' | 'Completed' | 'Cancelled'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && venue) {
      setSearchQuery('');
      setStatusFilter('all');
      const hasShows = schedule.some((s) => s.hotelId === venue.id);
      setActiveTab(hasShows ? 'shows' : 'contact');
    }
  }, [isOpen, venue?.id, schedule]);

  if (!venue) return null;

  // Filter shows scheduled at this venue
  const venueShows = schedule
    .filter((s) => s.hotelId === venue.id)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  const activeShowsCount = venueShows.filter((s) => s.status !== 'Cancelled').length;
  const scheduledCount = venueShows.filter((s) => s.status === 'Scheduled').length;
  const completedCount = venueShows.filter((s) => s.status === 'Completed').length;
  const cancelledCount = venueShows.filter((s) => s.status === 'Cancelled').length;

  const filteredShows = venueShows.filter((s) => {
    const matchesFilter = statusFilter === 'all' || s.status === statusFilter;
    const group = groups.find((g) => g.id === s.groupId);
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group && group.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleCopyText = (text: string, key: string, successMsg: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(successMsg);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleDelete = () => {
    confirm({
      title: dict.deleteTitle,
      message: dict.deleteConfirm,
      itemName: venue.name,
      confirmLabel: dict.delete,
      variant: 'danger',
      onConfirm: () => {
        onDelete(venue.id);
        toast.success(dict.deletedSuccess(venue.name));
        onClose();
      }
    });
  };

  const handleOpenEdit = () => {
    onClose();
    onEdit(venue);
  };

  const localeStr = language === 'ka' ? 'ka-GE' : language === 'tr' ? 'tr-TR' : 'en-US';

  const fullAddressString = `${venue.address}, ${venue.city}${venue.country ? `, ${venue.country}` : ''}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.name}, ${venue.address}, ${venue.city}`
  )}`;

  const cleanPhone = venue.contactPhone ? venue.contactPhone.replace(/[^\d+]/g, '') : '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}` : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={venue.name}
      subtitle={fullAddressString}
      maxWidth="680px"
      position="side"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-danger hover:bg-danger-light hover:border-danger-border transition-all duration-150 cursor-pointer outline-none"
          >
            <Trash2 size={15} />
            <span>{dict.delete}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
            >
              {dict.close}
            </button>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-pill text-sm font-medium bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none"
            >
              <Edit2 size={15} />
              <span>{dict.editVenue}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Top 3 Stat Cards (Always visible for immediate high-level overview) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Stat 1: Scheduled Shows */}
          <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <Calendar size={14} className="text-text-primary shrink-0" />
              <span className="truncate">{dict.scheduledShows}</span>
            </div>
            <div className="text-2xl font-extrabold text-text-primary mt-1 leading-tight">
              {activeShowsCount}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 truncate">
              {activeShowsCount > 0 ? dict.activeRepertoire : dict.noShowsCurrently}
            </div>
          </div>

          {/* Stat 2: Transit / Travel Time */}
          <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <Bus size={14} className="text-text-primary shrink-0" />
              <span className="truncate">{dict.transitTime}</span>
            </div>
            <div className="text-2xl font-extrabold text-text-primary mt-1 leading-tight">
              {venue.travelTimeMinutes ? `${venue.travelTimeMinutes} ${t('minutes_short')}` : '—'}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 truncate">
              {dict.fromBaseHub}
            </div>
          </div>

          {/* Stat 3: Venue Status */}
          <div className="p-3.5 rounded-md bg-surface-secondary border border-border-subtle flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <ShieldCheck
                size={14}
                className={`shrink-0 ${activeShowsCount > 0 ? 'text-status-active-dot' : 'text-text-secondary'}`}
              />
              <span className="truncate">{dict.venueStatus}</span>
            </div>
            <div
              className={`text-lg font-extrabold mt-1 leading-tight truncate ${
                activeShowsCount > 0 ? 'text-brand-primary' : 'text-status-active-text'
              }`}
            >
              {activeShowsCount > 0 ? t('active_venue') : t('available_venue')}
            </div>
            <div className="text-xs text-text-secondary mt-0.5 truncate">
              {activeShowsCount > 0 ? dict.bookedDestination : dict.readyToBook}
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar (3 Logical Tabs: Shows, Contact, Location & Map) */}
        <div className="flex items-center bg-surface-secondary rounded-pill p-1 border border-border-subtle gap-1 min-h-[46px] box-border">
          {/* Tab 1: Shows */}
          <button
            type="button"
            onClick={() => setActiveTab('shows')}
            title={dict.tabShows}
            className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-3 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
              activeTab === 'shows'
                ? 'font-bold bg-brand-primary text-white shadow-glow'
                : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calendar size={14} className="shrink-0" />
            <span className="truncate">{dict.tabShows}</span>
            <span
              className={`text-[0.675rem] font-bold rounded-pill px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0 transition-colors ${
                activeTab === 'shows'
                  ? 'bg-white text-brand-primary shadow-xs'
                  : 'bg-surface border border-border-subtle text-text-secondary'
              }`}
            >
              {venueShows.length}
            </span>
          </button>

          {/* Tab 2: Contact */}
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            title={dict.tabContact}
            className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-3 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
              activeTab === 'contact'
                ? 'font-bold bg-brand-primary text-white shadow-glow'
                : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <User size={14} className="shrink-0" />
            <span className="truncate">{dict.tabContact}</span>
          </button>

          {/* Tab 3: Location */}
          <button
            type="button"
            onClick={() => setActiveTab('location')}
            title={dict.tabLocation}
            className={`flex-1 relative h-[38px] flex items-center justify-center gap-1.5 px-3 rounded-pill border-none text-[0.825rem] cursor-pointer whitespace-nowrap min-w-0 transition-all duration-150 ${
              activeTab === 'location'
                ? 'font-bold bg-brand-primary text-white shadow-glow'
                : 'font-medium bg-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{dict.tabLocation}</span>
          </button>
        </div>

        {/* Tab 1 Content: Shows & Schedule */}
        {activeTab === 'shows' && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-150">
            {/* Search and Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search Bar */}
              <div className="flex items-center gap-2 bg-surface-secondary border border-border-subtle rounded-pill px-3.5 py-1.5 text-xs flex-1 transition-all duration-150 focus-within:bg-surface focus-within:border-brand-primary">
                <Search size={14} className="text-text-secondary shrink-0" />
                <input
                  type="text"
                  placeholder={dict.searchShowsPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-tertiary focus:ring-0"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 bg-surface-secondary border border-border-subtle p-0.5 rounded-pill shrink-0">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-pill text-[0.7rem] font-semibold transition-all ${
                    statusFilter === 'all'
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {dict.filterAll} ({venueShows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Scheduled')}
                  className={`px-2.5 py-1 rounded-pill text-[0.7rem] font-semibold transition-all ${
                    statusFilter === 'Scheduled'
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {dict.filterScheduled} ({scheduledCount})
                </button>
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter('Completed')}
                    className={`px-2.5 py-1 rounded-pill text-[0.7rem] font-semibold transition-all ${
                      statusFilter === 'Completed'
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {dict.filterCompleted} ({completedCount})
                  </button>
                )}
                {cancelledCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter('Cancelled')}
                    className={`px-2.5 py-1 rounded-pill text-[0.7rem] font-semibold transition-all ${
                      statusFilter === 'Cancelled'
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {dict.filterCancelled} ({cancelledCount})
                  </button>
                )}
              </div>
            </div>

            {/* Shows List */}
            <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface-secondary p-2.5 max-h-[360px] overflow-y-auto thin-scrollbar">
              {filteredShows.length === 0 ? (
                <div className="py-10 px-4 text-center text-xs text-text-secondary">
                  <Calendar size={32} className="opacity-30 mb-2 mx-auto text-brand-primary" />
                  <div className="font-semibold text-text-primary">
                    {venueShows.length === 0 ? dict.noShowsAtVenue : dict.noShowsFound}
                  </div>
                </div>
              ) : (
                filteredShows.map((show) => {
                  const group = groups.find((g) => g.id === show.groupId);
                  const startDate = new Date(show.startDateTime);
                  const endDate = new Date(show.endDateTime);
                  const dateLabel = startDate.toLocaleDateString(localeStr, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const startTime = startDate.toLocaleTimeString(localeStr, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });
                  const endTime = endDate.toLocaleTimeString(localeStr, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });

                  return (
                    <div
                      key={show.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-surface rounded-sm border border-border-subtle gap-2 hover:border-brand-primary/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-text-primary truncate">
                            {show.title}
                          </span>
                          {show.lobbyTime && (
                            <span className="text-[0.675rem] px-2 py-0.5 rounded-pill bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-semibold inline-flex items-center gap-1">
                              <Clock size={10} />
                              <span>
                                {dict.lobbyTime}: {show.lobbyTime}
                              </span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} className="text-brand-primary" />
                            <span>{dateLabel}</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} />
                            <span>
                              {startTime} - {endTime}
                            </span>
                          </span>
                          {group && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-brand-primary font-semibold">
                                <Users size={12} />
                                <span>{group.name}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-pill font-semibold shrink-0 self-start sm:self-auto ${
                          show.status === 'Scheduled'
                            ? 'bg-status-active-bg text-status-active-text border border-status-active-dot/20'
                            : show.status === 'Completed'
                            ? 'bg-surface-secondary text-text-secondary border border-border-subtle'
                            : 'bg-status-sick-bg text-status-sick-text border border-danger/20'
                        }`}
                      >
                        {show.status === 'Scheduled'
                          ? dict.statusScheduled
                          : show.status === 'Completed'
                          ? dict.statusCompleted
                          : dict.statusCancelled}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2 Content: Primary Contact Person */}
        {activeTab === 'contact' && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-150">
            {/* Main Contact Card */}
            <div className="bg-surface-secondary rounded-sm border border-border-subtle p-4 flex flex-col gap-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-brand-primary text-white font-extrabold flex items-center justify-center shrink-0 shadow-sm text-sm">
                    {venue.contactName
                      ? venue.contactName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : '—'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.675rem] text-text-secondary font-semibold uppercase tracking-wider">
                      {dict.primaryContactTitle}
                    </div>
                    <div className="text-base font-bold text-text-primary truncate">
                      {venue.contactName || dict.noContactSpecified}
                    </div>
                    <div className="text-xs text-text-secondary truncate">
                      {dict.contactRole}
                    </div>
                  </div>
                </div>

                {venue.roomOrBallroom && (
                  <span className="text-xs px-2.5 py-1 rounded-pill bg-surface border border-border-subtle text-text-primary font-semibold inline-flex items-center gap-1.5 shadow-xs">
                    <Building size={12} className="text-brand-primary" />
                    <span>{venue.roomOrBallroom}</span>
                  </span>
                )}
              </div>

              {/* Direct Quick Actions: Call / WhatsApp / Email */}
              <div className="flex items-center gap-2 pt-2 border-t border-border-subtle flex-wrap">
                {venue.contactPhone && (
                  <>
                    <a
                      href={`tel:${venue.contactPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-glow"
                    >
                      <Phone size={13} />
                      <span>{dict.callNow}</span>
                    </a>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <MessageSquare size={13} />
                        <span>{dict.openWhatsApp}</span>
                      </a>
                    )}
                  </>
                )}

                {venue.contactEmail && (
                  <a
                    href={`mailto:${venue.contactEmail}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold bg-surface border border-border-subtle text-text-primary hover:bg-surface-tertiary transition-colors"
                  >
                    <Mail size={13} className="text-brand-primary" />
                    <span>{dict.sendEmail}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Phone & Email Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Phone card */}
              <div className="p-3 bg-surface-secondary border border-border-subtle rounded-sm flex flex-col justify-between gap-2">
                <div className="text-[0.675rem] text-text-secondary font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Phone size={12} className="text-brand-primary" />
                  <span>{dict.phoneLabel}</span>
                </div>
                <div className="text-sm font-bold text-text-primary truncate">
                  {venue.contactPhone || dict.noPhoneSpecified}
                </div>
                {venue.contactPhone && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(venue.contactPhone, 'phone', dict.phoneCopied)
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:underline font-semibold cursor-pointer outline-none w-fit"
                  >
                    {copiedKey === 'phone' ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-600 font-bold">{dict.phoneCopied}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>{dict.copyPhone}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Email card */}
              <div className="p-3 bg-surface-secondary border border-border-subtle rounded-sm flex flex-col justify-between gap-2">
                <div className="text-[0.675rem] text-text-secondary font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Mail size={12} className="text-brand-primary" />
                  <span>{dict.emailLabel}</span>
                </div>
                <div className="text-sm font-bold text-text-primary truncate">
                  {venue.contactEmail || dict.noEmailSpecified}
                </div>
                {venue.contactEmail && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(venue.contactEmail, 'email', dict.emailCopied)
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:underline font-semibold cursor-pointer outline-none w-fit"
                  >
                    {copiedKey === 'email' ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-600 font-bold">{dict.emailCopied}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>{dict.copyEmail}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Specifications & Notes (if any) */}
            {venue.notes && (
              <div className="p-3.5 rounded-sm bg-surface-secondary border border-border-subtle flex flex-col gap-1.5">
                <div className="text-xs text-text-secondary font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-brand-primary" />
                  <span>{dict.notesTitle}</span>
                </div>
                <div className="p-3 rounded-sm bg-surface border border-border-subtle text-xs text-text-primary leading-relaxed italic border-l-4 border-l-brand-primary">
                  "{venue.notes}"
                </div>
              </div>
            )}

            {/* Coordination Guidelines Box */}
            <div className="p-3.5 rounded-sm bg-brand-primary/5 border border-brand-primary/20 flex items-start gap-2.5">
              <Info size={16} className="text-brand-primary shrink-0 mt-0.5" />
              <div className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-text-primary font-bold block mb-0.5">
                  {dict.coordinationNotesTitle}
                </strong>
                {dict.coordinationNotesText}
              </div>
            </div>

            {/* Front Desk Fallback */}
            <div className="p-3 rounded-sm bg-surface-secondary border border-border-subtle text-xs text-text-secondary flex items-start gap-2.5">
              <Building size={15} className="shrink-0 text-text-tertiary mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary block">
                  {dict.receptionFallbackTitle}
                </span>
                <span>{dict.receptionFallbackText}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3 Content: Location & Route Logistics */}
        {activeTab === 'location' && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-150">
            {/* Address Banner with Copy and Google Maps Link */}
            <div className="bg-surface-secondary rounded-sm border border-border-subtle p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.675rem] text-text-secondary font-semibold uppercase tracking-wider">
                      {dict.locationAndRouteTitle}
                    </div>
                    <div className="text-sm font-bold text-text-primary mt-0.5 leading-snug">
                      {venue.address}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {venue.city}
                      {venue.country ? `, ${venue.country}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Google Maps & Copy Address */}
              <div className="flex items-center gap-2 pt-2 border-t border-border-subtle flex-wrap">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-glow"
                >
                  <ExternalLink size={13} />
                  <span>{dict.openGoogleMaps}</span>
                </a>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(fullAddressString, 'address', dict.addressCopied)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold bg-surface border border-border-subtle text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer outline-none"
                >
                  {copiedKey === 'address' ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600 font-bold">{dict.addressCopied}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>{dict.copyAddress}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Transit Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Departure Point */}
              <div className="p-3 bg-surface-secondary border border-border-subtle rounded-sm flex flex-col justify-between gap-1.5">
                <div className="text-[0.675rem] text-text-secondary font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Navigation size={12} className="text-brand-primary" />
                  <span>{dict.departurePoint}</span>
                </div>
                <div className="text-sm font-bold text-text-primary">
                  {dict.departurePointValue}
                </div>
                <div className="text-[0.7rem] text-text-secondary">
                  {dict.transitTime}:{' '}
                  <strong className="text-text-primary">
                    {venue.travelTimeMinutes || 45} {t('minutes_short')}
                  </strong>
                </div>
              </div>

              {/* Recommended Departure */}
              <div className="p-3 bg-surface-secondary border border-border-subtle rounded-sm flex flex-col justify-between gap-1.5">
                <div className="text-[0.675rem] text-text-secondary font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} className="text-brand-primary" />
                  <span>{dict.recommendedDeparture}</span>
                </div>
                <div className="text-sm font-bold text-text-primary">
                  {dict.recommendedDepartureValue}
                </div>
                <div className="text-[0.7rem] text-text-secondary">
                  {language === 'ka' ? 'შეკრება სასტუმროს ლობიში' : 'Lobby assembly at destination'}
                </div>
              </div>
            </div>

            {/* Parking & Unloading Logistics */}
            <div className="p-3.5 rounded-sm bg-surface-secondary border border-border-subtle flex items-start gap-2.5">
              <Bus size={16} className="text-brand-primary shrink-0 mt-0.5" />
              <div className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-text-primary font-bold block mb-0.5">
                  {dict.parkingAndUnloadingTitle}
                </strong>
                {dict.parkingAndUnloadingDesc}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
