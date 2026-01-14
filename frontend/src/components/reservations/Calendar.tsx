'use client';

import { useState, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg, EventContentArg, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import plLocale from '@fullcalendar/core/locales/pl';
import { useCalendarReservations, useUpdateReservation } from '@/hooks/useReservations';
import { useRooms } from '@/hooks/useRooms';
import { ReservationModal } from './ReservationModal';
import { ReservationDetails } from './ReservationDetails';
import type { Reservation } from '@/types';
import { startOfWeek, endOfWeek, addDays } from '@/lib/utils/date';
import { useToast } from '@/components/ui/Toast';

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
  
  const { events, isLoading, refetch } = useCalendarReservations({
    roomId,
    from: dateRange.from,
    to: dateRange.to,
  });
  
  const { data: rooms } = useRooms();
  const updateMutation = useUpdateReservation();
  const { showToast } = useToast();
  
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

  // Obsługa przeciągania wydarzenia (drag & drop)
  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
    const reservation = dropInfo.event.extendedProps?.reservation as Reservation | undefined;
    
    if (!reservation) {
      dropInfo.revert();
      return;
    }

    // Oblicz nowe czasy - end może być null, wtedy oblicz na podstawie delta
    const newStart = dropInfo.event.start;
    let newEnd = dropInfo.event.end;
    
    // Jeśli end jest null, oblicz na podstawie oryginalnej długości rezerwacji
    if (!newEnd && newStart) {
      const originalStart = new Date(reservation.startTime);
      const originalEnd = new Date(reservation.endTime);
      const duration = originalEnd.getTime() - originalStart.getTime();
      newEnd = new Date(newStart.getTime() + duration);
    }

    if (!newStart) {
      dropInfo.revert();
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: reservation.id,
        data: {
          startTime: newStart.toISOString(),
          endTime: newEnd?.toISOString(),
        },
      });
      // Wymuś odświeżenie danych z serwera
      await refetch();
    } catch {
      // Błąd - przywróć pozycję
      dropInfo.revert();
    }
  }, [updateMutation, refetch]);

  // Obsługa zmiany rozmiaru wydarzenia (resize)
  const handleEventResize = useCallback(async (resizeInfo: EventResizeDoneArg) => {
    const reservation = resizeInfo.event.extendedProps?.reservation as Reservation | undefined;
    
    if (!reservation) {
      resizeInfo.revert();
      return;
    }

    const newStart = resizeInfo.event.start;
    const newEnd = resizeInfo.event.end;

    if (!newStart || !newEnd) {
      resizeInfo.revert();
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: reservation.id,
        data: {
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
        },
      });
      // Małe opóźnienie żeby baza danych się ustabilizowała
      await new Promise(resolve => setTimeout(resolve, 100));
      // Wymuś odświeżenie danych z serwera
      await refetch();
    } catch {
      // Błąd - przywróć rozmiar
      resizeInfo.revert();
    }
  }, [updateMutation, refetch]);

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
    const reservation = eventInfo.event.extendedProps?.reservation as Reservation | undefined;
    
    // Fallback jeśli nie ma danych reservation
    if (!reservation) {
      return (
        <div className="overflow-hidden p-1">
          <div className="font-medium text-xs truncate">
            {eventInfo.event.title}
          </div>
        </div>
      );
    }
    
    return (
      <div className="overflow-hidden p-1">
        <div className="font-medium text-xs truncate">
          {reservation.room?.name || 'Sala'}
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
    // Strefa czasowa - lokalna (zgodnie z ustawieniami przeglądarki)
    timeZone: 'local',
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
    dayMaxEvents: 4, // Maksymalna liczba wydarzeń w dniu w widoku miesięcznym
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
    // Drag & drop
    editable: true,
    eventResizableFromStart: true,
    // Wyświetlanie w widoku miesięcznym - blokowe kolory
    eventDisplay: 'block',
    // Dodatkowe opcje dla lepszego UX
    eventStartEditable: true,
    eventDurationEditable: true,
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
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
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
