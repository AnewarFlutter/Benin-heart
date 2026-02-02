'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Phone,
  Video,
  ArrowLeft,
  Check,
  CheckCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Message {
  id: number;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
  type: 'sent' | 'received'; // demande envoyée ou reçue
}

// Composant Liste des contacts
const ContactsListComponent = ({
  searchQuery,
  setSearchQuery,
  filteredContacts,
  selectedContact,
  setSelectedContact,
  getLastMessage,
  getLastMessageTime,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredContacts: Contact[];
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact) => void;
  getLastMessage: (contactId: number) => string;
  getLastMessageTime: (contactId: number) => Date;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 bg-gray-50 dark:bg-card border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h2 className="text-xl font-semibold mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Rechercher un profil..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={cn(
                'flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-accent transition-colors border-b border-gray-100 dark:border-gray-800',
                selectedContact?.id === contact.id && 'bg-gray-100 dark:bg-accent'
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-background rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">{contact.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {format(getLastMessageTime(contact.id), 'HH:mm', { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate flex-1">
                    {getLastMessage(contact.id)}
                  </p>
                  {contact.unreadCount > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                      {contact.unreadCount}
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
};

// Mémoriser le composant avec une fonction de comparaison personnalisée
const ContactsList = memo(ContactsListComponent, (prevProps, nextProps) => {
  // Ne re-render que si ces propriétés changent
  return (
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.filteredContacts.length === nextProps.filteredContacts.length &&
    prevProps.selectedContact?.id === nextProps.selectedContact?.id
  );
});

ContactsList.displayName = 'ContactsList';

export default function ChatPage() {
  // Données de démonstration
  const contacts: Contact[] = [
    {
      id: 1,
      name: 'Marie, 25 ans',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'Salut ! Comment ça va ?',
      timestamp: new Date(2024, 0, 4, 14, 30),
      unreadCount: 2,
      isOnline: true,
      type: 'received',
    },
    {
      id: 2,
      name: 'Sophie, 28 ans',
      avatar: 'https://i.pravatar.cc/150?img=5',
      lastMessage: 'On se voit ce weekend ?',
      timestamp: new Date(2024, 0, 4, 12, 15),
      unreadCount: 0,
      isOnline: false,
      type: 'sent',
    },
    {
      id: 3,
      name: 'Julie, 26 ans',
      avatar: 'https://i.pravatar.cc/150?img=9',
      lastMessage: 'Merci pour ton message 😊',
      timestamp: new Date(2024, 0, 3, 18, 45),
      unreadCount: 1,
      isOnline: true,
      type: 'received',
    },
    {
      id: 4,
      name: 'Camille, 27 ans',
      avatar: 'https://i.pravatar.cc/150?img=13',
      lastMessage: 'J\'adore ton profil !',
      timestamp: new Date(2024, 0, 3, 10, 20),
      unreadCount: 0,
      isOnline: false,
      type: 'sent',
    },
    {
      id: 5,
      name: 'Léa, 24 ans',
      avatar: 'https://i.pravatar.cc/150?img=16',
      lastMessage: 'À bientôt 👋',
      timestamp: new Date(2024, 0, 2, 16, 30),
      unreadCount: 0,
      isOnline: true,
      type: 'received',
    },
    {
      id: 6,
      name: 'Emma, 29 ans',
      avatar: 'https://i.pravatar.cc/150?img=20',
      lastMessage: 'J\'aimerais bien te rencontrer',
      timestamp: new Date(2024, 0, 2, 14, 15),
      unreadCount: 3,
      isOnline: true,
      type: 'received',
    },
    {
      id: 7,
      name: 'Chloé, 26 ans',
      avatar: 'https://i.pravatar.cc/150?img=23',
      lastMessage: 'Super profil !',
      timestamp: new Date(2024, 0, 2, 11, 45),
      unreadCount: 0,
      isOnline: false,
      type: 'sent',
    },
    {
      id: 8,
      name: 'Manon, 23 ans',
      avatar: 'https://i.pravatar.cc/150?img=26',
      lastMessage: 'On discute quand tu veux',
      timestamp: new Date(2024, 0, 1, 20, 30),
      unreadCount: 1,
      isOnline: true,
      type: 'received',
    },
    {
      id: 9,
      name: 'Laura, 30 ans',
      avatar: 'https://i.pravatar.cc/150?img=28',
      lastMessage: 'Merci pour ton like !',
      timestamp: new Date(2024, 0, 1, 18, 10),
      unreadCount: 0,
      isOnline: false,
      type: 'sent',
    },
    {
      id: 10,
      name: 'Sarah, 25 ans',
      avatar: 'https://i.pravatar.cc/150?img=31',
      lastMessage: 'Coucou toi 😊',
      timestamp: new Date(2024, 0, 1, 15, 20),
      unreadCount: 2,
      isOnline: true,
      type: 'received',
    },
  ];

  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Messages par contact
  const [messagesByContact, setMessagesByContact] = useState<Record<number, Message[]>>({
    1: [
      {
        id: 1,
        content: 'Salut ! J\'ai vu ton profil et je le trouve super intéressant 😊',
        timestamp: new Date(2024, 0, 4, 14, 25),
        isOwn: false,
        status: 'read',
      },
      {
        id: 2,
        content: 'Merci beaucoup ! Le tien aussi est très sympa',
        timestamp: new Date(2024, 0, 4, 14, 27),
        isOwn: true,
        status: 'read',
      },
      {
        id: 3,
        content: 'Tu fais quoi comme travail ?',
        timestamp: new Date(2024, 0, 4, 14, 28),
        isOwn: false,
        status: 'read',
      },
      {
        id: 4,
        content: 'Je suis designer graphique. Et toi ?',
        timestamp: new Date(2024, 0, 4, 14, 29),
        isOwn: true,
        status: 'delivered',
      },
      {
        id: 5,
        content: 'Salut ! Comment ça va ?',
        timestamp: new Date(2024, 0, 4, 14, 30),
        isOwn: false,
        status: 'sent',
      },
    ],
    2: [
      {
        id: 1,
        content: 'Coucou ! Tu es libre ce weekend ?',
        timestamp: new Date(2024, 0, 4, 10, 15),
        isOwn: true,
        status: 'read',
      },
      {
        id: 2,
        content: 'Oui pourquoi pas ! Tu proposes quoi ?',
        timestamp: new Date(2024, 0, 4, 10, 20),
        isOwn: false,
        status: 'read',
      },
      {
        id: 3,
        content: 'On pourrait aller au cinéma ou au restaurant',
        timestamp: new Date(2024, 0, 4, 10, 22),
        isOwn: true,
        status: 'read',
      },
      {
        id: 4,
        content: 'On se voit ce weekend ?',
        timestamp: new Date(2024, 0, 4, 12, 15),
        isOwn: false,
        status: 'delivered',
      },
    ],
    3: [
      {
        id: 1,
        content: 'Hello ! J\'adore le sport aussi 🏃‍♀️',
        timestamp: new Date(2024, 0, 3, 18, 30),
        isOwn: false,
        status: 'read',
      },
      {
        id: 2,
        content: 'Super ! Tu fais quel type de sport ?',
        timestamp: new Date(2024, 0, 3, 18, 35),
        isOwn: true,
        status: 'read',
      },
      {
        id: 3,
        content: 'Running et fitness principalement. On pourrait courir ensemble un jour ?',
        timestamp: new Date(2024, 0, 3, 18, 40),
        isOwn: false,
        status: 'read',
      },
      {
        id: 4,
        content: 'Merci pour ton message 😊',
        timestamp: new Date(2024, 0, 3, 18, 45),
        isOwn: false,
        status: 'sent',
      },
    ],
    4: [
      {
        id: 1,
        content: 'J\'adore ton profil !',
        timestamp: new Date(2024, 0, 3, 10, 20),
        isOwn: false,
        status: 'read',
      },
      {
        id: 2,
        content: 'Merci c\'est gentil ! 😊',
        timestamp: new Date(2024, 0, 3, 10, 25),
        isOwn: true,
        status: 'delivered',
      },
    ],
    5: [
      {
        id: 1,
        content: 'Salut ! Contente de faire ta connaissance',
        timestamp: new Date(2024, 0, 2, 16, 15),
        isOwn: false,
        status: 'read',
      },
      {
        id: 2,
        content: 'Moi aussi ! Tu habites où ?',
        timestamp: new Date(2024, 0, 2, 16, 20),
        isOwn: true,
        status: 'read',
      },
      {
        id: 3,
        content: 'À Bordeaux et toi ?',
        timestamp: new Date(2024, 0, 2, 16, 25),
        isOwn: false,
        status: 'read',
      },
      {
        id: 4,
        content: 'À bientôt 👋',
        timestamp: new Date(2024, 0, 2, 16, 30),
        isOwn: false,
        status: 'sent',
      },
    ],
  });

  const messages = selectedContact ? (messagesByContact[selectedContact.id] || []) : [];

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact) return;

    const contactMessages = messagesByContact[selectedContact.id] || [];
    const newMessage: Message = {
      id: contactMessages.length + 1,
      content: messageInput.trim(),
      timestamp: new Date(),
      isOwn: true,
      status: 'sent',
    };

    setMessagesByContact({
      ...messagesByContact,
      [selectedContact.id]: [...contactMessages, newMessage],
    });
    setMessageInput('');

    // Simuler la livraison et la lecture après un délai
    setTimeout(() => {
      setMessagesByContact((prev) => {
        const messages = prev[selectedContact.id] || [];
        const updatedMessages = messages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
        );
        return { ...prev, [selectedContact.id]: updatedMessages };
      });
    }, 1000);

    setTimeout(() => {
      setMessagesByContact((prev) => {
        const messages = prev[selectedContact.id] || [];
        const updatedMessages = messages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'read' as const } : msg
        );
        return { ...prev, [selectedContact.id]: updatedMessages };
      });
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mémoiser les fonctions helper pour éviter les re-renders
  const getLastMessage = useCallback((contactId: number) => {
    const contactMessages = messagesByContact[contactId] || [];
    if (contactMessages.length === 0) return 'Aucun message';
    const lastMsg = contactMessages[contactMessages.length - 1];
    return lastMsg.content.length > 50 ? lastMsg.content.substring(0, 50) + '...' : lastMsg.content;
  }, [messagesByContact]);

  const getLastMessageTime = useCallback((contactId: number) => {
    const contactMessages = messagesByContact[contactId] || [];
    if (contactMessages.length === 0) return new Date();
    return contactMessages[contactMessages.length - 1].timestamp;
  }, [messagesByContact]);

  // Mémoiser les contacts filtrés pour éviter les re-renders inutiles
  const filteredContacts = useMemo(() =>
    contacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [searchQuery]
  );

  // Composant Zone de chat
  const ChatArea = () => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll vers le bas quand les messages changent
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedContact]);

    // Focus sur l'input quand on change de contact
    useEffect(() => {
      inputRef.current?.focus();
    }, [selectedContact]);

    if (!selectedContact) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-background">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
            <p className="text-muted-foreground">
              Choisissez un contact pour commencer à discuter
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-background h-full overflow-hidden">
        {/* Header du chat */}
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-card border-b border-gray-200 dark:border-gray-700 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSelectedContact(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
              <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
            </Avatar>
            {selectedContact.isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-card rounded-full" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold">{selectedContact.name}</h3>
            <p className="text-xs text-muted-foreground">
              {selectedContact.isOnline ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.isOwn ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] sm:max-w-[70%] rounded-lg px-3 sm:px-4 py-2',
                      message.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white dark:bg-card border border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-1 text-xs',
                        message.isOwn
                          ? 'text-primary-foreground/70 justify-end'
                          : 'text-muted-foreground'
                      )}
                    >
                      <span>{format(message.timestamp, 'HH:mm', { locale: fr })}</span>
                      {message.isOwn && (
                        <>
                          {message.status === 'sent' && <Check className="h-3 w-3" />}
                          {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                          {message.status === 'read' && (
                            <CheckCheck className="h-3 w-3 text-green-500" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input de message */}
        <div className="p-4 bg-white dark:bg-card border-t border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Smile className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              ref={inputRef}
              placeholder="Écrivez un message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 flex w-full overflow-hidden">
      {/* Desktop: Sidebar toujours visible */}
      <div className="hidden md:block md:w-72 lg:w-80 xl:w-96 h-full">
        <ContactsList
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredContacts={filteredContacts}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          getLastMessage={getLastMessage}
          getLastMessageTime={getLastMessageTime}
        />
      </div>

      {/* Mobile: Switch entre liste et chat */}
      <div className="flex-1 flex flex-col md:hidden h-full">
        {!selectedContact ? (
          <div className="h-full">
            <ContactsList
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredContacts={filteredContacts}
              selectedContact={selectedContact}
              setSelectedContact={setSelectedContact}
              getLastMessage={getLastMessage}
              getLastMessageTime={getLastMessageTime}
            />
          </div>
        ) : (
          <ChatArea />
        )}
      </div>

      {/* Desktop: Zone de chat */}
      <div className="hidden md:flex flex-1 h-full">
        <ChatArea />
      </div>
    </div>
  );
}
