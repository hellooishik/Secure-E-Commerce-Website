import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProducts() {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
            setLoading(false);
        }

        fetchProducts();
    }, []);

    function handleAddToCart(product) {
        if (!currentUser) {
            alert("Please login to shop");
            navigate('/login');
            return;
        }
        addToCart(product);
        alert("Added to cart!");
    }

    if (loading) return <div className="text-center mt-10">Loading products...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Latest Products</h1>

            {products.length === 0 ? (
                <p className="text-gray-500 text-center">No products available. Admin must add products first.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="border rounded shadow-sm hover:shadow-md transition bg-white p-4 flex flex-col">
                            <div className="h-48 bg-gray-200 mb-4 rounded flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full" />
                                ) : (
                                    <span className="text-gray-400">No Image</span>
                                )}
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                            <div className="mt-auto flex justify-between items-center">
                                <span className="font-bold text-lg">${product.price}</span>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
