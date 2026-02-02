'use client';

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  IconCreditCard,
  IconAlertTriangle,
  IconCrown,
  IconDownload,
  IconFileInvoice,
  IconCircleCheck,
} from '@tabler/icons-react';

// Données fictives
const subscriptionData = {
  plan: 'Pro',
  billing: 'Mensuel',
  renewalDate: '21 févr. 2026',
  paymentMethod: {
    type: 'Visa',
    last4: '0973',
  },
  paymentWarning:
    'Votre abonnement est en retard de paiement. Veuillez modifier votre mode de paiement et régler votre facture impayée, ou annuler votre abonnement.',
};

const invoicesData = [
  {
    id: 1,
    date: '21 janv. 2026',
    dueDate: '',
    total: '20,00 €',
    status: 'overdue' as const,
  },
  {
    id: 2,
    date: '2 janv. 2026',
    dueDate: '16 janv. 2026',
    total: '0,46 €',
    status: 'paid' as const,
  },
  {
    id: 3,
    date: '2 déc. 2025',
    dueDate: '16 déc. 2025',
    total: '20,00 €',
    status: 'paid' as const,
  },
  {
    id: 4,
    date: '2 nov. 2025',
    dueDate: '16 nov. 2025',
    total: '20,00 €',
    status: 'paid' as const,
  },
];

function StatusBadge({ status }: { status: 'paid' | 'overdue' }) {
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 text-red-500">
        <IconAlertTriangle className="size-4" />
        Impayée
      </span>
    );
  }
  return <span className="text-muted-foreground">Payée</span>;
}

type Invoice = (typeof invoicesData)[number];

export default function AbonnementPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  return (
    <div className="flex flex-1 flex-col w-full overflow-y-auto">
      <div className="px-4 lg:px-6 py-4 sm:py-6 max-w-3xl w-full mx-auto">
        {/* En-tête du forfait */}
        <div className="flex items-start gap-4 py-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border bg-muted">
            <IconCrown className="size-7 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold">
              Forfait {subscriptionData.plan}
            </h2>
            <p className="text-sm text-muted-foreground">
              {subscriptionData.billing}
            </p>
            <p className="text-sm text-muted-foreground">
              Votre abonnement se renouvellera automatiquement le{' '}
              {subscriptionData.renewalDate}.
            </p>
          </div>
        </div>

        <Separator />

        {/* Section Paiement */}
        <div className="py-6">
          <h3 className="text-lg font-semibold mb-4">Paiement</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                <IconCreditCard className="size-5" />
              </div>
              <span className="text-sm">
                {subscriptionData.paymentMethod.type} &#8226;&#8226;&#8226;&#8226;{' '}
                {subscriptionData.paymentMethod.last4}
              </span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Mettre à jour
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Mettre à jour le moyen de paiement</DialogTitle>
                  <DialogDescription>
                    Modifiez les informations de votre carte bancaire.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="card-name">Nom sur la carte</Label>
                    <Input id="card-name" placeholder="Jean Dupont" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="card-number">Numéro de carte</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="card-expiry">Date d&apos;expiration</Label>
                      <Input id="card-expiry" placeholder="MM / AA" maxLength={7} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="card-cvc">CVC</Label>
                      <Input id="card-cvc" placeholder="123" maxLength={4} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full sm:w-auto">
                    Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {subscriptionData.paymentWarning && (
            <p className="mt-4 text-sm text-red-400 leading-relaxed">
              {subscriptionData.paymentWarning}
            </p>
          )}
        </div>

        <Separator />

        {/* Section Factures */}
        <div className="py-6">
          <h3 className="text-lg font-semibold mb-4">Factures</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoicesData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.dueDate || '—'}</TableCell>
                  <TableCell>{invoice.total}</TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>
                    {invoice.status === 'overdue' ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto underline"
                        onClick={() => setPaymentSuccess(true)}
                      >
                        Payer
                      </Button>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto underline"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        Voir
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator />

        {/* Actions abonnement */}
        <div className="flex items-center justify-end gap-4 py-8">
          <Button variant="outline" size="lg">
            Changer d&apos;abonnement
          </Button>
          <Button variant="destructive" size="lg">
            Annuler l&apos;abonnement
          </Button>
        </div>
      </div>

      {/* Modal confirmation paiement */}
      <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
        <DialogContent className="sm:max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <IconCircleCheck className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle>Paiement réussi</DialogTitle>
              <DialogDescription>
                Votre facture a été réglée avec succès. Merci pour votre paiement.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setPaymentSuccess(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet facture (droite vers gauche) */}
      <Sheet open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <IconFileInvoice className="size-5" />
              Facture
            </SheetTitle>
            <SheetDescription>
              Détails de la facture du {selectedInvoice?.date}
            </SheetDescription>
          </SheetHeader>

          {selectedInvoice && (
            <div className="flex flex-1 flex-col gap-6 py-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-medium">{selectedInvoice.date}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Échéance</span>
                  <span className="text-sm font-medium">{selectedInvoice.dueDate || '—'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Forfait</span>
                  <span className="text-sm font-medium">{subscriptionData.plan}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium">{subscriptionData.billing}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Moyen de paiement</span>
                  <span className="text-sm font-medium">
                    {subscriptionData.paymentMethod.type} ••••{' '}
                    {subscriptionData.paymentMethod.last4}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-semibold">{selectedInvoice.total}</span>
                </div>
              </div>
            </div>
          )}

          <SheetFooter>
            <Button className="w-full gap-2">
              <IconDownload className="size-4" />
              Télécharger la facture
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
