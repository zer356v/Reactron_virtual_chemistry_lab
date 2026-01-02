import { supabase } from './config/integrations/supabase/client.ts';

// Simple function to keep Supabase awake
const keepAlive = async () => {
  try {
    console.log('🏓 Pinging Supabase to keep it alive...');
    
    // Just query the chemicals table (lightweight query)
    const { data, error } = await supabase
      .from('chemicals')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Keepalive failed:', error.message);
    } else {
      console.log('✅ Supabase is alive! Last ping:', new Date().toLocaleString());
    }
  } catch (err) {
    console.error('❌ Keepalive error:', err);
  }
};

// Run immediately
keepAlive();

// Run every 6 days (518400000 ms)
setInterval(keepAlive, 6 * 24 * 60 * 60 * 1000);

console.log('🤖 Keepalive service started - will ping every 6 days');