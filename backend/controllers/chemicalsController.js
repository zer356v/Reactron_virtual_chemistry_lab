import { supabase } from '../config/integrations/supabase/client.ts';

export const getChemicals = async (req, res) => {
  try {
    console.log('🔄 Fetching chemicals from Supabase...');
    
    const { error, data } = await supabase
      .from('chemicals')
      .select('*');
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    if (!data || data.length === 0) {
      console.warn('⚠️ No chemicals found in database');
      return res.status(200).json([]);
    }
    
    console.log(`✅ Fetched ${data.length} chemicals from Supabase`);
    
    // 🔥 Transform Supabase snake_case to frontend camelCase
    const transformedData = data.map((chem, index) => {
      console.log(`Transforming chemical ${index + 1}:`, chem.name);
      
      return {
        id: chem.id || index,
        name: chem.name || 'Unknown',
        formula: chem.formula || '',
        color: chem.color || '#87CEEB',
        state: chem.state || 'liquid',
        dangerLevel: chem.danger_level || 'medium',  // snake_case → camelCase
        description: chem.description || '',
        molarMass: parseFloat(chem.molar_mass) || 0,  // snake_case → camelCase
        density: chem.density ? parseFloat(chem.density) : undefined,
        boilingPoint: chem.boiling_point ? parseFloat(chem.boiling_point) : undefined,  // snake_case → camelCase
        meltingPoint: chem.melting_point ? parseFloat(chem.melting_point) : undefined,  // snake_case → camelCase
        pH: chem.ph ? parseFloat(chem.ph) : undefined,
        reactsWith: chem.reacts_with || [],  // snake_case → camelCase
        category: chem.category || 'salt',
        hazards: chem.hazards || [],
        concentration: chem.concentration || '1.0M'
      };
    });
    
    console.log(`✅ Sending ${transformedData.length} transformed chemicals`);
    console.log('First chemical:', transformedData[0]);
    
    return res.status(200).json(transformedData);
    
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};