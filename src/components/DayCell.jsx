import React from 'react';
import { format, isToday } from 'date-fns';
import { getPasaran } from '../utils/javaneseCalendar';
import { getHoliday } from '../utils/holidays';

const DayCell = ({ day, isSelected, isCurrentMonth, onClick, events = [] }) => {
  const isCurrentDay = isToday(day);
  const pasaran = getPasaran(day);
  const dayOfWeek = day.getDay();
  
  // Calculate Holidays and Weekends
  const isSunday = dayOfWeek === 0;
  const isFriday = dayOfWeek === 5;
  const holiday = getHoliday(day);
  const isHoliday = !!holiday;

  let colorClass = '';
  if (isSunday || isHoliday) colorClass = 'text-red';
  else if (isFriday) colorClass = 'text-green';
  
  // Calculate Hijri Day in Arabic Numerals (e.g., ١, ٢, ٣)
  let hijriDay = '';
  try {
    hijriDay = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day: 'numeric'}).format(day);
  } catch (e) {
    console.error("Hijri format error", e);
  }

  // Example: events = [{id: 1, color: '#ff0000'}, {id: 2, color: '#00ff00'}]
  
  return (
    <div 
      className={`day-cell 
        ${!isCurrentMonth ? 'not-current-month' : ''} 
        ${isSelected ? 'selected' : ''} 
        ${isCurrentDay ? 'today' : ''}
        ${colorClass}
      `}
      onClick={onClick}
      title={holiday || ''}
    >
      <span className="day-hijri">{hijriDay}</span>
      <div className="day-number">{format(day, 'd')}</div>
      <div className="day-pasaran">{pasaran}</div>
      
      {/* Event Bullets */}
      {events.length > 0 && (
        <div className="event-bullets">
          {events.slice(0, 3).map((event, index) => (
            <span 
              key={index} 
              className="bullet" 
              style={{ backgroundColor: event.color || 'var(--primary-color)' }}
            />
          ))}
          {events.length > 3 && <span className="bullet-more">+</span>}
        </div>
      )}
    </div>
  );
};

export default DayCell;
