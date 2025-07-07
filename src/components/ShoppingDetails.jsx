import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function ShoppingDetails() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [centralBalance, setCentralBalance] = useState(0);
  // Removed `users` state as it's no longer needed for historical balances
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
  }, [page, user, authLoading]);

  const fetchData = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      // Only fetching transactions now, assuming historical user balances are embedded
      const transactionResponse = await axios.get(
        `https://bazar-hisab-backend.onrender.com/api/transactions?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      setTransactions(transactionResponse.data.data.transactions);
      setCentralBalance(transactionResponse.data.data.centralBalance || 0);
      setTotalPages(transactionResponse.data.data.totalPages || 1);
      // Removed setUsers as the global users list is not needed here anymore
    } catch (err) {
      console.error("Error fetching data:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch data");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    try {
      setLoading(true);
      await axios.delete(
        `https://bazar-hisab-backend.onrender.com/api/transactions/${id}`,
        {
          withCredentials: true,
        }
      );
      setSuccess("Transaction deleted successfully!");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(
        "Error deleting transaction:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to delete transaction");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getBorderClass = transaction => {
    if (transaction.items[0]?.itemName === "Balance Addition") {
      return "border-l-4 border-emerald-500";
    } else if (transaction.items[0]?.itemName === "Balance Removal") {
      return "border-l-4 border-rose-500";
    }
    return "border-l-4 border-indigo-500";
  };

  const getTransactionTitle = transaction => {
    if (transaction.items[0]?.itemName === "Balance Addition") {
      return "Balance Addition";
    } else if (transaction.items[0]?.itemName === "Balance Removal") {
      return "Balance Removal";
    }
    return "Shopping Transaction";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 pt-20">
      {/* Outer wrapper for full width on mobile, with horizontal padding */}
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Inner container to restrict max-width on larger screens and center content */}
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
            Transaction History
          </h2>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 md:p-8 mb-10 shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <h3 className="text-lg md:text-xl font-semibold text-center opacity-90">
              Current Central Balance
            </h3>
            <p className="text-4xl md:text-6xl font-extrabold mt-2 text-center">
              {centralBalance.toFixed(2)}{" "}
              <span className="text-blue-200 text-3xl md:text-4xl">tk</span>
            </p>
          </div>

          {error && (
            <div className="bg-rose-100 border-l-4 border-rose-600 text-rose-800 p-4 mb-6 rounded-lg shadow-sm font-medium animate-fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-100 border-l-4 border-emerald-600 text-emerald-800 p-4 mb-6 rounded-lg shadow-sm font-medium animate-fade-in">
              {success}
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <div className="bg-white rounded-xl p-8 shadow-md text-center border border-gray-200">
              <p className="text-gray-600 text-lg font-medium">
                No transactions recorded yet.
              </p>
            </div>
          )}

          <div className="space-y-6 lg:space-y-8">
            {transactions.map(transaction => {
              const isBalanceAddition =
                transaction.items[0]?.itemName === "Balance Addition";
              const isBalanceRemoval =
                transaction.items[0]?.itemName === "Balance Removal";
              const isCreator =
                user && transaction.createdBy._id.toString() === user.id;

              return (
                <div
                  key={transaction._id}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden ${getBorderClass(
                    transaction
                  )}`}
                >
                  <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center space-x-3">
                      {isBalanceAddition && (
                        <span className="text-emerald-500 text-2xl flex-shrink-0">
                          <i className="fas fa-plus-circle"></i>
                        </span>
                      )}
                      {isBalanceRemoval && (
                        <span className="text-rose-500 text-2xl flex-shrink-0">
                          <i className="fas fa-minus-circle"></i>
                        </span>
                      )}
                      {!isBalanceAddition && !isBalanceRemoval && (
                        <span className="text-indigo-500 text-2xl flex-shrink-0">
                          <i className="fas fa-shopping-cart"></i>
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-800 break-words">
                        {getTransactionTitle(transaction)}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center justify-start sm:justify-end gap-x-3 gap-y-1 text-sm mt-2 sm:mt-0">
                      <span className="inline-block bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full">
                        {transaction.createdBy.name}
                      </span>
                      {transaction.edited && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 font-semibold px-3 py-1 rounded-full">
                          Edited
                        </span>
                      )}
                      <span className="text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 md:p-6">
                    {isBalanceAddition && (
                      <div className="space-y-5">
                        <p className="text-lg font-medium text-gray-800 leading-relaxed">
                          <span className="font-semibold">
                            {transaction.createdBy.name}
                          </span>{" "}
                          added{" "}
                          <span className="text-emerald-600 font-bold">
                            {transaction.totalPrice.toFixed(2)} tk
                          </span>{" "}
                          to their balance.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 shadow-inner border border-gray-100">
                          <h4 className="font-semibold text-gray-800 mb-3 text-base">
                            Balance Update Summary
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[300px]">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="py-2 pr-4 font-semibold text-gray-700 text-left whitespace-nowrap">
                                    User
                                  </th>
                                  <th className="py-2 pr-4 font-semibold text-gray-700 text-right whitespace-nowrap">
                                    Before
                                  </th>
                                  <th className="py-2 pr-4 font-semibold text-gray-700 text-right whitespace-nowrap">
                                    Addition
                                  </th>
                                  <th className="py-2 font-semibold text-gray-700 text-right whitespace-nowrap">
                                    After
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                                    {transaction.createdBy.name}
                                  </td>
                                  <td className="py-2 pr-4 text-right text-gray-600 whitespace-nowrap">
                                    {(
                                      transaction.userBalanceBeforeTransaction ||
                                      transaction.createdBy.balance -
                                        transaction.totalPrice
                                    ).toFixed(2)}{" "}
                                    tk
                                  </td>
                                  <td className="py-2 pr-4 text-right text-emerald-600 font-semibold whitespace-nowrap">
                                    + {transaction.totalPrice.toFixed(2)} tk
                                  </td>
                                  <td
                                    className="py-2 text-right font-bold whitespace-nowrap"
                                    style={{
                                      color:
                                        transaction.createdBy.balance < 0
                                          ? "rgb(220 38 38)" // rose-600
                                          : "rgb(5 150 105)", // emerald-600
                                    }}
                                  >
                                    {/* This is the balance *after* addition, specific to this user */}
                                    {transaction.createdBy.balance.toFixed(2)}{" "}
                                    tk
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {isBalanceRemoval && (
                      <div className="space-y-5">
                        <p className="text-lg font-medium text-gray-800 leading-relaxed">
                          <span className="font-semibold">
                            {transaction.createdBy.name}
                          </span>{" "}
                          removed{" "}
                          <span className="text-rose-600 font-bold">
                            {Math.abs(transaction.totalPrice).toFixed(2)} tk
                          </span>{" "}
                          from their balance.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 shadow-inner border border-gray-100">
                          <h4 className="font-semibold text-gray-800 mb-3 text-base">
                            Balance Update Summary
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[300px]">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="py-2 pr-4 font-semibold text-gray-700 text-left whitespace-nowrap">
                                    User
                                  </th>
                                  <th className="py-2 pr-4 font-semibold text-gray-700 text-right whitespace-nowrap">
                                    Before
                                  </th>
                                  <th className="py-2 pr-4 font-semibold text-gray-700 text-right whitespace-nowrap">
                                    Removal
                                  </th>
                                  <th className="py-2 font-semibold text-gray-700 text-right whitespace-nowrap">
                                    After
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                                    {transaction.createdBy.name}
                                  </td>
                                  <td className="py-2 pr-4 text-right text-gray-600 whitespace-nowrap">
                                    {(
                                      transaction.userBalanceBeforeTransaction ||
                                      transaction.createdBy.balance +
                                        Math.abs(transaction.totalPrice)
                                    ).toFixed(2)}{" "}
                                    tk
                                  </td>
                                  <td className="py-2 pr-4 text-right text-rose-600 font-semibold whitespace-nowrap">
                                    −{" "}
                                    {Math.abs(transaction.totalPrice).toFixed(
                                      2
                                    )}{" "}
                                    tk
                                  </td>
                                  <td
                                    className="py-2 text-right font-bold whitespace-nowrap"
                                    style={{
                                      color:
                                        transaction.createdBy.balance < 0
                                          ? "rgb(220 38 38)"
                                          : "rgb(5 150 105)",
                                    }}
                                  >
                                    {/* This is the balance *after* removal, specific to this user */}
                                    {transaction.createdBy.balance.toFixed(2)}{" "}
                                    tk
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isBalanceAddition && !isBalanceRemoval && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3 text-base">
                            Items Purchased
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 shadow-inner border border-gray-100">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left min-w-[280px]">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="py-2 pr-4 font-semibold text-gray-700 whitespace-nowrap">
                                      Item
                                    </th>
                                    <th className="py-2 text-right font-semibold text-gray-700 whitespace-nowrap">
                                      Price (tk)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {transaction.items.map((item, index) => (
                                    <tr
                                      key={index}
                                      className="border-b border-gray-100 last:border-b-0"
                                    >
                                      <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                                        {item.itemName}
                                      </td>
                                      <td className="py-2 text-right text-gray-800 font-medium whitespace-nowrap">
                                        {item.price.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr>
                                    <td className="pt-3 pr-4 font-bold text-gray-800 text-base whitespace-nowrap">
                                      Total
                                    </td>
                                    <td className="pt-3 text-right font-bold text-gray-800 text-base whitespace-nowrap">
                                      {transaction.totalPrice.toFixed(2)}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-800 mb-3 text-base">
                            Deduction Details
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 shadow-inner border border-gray-100">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm min-w-[300px]">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="py-2 pr-4 font-semibold text-gray-700 text-left whitespace-nowrap">
                                      User
                                    </th>
                                    <th className="py-2 pr-4 font-semibold text-gray-700 text-right whitespace-nowrap">
                                      Before
                                    </th>
                                    <th className="py-2 pr-4 font-semibold text-gray-700 text-right whitespace-nowrap">
                                      Deduction
                                    </th>
                                    <th className="py-2 font-semibold text-gray-700 text-right whitespace-nowrap">
                                      After
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {transaction.sharedUsers.map(
                                    sharedUserObj => {
                                      // Here, `sharedUserObj.balance` is likely the balance *after* this transaction for this specific user.
                                      // If you want "Before", you'd use `sharedUserObj.balance + transaction.individualDeduction`.
                                      const currentBalance =
                                        sharedUserObj.balance || 0;
                                      const individualDeduction =
                                        transaction.individualDeduction || 0;
                                      const balanceBefore =
                                        currentBalance + individualDeduction;
                                      return (
                                        <tr
                                          key={sharedUserObj._id}
                                          className="border-b border-gray-100 last:border-b-0"
                                        >
                                          <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                                            {sharedUserObj.name}
                                          </td>
                                          <td className="py-2 pr-4 text-right text-gray-600 whitespace-nowrap">
                                            {balanceBefore.toFixed(2)} tk
                                          </td>
                                          <td className="py-2 pr-4 text-right text-rose-600 font-semibold whitespace-nowrap">
                                            − {individualDeduction.toFixed(2)}{" "}
                                            tk
                                          </td>
                                          <td
                                            className="py-2 text-right font-bold whitespace-nowrap"
                                            style={{
                                              color:
                                                currentBalance < 0
                                                  ? "rgb(220 38 38)"
                                                  : "rgb(5 150 105)",
                                            }}
                                          >
                                            {currentBalance.toFixed(2)} tk
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* NEW: Displays balances of all users AT THE TIME of this transaction */}
                    <div className="mt-8">
                      <h4 className="font-semibold text-gray-800 mb-3 text-base">
                        Balances of All Users at Transaction Time
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {transaction.usersBalancesAtTransactionTime &&
                          transaction.usersBalancesAtTransactionTime.map(u => (
                            <div
                              key={u._id}
                              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 transform transition-transform duration-150 hover:scale-[1.02]"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">
                                  {u.name}
                                </span>
                                <span
                                  className={`font-semibold text-base ${
                                    u.balanceAtTime < 0
                                      ? "text-rose-600"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {u.balanceAtTime.toFixed(2)} tk
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                      {!transaction.usersBalancesAtTransactionTime && (
                        <p className="text-gray-600 text-sm mt-2">
                          Historical user balances not available for this
                          transaction type or record.
                        </p>
                      )}
                    </div>
                  </div>

                  {isCreator && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                      <button
                        onClick={() =>
                          navigate(`/edit-transaction/${transaction._id}`)
                        }
                        className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="px-5 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors duration-200 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-base font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700 text-base font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-base font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingDetails;
