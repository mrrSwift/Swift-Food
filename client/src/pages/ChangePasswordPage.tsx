import { useState } from 'react';
import { navigate } from "wouter/use-browser-location";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, User } from '@/lib/api';
import { toast } from 'sonner';
import { useLocale } from "@/contexts/LocaleContext";


export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.admin.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');

     navigate('/owner/login');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Change Password</h1>
        <p className="text-sm text-muted-foreground text-center">
          You must change your password before continuing.
        </p>
        <Input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="New password (min 6 characters)"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Changing…' : 'Change Password'}
        </Button>
      </form>
    </div>
  );
}