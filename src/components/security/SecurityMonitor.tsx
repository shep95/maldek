
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SecurityEvent {
  type: 'auth' | 'suspicious' | 'error';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const SecurityMonitor = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    let eventCount = 0;
    let lastEventTime = Date.now();
    
    const monitorSecurity = () => {
      // Monitor for suspicious activity
      const currentTime = Date.now();
      
      // Check for rapid authentication attempts
      eventCount++;
      if (eventCount > 10 && currentTime - lastEventTime < 60000) {
        const event: SecurityEvent = {
          type: 'suspicious',
          message: 'Unusual authentication activity detected',
          timestamp: new Date(),
          severity: 'high'
        };
        
        setEvents(prev => [...prev.slice(-49), event]);
        toast.warning("Security Alert: Unusual activity detected");
      }
      
      // Reset counters periodically
      if (currentTime - lastEventTime > 300000) { // 5 minutes
        eventCount = 0;
        lastEventTime = currentTime;
      }
    };

    const interval = setInterval(monitorSecurity, 5000);
    setIsMonitoring(true);

    // Monitor Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        const securityEvent: SecurityEvent = {
          type: 'auth',
          message: `User ${event.toLowerCase().replace('_', ' ')}`,
          timestamp: new Date(),
          severity: 'low'
        };
        
        setEvents(prev => [...prev.slice(-49), securityEvent]);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
      setIsMonitoring(false);
    };
  }, []);

  return null; // This component runs in the background
};
