import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from local storage on init
    useEffect(() => {
        const savedCart = localStorage.getItem('secureParamsCart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('secureParamsCart', JSON.stringify(cartItems));
    }, [cartItems]);

    function addToCart(product) {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }

    function removeFromCart(productId) {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    }

    function updateQuantity(productId, quantity) {
        if (quantity < 1) return removeFromCart(productId);
        setCartItems(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity: quantity } : item
        ));
    }

    function clearCart() {
        setCartItems([]);
    }

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
