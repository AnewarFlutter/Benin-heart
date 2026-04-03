'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { sendContactAction } from '@/actions/beninheart/storefront/actions';

export default function ContactFormCard() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sujet: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await sendContactAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        sujet: formData.sujet,
        message: formData.message,
      });

      if (result.success) {
        toast.success('Message envoyé ! Nous vous répondrons sous 24h.');
        setFormData({ name: '', email: '', phone: '', sujet: '', message: '' });
      } else {
        toast.error(result.error ?? "Erreur lors de l'envoi du message.");
      }
    } catch {
      toast.error("Une erreur inattendue s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoyez-nous un message</CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom complet */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Nom complet <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Votre nom complet"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-12 text-base"
            />
          </div>

          {/* Email et Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+229 97 00 00 00"
                value={formData.phone}
                onChange={handleChange}
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <Label htmlFor="sujet" className="text-base">
              Sujet <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sujet"
              name="sujet"
              type="text"
              placeholder="Sujet de votre message"
              value={formData.sujet}
              onChange={handleChange}
              required
              className="h-12 text-base"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-base">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Décrivez votre demande en détail..."
              value={formData.message}
              onChange={handleChange}
              rows={12}
              required
              className="resize-none min-h-[250px] text-base"
            />
          </div>

          {/* Bouton d'envoi */}
          <div className="pt-8">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Envoi en cours...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer le message
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
