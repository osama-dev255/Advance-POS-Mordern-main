// Script to update existing saved GRNs with calculated totals
import dotenv from 'dotenv';
dotenv.config();

const { createClient } = await import('@supabase/supabase-js');

// Use environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tymfrdglmbnmzureeien.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateGRNTotals() {
  console.log('=== Updating GRN Totals ===\n');
  
  try {
    // 1. Update localStorage data
    console.log('1. Updating localStorage GRNs...');
    const savedGRNs = localStorage.getItem('savedGRNs');
    if (savedGRNs) {
      let grns = JSON.parse(savedGRNs);
      let updatedCount = 0;
      
      grns = grns.map(grn => {
        // Check if total is missing or 0
        if (!grn.total || grn.total === 0) {
          // Calculate total from items
          if (grn.data && grn.data.items) {
            const calculatedTotal = grn.data.items.reduce((sum, item) => {
              return sum + Number(item.totalWithReceivingCost || item.total || 0);
            }, 0);
            
            if (calculatedTotal > 0) {
              grn.total = calculatedTotal;
              grn.items = grn.data.items.length;
              updatedCount++;
              console.log(`  Updated GRN ${grn.grnNumber || grn.name}: ${calculatedTotal}`);
            }
          }
        }
        return grn;
      });
      
      if (updatedCount > 0) {
        localStorage.setItem('savedGRNs', JSON.stringify(grns));
        console.log(`✓ Updated ${updatedCount} localStorage GRNs with calculated totals`);
      } else {
        console.log('  No localStorage GRNs needed updating');
      }
    } else {
      console.log('  No localStorage GRNs found');
    }
    
    // 2. Update database records
    console.log('\n2. Updating database GRNs...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get all GRNs for this user
      const { data: dbGRNs, error } = await supabase
        .from('saved_grns')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.log('  Database query error:', error.message);
      } else if (dbGRNs && dbGRNs.length > 0) {
        let updatedDbCount = 0;
        
        for (const dbGRN of dbGRNs) {
          // Parse the GRN data
          let grnData;
          try {
            grnData = typeof dbGRN.grn_data === 'string' 
              ? JSON.parse(dbGRN.grn_data) 
              : dbGRN.grn_data;
          } catch (parseError) {
            console.log(`  Error parsing GRN data for ${dbGRN.grn_number}:`, parseError.message);
            continue;
          }
          
          // Calculate total if items exist
          if (grnData && grnData.items) {
            const calculatedTotal = grnData.items.reduce((sum, item) => {
              return sum + Number(item.totalWithReceivingCost || item.total || 0);
            }, 0);
            
            // Update the record if total was calculated
            if (calculatedTotal > 0) {
              const { error: updateError } = await supabase
                .from('saved_grns')
                .update({
                  total_amount: calculatedTotal
                })
                .eq('id', dbGRN.id);
              
              if (updateError) {
                console.log(`  Error updating ${dbGRN.grn_number}:`, updateError.message);
              } else {
                updatedDbCount++;
                console.log(`  Updated database GRN ${dbGRN.grn_number}: ${calculatedTotal}`);
              }
            }
          }
        }
        
        console.log(`✓ Updated ${updatedDbCount} database GRNs with calculated totals`);
      } else {
        console.log('  No database GRNs found for this user');
      }
    } else {
      console.log('  Not authenticated - skipping database update');
    }
    
    console.log('\n=== Update Complete ===');
    console.log('Existing GRNs should now display correct totals in the Saved GRNs section.');
    
  } catch (error) {
    console.error('Error updating GRN totals:', error);
  }
}

// Run the update
updateGRNTotals();