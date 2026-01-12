import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        async function fetchOrders() {
            try {
                // Securely query only own orders
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", currentUser.uid),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                setOrders(querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
            } catch (error) {
                console.error("Error fetching orders:", error);
                // Note: Missing index error might occur here initially if not indexed
            }
            setLoading(false);
        }

        fetchOrders();
    }, [currentUser]);

    if (loading) return <div className="text-center mt-10">Loading orders...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Order History</h1>

            {orders.length === 0 ? (
                <p className="text-gray-500">You haven't placed any orders yet.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white border rounded shadow p-4">
                            <div className="flex justify-between items-start border-b pb-2 mb-2">
                                <div>
                                    <span className="font-bold text-lg">Order #{order.id.slice(0, 8)}</span>
                                    <p className="text-sm text-gray-500">
                                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-blue-600">${order.totalAmount?.toFixed(2)}</p>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        {order.status || 'Success'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span>{item.name} (x{item.quantity})</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
