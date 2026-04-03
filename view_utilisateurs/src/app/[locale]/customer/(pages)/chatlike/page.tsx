'use client';

import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Smile, MoreVertical, Search, ArrowLeft, Check, CheckCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { featuresDi } from '@/di/features_di';
import { EntityConversation, EntityMessage } from '@/modules/beninheart/conversation/conversation/domain/entities/entity_conversation';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { useAuthStore } from '@/stores/auth_store';
import { API_ROUTES } from '@/shared/constants/api_routes';
import { toast } from 'sonner';

// ─── Liste contacts ────────────────────────────────────────────────────────────

const ContactsListComponent = ({
  searchQuery, setSearchQuery, conversations, selected, onSelect, loading,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  conversations: EntityConversation[];
  selected: EntityConversation | null;
  onSelect: (c: EntityConversation) => void;
  loading: boolean;
}) => (
  <div className="flex flex-col h-full bg-white dark:bg-background border-r border-gray-200 dark:border-gray-800">
    <div className="p-4 bg-gray-50 dark:bg-card border-b border-gray-200 dark:border-gray-700 shrink-0">
      <h2 className="text-xl font-semibold mb-3">Messages</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
      </div>
    </div>
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        {loading && (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && conversations.length === 0 && (
          <div className="text-center p-8 text-muted-foreground text-sm">
            Aucune conversation. Faites des matchs pour commencer à discuter !
          </div>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.uuid}
            onClick={() => onSelect(conv)}
            className={cn(
              'flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-accent transition-colors border-b border-gray-100 dark:border-gray-800',
              selected?.uuid === conv.uuid && 'bg-gray-100 dark:bg-accent'
            )}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={conv.autrePhoto ?? undefined} alt={conv.autrePrenom ?? ''} />
                <AvatarFallback>{(conv.autrePrenom ?? '?')[0]}</AvatarFallback>
              </Avatar>
              {conv.autreEstEnLigne && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-background rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm truncate">{conv.autrePrenom}</h3>
                {conv.dernierMessageAt && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(conv.dernierMessageAt), 'HH:mm', { locale: fr })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate flex-1">
                  {conv.dernierMessageTexte || 'Commencez la conversation…'}
                </p>
                {(conv.messagesNonLus ?? 0) > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {conv.messagesNonLus}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  </div>
);

const ContactsList = memo(ContactsListComponent);
ContactsList.displayName = 'ContactsList';

// ─── Page principale ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [conversations, setConversations] = useState<EntityConversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [selected, setSelected] = useState<EntityConversation | null>(null);
  const [messages, setMessages] = useState<EntityMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Charger les conversations
  useEffect(() => {
    featuresDi.conversationController.getConversations()
      .then((data) => setConversations(data))
      .finally(() => setConvLoading(false));
  }, []);

  // Charger les messages quand une conv est sélectionnée
  useEffect(() => {
    if (!selected?.uuid) return;
    setMsgLoading(true);
    featuresDi.conversationController.getMessages(selected.uuid)
      .then((data) => setMessages(data))
      .finally(() => setMsgLoading(false));
  }, [selected?.uuid]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket chat
  const { send: wsSend, isConnected } = useWebSocket(
    selected ? API_ROUTES.WS.CHAT(selected.uuid!) : '',
    {
      enabled: !!selected,
      onMessage: (data) => {
        if (data.type === 'message') {
          const msg = data.data;
          setMessages((prev) => [...prev, {
            uuid: msg.uuid,
            auteurId: msg.auteur_id,
            estMien: String(msg.auteur_id) === currentUserId,
            texte: msg.texte,
            lu: false,
            createdAt: msg.created_at,
          }]);
          if (String(msg.auteur_id) !== currentUserId) {
            wsSend({ type: 'lu', message_uuid: msg.uuid });
          }
        } else if (data.type === 'typing') {
          if (String(data.data.user_id) !== currentUserId) {
            setIsTyping(data.data.is_typing);
          }
        } else if (data.type === 'lu') {
          setMessages((prev) => prev.map((m) =>
            m.uuid === data.data.message_uuid ? { ...m, lu: true } : m
          ));
        }
      },
    }
  );

  const handleSend = () => {
    if (!messageInput.trim() || !selected) return;
    if (isConnected) {
      wsSend({ type: 'message', texte: messageInput.trim() });
    } else {
      toast.error("Connexion perdue. Reconnexion en cours…");
    }
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (isConnected) {
      wsSend({ type: 'typing', is_typing: true });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        wsSend({ type: 'typing', is_typing: false });
      }, 1500);
    }
  };

  const filtered = useMemo(() =>
    conversations.filter((c) =>
      (c.autrePrenom ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    ), [conversations, searchQuery]
  );

  const ChatArea = () => {
    if (!selected) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-background">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
            <p className="text-muted-foreground">Choisissez un contact pour commencer à discuter</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-background h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-card border-b border-gray-200 dark:border-gray-700 shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelected(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selected.autrePhoto ?? undefined} alt={selected.autrePrenom ?? ''} />
              <AvatarFallback>{(selected.autrePrenom ?? '?')[0]}</AvatarFallback>
            </Avatar>
            {selected.autreEstEnLigne && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-card rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{selected.autrePrenom}</h3>
            <p className="text-xs text-muted-foreground">
              {isTyping ? '✍️ écrit...' : selected.autreEstEnLigne ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>
          <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {msgLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.uuid} className={cn('flex', msg.estMien ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[85%] sm:max-w-[70%] rounded-lg px-3 sm:px-4 py-2',
                      msg.estMien
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white dark:bg-card border border-gray-200 dark:border-gray-700'
                    )}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.texte}</p>
                      <div className={cn(
                        'flex items-center gap-1 mt-1 text-xs',
                        msg.estMien ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'
                      )}>
                        <span>{msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm', { locale: fr }) : ''}</span>
                        {msg.estMien && (
                          msg.lu
                            ? <CheckCheck className="h-3 w-3 text-green-400" />
                            : <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-card border-t border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0"><Smile className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="h-5 w-5" /></Button>
            <Input
              placeholder="Écrivez un message..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!messageInput.trim()} size="icon" className="shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 flex w-full overflow-hidden">
      <div className="hidden md:block md:w-72 lg:w-80 xl:w-96 h-full">
        <ContactsList
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          conversations={filtered}
          selected={selected}
          onSelect={setSelected}
          loading={convLoading}
        />
      </div>
      <div className="flex-1 flex flex-col md:hidden h-full">
        {!selected ? (
          <div className="h-full">
            <ContactsList
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              conversations={filtered}
              selected={selected}
              onSelect={setSelected}
              loading={convLoading}
            />
          </div>
        ) : <ChatArea />}
      </div>
      <div className="hidden md:flex flex-1 h-full"><ChatArea /></div>
    </div>
  );
}
