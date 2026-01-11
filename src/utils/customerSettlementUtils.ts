import { supabase } from '@/lib/supabaseClient';

const SAVED_SETTLEMENTS_KEY = 'savedSettlements';

export interface CustomerSettlementData {
  id: string;
  customerName: string;
  customerId: string;
  customerPhone: string;
  customerEmail: string;
  referenceNumber: string;
  settlementAmount: number;
  paymentMethod: string;
  cashierName: string;
  previousBalance: number;
  amountPaid: number;
  newBalance: number;
  notes?: string;
  date: string;
  time: string;
}

export const saveCustomerSettlement = async (settlement: CustomerSettlementData): Promise<void> => {
  try {
    // First, save to localStorage for immediate availability
    const savedSettlements = await getSavedSettlements();
    const updatedSettlements = [...savedSettlements, settlement];
    localStorage.setItem(SAVED_SETTLEMENTS_KEY, JSON.stringify(updatedSettlements));
    
    // Then save to database with user context
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('saved_customer_settlements')
        .insert({
          user_id: user.id,
          customer_name: settlement.customerName,
          customer_id: settlement.customerId,
          customer_phone: settlement.customerPhone,
          customer_email: settlement.customerEmail,
          reference_number: settlement.referenceNumber,
          settlement_amount: settlement.settlementAmount,
          payment_method: settlement.paymentMethod,
          cashier_name: settlement.cashierName,
          previous_balance: settlement.previousBalance,
          amount_paid: settlement.amountPaid,
          new_balance: settlement.newBalance,
          notes: settlement.notes,
          date: settlement.date,
          time: settlement.time
        });
      
      if (error) {
        console.error('Error saving customer settlement to database:', error);
        // Don't throw error - still have local storage backup
      }
    }
  } catch (error) {
    console.error('Error saving customer settlement:', error);
    throw new Error('Failed to save customer settlement');
  }
};

export const getSavedSettlements = async (): Promise<CustomerSettlementData[]> => {
  try {
    // First, try to get from database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('saved_customer_settlements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error retrieving saved settlements from database:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(SAVED_SETTLEMENTS_KEY);
        return saved ? JSON.parse(saved) : [];
      }
      
      // Transform database records to CustomerSettlementData format
      return data.map(dbSettlement => ({
        id: dbSettlement.id,
        customerName: dbSettlement.customer_name,
        customerId: dbSettlement.customer_id,
        customerPhone: dbSettlement.customer_phone,
        customerEmail: dbSettlement.customer_email,
        referenceNumber: dbSettlement.reference_number,
        settlementAmount: dbSettlement.settlement_amount,
        paymentMethod: dbSettlement.payment_method,
        cashierName: dbSettlement.cashier_name,
        previousBalance: dbSettlement.previous_balance,
        amountPaid: dbSettlement.amount_paid,
        newBalance: dbSettlement.new_balance,
        notes: dbSettlement.notes,
        date: dbSettlement.date,
        time: dbSettlement.time
      }));
    } else {
      // If not authenticated, use localStorage
      const saved = localStorage.getItem(SAVED_SETTLEMENTS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  } catch (error) {
    console.error('Error retrieving saved settlements:', error);
    return [];
  }
};

export const deleteCustomerSettlement = async (settlementId: string): Promise<void> => {
  try {
    const savedSettlements = await getSavedSettlements();
    const updatedSettlements = savedSettlements.filter(settlement => settlement.id !== settlementId);
    localStorage.setItem(SAVED_SETTLEMENTS_KEY, JSON.stringify(updatedSettlements));
    
    // Also delete from database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('saved_customer_settlements')
        .delete()
        .eq('user_id', user.id)
        .eq('id', settlementId);
      
      if (error) {
        console.error('Error deleting customer settlement from database:', error);
        // Don't throw error - still have local storage backup
      }
    }
  } catch (error) {
    console.error('Error deleting customer settlement:', error);
    throw new Error('Failed to delete customer settlement');
  }
};

export const updateCustomerSettlement = async (updatedSettlement: CustomerSettlementData): Promise<void> => {
  try {
    const savedSettlements = await getSavedSettlements();
    const updatedSettlements = savedSettlements.map(settlement => 
      settlement.id === updatedSettlement.id ? updatedSettlement : settlement
    );
    localStorage.setItem(SAVED_SETTLEMENTS_KEY, JSON.stringify(updatedSettlements));
    
    // Also update in database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('saved_customer_settlements')
        .update({
          customer_name: updatedSettlement.customerName,
          customer_id: updatedSettlement.customerId,
          customer_phone: updatedSettlement.customerPhone,
          customer_email: updatedSettlement.customerEmail,
          reference_number: updatedSettlement.referenceNumber,
          settlement_amount: updatedSettlement.settlementAmount,
          payment_method: updatedSettlement.paymentMethod,
          cashier_name: updatedSettlement.cashierName,
          previous_balance: updatedSettlement.previousBalance,
          amount_paid: updatedSettlement.amountPaid,
          new_balance: updatedSettlement.newBalance,
          notes: updatedSettlement.notes,
          date: updatedSettlement.date,
          time: updatedSettlement.time
        })
        .eq('user_id', user.id)
        .eq('id', updatedSettlement.id);
      
      if (error) {
        console.error('Error updating customer settlement in database:', error);
        // Don't throw error - still have local storage backup
      }
    }
  } catch (error) {
    console.error('Error updating customer settlement:', error);
    throw new Error('Failed to update customer settlement');
  }
};

export const getCustomerSettlementById = async (settlementId: string): Promise<CustomerSettlementData | undefined> => {
  try {
    const savedSettlements = await getSavedSettlements();
    return savedSettlements.find(settlement => settlement.id === settlementId);
  } catch (error) {
    console.error('Error retrieving customer settlement by ID:', error);
    return undefined;
  }
};