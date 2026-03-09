import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  variantId?: string;
  variantName?: string;
}

interface PosPayment {
  paymentMethod: string;
  amount: number;
  giftCardId?: string;
  cashboxId?: string;
  bankAccountId?: string;
}

interface PosState {
  // Cart management
  carts: Record<string, CartItem[]>;
  activeCartId: string | null;
  cartTotal: number;
  
  // Customer
  selectedCustomer: {
    id: string;
    code: string;
    title: string;
    creditLimit?: number;
    balance?: number;
  } | null;
  
  // Session
  activeSessionId: string | null;
  cashierId: string | null;
  cashboxId: string | null;
  
  // Payment
  payments: PosPayment[];
  remainingAmount: number;
  
  // UI state
  variantDialogOpen: boolean;
  paymentDialogOpen: boolean;
  receiptDialogOpen: boolean;
  selectedProductForVariant: CartItem | null;
  
  // Actions
  setActiveCart: (cartId: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string, productId: string) => void;
  updateCartItem: (cartId: string, productId: string, quantity: number) => void;
  clearCart: (cartId: string) => void;
  switchCart: (cartId: string) => void;
  deleteCart: (cartId: string) => void;
  
  setSelectedCustomer: (customer: PosState['selectedCustomer']) => void;
  clearSelectedCustomer: () => void;
  
  setSession: (sessionId: string | null, cashierId: string | null, cashboxId: string | null) => void;
  
  addPayment: (payment: PosPayment) => void;
  removePayment: (index: number) => void;
  clearPayments: () => void;
  
  setVariantDialogOpen: (open: boolean) => void;
  setSelectedProductForVariant: (product: CartItem | null) => void;
  setPaymentDialogOpen: (open: boolean) => void;
  setReceiptDialogOpen: (open: boolean) => void;
  completeCheckout: () => Promise<void>;
}

export const usePosStore = create<PosState>()(
  persist(
    (set) => ({
      // Cart state
      carts: {},
      activeCartId: null,
      cartTotal: 0,
      
      // Customer state
      selectedCustomer: null,
      
      // Session state
      activeSessionId: null,
      cashierId: null,
      cashboxId: null,
      
      // Payment state
      payments: [],
      remainingAmount: 0,
      
      // UI state
      variantDialogOpen: false,
      paymentDialogOpen: false,
      receiptDialogOpen: false,
      selectedProductForVariant: null,
      
      // Cart actions
      setActiveCart: (cartId) => set({ activeCartId: cartId }),
      
      addToCart: (item) => set((state) => {
        const cartId = state.activeCartId || 'default';
        const currentCart = state.carts[cartId] || [];
        
        // Check if product already exists in cart
        const existingItem = currentCart.find(
          (cartItem) => cartItem.productId === item.productId
        );
        
        if (existingItem) {
          // Update quantity if exists
          const updatedCart = currentCart.map((cartItem) =>
            cartItem.productId === item.productId
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          );
          const newTotal = calculateCartTotal(updatedCart);
          return {
            ...state,
            carts: { ...state.carts, [cartId]: updatedCart },
            cartTotal: newTotal,
          };
        } else {
          const updatedCart = [...currentCart, item];
          const newTotal = calculateCartTotal(updatedCart);
          return {
            ...state,
            carts: { ...state.carts, [cartId]: updatedCart },
            cartTotal: newTotal,
          };
        }
      }),

      removeFromCart: (cartId, productId) => set((state) => {
        const currentCart = state.carts[cartId] || [];
        const updatedCart = currentCart.filter((item) => item.productId !== productId);
        const newTotal = calculateCartTotal(updatedCart);
        return {
          ...state,
          carts: { ...state.carts, [cartId]: updatedCart },
          cartTotal: newTotal,
        };
      }),

      updateCartItem: (cartId, productId, quantity) => set((state) => {
        const currentCart = state.carts[cartId] || [];
        const updatedCart = currentCart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
        const newTotal = calculateCartTotal(updatedCart);
        return {
          ...state,
          carts: { ...state.carts, [cartId]: updatedCart },
          cartTotal: newTotal,
        };
      }),

      clearCart: (cartId) => set((state) => {
        const newCarts = { ...state.carts };
        delete newCarts[cartId];
        let newTotal = 0;
        Object.values(newCarts).forEach((cart) => {
          newTotal += calculateCartTotal(cart);
        });
        return { ...state, carts: newCarts, cartTotal: newTotal };
      }),

      switchCart: (cartId) => set((state) => {
        const hasCart = state.carts[cartId];
        if (!hasCart) {
          return {
            ...state,
            carts: { ...state.carts, [cartId]: [] },
            activeCartId: cartId,
            cartTotal: 0,
          };
        }
        return {
          ...state,
          activeCartId: cartId,
          cartTotal: calculateCartTotal(state.carts[cartId] || []),
        };
      }),

      deleteCart: (cartId) => set((state) => {
        const newCarts = { ...state.carts };
        delete newCarts[cartId];
        const newActiveId = state.activeCartId === cartId ? null : state.activeCartId;
        let newTotal = 0;
        Object.values(newCarts).forEach((cart) => {
          newTotal += calculateCartTotal(cart);
        });
        return {
          ...state,
          carts: newCarts,
          activeCartId: newActiveId,
          cartTotal: newTotal,
        };
      }),
      
      // Customer actions
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      
      clearSelectedCustomer: () => set({ selectedCustomer: null }),
      
      // Session actions
      setSession: (sessionId, cashierId, cashboxId) => set({
        activeSessionId: sessionId,
        cashierId,
        cashboxId,
      }),
      
      // Payment actions
      addPayment: (payment) => set((state) => {
        const newPayments = [...state.payments, payment];
        const newRemaining = state.cartTotal - newPayments.reduce(
          (sum, p) => sum + p.amount,
          0
        );
        
        return {
          ...state,
          payments: newPayments,
          remainingAmount: newRemaining,
        };
      }),
      
      removePayment: (index) => set((state) => {
        const newPayments = state.payments.filter((_, i) => i !== index);
        const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
        const newRemaining = state.cartTotal - totalPaid;
        
        return {
          ...state,
          payments: newPayments,
          remainingAmount: newRemaining,
        };
      }),
      
      clearPayments: () => set((state) => ({
        payments: [],
        remainingAmount: state.cartTotal,
      })),

      setVariantDialogOpen: (open) => set({ variantDialogOpen: open }),
      setSelectedProductForVariant: (product) => set({ selectedProductForVariant: product }),
      setPaymentDialogOpen: (open) => set({ paymentDialogOpen: open }),
      setReceiptDialogOpen: (open) => set({ receiptDialogOpen: open }),

      completeCheckout: async () => {
        try {
          const state = usePosStore.getState();
          const response = await fetch('/api/pos/cart/' + state.activeCartId + '/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payments: state.payments }),
          });
          if (response.ok) {
            set({
              carts: {},
              activeCartId: null,
              cartTotal: 0,
              payments: [],
              remainingAmount: 0,
              paymentDialogOpen: false,
              receiptDialogOpen: true,
            });
          }
        } catch (error) {
          console.error('Checkout error:', error);
        }
      },
    }),
    {
      name: 'pos-storage',
    }
  )
);

// Helper function to calculate cart total
function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discount = itemTotal * (item.discountRate || 0) / 100;
    const vat = (itemTotal - discount) * item.vatRate / 100;
    return total + (itemTotal - discount + vat);
  }, 0);
}
