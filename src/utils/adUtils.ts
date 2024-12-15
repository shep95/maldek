import { supabase } from "@/integrations/supabase/client";

export const fetchRelevantAd = async () => {
  console.log('Fetching relevant ad...');
  
  const { data: ad, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('status', 'active')
    .lte('daily_spend', 'daily_budget')
    .gt('campaign_start_time', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching ad:', error);
    return null;
  }

  if (ad) {
    console.log('Found relevant ad:', ad);
    // Increment ad view
    await supabase.rpc('increment_ad_view', { ad_id: ad.id });
  }

  return ad;
};

export const handleAdClick = async (adId: string, targetUrl: string) => {
  console.log('Ad clicked:', adId);
  
  try {
    await supabase.rpc('increment_ad_click', { ad_id: adId });
    window.open(targetUrl, '_blank');
  } catch (error) {
    console.error('Error handling ad click:', error);
  }
};