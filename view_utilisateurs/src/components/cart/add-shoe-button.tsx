'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AddShoeButtonProps {
  onClick?: () => void;
  className?: string;
}

export function AddShoeButton({ onClick, className }: AddShoeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-card p-8 transition-colors hover:border-primary hover:bg-accent',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Plus className="h-6 w-6 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        Ajouter une autre paire de chaussures
      </span>
    </button>
  );
}
