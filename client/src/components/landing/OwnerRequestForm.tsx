// apps/web/src/components/landing/OwnerRequestForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

const requestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  restaurantName: z.string().min(2),
  description: z.string().min(20, 'Tell us a bit about your café/restaurant'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export function OwnerRequestForm() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async (data: RequestFormData) => {
    setSubmitting(true);
    try {
      await api.post('/owner-requests', data);   // add a simple post method if not present
      toast.success('Request submitted! We will review it soon.');
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

function ItemList() {
  const renderedItems = [];

  for (const key of Object.entries(errors)) {
    renderedItems.push(<p className='text-red-600'>{key[0] + " " + key[1].message + "\n"} </p>);
  }

  return <ul>{renderedItems}</ul>;
}

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 rounded-3xl space-y-5 max-w-lg mx-auto">
      <h3 className="font-display text-2xl font-bold text-center ">Become an Owner</h3>
      <p className="text-sm text-muted-foreground text-center">Fill in the details and we'll set up your account after review.</p>

      <Input placeholder="Your Name" {...register('name')} required/>
      <Input placeholder="Email" type="email" {...register('email')} required/>
      <Input placeholder="Password" type="password" {...register('password')}  required/>
      <Input placeholder="Phone Number" {...register('phone')} />
      <Input placeholder="Café / Restaurant Name" {...register('restaurantName')}  required/>
      <Textarea placeholder="Description" rows={4} {...register('description')}  required/>
      <ItemList></ItemList>

      <Button type="submit" className="w-full gap-2" disabled={submitting}>
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {submitting ? 'Submitting...' : 'Send Request'}
      </Button>
    </form>
  );
}