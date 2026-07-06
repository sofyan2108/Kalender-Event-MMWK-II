import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { id } from 'date-fns/locale';
import { useSwipeable } from 'react-swipeable';
import DayCell from './DayCell';

const CalendarGrid = ({ selectedDate, setSelectedDate, viewMode, events, allAgendas }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextPeriod = () => {
    setCurrentDate(viewMode === 'monthly' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const prevPeriod = () => {
    setCurrentDate(viewMode === 'monthly' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => nextPeriod(),
    onSwipedRight: () => prevPeriod(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  // Generate days based on viewMode
  let startDate, endDate;
  if (viewMode === 'monthly') {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  } else {
    // Weekly view based on selectedDate or currentDate
    startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="calendar-container" {...handlers}>
      <div className="calendar-header">
        <button onClick={prevPeriod} className="icon-btn">
          <ChevronLeft size={24} />
        </button>
        <h2>
          {viewMode === 'monthly' 
            ? format(currentDate, 'MMMM yyyy', { locale: id })
            : `${format(startDate, 'd MMM', { locale: id })} - ${format(endDate, 'd MMM yyyy', { locale: id })}`
          }
        </h2>
        <button onClick={nextPeriod} className="icon-btn">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="calendar-grid">
        {/* Days of week header */}
        {weekDays.map((day) => (
          <div key={day} className="weekday-header">{day}</div>
        ))}

        {/* Days cells */}
        {days.map((day) => {
          // Find agendas that fall on this day
          const dayString = format(day, 'yyyy-MM-dd');
          const dayAgendas = allAgendas ? allAgendas.filter(a => a.dateString === dayString) : [];
          
          // Map agendas to their event colors
          const dayEvents = dayAgendas.map(agenda => {
            const event = events?.find(e => e.id === agenda.eventId);
            return event ? event : null;
          }).filter(Boolean);

          return (
            <DayCell 
              key={day.toString()} 
              day={day}
              currentMonth={currentDate}
              isSelected={isSameDay(day, selectedDate)}
              isCurrentMonth={viewMode === 'weekly' ? true : isSameMonth(day, currentDate)}
              onClick={() => setSelectedDate(day)}
              events={dayEvents}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
