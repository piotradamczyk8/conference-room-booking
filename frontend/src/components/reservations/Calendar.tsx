'use client';

import { useState, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import plLocale from '@fullcalendar/core/locales/pl';
import { useCalendarReservations } from '@/hooks/useReservations';
import { useRooms } from '@/hooks/useRooms';
import { ReservationModal } from './ReservationModal';
import { ReservationDetails } from './ReservationDetails';
import type { Reservation } from '@/types';
import { startOfWeek, endOfWeek, addDays } from '@/lib/utils/date';

interface CalendarProps {
  roomId?: string;
}

export function Calendar({ roomId }: CalendarProps) {
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    return {
      from: startOfWeek(now).toISOString(),
      to: addDays(endOfWeek(now), 7).toISOString(), // 2 tygodnie do przodu
    };
  });
  
  const { events, isLoading } = useCalendarReservations({
    roomId,
    from: dateRange.from,
    to: dateRange.to,
  });
  
  const { data: rooms } = useRooms();
  
  // Stan modali
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Obsługa wyboru slotu (tworzenie nowej rezerwacji)
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end,
    });
    setCreateModalOpen(true);
    
    // Odznacz zaznaczenie
    selectInfo.view.calendar.unselect();
  }, []);

  // Obsługa kliknięcia w event (szczegóły rezerwacji)
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const reservation = clickInfo.event.extendedProps.reservation as Reservation;
    setSelectedReservation(reservation);
    setDetailsModalOpen(true);
  }, []);

  // Obsługa zmiany widoku (aktualizacja zakresu dat)
  const handleDatesSet = useCallback((dateInfo: { start: Date; end: Date }) => {
    setDateRange({
      from: dateInfo.start.toISOString(),
      to: dateInfo.end.toISOString(),
    });
  }, []);

  // Zamknięcie modalu tworzenia
  const handleCreateModalClose = useCallback(() => {
    setCreateModalOpen(false);
    setSelectedSlot(null);
  }, []);

  // Zamknięcie modalu szczegółów
  const handleDetailsModalClose = useCallback(() => {
    setDetailsModalOpen(false);
    setSelectedReservation(null);
  }, []);

  // Customowy render eventu
  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const reservation = eventInfo.event.extendedProps.reservation as Reservation;
    
    return (
      <div className="overflow-hidden p-1">
        <div className="font-medium text-xs truncate">
          {reservation.room.name}
        </div>
        <div className="text-xs opacity-90 truncate">
          {reservation.reservedBy}
        </div>
        {reservation.title && (
          <div className="text-xs opacity-75 truncate">
            {reservation.title}
          </div>
        )}
      </div>
    );
  }, []);

  // Memoized calendar options
  const calendarOptions = useMemo(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: plLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    buttonText: {
      today: 'Dziś',
      month: 'Miesiąc',
      week: 'Tydzień',
      day: 'Dzień',
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    nowIndicator: true,
    height: 'auto',
    expandRows: true,
    stickyHeaderDates: true,
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00',
    slotLabelFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: false,
    },
    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: false,
    },
    firstDay: 1, // Poniedziałek
  }), []);

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      )}

      {/* Filtr sal (opcjonalny) */}
      {rooms && rooms.length > 1 && !roomId && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Legenda:</span>
          <div className="flex flex-wrap gap-2">
            {rooms.slice(0, 7).map((room, index) => {
              const colors = [
                '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', 
                '#ef4444', '#06b6d4', '#ec4899'
              ];
              return (
                <div key={room.id} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-xs text-gray-600">{room.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kalendarz */}
      <div className="fc-wrapper bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <FullCalendar
          {...calendarOptions}
          events={events || []}
          select={handleDateSelect}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
        />
      </div>

      {/* Modal tworzenia rezerwacji */}
      {createModalOpen && selectedSlot && (
        <ReservationModal
          mode="create"
          startTime={selectedSlot.start}
          endTime={selectedSlot.end}
          defaultRoomId={roomId}
          onClose={handleCreateModalClose}
        />
      )}

      {/* Modal szczegółów rezerwacji */}
      {detailsModalOpen && selectedReservation && (
        <ReservationDetails
          reservation={selectedReservation}
          onClose={handleDetailsModalClose}
        />
      )}
    </div>
  );
}
