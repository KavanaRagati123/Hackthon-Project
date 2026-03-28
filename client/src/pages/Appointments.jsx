import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LoadingSpinner, EmptyState } from '../components/UI';
import {
  HiCalendar, HiClock, HiVideoCamera, HiUser, HiStar, HiGlobe,
  HiCheck, HiX, HiChat, HiPaperAirplane, HiLightBulb, HiClipboardList,
  HiBookOpen, HiLink, HiCheckCircle, HiExclamation
} from 'react-icons/hi';

/* ==========================================
   NOTE TYPE CONFIG
   ========================================== */
const noteTypes = [
  { value: 'suggestion', label: 'Suggestion', icon: HiLightBulb, color: 'text-amber-500' },
  { value: 'follow-up', label: 'Follow-up', icon: HiClipboardList, color: 'text-primary-500' },
  { value: 'resource', label: 'Resource', icon: HiBookOpen, color: 'text-mint-500' },
  { value: 'general', label: 'General', icon: HiChat, color: 'text-dark-400' },
];

const statusConfig = {
  pending: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', label: 'Pending' },
  confirmed: { badge: 'badge-mint', label: 'Confirmed' },
  completed: { badge: 'badge-primary', label: 'Completed' },
  cancelled: { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', label: 'Cancelled' },
};

/* ==========================================
   APPOINTMENT DETAIL PANEL (Chat + Notes)
   ========================================== */
function AppointmentDetail({ appointment, user, onClose, onRefresh }) {
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('suggestion');
  const [sending, setSending] = useState(false);
  const [marking, setMarking] = useState(false);
  const chatEndRef = useRef(null);

  const isCounsellor = user?.role === 'counsellor' || user?.role === 'admin';
  const notes = appointment.counsellorNotes || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes.length]);

  const sendNote = async () => {
    if (!noteText.trim()) return;
    setSending(true);
    try {
      await appointmentAPI.addNote(appointment._id, { text: noteText.trim(), type: noteType });
      setNoteText('');
      toast.success('Note sent!');
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const markComplete = async () => {
    setMarking(true);
    try {
      await appointmentAPI.update(appointment._id, { status: 'completed' });
      toast.success('Session marked complete');
      onRefresh();
    } catch (e) {
      toast.error('Failed to update');
    } finally {
      setMarking(false);
    }
  };

  const studentName = appointment.isAnonymous
    ? 'Anonymous Student'
    : (appointment.studentId?.name || 'Student');

  const counsellorName = appointment.counsellorId?.userId?.name || 'Counsellor';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-dark-200/50 dark:border-dark-800/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${statusConfig[appointment.status]?.badge}`}>
                {statusConfig[appointment.status]?.label}
              </span>
              {appointment.isAnonymous && (
                <span className="badge bg-dark-100 dark:bg-dark-800 text-dark-500 text-[10px]">Anonymous</span>
              )}
            </div>
            <h3 className="text-lg font-bold">
              {isCounsellor ? studentName : `Dr. ${counsellorName}`}
            </h3>
            <div className="flex items-center gap-3 text-sm text-dark-500 dark:text-dark-400 mt-1">
              <span className="flex items-center gap-1">
                <HiCalendar className="w-3.5 h-3.5" />
                {new Date(appointment.dateTime).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <HiClock className="w-3.5 h-3.5" />
                {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors">
            <HiX className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        {/* Video Call Banner */}
        {appointment.meetingLink && appointment.status === 'confirmed' && (
          <div className="px-5 py-3 bg-primary-50/60 dark:bg-primary-900/10 border-b border-dark-200/30 dark:border-dark-800/30">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HiVideoCamera className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm font-semibold text-dark-800 dark:text-dark-100">Video Session Ready</p>
                  <p className="text-xs text-dark-500">Powered by Jitsi Meet — no install needed</p>
                </div>
              </div>
              <a
                href={appointment.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5 shrink-0"
              >
                <HiVideoCamera className="w-4 h-4" />
                {isCounsellor ? 'Start Call' : 'Join Call'}
              </a>
            </div>
            {/* Copy link */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(appointment.meetingLink);
                toast.success('Meeting link copied!');
              }}
              className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 mt-2 hover:underline"
            >
              <HiLink className="w-3 h-3" /> Copy meeting link to share
            </button>
          </div>
        )}

        {/* Notes Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[200px]">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <HiChat className="w-10 h-10 text-dark-300 dark:text-dark-600 mx-auto mb-3" />
              <p className="text-dark-500 dark:text-dark-400 text-sm font-medium">
                {isCounsellor
                  ? 'Send suggestions, follow-ups, or resources to the student'
                  : 'Your counsellor will share notes and suggestions here'}
              </p>
            </div>
          ) : (
            notes.map((note, i) => {
              const typeInfo = noteTypes.find(t => t.value === note.type) || noteTypes[3];
              const TypeIcon = typeInfo.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3"
                >
                  <div className={`w-8 h-8 rounded-lg bg-dark-100 dark:bg-dark-800 flex items-center justify-center shrink-0 mt-0.5`}>
                    <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-dark-400">
                        {typeInfo.label}
                      </span>
                      <span className="text-[10px] text-dark-400">
                        {new Date(note.createdAt).toLocaleString([], {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-dark-700 dark:text-dark-200 leading-relaxed bg-dark-50 dark:bg-dark-800/60 rounded-xl rounded-tl-sm px-3 py-2">
                      {note.text}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Counsellor Input Area */}
        {isCounsellor && (appointment.status === 'confirmed' || appointment.status === 'completed') && (
          <div className="border-t border-dark-200/50 dark:border-dark-800/50 p-4">
            {/* Note type tabs */}
            <div className="flex gap-1 mb-3">
              {noteTypes.map(nt => (
                <button
                  key={nt.value}
                  onClick={() => setNoteType(nt.value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                    ${noteType === nt.value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800'
                    }`}
                >
                  <nt.icon className="w-3.5 h-3.5" />
                  {nt.label}
                </button>
              ))}
            </div>

            {/* Input + Send */}
            <div className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendNote()}
                placeholder="Type a suggestion or note..."
                className="input-field flex-1 !py-2.5 text-sm"
              />
              <button
                onClick={sendNote}
                disabled={sending || !noteText.trim()}
                className="btn-primary !p-2.5 disabled:opacity-40"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <HiPaperAirplane className="w-5 h-5 rotate-90" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isCounsellor && appointment.status === 'confirmed' && (
          <div className="border-t border-dark-200/50 dark:border-dark-800/50 p-4">
            <button
              onClick={markComplete}
              disabled={marking}
              className="w-full flex items-center justify-center gap-2 btn-primary !bg-mint-600 hover:!bg-mint-700 text-sm"
            >
              <HiCheckCircle className="w-4 h-4" />
              {marking ? 'Updating...' : 'Mark Session Complete'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ==========================================
   MAIN APPOINTMENTS PAGE
   ========================================== */
export default function Appointments() {
  const { user } = useAuth();
  const [counsellors, setCounsellors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [selectedApt, setSelectedApt] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  const isCounsellor = user?.role === 'counsellor' || user?.role === 'admin';

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const promises = [appointmentAPI.getAll()];
      if (user?.role === 'student') promises.push(appointmentAPI.getCounsellors());
      
      const results = await Promise.all(promises);
      setAppointments(results[0].data.appointments || []);
      if (results[1]) setCounsellors(results[1].data.counsellors || []);

      // Refresh the selected appointment if open
      if (selectedApt) {
        const updated = (results[0].data.appointments || []).find(a => a._id === selectedApt._id);
        if (updated) setSelectedApt(updated);
      }
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!bookingDate || !bookingTime) {
      toast.error('Please select date and time');
      return;
    }
    setSubmitting(true);
    try {
      const dateTime = new Date(`${bookingDate}T${bookingTime}`).toISOString();
      await appointmentAPI.create({
        counsellorId: booking._id,
        dateTime,
        isAnonymous,
        duration: 60
      });
      toast.success('Appointment booked! 🎉');
      setBooking(null);
      setBookingDate('');
      setBookingTime('');
      setIsAnonymous(false);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (id, e) => {
    e?.stopPropagation();
    try {
      await appointmentAPI.cancel(id);
      toast.success('Appointment cancelled');
      loadData();
    } catch (e) {
      toast.error('Failed to cancel');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  if (loading) return <div className="pt-24"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">
            {isCounsellor ? 'Session' : 'Counselling'} <span className="gradient-text">Appointments</span>
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mb-8 font-medium">
            {isCounsellor
              ? 'Manage your sessions. Start video calls and send suggestions to students.'
              : 'Book sessions with certified counsellors. Your privacy is guaranteed.'}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        {appointments.length > 0 && (
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
            {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap
                  ${filter === f
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`}
              >
                {f === 'all' ? `All (${appointments.length})` : `${f} (${appointments.filter(a => a.status === f).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Appointments List */}
        {filteredAppointments.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 tracking-tight">
              <HiCalendar className="text-primary-500" />
              {isCounsellor ? 'Your Sessions' : 'Your Appointments'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredAppointments.map((apt, index) => (
                <motion.div
                  key={apt._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedApt(apt)}
                  className="glass-card card-hover cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`badge ${statusConfig[apt.status]?.badge}`}>
                          {statusConfig[apt.status]?.label}
                        </span>
                        {apt.isAnonymous && (
                          <span className="badge bg-dark-100 dark:bg-dark-800 text-dark-500 text-[10px]">Anonymous</span>
                        )}
                        {apt.counsellorNotes?.length > 0 && (
                          <span className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px]">
                            {apt.counsellorNotes.length} note{apt.counsellorNotes.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <p className="font-bold text-dark-800 dark:text-dark-100 truncate">
                        {isCounsellor
                          ? (apt.isAnonymous ? 'Anonymous Student' : (apt.studentId?.name || 'Student'))
                          : (apt.counsellorId?.userId?.name || 'Counsellor')}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-sm text-dark-500 dark:text-dark-400">
                        <span className="flex items-center gap-1">
                          <HiCalendar className="w-3.5 h-3.5" />
                          {new Date(apt.dateTime).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiClock className="w-3.5 h-3.5" />
                          {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 ml-3">
                      {apt.meetingLink && apt.status === 'confirmed' && (
                        <a
                          href={apt.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="btn-primary !py-2 !px-3 text-xs flex items-center gap-1"
                        >
                          <HiVideoCamera className="w-4 h-4" />
                          {isCounsellor ? 'Start' : 'Join'}
                        </a>
                      )}
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <button
                          onClick={(e) => cancelAppointment(apt._id, e)}
                          className="btn-ghost text-coral-500 !py-2 !px-3 text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preview latest note */}
                  {apt.counsellorNotes?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-dark-100 dark:border-dark-800">
                      <p className="text-xs text-dark-500 dark:text-dark-400 truncate flex items-center gap-1.5">
                        <HiChat className="w-3 h-3 shrink-0" />
                        <span className="font-medium">Latest:</span>
                        {apt.counsellorNotes[apt.counsellorNotes.length - 1].text}
                      </p>
                    </div>
                  )}

                  {/* Click hint */}
                  <div className="mt-2 text-[11px] text-dark-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <HiChat className="w-3 h-3" /> Click to {isCounsellor ? 'manage session & send notes' : 'view details & notes'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {filteredAppointments.length === 0 && appointments.length > 0 && (
          <EmptyState
            icon={HiCalendar}
            title={`No ${filter} appointments`}
            description={`You don't have any ${filter} appointments.`}
            action={<button onClick={() => setFilter('all')} className="btn-primary text-sm !py-2">Show All</button>}
          />
        )}

        {appointments.length === 0 && !isCounsellor && (
          <EmptyState
            icon={HiCalendar}
            title="No appointments yet"
            description="Book your first session with a counsellor below."
          />
        )}

        {/* Counsellors List (Students Only) */}
        {user?.role === 'student' && (
          <>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 tracking-tight">
              <HiUser className="text-mint-500" /> Available Counsellors
            </h2>

            {counsellors.length === 0 ? (
              <EmptyState icon={HiUser} title="No Counsellors Available" description="Counsellors haven't been set up yet." />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {counsellors.map((counsellor) => (
                  <motion.div
                    key={counsellor._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card card-hover"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-mint-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">{counsellor.userId?.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold">{counsellor.userId?.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-amber-500">
                          <HiStar className="w-4 h-4" />
                          <span>{counsellor.rating || '4.5'}</span>
                          <span className="text-dark-400 text-xs ml-1">({counsellor.totalSessions} sessions)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-dark-600 dark:text-dark-400 mb-3 line-clamp-2">{counsellor.bio}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {counsellor.specialties?.map((s) => (
                        <span key={s} className="badge-primary text-[10px]">{s}</span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-dark-500 dark:text-dark-400 mb-4">
                      <HiGlobe className="w-3 h-3" />
                      {counsellor.languages?.join(', ')}
                    </div>

                    <button
                      onClick={() => setBooking(counsellor)}
                      className="btn-primary w-full !py-2.5 text-sm"
                    >
                      Book Appointment
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Booking Modal */}
        <AnimatePresence>
          {booking && (
            <div className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBooking(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-1">Book Appointment</h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm mb-6">with {booking.userId?.name}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Date</label>
                    <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Time</label>
                    <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="input-field" />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                    <input type="checkbox" id="anon" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="accent-primary-500" />
                    <label htmlFor="anon" className="text-sm">Book anonymously (your identity will be hidden)</label>
                  </div>

                  {/* Jitsi info */}
                  <div className="flex items-start gap-2 p-3 bg-mint-50 dark:bg-mint-900/10 rounded-xl border border-mint-200/50 dark:border-mint-800/20">
                    <HiVideoCamera className="w-5 h-5 text-mint-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-mint-700 dark:text-mint-300">
                      A <strong>free video call link</strong> (Jitsi Meet) will be automatically generated. No installation needed — works in your browser.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setBooking(null)} className="btn-ghost flex-1 border border-dark-200 dark:border-dark-700">Cancel</button>
                  <button onClick={bookAppointment} disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Appointment Detail Panel */}
        <AnimatePresence>
          {selectedApt && (
            <AppointmentDetail
              appointment={selectedApt}
              user={user}
              onClose={() => setSelectedApt(null)}
              onRefresh={loadData}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
