import { supabase } from '@/lib/supabaseClient';

const SAVED_DELIVERIES_KEY = 'savedDeliveries';

export interface DeliveryData {
  id: string;
  deliveryNoteNumber: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  paymentMethod: string;
  status: "completed" | "in-transit" | "pending" | "delivered" | "cancelled";
  itemsList?: any[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  amountReceived?: number;
  change?: number;
  vehicle?: string;
  driver?: string;
  deliveryNotes?: string;
}

export const saveDelivery = async (delivery: DeliveryData): Promise<void> => {
  try {
    // First, save to localStorage for immediate availability
    const savedDeliveries = await getSavedDeliveries();
    const updatedDeliveries = [...savedDeliveries, delivery];
    localStorage.setItem(SAVED_DELIVERIES_KEY, JSON.stringify(updatedDeliveries));
    
    // Then save to database with user context
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('saved_delivery_notes')
        .insert({
          user_id: user.id,
          delivery_note_number: delivery.deliveryNoteNumber,
          date: delivery.date,
          customer: delivery.customer,
          items: delivery.items,
          total: delivery.total,
          payment_method: delivery.paymentMethod,
          status: delivery.status,
          items_list: delivery.itemsList,
          subtotal: delivery.subtotal,
          tax: delivery.tax,
          discount: delivery.discount,
          amount_received: delivery.amountReceived,
          change: delivery.change,
          vehicle: delivery.vehicle,
          driver: delivery.driver,
          delivery_notes: delivery.deliveryNotes
        });
        
      if (error) {
        console.error('Error saving delivery to database:', error);
        // Don't throw error - still have local storage backup
      }
    }
  } catch (error) {
    console.error('Error saving delivery:', error);
    throw new Error('Failed to save delivery');
  }
};

export const getSavedDeliveries = async (): Promise<DeliveryData[]> => {
  try {
    // First, try to get from database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('saved_delivery_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error retrieving saved deliveries from database:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(SAVED_DELIVERIES_KEY);
        return saved ? JSON.parse(saved) : [];
      }
      
      // Transform database records to DeliveryData format
      return data.map(dbDelivery => ({
        id: dbDelivery.id,
        deliveryNoteNumber: dbDelivery.delivery_note_number,
        date: dbDelivery.date,
        customer: dbDelivery.customer,
        items: dbDelivery.items,
        total: dbDelivery.total,
        paymentMethod: dbDelivery.payment_method,
        status: dbDelivery.status,
        itemsList: dbDelivery.items_list,
        subtotal: dbDelivery.subtotal,
        tax: dbDelivery.tax,
        discount: dbDelivery.discount,
        amountReceived: dbDelivery.amount_received,
        change: dbDelivery.change,
        vehicle: dbDelivery.vehicle,
        driver: dbDelivery.driver,
        deliveryNotes: dbDelivery.delivery_notes
      }));
    } else {
      // If not authenticated, use localStorage
      const saved = localStorage.getItem(SAVED_DELIVERIES_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  } catch (error) {
    console.error('Error retrieving saved deliveries:', error);
    return [];
  }
};

export const deleteDelivery = async (deliveryId: string): Promise<void> => {
  try {
    const savedDeliveries = await getSavedDeliveries();
    const updatedDeliveries = savedDeliveries.filter(delivery => delivery.id !== deliveryId);
    localStorage.setItem(SAVED_DELIVERIES_KEY, JSON.stringify(updatedDeliveries));
    
    // Also delete from database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('saved_delivery_notes')
        .delete()
        .eq('user_id', user.id)
        .eq('id', deliveryId);
        
      if (error) {
        console.error('Error deleting delivery from database:', error);
        // Don't throw error - still have local storage backup
      }
    }
  } catch (error) {
    console.error('Error deleting delivery:', error);
    throw new Error('Failed to delete delivery');
  }
};

export const updateDelivery = async (updatedDelivery: DeliveryData): Promise<void> => {
  try {
    const savedDeliveries = await getSavedDeliveries();
    const updatedDeliveries = savedDeliveries.map(delivery => 
      delivery.id === updatedDelivery.id ? updatedDelivery : delivery
    );
    localStorage.setItem(SAVED_DELIVERIES_KEY, JSON.stringify(updatedDeliveries));
    
    // Also update in database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('saved_delivery_notes')
        .update({
          delivery_note_number: updatedDelivery.deliveryNoteNumber,
          date: updatedDelivery.date,
          customer: updatedDelivery.customer,
          items: updatedDelivery.items,
          total: updatedDelivery.total,
          payment_method: updatedDelivery.paymentMethod,
          status: updatedDelivery.status,
          items_list: updatedDelivery.itemsList,
          subtotal: updatedDelivery.subtotal,
          tax: updatedDelivery.tax,
          discount: updatedDelivery.discount,
          amount_received: updatedDelivery.amountReceived,
          change: updatedDelivery.change,
          vehicle: updatedDelivery.vehicle,
          driver: updatedDelivery.driver,
          delivery_notes: updatedDelivery.deliveryNotes
        })
        .eq('user_id', user.id)
        .eq('id', updatedDelivery.id);
        
      if (error) {
        console.error('Error updating delivery in database:', error);
        // Don't throw error - still have local storage backup
      }
    }
  } catch (error) {
    console.error('Error updating delivery:', error);
    throw new Error('Failed to update delivery');
  }
};

export const getDeliveryById = async (deliveryId: string): Promise<DeliveryData | undefined> => {
  try {
    const savedDeliveries = await getSavedDeliveries();
    return savedDeliveries.find(delivery => delivery.id === deliveryId);
  } catch (error) {
    console.error('Error retrieving delivery by ID:', error);
    return undefined;
  }
};