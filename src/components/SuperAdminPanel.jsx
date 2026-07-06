import React, { useState, useEffect } from 'react';
import { db, secondaryAuth } from '../firebase';
import { collection, addDoc, getDocs, query, updateDoc, doc, arrayUnion, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Users, Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const SuperAdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'admins'
  
  // Data state
  const [events, setEvents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState('#3b82f6');
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const eventsSnap = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);

      const usersSnap = await getDocs(query(collection(db, 'users')));
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => u.role === 'admin');
      setAdmins(usersData);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    
    setIsSavingEvent(true);
    const toastId = toast.loading('Menambahkan event...');
    try {
      await addDoc(collection(db, 'events'), {
        title: newEventTitle,
        color: newEventColor,
        adminIds: []
      });
      setNewEventTitle('');
      fetchData();
      toast.success('Event berhasil ditambahkan!', { id: toastId });
    } catch (err) {
      console.error("Error adding event: ", err);
      toast.error('Gagal menambahkan event', { id: toastId });
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ margin: 0, fontWeight: 500 }}>Hapus event ini beserta datanya?</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button 
            style={{ padding: '0.25rem 0.75rem', background: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }} 
            onClick={() => toast.dismiss(t.id)}
          >
            Batal
          </button>
          <button 
            style={{ padding: '0.25rem 0.75rem', background: 'var(--danger-color)', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }} 
            onClick={async () => {
              toast.dismiss(t.id);
              const toastId = toast.loading('Menghapus event...');
              try {
                await deleteDoc(doc(db, 'events', eventId));
                fetchData();
                toast.success('Event berhasil dihapus', { id: toastId });
              } catch (err) {
                console.error("Error deleting event: ", err);
                toast.error('Gagal menghapus event', { id: toastId });
              }
            }}
          >
            Hapus
          </button>
        </div>
      </div>
    ), { duration: Infinity, id: `confirm-${eventId}` });
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || newAdminPassword.length < 6) {
      toast.error("Email tidak valid atau password kurang dari 6 karakter.");
      return;
    }
    
    const toastId = toast.loading('Membuat admin...');
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newAdminEmail, newAdminPassword);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'admin'
      });
      
      setNewAdminEmail('');
      setNewAdminPassword('');
      fetchData();
      secondaryAuth.signOut();
      
      toast.success("Admin berhasil ditambahkan!", { id: toastId });
    } catch (err) {
      console.error("Error creating admin:", err);
      toast.error("Gagal menambahkan admin: " + err.message, { id: toastId });
    }
  };

  const handleAssignAdmin = async (eventId, adminId) => {
    if (!adminId) return;
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        adminIds: arrayUnion(adminId)
      });
      fetchData();
      toast.success("Admin berhasil ditugaskan ke event ini");
    } catch (err) {
      console.error("Error assigning admin: ", err);
      toast.error("Gagal menugaskan admin");
    }
  };

  return (
    <motion.div 
      className="superadmin-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="superadmin-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="modal-header">
          <h2>Panel Super Admin</h2>
          <button onClick={onClose} className="icon-btn"><X size={24} /></button>
        </div>
        
        <div className="tabs">
          <button 
            className={activeTab === 'events' ? 'active' : ''} 
            onClick={() => setActiveTab('events')}
          >
            <CalendarIcon size={16} /> Kelola Event
          </button>
          <button 
            className={activeTab === 'admins' ? 'active' : ''} 
            onClick={() => setActiveTab('admins')}
          >
            <Users size={16} /> Daftar Admin
          </button>
        </div>

        <div className="modal-content">
          {loading ? (
            <p>Memuat data...</p>
          ) : activeTab === 'events' ? (
            <div className="tab-pane">
              <form onSubmit={handleAddEvent} className="add-form premium-form" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Nama Event Baru" 
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                  className="premium-input"
                  style={{ flex: 1 }}
                />
                <input 
                  type="color" 
                  value={newEventColor}
                  onChange={(e) => setNewEventColor(e.target.value)}
                  title="Pilih Warna Event"
                  style={{ 
                    flex: '0 0 50px', 
                    height: '42px', 
                    padding: '2px', 
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                />
                <button type="submit" className="btn-primary" disabled={isSavingEvent} style={{ whiteSpace: 'nowrap' }}>
                  {isSavingEvent ? 'Menyimpan...' : 'Tambah Event'}
                </button>
              </form>

              <div className="list-container">
                {events.map(event => (
                  <div key={event.id} className="list-item" style={{ borderLeft: `4px solid ${event.color}` }}>
                    <div className="item-details">
                      <h4>{event.title}</h4>
                      <p className="subtitle">Admins: {event.adminIds?.length || 0}</p>
                    </div>
                    <div className="item-actions">
                      <select 
                        onChange={(e) => handleAssignAdmin(event.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Tugaskan Admin...</option>
                        {admins.map(admin => {
                          const isAssigned = event.adminIds?.includes(admin.id);
                          return (
                            <option key={admin.id} value={admin.id} disabled={isAssigned}>
                              {admin.email} {isAssigned ? '(Sudah Ditugaskan)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <button 
                        className="icon-btn-small text-danger" 
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="tab-pane">
              <form onSubmit={handleAddAdmin} className="add-form">
                <input 
                  type="email" 
                  placeholder="Email Admin Baru" 
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Password (min 6 char)" 
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="submit" className="btn-primary">Buat Admin</button>
              </form>

              <div className="list-container">
                {admins.map(admin => (
                  <div key={admin.id} className="list-item">
                    <h4>{admin.email}</h4>
                    <p className="subtitle">UID: {admin.id}</p>
                  </div>
                ))}
                {admins.length === 0 && <p className="subtitle">Belum ada admin terdaftar.</p>}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuperAdminPanel;
