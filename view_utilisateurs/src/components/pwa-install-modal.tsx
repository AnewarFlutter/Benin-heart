'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { IconDownload, IconX } from '@tabler/icons-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

function isDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  const dismissed = localStorage.getItem(DISMISS_KEY);
  if (!dismissed) return false;
  const timestamp = parseInt(dismissed, 10);
  if (Date.now() - timestamp > DISMISS_DURATION) {
    localStorage.removeItem(DISMISS_KEY);
    return false;
  }
  return true;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (promptRef.current) {
      await promptRef.current.prompt();
      const { outcome } = await promptRef.current.userChoice;
      if (outcome === 'accepted') {
        setIsOpen(false);
      }
      promptRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="rounded-xl border bg-background p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <IconDownload className="size-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Installer Benin Heart</p>
            <p className="text-xs text-muted-foreground">
              Accédez rapidement à l&apos;app depuis votre écran d&apos;accueil
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconX className="size-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleDismiss} className="w-full">
            Plus tard
          </Button>
          <Button size="sm" onClick={handleInstall} className="w-full">
            Installer
          </Button>
        </div>
      </div>
    </div>
  );
}
