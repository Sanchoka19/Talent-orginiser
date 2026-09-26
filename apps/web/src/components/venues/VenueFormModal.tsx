'use client';

import React, { useState, useEffect } from 'react';
import { HotelVenue } from '../../types/venue';
import { Modal } from '../common/Modal';
import { PhoneInput } from '../common/PhoneInput';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface VenueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingVenue?: HotelVenue | null;
}

export const VenueFormModal: React.FC<VenueFormModalProps> = ({
  isOpen,
  onClose,
  editingVenue
}) => {
  const { addVenue, updateVenue } = useApp();
  const { t, language } = useLanguage();
  const toast = useToast();
  const isKa = language === 'ka';

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingVenue) {
      setName(editingVenue.name);
      setAddress(editingVenue.address);
      setCity(editingVenue.city);
      setContactName(editingVenue.contactName);
      setContactPhone(editingVenue.contactPhone);
      setContactEmail(editingVenue.contactEmail);
      setNotes(editingVenue.notes || '');
    } else {
      setName('');
      setAddress('');
      setCity('Las Vegas');
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setNotes('');
    }
  }, [editingVenue, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !city.trim()) {
      toast.error(isKa ? 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი' : 'Please fill in all required fields');
      return;
    }

    if (editingVenue) {
      updateVenue(editingVenue.id, {
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        country: editingVenue.country || '',
        travelTimeMinutes: editingVenue.travelTimeMinutes,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        notes: notes.trim()
      });
      toast.success(
        isKa
          ? `სასტუმროს „${name.trim()}“ მონაცემები განახლდა`
          : `Hotel venue "${name.trim()}" updated successfully`
      );
    } else {
      addVenue({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        country: '',
        travelTimeMinutes: 45,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        notes: notes.trim()
      });
      toast.success(
        isKa
          ? `სასტუმრო/ლოკაცია „${name.trim()}“ წარმატებით დაემატა`
          : `Hotel venue "${name.trim()}" added successfully`
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingVenue ? t('edit_venue') : t('add_hotel_venue')}
      subtitle={t('venue_form_subtitle')}
      maxWidth="580px"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 rounded-pill text-sm font-medium border border-border-subtle bg-surface-secondary text-text-primary hover:bg-surface-tertiary hover:border-border-medium transition-all duration-150 cursor-pointer outline-none"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="venue-form"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-pill text-sm font-medium bg-brand-primary text-white shadow-glow hover:bg-brand-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer outline-none"
          >
            {editingVenue ? t('save_venue') : t('add_hotel_venue')}
          </button>
        </div>
      }
    >
      <form id="venue-form" onSubmit={handleSubmit} className="overflow-x-hidden flex flex-col gap-4">
        {/* Hotel Venue Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">{t('hotel_name')} *</label>
          <input
            type="text"
            required
            className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-text-tertiary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Venetian Resort & Casino"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">{t('address_location')} *</label>
          <input
            type="text"
            required
            className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-text-tertiary"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 3355 S Las Vegas Blvd"
          />
        </div>

        {/* City */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">{t('city')} *</label>
          <input
            type="text"
            required
            className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-text-tertiary"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Las Vegas"
          />
        </div>

        {/* Primary Contact Section */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            {t('primary_contact')}
          </h4>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">{t('contact_name')}</label>
          <input
            type="text"
            className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-text-tertiary"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder={isKa ? 'მაგ. გიორგი ბერიძე' : 'e.g. John Doe'}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-text-secondary">{t('phone')}</label>
            <PhoneInput
              value={contactPhone}
              onChange={setContactPhone}
            />
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-text-secondary">{t('email')}</label>
            <input
              type="email"
              className="w-full text-sm px-3.5 py-2.5 rounded-sm border border-border-subtle bg-surface-secondary text-text-primary outline-none transition-all duration-150 focus:bg-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 placeholder:text-text-tertiary"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@hotel.com"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
