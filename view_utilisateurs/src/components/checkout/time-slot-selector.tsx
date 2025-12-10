'use client';

import * as React from 'react';
import { Clock, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface TimeSlot {
  id: string;
  label: string;
}

export interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedSlot: string;
  date?: Date;
  onSelectSlot?: (slotId: string) => void;
  onDateChange?: (date: Date | undefined) => void;
  className?: string;
}

export function TimeSlotSelector({
  slots,
  selectedSlot,
  date,
  onSelectSlot,
  onDateChange,
  className,
}: TimeSlotSelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Créneau de collecte
        </h2>
      </div>

      {/* Date Picker */}
      <div className="mb-8">
        <label className="text-sm font-medium text-foreground mb-3 block">
          Date de collecte
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-64 justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                onDateChange?.(selectedDate);
                setOpen(false);
              }}
              disabled={(date) => {
                // Disable past dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => onSelectSlot?.(slot.id)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border-2 bg-background px-4 py-3 transition-all',
              selectedSlot === slot.id
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-foreground hover:border-primary/50 hover:bg-accent'
            )}
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{slot.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
