import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { differenceInMinutes } from 'date-fns';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export const useReminders = (agendas) => {
  const notifiedSet = useRef(new Set()); 

  useEffect(() => {
    // 1. CAPACITOR NATIVE IMPLEMENTATION
    if (Capacitor.isNativePlatform()) {
      const scheduleNativeNotifications = async () => {
        try {
          // Request permission
          const permStatus = await LocalNotifications.requestPermissions();
          if (permStatus.display !== 'granted') return;

          // Clear existing to prevent duplicates when data updates
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
          }

          if (!agendas || agendas.length === 0) return;

          const notificationsToSchedule = [];
          const now = new Date();

          // Construct notifications
          agendas.forEach(agenda => {
            if (!agenda.time || !agenda.dateString) return;
            
            const agendaDateTime = new Date(`${agenda.dateString}T${agenda.time}:00`);
            
            if (agendaDateTime < now) return; // Skip past agendas

            // 24 hours before
            const h24 = new Date(agendaDateTime.getTime() - 24 * 60 * 60 * 1000);
            if (h24 > now) {
              notificationsToSchedule.push({
                title: "Pengingat H-24",
                body: `Agenda "${agenda.title}" akan dimulai besok jam ${agenda.time}`,
                id: Math.floor(Math.random() * 1000000),
                schedule: { at: h24 }
              });
            }

            // 12 hours before
            const h12 = new Date(agendaDateTime.getTime() - 12 * 60 * 60 * 1000);
            if (h12 > now) {
              notificationsToSchedule.push({
                title: "Pengingat H-12",
                body: `Agenda "${agenda.title}" akan dimulai 12 jam lagi`,
                id: Math.floor(Math.random() * 1000000),
                schedule: { at: h12 }
              });
            }

            // 1 hour before
            const h1 = new Date(agendaDateTime.getTime() - 1 * 60 * 60 * 1000);
            if (h1 > now) {
              notificationsToSchedule.push({
                title: "Pengingat H-1",
                body: `Agenda "${agenda.title}" segera dimulai dalam 1 jam!`,
                id: Math.floor(Math.random() * 1000000),
                schedule: { at: h1 }
              });
            }
          });

          if (notificationsToSchedule.length > 0) {
            await LocalNotifications.schedule({ notifications: notificationsToSchedule });
          }

        } catch (err) {
          console.error("Error scheduling native notifications", err);
        }
      };

      scheduleNativeNotifications();
      return; // Stop here, don't run the web polling interval
    }

    // 2. WEB PWA FALLBACK IMPLEMENTATION (Polling)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const checkReminders = () => {
      if (!agendas || agendas.length === 0) return;
      const now = new Date();

      agendas.forEach(agenda => {
        if (!agenda.time || !agenda.dateString) return;
        const agendaDateTime = new Date(`${agenda.dateString}T${agenda.time}:00`);
        const diffMins = differenceInMinutes(agendaDateTime, now);

        const thresholds = [
          { label: '24 jam', mins: 1440 },
          { label: '12 jam', mins: 720 },
          { label: '1 jam', mins: 60 }
        ];

        thresholds.forEach(threshold => {
          if (diffMins === threshold.mins || diffMins === threshold.mins - 1) {
            const notifId = `${agenda.id}-${threshold.mins}`;
            
            if (!notifiedSet.current.has(notifId)) {
              notifiedSet.current.add(notifId);
              const message = `Pengingat: Agenda "${agenda.title}" akan dimulai dalam ${threshold.label} (Jam ${agenda.time})`;
              
              toast(message, { icon: '⏰', duration: 10000 });
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pengingat Kalender Event', { body: message });
              }
            }
          }
        });
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);

  }, [agendas]);
};
