'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface AdditionalNotesProps {
  notes: string;
  onNotesChange?: (notes: string) => void;
  className?: string;
}

export function AdditionalNotes({
  notes,
  onNotesChange,
  className,
}: AdditionalNotesProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <div>
        <Label htmlFor="notes" className="mb-2 text-base font-semibold">
          Notes additionnelles (optionnel)
        </Label>
        <Textarea
          id="notes"
          placeholder="Instructions spéciales, code d'accès, étage, etc."
          value={notes}
          onChange={(e) => onNotesChange?.(e.target.value)}
          className="min-h-[100px] resize-none bg-muted/50"
        />
      </div>
    </div>
  );
}
