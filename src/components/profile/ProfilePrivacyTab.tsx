
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock, Shield, Key } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type PrivateData = Database['public']['Tables']['private_data']['Row'];

interface ProfilePrivacyTabProps {
  userId: string;
}

export const ProfilePrivacyTab = ({ userId }: ProfilePrivacyTabProps) => {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const queryClient = useQueryClient();

  const { data: privateData } = useQuery({
    queryKey: ['private-data', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('private_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching private data:', error);
        return null;
      }

      return data;
    }
  });

  const updateSecurityCode = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc(
        'update_security_code',
        { old_code: currentCode, new_code: newCode }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Security code updated successfully');
      setCurrentCode('');
      setNewCode('');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Error updating security code:', error);
      toast.error('Failed to update security code. Please check your current code.');
    }
  });

  const handleUpdateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.length !== 4 || !/^\d{4}$/.test(newCode)) {
      toast.error('New security code must be exactly 4 digits');
      return;
    }
    updateSecurityCode.mutate();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-background/20 backdrop-blur-lg border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Privacy Settings</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your security code and private data. Your security code is required to access sensitive information and make important changes to your account.
        </p>

        <form onSubmit={handleUpdateCode} className="space-y-4">
          <div>
            <label htmlFor="currentCode" className="block text-sm font-medium mb-2">
              Current Security Code
            </label>
            <Input
              id="currentCode"
              type="password"
              placeholder="Enter current code"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              maxLength={4}
              className="bg-background/10"
            />
          </div>

          <div>
            <label htmlFor="newCode" className="block text-sm font-medium mb-2">
              New Security Code
            </label>
            <Input
              id="newCode"
              type="password"
              placeholder="Enter new code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              maxLength={4}
              className="bg-background/10"
            />
          </div>

          <Button 
            type="submit"
            className="w-full"
            disabled={updateSecurityCode.isPending}
          >
            {updateSecurityCode.isPending ? 'Updating...' : 'Update Security Code'}
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-background/20 backdrop-blur-lg border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Protected Data</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {privateData 
            ? 'Your private data is securely stored and can only be accessed with your security code.'
            : 'No private data stored yet. Data added here will be protected by your security code.'}
        </p>
      </Card>
    </div>
  );
};
