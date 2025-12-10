'use client';

import { Package, CreditCard, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckoutStep {
  id: string;
  title: string;
  description: string;
  icon: 'collection' | 'payment';
}

export interface CheckoutStepperProps {
  steps: CheckoutStep[];
  currentStep: number;
  className?: string;
}

const stepIcons = {
  collection: Package,
  payment: CreditCard,
};

export function CheckoutStepper({
  steps,
  currentStep,
  className,
}: CheckoutStepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = stepIcons[step.icon];
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isActive || isCompleted
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      isActive || isCompleted
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/60'
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-4 transition-all',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                  style={{ marginTop: '-60px' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
