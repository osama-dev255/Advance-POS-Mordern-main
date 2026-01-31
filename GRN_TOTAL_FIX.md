# GRN Total Amount Fix

## Problem
Saved GRNs were displaying "TSh 0.00" instead of their actual total amounts in the Purchase Management → Saved GRNs section.

## Solution
The issue was that when saving GRNs, the total amount was not being calculated and stored properly. The fix includes:

1. **Code Fix**: Modified the `handleSaveGRN` function in `src/pages/Templates.tsx` to calculate the total amount from item costs and include it in the saved GRN data.

2. **Data Migration**: Created a script to update existing saved GRNs with their correct calculated totals.

## Files Modified
- `src/pages/Templates.tsx` - Added total calculation in `handleSaveGRN` function

## Files Added
- `scripts/update_grn_totals.js` - Script to update existing GRNs with calculated totals

## How to Apply the Fix

### 1. For New GRNs (Automatic)
The fix is already applied to the code, so any new GRNs saved will automatically show the correct total.

### 2. For Existing GRNs (Manual Update Required)
Run the update script to fix existing GRNs:

```bash
# Navigate to your project directory
cd "f:\PROJECTS\POS MORDERN\Advance-POS-Mordern-main"

# Run the update script
node scripts/update_grn_totals.js
```

**Note**: You need to run this script in a browser console while logged into your application, or modify the script to run in Node.js environment with proper authentication.

### Alternative Manual Method:
1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. Paste and run this code:

```javascript
// Update localStorage GRNs
const savedGRNs = localStorage.getItem('savedGRNs');
if (savedGRNs) {
  let grns = JSON.parse(savedGRNs);
  let updatedCount = 0;
  
  grns = grns.map(grn => {
    if (!grn.total || grn.total === 0) {
      if (grn.data && grn.data.items) {
        const calculatedTotal = grn.data.items.reduce((sum, item) => {
          return sum + Number(item.totalWithReceivingCost || item.total || 0);
        }, 0);
        
        if (calculatedTotal > 0) {
          grn.total = calculatedTotal;
          grn.items = grn.data.items.length;
          updatedCount++;
          console.log(`Updated GRN ${grn.grnNumber || grn.name}: ${calculatedTotal}`);
        }
      }
    }
    return grn;
  });
  
  if (updatedCount > 0) {
    localStorage.setItem('savedGRNs', JSON.stringify(grns));
    console.log(`✓ Updated ${updatedCount} GRNs with calculated totals`);
  }
}
```

## Verification
After applying the fix:
1. Create a new GRN with some items and costs
2. Save the GRN
3. Go to Purchase Management → Saved GRNs
4. The GRN should now display the correct total amount instead of "TSh 0.00"

For existing GRNs, run the update script and refresh the Saved GRNs page to see the correct totals.