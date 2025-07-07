import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../AuthContext"; // Assuming AuthContext provides user info

function EditTransaction() {
  const { user, loading: authLoading } = useContext(AuthContext);
  // Removed users state as it's no longer needed without "Share With" section
  const [items, setItems] = useState([{ itemName: "", price: "" }]); // For shopping transactions
  // Removed sharedUserIds state as it's no longer needed
  const [amount, setAmount] = useState(""); // For balance addition/removal transactions
  const [isBalanceAddition, setIsBalanceAddition] = useState(false);
  const [isBalanceRemoval, setIsBalanceRemoval] = useState(false);
  const [originalTransaction, setOriginalTransaction] = useState(null); // Stores the fetched transaction data to compare with edits
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState({
    // Removed users loading state
    transaction: false, // Loading state for fetching the specific transaction
    submit: false, // Loading state for submitting the form
  });

  const navigate = useNavigate();
  const { id: transactionId } = useParams(); // Extracts transaction ID from URL

  // Effect hook to fetch initial data when component mounts or dependencies change
  useEffect(() => {
    // Only fetch data if authentication is not loading and user data is available
    if (authLoading || !user) {
      // Optionally redirect to login if no user is found after auth loads
      if (!authLoading && !user) navigate("/login");
      return;
    }
    fetchData();
  }, [transactionId, user, authLoading, navigate]); // Dependencies for re-running the effect

  // Function to fetch the specific transaction data (removed users fetch)
  const fetchData = async () => {
    try {
      // Set loading state for transaction
      setLoading(prev => ({ ...prev, transaction: true }));

      // Fetch only the specific transaction
      const transRes = await axios.get(
        `https://bazar-hisab-backend.onrender.com/api/transactions/${transactionId}`,
        {
          withCredentials: true,
        }
      );

      const transaction = transRes.data.data?.transaction;

      // Error handling if transaction is not found
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Authorization check: Ensure only the creator can edit their transaction
      if (transaction.createdBy._id?.toString() !== user.id) {
        throw new Error("You are not authorized to edit this transaction");
      }

      // Removed setUsers(allUsers)
      setOriginalTransaction(transaction); // Store the complete original transaction data

      // Determine transaction type from the fetched data and populate form fields accordingly
      if (transaction.items[0]?.itemName === "Balance Addition") {
        setIsBalanceAddition(true);
        setIsBalanceRemoval(false);
        setAmount(transaction.totalPrice?.toString() ?? ""); // Amount for display should be positive
      } else if (transaction.items[0]?.itemName === "Balance Removal") {
        setIsBalanceRemoval(true);
        setIsBalanceAddition(false);
        // For removal, totalPrice might be negative in DB, use Math.abs for positive display
        setAmount(Math.abs(transaction.totalPrice ?? 0)?.toString() ?? "");
      } else {
        // It's a regular shopping transaction
        setIsBalanceAddition(false);
        setIsBalanceRemoval(false);
        setItems(
          transaction.items.map(item => ({
            itemName: item.itemName || "",
            price: item.price?.toString() || "", // Defensive access
          }))
        );
        // sharedUserIds is no longer managed in state or form, but we'll use original for payload
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
      // Redirect on error after a delay for user to read message
      setTimeout(() => navigate("/shopping-details"), 3000);
    } finally {
      setLoading(prev => ({ ...prev, transaction: false })); // Reset loading state (removed users loading)
    }
  };

  // Handler for changes in item name or price for shopping transactions
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Handler to add a new item row for shopping transactions
  const addItem = () => setItems([...items, { itemName: "", price: "" }]);

  // Handler to remove an item row for shopping transactions (if more than one exists)
  const removeItem = index =>
    items.length > 1 && setItems(items.filter((_, i) => i !== index));

  // Removed handleUserToggle as "Share With" section is removed

  // Form validation logic before submission
  const validateForm = () => {
    setError(null); // Clear previous errors before validating
    if (isBalanceAddition || isBalanceRemoval) {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setError(
          "Please enter a valid positive amount for balance transaction."
        );
        return false;
      }
    } else {
      // Validation for regular shopping transactions
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
      // Removed sharedUserIds validation as the section is removed
    }
    return true; // Form is valid
  };

  // Handler for submitting the form
  const handleSubmit = async () => {
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous successes

    if (!validateForm()) return; // Validate form inputs first

    // Essential check: Ensure originalTransaction data is loaded before proceeding
    if (!originalTransaction) {
      setError("Original transaction data not loaded. Please try again.");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true })); // Set submit loading state
      let payload = {}; // Initialize payload for the API request

      // Construct payload based on transaction type
      if (isBalanceAddition || isBalanceRemoval) {
        const newAmount = parseFloat(amount);
        const userIdToAdjust = originalTransaction.createdBy._id; // The user whose balance is affected

        payload = {
          items: [
            {
              itemName: isBalanceAddition
                ? "Balance Addition"
                : "Balance Removal",
              price: newAmount,
            },
          ],
          // For balance transactions, the affected user is typically just the creator
          sharedUsers: [userIdToAdjust], // Ensure only creator is in sharedUsers for balance transactions
          totalPrice: isBalanceRemoval ? -newAmount : newAmount,
        };
      } else {
        // Payload for regular shopping transaction update
        payload = {
          items: items.map(item => ({
            itemName: item.itemName.trim(),
            price: parseFloat(item.price),
          })),
          // For shopping transactions, retain the original sharedUsers if the backend expects it.
          // This assumes the sharedUsers cannot be changed from the edit form.
          sharedUsers: originalTransaction.sharedUsers.map(u => u._id),
        };
      }

      // Send the PATCH request to update the transaction document
      const response = await axios.patch(
        `https://bazar-hisab-backend.onrender.com/api/transactions/${transactionId}`,
        payload,
        { withCredentials: true }
      );

      // Handle successful response
      if (response.status === 200) {
        setSuccess(
          response.data.message || "Transaction updated successfully!"
        );
        // Redirect to shopping details page after a short delay
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
      setLoading(prev => ({ ...prev, submit: false })); // Reset submit loading state
    }
  };

  // Helper function to dynamically set the form title
  const getTitle = () => {
    if (isBalanceAddition) {
      return "Edit Balance Addition";
    } else if (isBalanceRemoval) {
      return "Edit Balance Removal";
    } else {
      return "Edit Transaction";
    }
  };

  // Display loading spinner while initial data is being fetched
  if (authLoading || loading.transaction) {
    // Removed loading.users
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Display a message if originalTransaction hasn't loaded (should be very brief)
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
        {/* Error message display */}
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
        {/* Success message display */}
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
          {/* Conditional rendering for balance transactions vs. regular transactions forms */}
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
            <>
              {/* Items section for regular shopping transactions */}
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

              {/* "Share With" section removed as requested */}
            </>
          )}

          {/* Action buttons */}
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
              disabled={loading.submit} // Removed users.length === 0 check
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
