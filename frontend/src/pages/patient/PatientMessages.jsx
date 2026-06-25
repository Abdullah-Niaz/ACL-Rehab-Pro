import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Send, MessageCircle, Heart, User, Check, CheckCheck } from 'lucide-react';

export default function PatientMessages() {
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const fetchMessages = () => {
    if (!user) return;
    api.get(`/messages/conversation/${user.id}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Error fetching messages', err));
  };

  useEffect(() => {
    if (!user) return;
    
    // Fetch doctor name from profile
    api.get('/progress/me')
      .then(res => {
        const doc = res.data.patient?.doctor;
        if (doc) setDoctor(doc);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching doctor details', err);
        setLoading(false);
      });

    fetchMessages();

    // Mark as read
    api.patch(`/messages/read/${user.id}`).catch(err => console.error(err));

    // Poll message feed
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      const response = await api.post('/messages', {
        text: text.trim()
      });
      setMessages(prev => [...prev, response.data]);
      setText('');
      setSending(false);
    } catch (err) {
      console.error(err);
      setSending(false);
    }
  }

  if (loading) {
    return (
      <Layout role="patient">
        <p className="animate-pulse">Loading secure chat...</p>
      </Layout>
    );
  }

  const docInitials = doctor?.name ? doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';

  return (
    <Layout role="patient">
      <div className="h-[750px] bg-brand-canvas rounded-[16px] border border-brand-hairlineSoft flex overflow-hidden select-none shadow-none">
        
        {/* Left / Center pane: Chat thread */}
        <div className="flex-1 flex flex-col bg-brand-surfaceSoft/30">
          {/* Active Header */}
          <div className="bg-brand-canvas px-6 py-4 border-b border-brand-hairlineSoft flex justify-between items-center shadow-none">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[16px] bg-brand-surfaceCard text-brand-charcoal flex items-center justify-center font-bold text-xs">
                {docInitials}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-brand-ink">{doctor?.name || "Managing Doctor"}</h4>
                <p className="text-[9px] text-brand-mute font-bold uppercase tracking-wider mt-0.5">Secure Clinical Messaging</p>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-brand-mute">
                <MessageCircle size={36} className="text-brand-stone mb-2" />
                <p className="text-xs font-bold">No messages yet. Say hello to your doctor!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isPatientSender = msg.senderId === user.id;
                return (
                  <div 
                    key={msg._id} 
                    className={`flex ${isPatientSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[65%] p-3.5 rounded-[16px] text-xs leading-relaxed ${
                        isPatientSender 
                          ? 'bg-brand-primary text-white rounded-tr-none' 
                          : 'bg-brand-canvas text-brand-body rounded-tl-none border border-brand-hairlineSoft'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px]">
                        <span className={isPatientSender ? 'text-white/70' : 'text-brand-mute'}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isPatientSender && (
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

          {/* Textarea input */}
          <form onSubmit={handleSend} className="bg-brand-canvas border-t border-brand-hairlineSoft p-4 flex gap-2.5">
            <input
              type="text"
              placeholder="Message your clinician..."
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
        </div>

        {/* Right pane: Doctor profile summary */}
        <div className="w-80 border-l border-brand-hairlineSoft p-6 hidden lg:block bg-brand-canvas space-y-6">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-brand-mute uppercase block mb-3">
              Assigned Clinician
            </span>
            <div className="flex items-center gap-3 p-4 bg-brand-surfaceSoft rounded-[16px] border border-brand-hairlineSoft">
              <div className="w-12 h-12 rounded-[16px] bg-brand-surfaceCard text-brand-charcoal flex items-center justify-center font-extrabold text-base border border-brand-hairlineSoft">
                {docInitials}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-extrabold text-xs text-brand-ink truncate">{doctor?.name}</h4>
                <p className="text-[9px] text-brand-mute font-bold uppercase tracking-wider mt-0.5">Surgeon / Physio</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold text-brand-charcoal">
            <div>
              <span className="text-[10px] text-brand-mute uppercase tracking-widest font-extrabold block mb-1">Email</span>
              <span className="text-brand-ink font-bold">{doctor?.email}</span>
            </div>

            <div>
              <span className="text-[10px] text-brand-mute uppercase tracking-widest font-extrabold block mb-1">Support Clinic</span>
              <span className="text-brand-ink font-bold">Elite Sports Physiotherapy Center</span>
            </div>

            <div>
              <span className="text-[10px] text-brand-mute uppercase tracking-widest font-extrabold block mb-1">Medical Hours</span>
              <span className="text-brand-ink font-bold">Mon - Fri • 9:00 AM - 5:00 PM</span>
            </div>
          </div>

          <div className="border-t border-brand-hairlineSoft pt-6 space-y-2.5">
            <div className="p-3 bg-brand-primary/5 border border-brand-primary/10 text-[11px] leading-relaxed rounded-[16px] text-brand-primary flex gap-2 items-start font-bold">
              <Heart size={14} className="mt-0.5 text-brand-primary flex-shrink-0" />
              <span>Use this channel to notify your clinician about knee flexion pain, debridement complications, or wound swelling concerns.</span>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
