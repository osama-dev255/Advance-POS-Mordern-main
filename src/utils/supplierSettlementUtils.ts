import { formatCurrency } from "@/lib/currency";

// Define the supplier settlement data interface
export interface SupplierSettlementData {
  id?: string;
  supplierName: string;
  supplierId?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  referenceNumber: string;
  settlementAmount: number;
  paymentMethod: string;
  processedBy?: string;
  poNumber?: string;
  previousBalance?: number;
  amountPaid?: number;
  newBalance?: number;
  notes?: string;
  date: string;
  time?: string;
  status?: "completed" | "pending" | "cancelled";
}

// Save supplier settlement to localStorage
export const saveSupplierSettlement = (settlementData: SupplierSettlementData): boolean => {
  try {
    const savedSettlements = getSavedSupplierSettlements();
    const newSettlement = {
      ...settlementData,
      id: settlementData.id || Date.now().toString(),
      time: settlementData.time || new Date().toLocaleTimeString()
    };
    
    savedSettlements.push(newSettlement);
    localStorage.setItem('savedSupplierSettlements', JSON.stringify(savedSettlements));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'savedSupplierSettlements',
      newValue: JSON.stringify(savedSettlements)
    }));
    
    return true;
  } catch (error) {
    console.error('Error saving supplier settlement:', error);
    return false;
  }
};

// Get saved supplier settlements from localStorage
export const getSavedSupplierSettlements = (): SupplierSettlementData[] => {
  try {
    const saved = localStorage.getItem('savedSupplierSettlements');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error getting saved supplier settlements:', error);
    return [];
  }
};

// Delete supplier settlement from localStorage
export const deleteSupplierSettlement = (settlementId: string): boolean => {
  try {
    const savedSettlements = getSavedSupplierSettlements();
    const updatedSettlements = savedSettlements.filter(s => s.id !== settlementId);
    localStorage.setItem('savedSupplierSettlements', JSON.stringify(updatedSettlements));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'savedSupplierSettlements',
      newValue: JSON.stringify(updatedSettlements)
    }));
    
    return true;
  } catch (error) {
    console.error('Error deleting supplier settlement:', error);
    return false;
  }
};

// Update supplier settlement in localStorage
export const updateSupplierSettlement = (settlementId: string, updatedData: Partial<SupplierSettlementData>): boolean => {
  try {
    const savedSettlements = getSavedSupplierSettlements();
    const updatedSettlements = savedSettlements.map(settlement => 
      settlement.id === settlementId 
        ? { ...settlement, ...updatedData, id: settlementId }
        : settlement
    );
    
    localStorage.setItem('savedSupplierSettlements', JSON.stringify(updatedSettlements));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'savedSupplierSettlements',
      newValue: JSON.stringify(updatedSettlements)
    }));
    
    return true;
  } catch (error) {
    console.error('Error updating supplier settlement:', error);
    return false;
  }
};

// Generate a unique supplier settlement reference number
export const generateSupplierSettlementReference = (): string => {
  return `SUP-SET-${Date.now()}`;
};

// Format supplier settlement data for display
export const formatSupplierSettlement = (settlement: SupplierSettlementData) => {
  return {
    ...settlement,
    formattedAmount: formatCurrency(settlement.settlementAmount),
    formattedPreviousBalance: settlement.previousBalance !== undefined ? formatCurrency(settlement.previousBalance) : 'N/A',
    formattedNewBalance: settlement.newBalance !== undefined ? formatCurrency(settlement.newBalance) : 'N/A',
    formattedDate: new Date(settlement.date).toLocaleDateString(),
    formattedTime: settlement.time || new Date().toLocaleTimeString()
  };
};