import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/client';
import { Send, Search, Users, ChevronRight, Check, CheckCheck, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorMessages() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const chatEndRef = useRef(null);

  // Fetch list of patients (includes unread counts)
  const fetchPatients = () => {
    api.get('/doctor/patients')
      .then(res => {
        setPatients(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching patients list', err);
        setLoading(false);
      });
  };

  // Fetch messages thread for selected patient
  const fetchMessages = () => {
    if (!patientId) return;
    api.get(`/messages/conversation/${patientId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Error fetching messages thread', err));
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!patientId) return;
    fetchMessages();
    
    // Mark as read
    api.patch(`/messages/read/${patientId}`)
      .then(() => fetchPatients()) // refresh unread counts on list
      .catch(err => console.error(err));

    // Poll message feed
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [patientId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !patientId) return;

    setSending(true);
    try {
      const response = await api.post('/messages', {
        patientId,
        text: text.trim()
      });
      setMessages(prev => [...prev, response.data]);
      setText('');
      setSending(false);
    } catch (err) {
      console.error('Error sending message', err);
      setSending(false);
    }
  }

  const selectedPatient = patients.find(p => p.userId?._id === patientId);

  return (
    <Layout role="doctor">
      <div className="h-[750px] bg-brand-canvas rounded-md border border-brand-hairlineSoft flex overflow-hidden select-none shadow-none">
        
        {/* Left Side Pane: Patients List */}
        <div className="w-80 border-r border-brand-hairlineSoft flex flex-col">
          <div className="p-4 border-b border-brand-hairlineSoft bg-brand-surfaceSoft/30">
            <h3 className="font-extrabold text-brand-ink text-sm tracking-tight flex items-center gap-1.5">
              <Users size={16} className="text-brand-primary" />
              Patient Conversations
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-brand-hairlineSoft/40 custom-scrollbar bg-brand-canvas">
            {patients.length === 0 ? (
              <p className="p-4 text-xs text-brand-mute italic text-center">No active chats.</p>
            ) : (
              patients.map(p => {
                const isActive = p.userId?._id === patientId;
                const initials = p.userId?.name ? p.userId.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'U';
                
                return (
                  <Link
                    key={p._id}
                    to={`/doctor/messages/${p.userId?._id}`}
                    className={`flex items-center gap-3 p-4 transition ${
                      isActive 
                        ? 'bg-brand-surfaceCard border-l-4 border-l-brand-primary' 
                        : 'hover:bg-brand-surfaceSoft'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-md bg-brand-surfaceSoft text-brand-charcoal border border-brand-hairlineSoft flex items-center justify-center font-bold text-xs">
                      {initials}
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-bold text-xs truncate ${isActive ? 'text-brand-primary' : 'text-brand-ink'}`}>{p.userId?.name}</span>
                        {p.unreadMessagesCount > 0 && (
                          <span className="bg-brand-primary text-white rounded-full text-[9px] font-bold h-4.5 w-4.5 flex items-center justify-center">
                            {p.unreadMessagesCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-brand-mute block truncate mt-0.5">Phase {p.currentPhase} • Week {p.currentWeek}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Pane: Chat View */}
        <div className="flex-1 flex flex-col bg-brand-surfaceSoft/30">
          {selectedPatient ? (
            <>
              {/* Active Header */}
              <div className="bg-brand-canvas px-6 py-3.5 border-b border-brand-hairlineSoft flex justify-between items-center shadow-none">
                <div>
                  <h4 className="font-bold text-sm text-brand-ink">{selectedPatient.userId?.name}</h4>
                  <p className="text-[10px] text-brand-mute font-semibold">Managed patient email: {selectedPatient.userId?.email}</p>
                </div>
                
                <Link 
                  to={`/doctor/patients/${selectedPatient._id}`}
                  className="btn-brand-secondary py-1.5 px-3 text-xs font-bold"
                >
                  Clinical Profile
                </Link>
              </div>

              {/* Message Feed list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-brand-mute italic text-xs font-medium">
                    Send a diagnostic reminder or check-in note to Jane.
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isDoctorSender = msg.senderId !== patientId;
                    return (
                      <div 
                        key={msg._id || idx} 
                        className={`flex ${isDoctorSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[65%] p-3.5 rounded-md text-xs leading-relaxed ${
                            isDoctorSender 
                              ? 'bg-brand-primary text-white rounded-tr-none' 
                              : 'bg-brand-canvas text-brand-body rounded-tl-none border border-brand-hairlineSoft'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[9px]">
                            <span className={isDoctorSender ? 'text-white/70' : 'text-brand-mute'}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isDoctorSender && (
                              msg.isRead ? <CheckCheck size={12} className="text-white/90" /> : <Check size={12} className="text-white/70" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Text area input bar */}
              <form onSubmit={handleSend} className="bg-brand-canvas border-t border-brand-hairlineSoft p-4 flex gap-2.5">
                <input
                  type="text"
                  placeholder="Type a secure message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={sending}
                  className="input-premium flex-1"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="btn-brand-primary py-2.5 px-6 shadow-none"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-brand-mute p-6 bg-brand-surfaceSoft/20">
              <MessageSquare size={48} className="text-brand-stone mb-3" />
              <p className="text-sm font-semibold text-brand-ink">No Patient Selected</p>
              <p className="text-xs text-brand-mute mt-1">Select a patient profile from the sidebar panel to check secure message threads.</p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
