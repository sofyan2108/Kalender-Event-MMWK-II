import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getPasaran } from '../utils/javaneseCalendar';
import { PlusCircle, CheckCircle, Circle, Trash2, Plus, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const BottomDetailPanel = ({ selectedDate, userRole, currentUser, events, onAgendaChanged }) => {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  const formattedDate = format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id });
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const pasaran = getPasaran(selectedDate);

  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'agendas'), where('dateString', '==', dateString));
      const snap = await getDocs(q);
      const fetchedAgendas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const allowedEventIds = events.map(e => e.id);
      const filteredAgendas = fetchedAgendas.filter(a => allowedEventIds.includes(a.eventId));
      
      setAgendas(filteredAgendas);
    } catch (err) {
      console.error("Error fetching agendas:", err);
      toast.error("Gagal memuat agenda");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedDate && events.length > 0) {
      fetchAgendas();
    } else if (events.length === 0) {
      setAgendas([]);
    }
  }, [selectedDate, events]);

  const handleAddAgenda = async (e) => {
    e.preventDefault();
    if (!newAgendaTitle.trim() || !selectedEventId || !newAgendaTime) {
      toast.error("Judul agenda, event, dan jam harus diisi");
      return;
    }
    
    const toastId = toast.loading('Menyimpan agenda...');
    try {
      await addDoc(collection(db, 'agendas'), {
        eventId: selectedEventId,
        dateString,
        time: newAgendaTime,
        title: newAgendaTitle,
        isCompleted: false,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      setNewAgendaTitle('');
      setNewAgendaTime('');
      setSelectedEventId('');
      setShowAddForm(false);
      fetchAgendas();
      if (typeof onAgendaChanged === 'function') onAgendaChanged();
      toast.success('Agenda berhasil ditambahkan!', { id: toastId });
    } catch (err) {
      console.error("Error adding agenda:", err);
      toast.error('Gagal menambahkan agenda', { id: toastId });
    }
  };

  const handleDeleteAgenda = async (agendaId) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ margin: 0, fontWeight: 500 }}>Apakah Anda yakin ingin menghapus agenda ini?</p>
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
              const toastId = toast.loading('Menghapus agenda...');
              try {
                await deleteDoc(doc(db, 'agendas', agendaId));
                fetchAgendas();
                if (typeof onAgendaChanged === 'function') onAgendaChanged();
                toast.success('Agenda berhasil dihapus', { id: toastId });
              } catch (err) {
                toast.error('Gagal menghapus agenda', { id: toastId });
              }
            }}
          >
            Hapus
          </button>
        </div>
      </div>
    ), { duration: Infinity, id: `confirm-agenda-${agendaId}` });
  };

  const toggleAgendaStatus = async (agendaId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'agendas', agendaId), { isCompleted: !currentStatus });
      fetchAgendas();
    } catch (err) {
      toast.error('Gagal update status agenda');
    }
  };

  const getEventDetails = (eventId) => {
    return events.find(e => e.id === eventId) || { title: 'Unknown', color: '#ccc' };
  };

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h3>{formattedDate}</h3>
        <span className="pasaran-badge">{pasaran}</span>
      </div>

      <div className="agenda-list">
        {loading ? (
          <p>Memuat agenda...</p>
        ) : agendas.length === 0 ? (
          <div className="empty-state">Belum ada agenda untuk hari ini.</div>
        ) : (
          agendas.map((agenda, index) => {
            const eventDetails = getEventDetails(agenda.eventId);
            const isCompleted = agenda.isCompleted || false;

            return (
              <motion.div 
                key={agenda.id} 
                className="agenda-item" 
                style={{ borderLeft: `4px solid ${eventDetails.color}` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="agenda-item-header">
                  <div className="agenda-title-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                    <button 
                      onClick={() => toggleAgendaStatus(agenda.id, isCompleted)} 
                      className="task-check-btn"
                    >
                      {isCompleted ? <CheckCircle size={22} color={eventDetails.color} /> : <Circle size={22} color="var(--text-secondary)" />}
                    </button>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="agenda-title" style={{ textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {agenda.title}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {agenda.time && (
                          <span className="agenda-time-tag" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            ⏰ {agenda.time}
                          </span>
                        )}
                        <span className="agenda-event-tag" style={{ backgroundColor: eventDetails.color + '20', color: eventDetails.color }}>
                          {eventDetails.title}
                        </span>
                      </div>
                    </div>
                  </div>
                  {userRole === 'admin' && (
                    <button className="icon-btn text-danger" onClick={() => handleDeleteAgenda(agenda.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {userRole === 'admin' && events.length > 0 && !showAddForm && (
        <button 
          className="btn-add-agenda" 
          onClick={() => setShowAddForm(true)}
        >
          <PlusCircle size={20} />
          Tambah Agenda
        </button>
      )}

      {showAddForm && (
        <motion.form 
          onSubmit={handleAddAgenda} 
          className="add-agenda-form premium-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <select 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value)}
            required
            className="premium-input"
          >
            <option value="" disabled>Pilih Event...</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="time" 
              value={newAgendaTime}
              onChange={(e) => setNewAgendaTime(e.target.value)}
              required
              className="premium-input time-input"
            />
            <input 
              type="text" 
              placeholder="Judul Agenda..." 
              value={newAgendaTitle}
              onChange={(e) => setNewAgendaTitle(e.target.value)}
              autoFocus
              required
              className="premium-input title-input"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-cancel" disabled={isSaving}>Batal</button>
            <button type="submit" className="btn-save" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </motion.form>
      )}
    </div>
  );
};

export default BottomDetailPanel;
