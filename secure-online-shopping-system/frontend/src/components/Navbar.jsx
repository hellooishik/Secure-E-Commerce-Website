import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { currentUser, userRole, logout } = useAuth();
    const navigate = useNavigate();
    const { cartCount } = useCart();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch {
            console.error("Failed to log out");
        }
    }

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">SecureShop</Link>
                <div className="flex gap-4 items-center">
                    <Link to="/" className="hover:text-gray-300">Home</Link>

                    {currentUser && (
                        <>
                            <Link to="/cart" className="hover:text-gray-300 flex items-center">
                                Cart
                                {cartCount > 0 && (
                                    <span className="ml-1 bg-red-500 rounded-full px-2 text-xs">{cartCount}</span>
                                )}
                            </Link>
                            <Link to="/orders" className="hover:text-gray-300">My Orders</Link>
                        </>
                    )}

                    {userRole === 'admin' && (
                        <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 font-semibold border border-yellow-400 rounded px-2 py-1">
                            Admin Panel
                        </Link>
                    )}

                    {currentUser ? (
                        <div className="flex items-center gap-4 border-l pl-4 ml-4 border-gray-600">
                            <span className="text-sm text-gray-400">{currentUser.email}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Link to="/login" className="hover:text-gray-300">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
