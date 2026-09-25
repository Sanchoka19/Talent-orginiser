'use client';

import React from 'react';
import { ShowEvent } from '../../../types/schedule';
import { HotelVenue } from '../../../types/venue';
import {
  Calendar,
  MapPin
} from 'lucide-react';

interface GroupShowsTabProps {
  groupShows: ShowEvent[];
  venues: HotelVenue[];
  dict: any;
  isKa: boolean;
}

export const GroupShowsTab: React.FC<GroupShowsTabProps> = ({
  groupShows,
  venues,
  dict,
  isKa
}) => {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-text-primary m-0">
            {dict.scheduledEvents} ({groupShows.length})
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {isKa ? `სულ: ${groupShows.length} შოუ` : `Total: ${groupShows.length} shows`}
          </p>
        </div>
      </div>

      {groupShows.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-xl border border-dashed border-border-medium text-text-secondary text-sm">
          <Calendar size={36} className="mx-auto mb-2 opacity-30 text-text-secondary" />
          <p>{dict.noShows}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupShows.map((show) => {
            const venue = venues.find((v) => v.id === show.hotelId);
            const startDate = new Date(show.startDateTime);
            const endDate = new Date(show.endDateTime);
            const localeStr = isKa ? 'ka-GE' : 'en-US';

            return (
              <div
                key={show.id}
                className="bg-surface border border-border-subtle rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs hover:border-border-medium transition-all"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-bold text-text-primary truncate">
                    {show.title}
                  </h4>
                  <div className="text-xs text-text-secondary mt-1 flex items-center gap-1.5 truncate">
                    <MapPin size={12} className="text-danger shrink-0" />
                    <span>
                      {venue?.name || 'Hotel'} {venue?.city ? `(${venue.city})` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs shrink-0">
                  <div className="font-bold text-text-primary">
                    {startDate.toLocaleDateString(localeStr, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-text-secondary mt-0.5">
                    {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
