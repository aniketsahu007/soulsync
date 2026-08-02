// src/services/payment.service.ts

/**
 * Payment Service for SoulSync
 * Handles Razorpay payment integration
 */

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    
    // Add script to document
    document.body.appendChild(script);
  });
};

// Create donation order via Supabase Edge Function
export const createDonationOrder = async (
  amount: number, 
  donorAliasId: string, 
  ngoId?: string
): Promise<{ id: string; amount: number; currency: string }> => {
  try {
    const response = await fetch('/api/create-donation-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        donorAliasId,
        ngoId: ngoId || 'soulsync',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create donation order');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating donation order:', error);
    throw error;
  }
};

// Verify payment with Supabase Edge Function
export const verifyPayment = async (
  orderId: string,
  paymentId: string,
  signature: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment verification failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Save donation to Supabase
export const saveDonation = async (donationData: {
  donorAliasId: string;
  amount: number;
  ngoId?: string;
  paymentId: string;
  orderId: string;
  paymentGateway: string;
  status: string;
}) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('donations')
      .insert({
        donor_alias_id: donationData.donorAliasId,
        amount: donationData.amount,
        ngo_id: donationData.ngoId || null,
        payment_id: donationData.paymentId,
        order_id: donationData.orderId,
        payment_gateway: donationData.paymentGateway,
        status: donationData.status,
        created_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error saving donation:', error);
    throw error;
  }
};

// Get donation history for a user
export const getDonationHistory = async (donorAliasId: string) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_alias_id', donorAliasId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching donation history:', error);
    throw error;
  }
};

// Get total donations for an NGO
export const getNgoDonationStats = async (ngoId: string) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('donations')
      .select('amount, status')
      .eq('ngo_id', ngoId)
      .eq('status', 'completed');

    if (error) {
      throw new Error(error.message);
    }

    const totalAmount = data.reduce((sum, donation) => sum + donation.amount, 0);
    const totalDonations = data.length;

    return {
      totalAmount,
      totalDonations,
      donations: data,
    };
  } catch (error) {
    console.error('Error fetching NGO donation stats:', error);
    throw error;
  }
};

// Format currency in Indian Rupees
export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get payment status message
export const getPaymentStatusMessage = (status: string): string => {
  const messages: Record<string, string> = {
    pending: 'Your payment is being processed...',
    completed: 'Payment successful! Thank you for your donation!',
    failed: 'Payment failed. Please try again.',
    refunded: 'Payment has been refunded.',
  };
  return messages[status] || 'Unknown payment status';
};

// Check if Razorpay is available
export const isRazorpayAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).Razorpay;
};

// Get donation receipt data
export const getDonationReceipt = (donation: any) => {
  return {
    receiptNumber: `DON-${donation.id?.slice(0, 8) || 'XXXX'}`,
    date: new Date(donation.created_at).toLocaleDateString('en-IN'),
    amount: formatIndianCurrency(donation.amount),
    donorId: donation.donor_alias_id,
    paymentId: donation.payment_id,
    orderId: donation.order_id,
    ngoName: donation.ngo_name || 'SoulSync',
    message: 'Thank you for supporting mental health initiatives!',
  };
};

// Default export for convenience
const paymentService = {
  loadRazorpayScript,
  createDonationOrder,
  verifyPayment,
  saveDonation,
  getDonationHistory,
  getNgoDonationStats,
  formatIndianCurrency,
  getPaymentStatusMessage,
  isRazorpayAvailable,
  getDonationReceipt,
};

export default paymentService;
