import { supabase } from '../config/integrations/supabase/client.ts';

// ✅ EXISTING: Create user experiment
export const createUserExperiment = async (req, res) => {
  const { experimentData } = req.body; 
  const { data, error } = await supabase
    .from("user_experiments")
    .insert(experimentData)
    .select();

  console.log(data);
    
  if (error) {
    return res.status(500).json({ message: error.message });
  } else {
    return res.status(200).json(data);
  }  
};

// ✅ EXISTING: Get user experiments
export const getUserExperiments = async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from("user_experiments")
    .select("*")
    .eq("user_id", userId)
    .order('created_at', { ascending: false }); // 🔥 Added: newest first

  if (error) {
    return res.status(500).json({ message: error.message });
  } else {
    return res.status(200).json(data);
  }
};

// 🔥 NEW: Delete multiple experiments (bulk delete)
export const deleteExperiments = async (req, res) => {
  try {
    const { experimentIds, userId } = req.body;
    
    if (!experimentIds || !Array.isArray(experimentIds) || experimentIds.length === 0) {
      return res.status(400).json({ message: "No experiment IDs provided" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    console.log(`🗑️ Deleting ${experimentIds.length} experiments for user: ${userId}`);
    
    // Delete only experiments that belong to this user (security)
    const { data, error } = await supabase
      .from('user_experiments')
      .delete()
      .in('id', experimentIds)
      .eq('user_id', userId)
      .select(); // Return deleted rows to confirm
    
    if (error) {
      console.error('❌ Supabase delete error:', error);
      return res.status(500).json({ message: error.message });
    }
    
    console.log(`✅ Successfully deleted ${data?.length || 0} experiments`);
    
    return res.status(200).json({ 
      success: true, 
      deleted: data?.length || 0,
      message: `${data?.length || 0} experiment(s) deleted successfully`
    });
    
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔥 NEW: Delete single experiment
export const deleteSingleExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;
    const { userId } = req.body;
    
    if (!experimentId) {
      return res.status(400).json({ message: "Experiment ID required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    console.log(`🗑️ Deleting single experiment: ${experimentId} for user: ${userId}`);
    
    // Delete only if experiment belongs to this user (security)
    const { data, error } = await supabase
      .from('user_experiments')
      .delete()
      .eq('id', experimentId)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error('❌ Supabase delete error:', error);
      return res.status(500).json({ message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ 
        message: "Experiment not found or you don't have permission to delete it" 
      });
    }
    
    console.log('✅ Experiment deleted successfully');
    
    return res.status(200).json({ 
      success: true,
      message: 'Experiment deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};