import { useState, useEffect } from 'react';

// Cache global untuk menyimpan data libur per tahun agar tidak fetch berulang kali
const globalHolidayCache = {};

export const useHolidays = (year) => {
  const [holidays, setHolidays] = useState(globalHolidayCache[year] || {});

  useEffect(() => {
    if (!year) return;

    if (globalHolidayCache[year]) {
      setHolidays(globalHolidayCache[year]);
      return;
    }

    // Fetch data libur dari API libur.deno.dev
    fetch(`https://libur.deno.dev/api?year=${year}`)
      .then(res => res.json())
      .then(data => {
        const holidayMap = {};
        if (Array.isArray(data)) {
          data.forEach(item => {
            // Asumsi API mengembalikan "date" format "YYYY-MM-DD"
            // dan "is_national_holiday" boolean. Kita gabungkan semua libur (termasuk cuti bersama)
            holidayMap[item.date] = item.name;
          });
        }
        globalHolidayCache[year] = holidayMap;
        setHolidays(holidayMap);
      })
      .catch(err => {
        console.error("Gagal mengambil data libur nasional:", err);
      });
  }, [year]);

  return holidays;
};
