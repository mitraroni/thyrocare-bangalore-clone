"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// TypeScript Interfaces
export interface Package {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  test_count: number;
  description?: string;
  category?: string;
  image_url?: string;
  tests?: string[];
  is_popular?: boolean;
  discount_percentage?: number;
}

export interface CartItem {
  package: Package;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  totalSavings: number;
  total: number;
}

export interface CartContextType extends CartState {
  addToCart: (packageItem: Package, quantity?: number) => void;
  updateQuantity: (packageId: string, quantity: number) => void;
  removeFromCart: (packageId: string) => void;
  clearCart: () => void;
  isInCart: (packageId: string) => boolean;
  getItemQuantity: (packageId: string) => number;
}

// Cart Actions
type CartAction =
  | { type: 'ADD_TO_CART'; payload: { package: Package; quantity: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { packageId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { packageId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Initial State
const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  totalSavings: 0,
  total: 0,
};

// Cart Calculations Helper
const calculateCartTotals = (items: CartItem[]): Omit<CartState, 'items'> => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.package.price * item.quantity);
  }, 0);
  
  const totalSavings = items.reduce((sum, item) => {
    if (item.package.original_price) {
      const savings = (item.package.original_price - item.package.price) * item.quantity;
      return sum + savings;
    }
    return sum;
  }, 0);
  
  const total = subtotal;
  
  return {
    totalItems,
    subtotal,
    totalSavings,
    total,
  };
};

// Cart Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { package: packageItem, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.package.id === packageItem.id
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { package: packageItem, quantity }];
      }

      const totals = calculateCartTotals(newItems);
      
      return {
        items: newItems,
        ...totals,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { packageId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const newItems = state.items.filter(item => item.package.id !== packageId);
        const totals = calculateCartTotals(newItems);
        
        return {
          items: newItems,
          ...totals,
        };
      }

      const newItems = state.items.map(item =>
        item.package.id === packageId
          ? { ...item, quantity }
          : item
      );

      const totals = calculateCartTotals(newItems);
      
      return {
        items: newItems,
        ...totals,
      };
    }

    case 'REMOVE_FROM_CART': {
      const { packageId } = action.payload;
      const newItems = state.items.filter(item => item.package.id !== packageId);
      const totals = calculateCartTotals(newItems);
      
      return {
        items: newItems,
        ...totals,
      };
    }

    case 'CLEAR_CART': {
      return initialState;
    }

    case 'LOAD_CART': {
      const items = action.payload;
      const totals = calculateCartTotals(items);
      
      return {
        items,
        ...totals,
      };
    }

    default:
      return state;
  }
};

// LocalStorage Helpers
const CART_STORAGE_KEY = 'bloodtest_cart';

const saveCartToStorage = (items: CartItem[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsedItems = JSON.parse(stored);
        // Validate the structure
        if (Array.isArray(parsedItems)) {
          return parsedItems.filter(item => 
            item.package && 
            typeof item.package.id === 'string' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
          );
        }
      }
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
  }
  return [];
};

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    if (savedCart.length > 0) {
      dispatch({ type: 'LOAD_CART', payload: savedCart });
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  // Cart Actions
  const addToCart = (packageItem: Package, quantity: number = 1) => {
    if (quantity <= 0) return;
    dispatch({ 
      type: 'ADD_TO_CART', 
      payload: { package: packageItem, quantity } 
    });
  };

  const updateQuantity = (packageId: string, quantity: number) => {
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { packageId, quantity } 
    });
  };

  const removeFromCart = (packageId: string) => {
    dispatch({ 
      type: 'REMOVE_FROM_CART', 
      payload: { packageId } 
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (packageId: string): boolean => {
    return state.items.some(item => item.package.id === packageId);
  };

  const getItemQuantity = (packageId: string): number => {
    const item = state.items.find(item => item.package.id === packageId);
    return item ? item.quantity : 0;
  };

  const contextValue: CartContextType = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Export default for convenience
export default CartProvider;