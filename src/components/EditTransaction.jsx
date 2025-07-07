import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function EditTransaction() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [items, setItems] = useState([{ itemName: "", price: "" }]);
  const [amount, setAmount] = useState("");
  const [isBalanceAddition, setIsBalanceAddition] = useState(false);
  const [isBalanceRemoval, setIsBalanceRemoval] = useState(false);
  const [originalTransaction, setOriginalTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState({
    transaction: false,
    submit: false,
  });

  const navigate = useNavigate();
  const { id: transactionId } = useParams();

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) navigate("/login");
      return;
    }
    fetchData();
  }, [transactionId, user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, transaction: true }));
      const transRes = await axios.get(
        `https://bazar-hisab-backend.onrender.com/api/transactions/${transactionId}`,
        { withCredentials: true }
      );

      const transaction = transRes.data.data?.transaction;
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.createdBy._id?.toString() !== user.id) {
        throw new Error("You are not authorized to edit this transaction");
      }

      setOriginalTransaction(transaction);

      if (transaction.items[0]?.itemName === "Balance Addition") {
        setIsBalanceAddition(true);
        setIsBalanceRemoval(false);
        setAmount(transaction.totalPrice?.toString() ?? "");
      } else if (transaction.items[0]?.itemName === "Balance Removal") {
        setIsBalanceRemoval(true);
        setIsBalanceAddition(false);
        setAmount(Math.abs(transaction.totalPrice ?? 0)?.toString() ?? "");
      } else {
        setIsBalanceAddition(false);
        setIsBalanceRemoval(false);
        setItems(
          transaction.items.map(item => ({
            itemName: item.itemName || "",
            price: item.price?.toString() || "",
          }))
        );
      }
    } catch (err) {
      console.error(
        "Error fetching data for edit:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load transaction data"
      );
      setTimeout(() => navigate("/shopping-details"), 3000);
    } finally {
      setLoading(prev => ({ ...prev, transaction: false }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { itemName: "", price: "" }]);

  const removeItem = index =>
    items.length > 1 && setItems(items.filter((_, i) => i !== index));

  const validateForm = () => {
    setError(null);
    if (isBalanceAddition || isBalanceRemoval) {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setError(
          "Please enter a valid positive amount for balance transaction."
        );
        return false;
      }
    } else {
      if (items.length === 0) {
        setError("Please add at least one item.");
        return false;
      }
      for (const item of items) {
        if (!item.itemName.trim()) {
          setError("All items must have a non-empty name.");
          return false;
        }
        const price = parseFloat(item.price);
        if (isNaN(price) || price <= 0) {
          setError("All items must have a valid positive price.");
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    if (!originalTransaction) {
      setError("Original transaction data not loaded. Please try again.");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      let payload = {};

      if (isBalanceAddition || isBalanceRemoval) {
        const newAmount = parseFloat(amount);
        const userIdToAdjust = originalTransaction.createdBy._id;

        payload = {
          items: [
            {
              itemName: isBalanceAddition
                ? "Balance Addition"
                : "Balance Removal",
              price: newAmount,
            },
          ],
          sharedUsers: [userIdToAdjust],
          totalPrice: isBalanceRemoval ? -newAmount : newAmount,
          originalTotalPrice: originalTransaction.totalPrice,
          userBalanceBeforeTransaction:
            originalTransaction.userBalanceBeforeTransaction,
          usersBalancesAtTransactionTime:
            originalTransaction.usersBalancesAtTransactionTime,
        };
      } else {
        const newTotal = items.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        );
        payload = {
          items: items.map(item => ({
            itemName: item.itemName.trim(),
            price: parseFloat(item.price),
          })),
          sharedUsers: originalTransaction.sharedUsers.map(u => u._id),
          totalPrice: newTotal,
          originalTotalPrice: originalTransaction.totalPrice,
          userBalanceBeforeTransaction:
            originalTransaction.userBalanceBeforeTransaction,
          usersBalancesAtTransactionTime:
            originalTransaction.usersBalancesAtTransactionTime,
        };
      }

      const response = await axios.patch(
        `https://bazar-hisab-backend.onrender.com/api/transactions/${transactionId}`,
        payload,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setSuccess(
          response.data.message || "Transaction updated successfully!"
        );
        setTimeout(() => navigate("/shopping-details"), 1500);
      }
    } catch (err) {
      console.error(
        "Error updating transaction:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update transaction"
      );
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const getTitle = () => {
    if (isBalanceAddition) return "Edit Balance Addition";
    if (isBalanceRemoval) return "Edit Balance Removal";
    return "Edit Transaction";
  };

  if (authLoading || loading.transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!originalTransaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading transaction details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24">
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 max-w-3xl w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          {getTitle()}
        </h2>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {success}
          </div>
        )}
        <div className="space-y-6 sm:space-y-8">
          {isBalanceAddition || isBalanceRemoval ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (tk)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <p className="text-sm text-gray-500">
                This will {isBalanceAddition ? "add to" : "deduct from"}{" "}
                {user?.name}'s balance.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                Items
              </h3>
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 sm:flex-row sm:gap-3 sm:items-end"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter item name"
                      value={item.itemName}
                      onChange={e =>
                        handleItemChange(index, "itemName", e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (tk)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={item.price}
                      onChange={e =>
                        handleItemChange(index, "price", e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full sm:w-auto mt-2 sm:mt-0 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-all"
              >
                + Add Another Item
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate("/shopping-details")}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all text-base"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading.submit}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center text-base"
            >
              {loading.submit ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTransaction;
