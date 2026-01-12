import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
// import { useAuth } from '../context/AuthContext'; // If needed for localized messages
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleCheckout() {
        if (cartItems.length === 0) return;
        setLoading(true);

        try {
            const placeOrder = httpsCallable(functions, 'placeOrder');

            // Prepare payload: only productId and quantity.
            // Price is IGNORED by backend for security.
            const itemsPayload = cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }));

            const result = await placeOrder({ items: itemsPayload });

            if (result.data.success) {
                alert(`Order Placed Successfully! Total: $${result.data.totalAmount.toFixed(2)}`);
                clearCart();
                navigate('/orders');
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Checkout Failed: " + (error.message || "Unknown error"));
        }
        setLoading(false);
    }

    if (cartItems.length === 0) {
        return <div className="text-center mt-10 text-2xl text-gray-500">Your Cart is Empty</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
            <div className="bg-white rounded shadow p-6">
                {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b py-4">
                        <div className="flex items-center gap-4">
                            {/* Optional Image */}
                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                            <div>
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <p className="text-gray-600">${item.price}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded">
                                <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                <span className="px-3">{item.quantity}</span>
                                <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:underline text-sm">Remove</button>
                        </div>
                    </div>
                ))}

                <div className="mt-6 flex justify-between items-center">
                    <div className="text-2xl font-bold">
                        Total: <span className="text-blue-600">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-3 rounded text-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Secure Checkout'}
                    </button>
                </div>
                <p className="text-right text-gray-500 text-sm mt-2">
                    Prices are verified on the server.
                </p>
            </div>
        </div>
    );
}
