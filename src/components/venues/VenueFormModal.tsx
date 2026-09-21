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
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {t('cancel')}
          </button>
          <button type="submit" form="venue-form" className="btn btn-primary">
            {editingVenue ? t('save_venue') : t('add_hotel_venue')}
          </button>
        </>
      }
    >
      <form id="venue-form" onSubmit={handleSubmit} style={{ overflowX: 'hidden' }}>
        {/* Hotel Venue Name */}
        <div className="form-group">
          <label className="form-label">{t('hotel_name')} *</label>
          <input
            type="text"
            required
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Venetian Resort & Casino"
          />
        </div>

        {/* Address */}
        <div className="form-group">
          <label className="form-label">{t('address_location')} *</label>
          <input
            type="text"
            required
            className="form-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 3355 S Las Vegas Blvd"
          />
        </div>

        {/* City */}
        <div className="form-group">
          <label className="form-label">{t('city')} *</label>
          <input
            type="text"
            required
            className="form-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Las Vegas"
          />
        </div>

        {/* Primary Contact Section */}
        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '8px' }}>
            {t('primary_contact')}
          </h4>
        </div>

        <div className="form-group">
          <label className="form-label">{t('contact_name')}</label>
          <input
            type="text"
            className="form-input"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Victoria Sterling"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label className="form-label">{t('phone')}</label>
            <PhoneInput
              value={contactPhone}
              onChange={setContactPhone}
            />
          </div>

          <div className="form-group" style={{ minWidth: 0 }}>
            <label className="form-label">{t('email')}</label>
            <input
              type="email"
              className="form-input"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="vsterling@hotel.com"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
