
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Mail, Globe } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreference {
  notification_type: string;
  enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  muted_until?: string | null;
}

export const NotificationPreferences = () => {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as NotificationPreference[];
    }
  });

  const updatePreference = useMutation({
    mutationFn: async (updates: Partial<NotificationPreference> & { type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          notification_type: updates.type,
          ...updates
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferences updated');
    },
    onError: () => {
      toast.error('Failed to update preferences');
    }
  });

  const notificationTypes = [
    { type: 'like', label: 'Likes', icon: Bell },
    { type: 'comment', label: 'Comments', icon: Bell },
    { type: 'follow', label: 'New Followers', icon: Bell },
    { type: 'mention', label: 'Mentions', icon: Bell },
    { type: 'repost', label: 'Reposts', icon: Bell }
  ];

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Notification Preferences</h2>
      <div className="space-y-6">
        {notificationTypes.map(({ type, label, icon: Icon }) => {
          const pref = preferences?.find(p => p.notification_type === type) || {
            enabled: true,
            email_enabled: false,
            push_enabled: false
          };

          return (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <Label htmlFor={`${type}-notifications`}>{label}</Label>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`${type}-notifications`}
                    checked={pref.enabled}
                    onCheckedChange={(checked) =>
                      updatePreference.mutate({ type, enabled: checked })
                    }
                  />
                  <Globe className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`${type}-email`}
                    checked={pref.email_enabled}
                    onCheckedChange={(checked) =>
                      updatePreference.mutate({ type, email_enabled: checked })
                    }
                  />
                  <Mail className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => {
            updatePreference.mutate({
              type: 'all',
              enabled: false,
              muted_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            });
          }}
        >
          Mute all notifications for 24 hours
        </Button>
      </div>
    </Card>
  );
};
