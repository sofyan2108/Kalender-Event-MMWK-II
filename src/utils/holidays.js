import { format } from 'date-fns';

// Daftar Libur Nasional Indonesia (Contoh untuk 2026/2027)
// Format: YYYY-MM-DD
const nationalHolidays = {
  // 2026
  '2026-01-01': 'Tahun Baru Masehi',
  '2026-02-17': 'Isra Mikraj Nabi Muhammad SAW',
  '2026-02-27': 'Tahun Baru Imlek',
  '2026-03-20': 'Hari Raya Nyepi',
  '2026-03-21': 'Idul Fitri 1447 H',
  '2026-03-22': 'Idul Fitri 1447 H',
  '2026-04-03': 'Wafat Isa Al Masih',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Isa Al Masih',
  '2026-05-28': 'Idul Adha 1447 H',
  '2026-05-31': 'Hari Lahir Pancasila',
  '2026-06-18': 'Tahun Baru Islam 1448 H',
  '2026-08-17': 'Hari Kemerdekaan RI',
  '2026-08-27': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal',
};

export const getHoliday = (date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return nationalHolidays[dateStr] || null;
};
