import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import CalendarGrid from '../components/CalendarGrid';
import BottomDetailPanel from '../components/BottomDetailPanel';
import SuperAdminPanel from '../components/SuperAdminPanel';
import { LogOut, Sun, Moon, Settings } from 'lucide-react';
import { useReminders } from '../hooks/useReminders';

const Dashboard = () => {
  const { currentUser, userRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'weekly'
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [events, setEvents] = useState([]);
  const [allAgendas, setAllAgendas] = useState([]);

  // Initialize Reminders
  useReminders(allAgendas);

  // Fetch events based on role
  useEffect(() => {
    const fetchEvents = async () => {
      if (!userRole) return;
      try {
        let q;
        if (userRole === 'superadmin' || userRole === 'guest') {
          q = query(collection(db, 'events'));
        } else {
          q = query(collection(db, 'events'), where('adminIds', 'array-contains', currentUser.uid));
        }
        
        const snap = await getDocs(q);
        const fetchedEvents = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    
    fetchEvents();
  }, [userRole, currentUser, showAdminPanel]);

  // Fetch all agendas for the allowed events to show bullets on calendar
  useEffect(() => {
    if (events.length === 0) {
      setAllAgendas([]);
      return;
    }

    const fetchAgendas = async () => {
      try {
        const allowedEventIds = events.map(e => e.id);
        const q = query(collection(db, 'agendas')); // Ideally we would batch this with 'in' if there are few events, but getting all and filtering client side is okay for V1
        const snap = await getDocs(q);
        
        const fetchedAgendas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filteredAgendas = fetchedAgendas.filter(a => allowedEventIds.includes(a.eventId));
        
        setAllAgendas(filteredAgendas);
      } catch (err) {
        console.error("Error fetching all agendas:", err);
      }
    };

    fetchAgendas();
  }, [events]);

  // Toggle Dark Mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="mobile-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-info">
          <h1>Kalender Event</h1>
          <span className="role-badge">
            {userRole === 'superadmin' ? 'Super Admin' : userRole === 'guest' ? 'Tamu' : 'Admin'}
          </span>
        </div>
        <div className="header-actions">
          {userRole === 'superadmin' && (
            <button onClick={() => setShowAdminPanel(true)} className="icon-btn">
              <Settings size={20} />
            </button>
          )}
          <button onClick={toggleTheme} className="icon-btn">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="icon-btn logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Top Panel: Calendar */}
      <div className="top-panel">
        <div className="view-toggle">
          <button 
            className={viewMode === 'monthly' ? 'active' : ''} 
            onClick={() => setViewMode('monthly')}
          >
            Bulanan
          </button>
          <button 
            className={viewMode === 'weekly' ? 'active' : ''} 
            onClick={() => setViewMode('weekly')}
          >
            Mingguan
          </button>
        </div>
        <CalendarGrid 
          selectedDate={selectedDate} 
          setSelectedDate={setSelectedDate}
          viewMode={viewMode}
          events={events} // Still pass events for color mapping
          allAgendas={allAgendas} // Pass agendas to show accurate bullets
        />
      </div>

      {/* Bottom Panel: Details */}
      <div className="bottom-panel">
        <BottomDetailPanel 
          selectedDate={selectedDate} 
          userRole={userRole} 
          currentUser={currentUser}
          events={events} 
          onAgendaChanged={() => {
            // Trigger a re-fetch of events to subsequently re-fetch agendas
            // A simpler way: we can just re-assign the events array to trigger the useEffect
            setEvents([...events]);
          }}
        />
      </div>

      {/* Super Admin Modal */}
      {showAdminPanel && (
        <SuperAdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
};

export default Dashboard;
