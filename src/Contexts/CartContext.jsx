import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'booksphere.shop.cart.v1';

const readStoredCartCount = () => {
    if (typeof window === 'undefined') return 0;
    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return 0;
        const items = JSON.parse(raw);
        if (!Array.isArray(items)) return 0;
        return items.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);
    } catch {
        return 0;
    }
};

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(readStoredCartCount);

    const addToCart = () => setCartCount(prev => prev + 1);

    return (
        <CartContext.Provider value={{ cartCount, setCartCount, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
