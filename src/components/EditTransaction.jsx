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

    fetchData();
  }, [transactionId, user, authLoading, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        };
      } else {
        payload = {
            items: items.map(item => ({
                itemName: item.itemName,
                price: parseFloat(item.price)
            }))
        }
      }

      await axios.put(
        `https://bazar-hisab-backend.onrender.com/api/transactions/${transactionId}`,
        payload,
        { withCredentials: true }
      );

      setSuccess("Transaction updated successfully!");
      setTimeout(() => navigate("/shopping-details"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating transaction");
    } finally {
        setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  if (loading.transaction || authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center p-8 glass-card">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mb-4"></div>
          <p className="text-neutral-300 text-lg font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 md:p-12 shadow-neon-cyan animate-in slide-in-from-bottom relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-secondary-300 mb-2">
              Edit Transaction
            </h2>
            <p className="text-neutral-400">Update the details of your transaction</p>
          </div>

          {error && (
            <div className="bg-rose-900/20 border-l-4 border-rose-500 text-rose-300 p-4 mb-8 rounded-r-lg shadow-sm font-medium flex items-center animate-in fade-in relative z-10 backdrop-blur-sm">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-300 p-4 mb-8 rounded-r-lg shadow-sm font-medium flex items-center animate-in fade-in relative z-10 backdrop-blur-sm">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}

          <div className="mb-8 relative z-10">
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-900/50 rounded-xl border border-white/5">
              <button
                type="button"
                disabled={isBalanceAddition || isBalanceRemoval}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  !isBalanceAddition && !isBalanceRemoval
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-900/50"
                    : "text-neutral-500 cursor-not-allowed"
                }`}
              >
                Shopping
              </button>
              <button
                type="button"
                disabled={!isBalanceAddition}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isBalanceAddition
                    ? "bg-accent-lime text-neutral-950 shadow-lg shadow-lime-900/50"
                    : "text-neutral-500 cursor-not-allowed"
                }`}
              >
                Add Balance
              </button>
              <button
                type="button"
                disabled={!isBalanceRemoval}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isBalanceRemoval
                    ? "bg-accent-pink text-white shadow-lg shadow-pink-900/50"
                    : "text-neutral-500 cursor-not-allowed"
                }`}
              >
                Remove Balance
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {!isBalanceAddition && !isBalanceRemoval ? (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start animate-in fade-in">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                        className="input-field bg-neutral-800/50"
                        required
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        className="input-field bg-neutral-800/50"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-3.5 text-rose-400 hover:bg-rose-900/20 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="w-full py-3 border border-dashed border-neutral-700 rounded-xl text-neutral-400 font-medium hover:border-primary-500 hover:text-primary-400 hover:bg-primary-500/5 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Add Another Item
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Amount to {isBalanceAddition ? "Add" : "Remove"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">tk</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field pl-10 text-lg font-medium"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/shopping-details")}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading.submit}
                className="flex-1 btn-primary"
              >
                {loading.submit ? "Updating..." : "Update Transaction"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditTransaction;
