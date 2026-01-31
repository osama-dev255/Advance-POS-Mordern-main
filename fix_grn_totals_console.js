// Browser Console Script to Fix GRN Totals
// Copy and paste this entire code block into your browser's console (F12 -> Console tab)

(function() {
  console.log('=== GRN Total Fix Script ===');
  
  // Update localStorage GRNs
  const savedGRNs = localStorage.getItem('savedGRNs');
  if (savedGRNs) {
    console.log('Found localStorage GRNs, processing...');
    let grns = JSON.parse(savedGRNs);
    let updatedCount = 0;
    let zeroTotalCount = 0;
    
    grns = grns.map(grn => {
      // Count how many have zero totals
      if (!grn.total || grn.total === 0) {
        zeroTotalCount++;
      }
      
      // Calculate total from items if missing or zero
      if (!grn.total || grn.total === 0) {
        if (grn.data && grn.data.items) {
          const calculatedTotal = grn.data.items.reduce((sum, item) => {
            return sum + Number(item.totalWithReceivingCost || item.total || 0);
          }, 0);
          
          if (calculatedTotal > 0) {
            // Update the GRN object with calculated values
            grn.total = calculatedTotal;
            grn.items = grn.data.items.length;
            updatedCount++;
            console.log(`✓ Updated GRN ${grn.grnNumber || grn.name}: TSh ${calculatedTotal.toLocaleString()}`);
          } else {
            console.log(`⚠ GRN ${grn.grnNumber || grn.name}: No valid item totals found`);
          }
        } else {
          console.log(`⚠ GRN ${grn.grnNumber || grn.name}: No items data found`);
        }
      }
      return grn;
    });
    
    if (updatedCount > 0) {
      localStorage.setItem('savedGRNs', JSON.stringify(grns));
      console.log(`\n=== SUMMARY ===`);
      console.log(`✓ Successfully updated ${updatedCount} GRNs with calculated totals`);
      console.log(`ℹ ${zeroTotalCount} GRNs had zero/missing totals`);
      console.log(`✓ localStorage updated - refresh the Saved GRNs page to see changes`);
    } else {
      console.log(`\n=== SUMMARY ===`);
      console.log(`ℹ No GRNs needed updating or no valid totals could be calculated`);
      console.log(`ℹ Found ${zeroTotalCount} GRNs with zero/missing totals`);
    }
  } else {
    console.log('No localStorage GRNs found');
  }
  
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Refresh the Purchase Management → Saved GRNs page');
  console.log('2. The GRNs should now display correct total amounts');
  console.log('3. For database GRNs, you may need to re-save them to update the database');
  
})();