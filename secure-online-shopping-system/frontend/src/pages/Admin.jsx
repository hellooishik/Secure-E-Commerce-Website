import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        stock: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    async function fetchData() {
        setLoading(true);
        try {
            if (activeTab === 'products') {
                const querySnapshot = await getDocs(collection(db, "products"));
                setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else {
                // Fetch all orders
                const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Error fetching data. Check permissions or console.");
        }
        setLoading(false);
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.stock) return alert("Fill required fields");

        // Convert types
        const productPayload = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
            updatedAt: serverTimestamp()
        };

        try {
            if (editingId) {
                // Update
                await updateDoc(doc(db, "products", editingId), productPayload);
                alert("Product Updated");
            } else {
                // Create
                await addDoc(collection(db, "products"), {
                    ...productPayload,
                    createdAt: serverTimestamp()
                });
                alert("Product Created");
            }
            // Reset
            setEditingId(null);
            setFormData({ name: '', price: '', description: '', imageUrl: '', stock: '' });
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product");
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, "products", id));
            fetchData();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete");
        }
    }

    function startEdit(product) {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            imageUrl: product.imageUrl,
            stock: product.stock
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b pb-2">
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('products')}
                >
                    Manage Products
                </button>
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('orders')}
                >
                    View All Orders
                </button>
            </div>

            {loading && <div>Loading...</div>}

            {!loading && activeTab === 'products' && (
                <>
                    {/* Product Form */}
                    <div className="bg-white p-6 rounded shadow mb-8">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} className="border p-2 rounded" required />
                            <input name="price" type="number" step="0.01" placeholder="Price" value={formData.price} onChange={handleInputChange} className="border p-2 rounded" required />
                            <input name="stock" type="number" placeholder="Stock Quantity" value={formData.stock} onChange={handleInputChange} className="border p-2 rounded" required />
                            <input name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleInputChange} className="border p-2 rounded" />
                            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} className="border p-2 rounded md:col-span-2" rows="3"></textarea>

                            <div className="md:col-span-2 flex gap-2">
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                    {editingId ? 'Update Product' : 'Add Product'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', price: '', description: '', imageUrl: '', stock: '' }); }} className="bg-gray-500 text-white px-4 py-2 rounded">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Product List */}
                    <div className="bg-white rounded shadow overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium">{p.name}</td>
                                        <td className="p-3">${p.price}</td>
                                        <td className="p-3">{p.stock}</td>
                                        <td className="p-3 flex gap-2">
                                            <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr><td colSpan="4" className="p-4 text-center text-gray-500">No products found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {!loading && activeTab === 'orders' && (
                <div className="bg-white rounded shadow overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3">Order ID</th>
                                <th className="p-3">User ID</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-sm font-mono">{o.id}</td>
                                    <td className="p-3 text-sm font-mono">{o.userId}</td>
                                    <td className="p-3 font-bold">${o.totalAmount?.toFixed(2)}</td>
                                    <td className="p-3 text-sm">
                                        {o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                                    </td>
                                    <td className="p-3">
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                            {o.status || 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
