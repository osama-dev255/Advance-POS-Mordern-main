import { supabase } from '@/lib/supabaseClient';

const SAVED_GRNS_KEY = 'savedGRNs';

export interface GRNData {
  grnNumber: string;
  date: string;
  time: string;
  supplierName: string;
  supplierId: string;
  supplierPhone: string;
  supplierEmail: string;
  supplierAddress: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessStockType: 'exempt' | 'vatable' | '';
  isVatable: boolean;
  supplierTinNumber: string;
  poNumber: string;
  deliveryNoteNumber: string;
  vehicleNumber: string;
  driverName: string;
  receivedBy: string;
  receivedLocation?: string;
  items: GRNItem[];
  receivingCosts: GRNReceivingCost[];
  qualityCheckNotes: string;
  discrepancies: string;
  preparedBy: string;
  preparedDate: string;
  checkedBy: string;
  checkedDate: string;
  approvedBy: string;
  approvedDate: string;
  receivedDate: string;
  status?: "received" | "checked" | "approved" | "completed";
  timestamp?: string;
}

export interface GRNItem {
  id: string;
  description: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  receivingCostPerUnit?: number;
  totalWithReceivingCost?: number;
  batchNumber?: string;
  expiryDate?: string;
  remarks: string;
}

export interface GRNReceivingCost {
  id: string;
  description: string;
  amount: number;
}

export interface SavedGRN {
  id: string;
  name: string;
  data: GRNData;
  createdAt: string;
  updatedAt: string;
}

export const saveGRN = async (grn: SavedGRN): Promise<void> => {
  try {
    // First, save to localStorage for immediate availability
    const savedGRNs = await getSavedGRNs();
    const updatedGRNs = [...savedGRNs, grn];
    localStorage.setItem(SAVED_GRNS_KEY, JSON.stringify(updatedGRNs));
    
    // Then save to database with user context
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('saved_grns')
        .insert({
          user_id: user.id,
          grn_number: grn.data.grnNumber,
          date: grn.data.date,
          supplier_name: grn.data.supplierName,
          po_number: grn.data.poNumber,
          items: grn.data.items.length,
          total: grn.data.items.reduce((sum, item) => sum + (item.totalWithReceivingCost || 0), 0),
          status: grn.data.status,
          grn_data: grn.data,
          name: grn.name,
          created_at: grn.createdAt,
          updated_at: grn.updatedAt
        });
      
      if (error) {
        console.error('Error saving GRN to database:', error);
        // Don't throw error - still have local storage backup
      }
    }
  } catch (error) {
    console.error('Error saving GRN:', error);
    throw new Error('Failed to save GRN');
  }
};

export const getSavedGRNs = async (): Promise<SavedGRN[]> => {
  try {
    // First, try to get from database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('saved_grns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error retrieving saved GRNs from database:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(SAVED_GRNS_KEY);
        return saved ? JSON.parse(saved) : [];
      }
      
      // Transform database records to SavedGRN format
      return data.map(dbGRN => ({
        id: dbGRN.id,
        name: dbGRN.name,
        data: dbGRN.grn_data,
        createdAt: dbGRN.created_at,
        updatedAt: dbGRN.updated_at
      }));
    } else {
      // If not authenticated, use localStorage
      const saved = localStorage.getItem(SAVED_GRNS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  } catch (error) {
    console.error('Error retrieving saved GRNs:', error);
    return [];
  }
};

export const deleteGRN = async (grnId: string): Promise<void> => {
  try {
    // First, remove from localStorage
    const savedGRNs = await getSavedGRNs();
    const updatedGRNs = savedGRNs.filter(grn => grn.id !== grnId);
    localStorage.setItem(SAVED_GRNS_KEY, JSON.stringify(updatedGRNs));
    
    // Then remove from database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('saved_grns')
        .delete()
        .eq('user_id', user.id)
        .eq('id', grnId);
      
      if (error) {
        console.error('Error deleting GRN from database:', error);
        // Don't throw error - still have local storage sync
      }
    }
  } catch (error) {
    console.error('Error deleting GRN:', error);
    throw new Error('Failed to delete GRN');
  }
};

export const updateGRN = async (updatedGRN: SavedGRN): Promise<void> => {
  try {
    const savedGRNs = await getSavedGRNs();
    const updatedGRNs = savedGRNs.map(grn => 
      grn.id === updatedGRN.id ? updatedGRN : grn
    );
    localStorage.setItem(SAVED_GRNS_KEY, JSON.stringify(updatedGRNs));
    
    // Also update in database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('saved_grns')
        .update({
          grn_number: updatedGRN.data.grnNumber,
          date: updatedGRN.data.date,
          supplier_name: updatedGRN.data.supplierName,
          po_number: updatedGRN.data.poNumber,
          items: updatedGRN.data.items.length,
          total: updatedGRN.data.items.reduce((sum, item) => sum + (item.totalWithReceivingCost || 0), 0),
          status: updatedGRN.data.status,
          grn_data: updatedGRN.data,
          name: updatedGRN.name,
          updated_at: updatedGRN.updatedAt
        })
        .eq('user_id', user.id)
        .eq('id', updatedGRN.id);
      
      if (error) {
        console.error('Error updating GRN in database:', error);
        // Don't throw error - still have local storage backup
      }
    }
  } catch (error) {
    console.error('Error updating GRN:', error);
    throw new Error('Failed to update GRN');
  }
};