const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Place Order Cloud Function (HTTPS Callable)
 * STRICT SECURITY:
 * 1. Authenticated users only.
 * 2. Recalculates total price from server-side product data.
 * 3. Ignores client-provided prices.
 * 4. Checks stock availability (optional but good practice).
 */
exports.placeOrder = functions.https.onCall(async (data, context) => {
  // 1. Auth Verification
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  const uid = context.auth.uid;
  const {items} = data; // items: [{ productId, quantity }]

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Order must contain items.",
    );
  }

  // 2. Server-side Price Calculation
  let totalAmount = 0;
  const orderItems = [];

  // Use a transaction/batch to ensure consistency (optional complexity, for now simple iteration)
  // Ideally, use db.runTransaction for stock updates.

  try {
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid item data");
      }

      const docRef = db.collection("products").doc(item.productId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        throw new functions.https.HttpsError("not-found", `Product ${item.productId} not found`);
      }

      const productData = docSnap.data();
      // STOCK CHECK (Optional but recommended)
      if (productData.stock < item.quantity) {
        throw new functions.https.HttpsError("resource-exhausted", `Insufficient stock for ${productData.name}`);
      }

      const price = productData.price;
      const lineTotal = price * item.quantity;
      totalAmount += lineTotal;

      orderItems.push({
        productId: item.productId,
        name: productData.name,
        price: price, // Store authoritative price
        quantity: item.quantity,
        lineTotal: lineTotal,
      });
    }

    // 3. Create Order in Firestore
    const orderData = {
      userId: uid,
      items: orderItems,
      totalAmount: totalAmount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "pending",
    };

    const orderRef = await db.collection("orders").add(orderData);

    return {
      success: true,
      orderId: orderRef.id,
      totalAmount: totalAmount,
    };
  } catch (error) {
    console.error("Order placement error:", error);
    // Re-throw if it's already an HttpsError
    if (error.code) throw error;
    throw new functions.https.HttpsError("internal", "Unable to place order");
  }
});
