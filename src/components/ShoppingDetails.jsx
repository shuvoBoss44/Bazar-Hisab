import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function ShoppingDetails() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [centralBalance, setCentralBalance] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const limit = 10;

  const fetchData = useCallback(async () => {
    if (!user) {
      console.warn("fetchData called without a user. Redirecting.");
      navigate("/login");
      return;
    }

    try {
      setLoadingTransactions(true);
      const transactionResponse = await axios.get(
        `https://bazar-hisab-backend.onrender.com/api/transactions?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      const data = transactionResponse.data.data || {};
      setTransactions(data.transactions || []);
      setCentralBalance(data.centralBalance || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching data:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch data");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setLoadingTransactions(false);
    }
  }, [user, navigate, page, limit]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchData();
    }
  }, [page, user, authLoading, fetchData]);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleDelete = async id => {
    try {
      setLoadingTransactions(true);

      const transactionToDelete = transactions.find(t => t._id === id);
      if (!transactionToDelete) {
        throw new Error("Transaction not found in local state for deletion.");
      }

      await axios.delete(
        `https://bazar-hisab-backend.onrender.com/api/transactions/${id}`,
        { withCredentials: true }
      );

      const updatedTransactions = transactions.filter(
        transaction => transaction._id !== id
      );
      setTransactions(updatedTransactions);

      let newCentralBalance = centralBalance;
      if (transactionToDelete.items[0]?.itemName === "Balance Addition") {
        newCentralBalance -= transactionToDelete.totalPrice || 0;
      } else if (transactionToDelete.items[0]?.itemName === "Balance Removal") {
        newCentralBalance += Math.abs(transactionToDelete.totalPrice || 0);
      } else {
        newCentralBalance += transactionToDelete.totalPrice || 0;
      }
      setCentralBalance(newCentralBalance);

      if (updatedTransactions.length === 0 && page > 1) {
        setPage(prevPage => prevPage - 1);
      } else if (
        updatedTransactions.length < limit &&
        page === totalPages &&
        totalPages > 1
      ) {
        await fetchData();
      } else if (
        page === 1 &&
        updatedTransactions.length === 0 &&
        totalPages > 1
      ) {
        await fetchData();
      }

      setSuccess("Transaction deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(
        "Error deleting transaction:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to delete transaction");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getBorderClass = transaction => {
    if (transaction.items[0]?.itemName === "Balance Addition") {
      return "border-l-4 border-accent-emerald";
    } else if (transaction.items[0]?.itemName === "Balance Removal") {
      return "border-l-4 border-accent-rose";
    }
    return "border-l-4 border-accent-indigo";
  };

  const getTransactionTitle = transaction => {
    if (transaction.items[0]?.itemName === "Balance Addition") {
      return "Balance Addition";
    } else if (transaction.items[0]?.itemName === "Balance Removal") {
      return "Balance Removal";
    }
    return "Shopping Transaction";
  };

  if (authLoading || loadingTransactions) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center p-8 glass-dark rounded-2xl shadow-glow-primary">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-neutral-300 text-lg font-medium animate-pulse">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-8 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gradient-primary mb-10 text-center tracking-tight animate-in slide-in-from-bottom">
          Transaction History
        </h2>

        <div className="glass-indigo bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-3xl p-8 mb-12 shadow-glow-primary transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <h3 className="text-xl font-medium opacity-90 mb-2 font-display">
              Current Central Balance
            </h3>
            <p className="text-6xl sm:text-7xl font-bold tracking-tighter">
              {centralBalance?.toFixed(2) ?? "0.00"}
              <span className="text-3xl sm:text-4xl font-normal text-primary-200 ml-2">tk</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 mb-8 rounded-r-lg shadow-sm font-medium animate-in slide-in-from-bottom flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 mb-8 rounded-r-lg shadow-sm font-medium animate-in slide-in-from-bottom flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {success}
          </div>
        )}

        {!loadingTransactions && transactions.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <p className="text-secondary-500 text-xl font-medium">
              No transactions recorded yet.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {transactions.map((transaction, index) => {
            const isBalanceAddition =
              transaction.items[0]?.itemName === "Balance Addition";
            const isBalanceRemoval =
              transaction.items[0]?.itemName === "Balance Removal";
            const isCreator =
              user && transaction.createdBy._id.toString() === user.id;
            const isLatestTransaction = index === 0;

            return (
              <div
                key={transaction._id}
                className={`glass-card overflow-hidden hover:shadow-lg transition-all duration-300 ${getBorderClass(
                  transaction
                )}`}
              >
                <div className="p-6 border-b border-secondary-100 bg-secondary-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      isBalanceAddition ? "bg-emerald-100 text-emerald-600" :
                      isBalanceRemoval ? "bg-rose-100 text-rose-600" :
                      "bg-indigo-100 text-indigo-600"
                    }`}>
                      {isBalanceAddition && <i className="fas fa-plus-circle text-xl"></i>}
                      {isBalanceRemoval && <i className="fas fa-minus-circle text-xl"></i>}
                      {!isBalanceAddition && !isBalanceRemoval && <i className="fas fa-shopping-cart text-xl"></i>}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-secondary-900">
                        {getTransactionTitle(transaction)}
                      </h3>
                      <p className="text-sm text-secondary-500 font-medium">
                        {new Date(transaction.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-1.5 bg-white border border-secondary-200 rounded-full text-sm font-semibold text-secondary-700 shadow-sm">
                      {transaction.createdBy.name}
                    </span>
                    {transaction.edited && (
                      <span className="px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm font-semibold shadow-sm">
                        Edited
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  {(isBalanceAddition || isBalanceRemoval) &&
                    (isBalanceAddition ? (
                      <div className="space-y-6">
                        <p className="text-xl text-secondary-800 leading-relaxed">
                          <span className="font-bold text-secondary-900">{transaction.createdBy.name}</span> added{" "}
                          <span className="text-emerald-600 font-bold text-2xl">
                            {transaction.totalPrice?.toFixed(2) ?? "0.00"} tk
                          </span>{" "}
                          to their balance.
                        </p>
                        <div className="bg-secondary-50 rounded-xl p-6 border border-secondary-100">
                          <h4 className="font-semibold text-secondary-900 mb-4 text-sm uppercase tracking-wider">
                            Balance Update Summary
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-secondary-200">
                                  <th className="py-3 pr-4 font-semibold text-secondary-600 text-left">User</th>
                                  <th className="py-3 pr-4 font-semibold text-secondary-600 text-right">Before</th>
                                  <th className="py-3 pr-4 font-semibold text-secondary-600 text-right">Addition</th>
                                  <th className="py-3 font-semibold text-secondary-600 text-right">After</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-3 pr-4 text-secondary-900 font-medium">{transaction.createdBy.name}</td>
                                  <td className="py-3 pr-4 text-right text-secondary-600">
                                    {transaction.userBalanceBeforeTransaction?.toFixed(2) ?? "0.00"} tk
                                  </td>
                                  <td className="py-3 pr-4 text-right text-emerald-600 font-bold">
                                    + {transaction.totalPrice?.toFixed(2) ?? "0.00"} tk
                                  </td>
                                  <td className={`py-3 text-right font-bold ${
                                    (transaction.createdBy?.balance ?? 0) < 0 ? "text-rose-600" : "text-emerald-600"
                                  }`}>
                                    {transaction.createdBy?.balance?.toFixed(2) ?? "0.00"} tk
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-xl text-secondary-800 leading-relaxed">
                          <span className="font-bold text-secondary-900">{transaction.createdBy.name}</span> removed{" "}
                          <span className="text-rose-600 font-bold text-2xl">
                            {Math.abs(transaction.totalPrice ?? 0)?.toFixed(2) ?? "0.00"} tk
                          </span>{" "}
                          from their balance.
                        </p>
                        <div className="bg-secondary-50 rounded-xl p-6 border border-secondary-100">
                          <h4 className="font-semibold text-secondary-900 mb-4 text-sm uppercase tracking-wider">
                            Balance Update Summary
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-secondary-200">
                                  <th className="py-3 pr-4 font-semibold text-secondary-600 text-left">User</th>
                                  <th className="py-3 pr-4 font-semibold text-secondary-600 text-right">Before</th>
                                  <th className="py-3 pr-4 font-semibold text-secondary-600 text-right">Removal</th>
                                  <th className="py-3 font-semibold text-secondary-600 text-right">After</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-3 pr-4 text-secondary-900 font-medium">{transaction.createdBy.name}</td>
                                  <td className="py-3 pr-4 text-right text-secondary-600">
                                    {transaction.userBalanceBeforeTransaction?.toFixed(2) ?? "0.00"} tk
                                  </td>
                                  <td className="py-3 pr-4 text-right text-rose-600 font-bold">
                                    − {Math.abs(transaction.totalPrice ?? 0)?.toFixed(2) ?? "0.00"} tk
                                  </td>
                                  <td className={`py-3 text-right font-bold ${
                                    ((transaction.userBalanceBeforeTransaction || 0) - Math.abs(transaction.totalPrice ?? 0)) < 0 ? "text-rose-600" : "text-emerald-600"
                                  }`}>
                                    {((transaction.userBalanceBeforeTransaction || 0) - Math.abs(transaction.totalPrice ?? 0)).toFixed(2) ?? "0.00"} tk
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}

                  {!isBalanceAddition && !isBalanceRemoval && (
                    <div className="space-y-8">
                      <div>
                        <h4 className="font-semibold text-secondary-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                          Items Purchased
                        </h4>
                        <div className="bg-secondary-50 rounded-xl p-6 border border-secondary-100">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead>
                                <tr className="border-b border-secondary-200">
                                  <th className="py-3 pr-4 font-semibold text-secondary-600">Item</th>
                                  <th className="py-3 text-right font-semibold text-secondary-600">Price (tk)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transaction.items.map((item, index) => (
                                  <tr key={index} className="border-b border-secondary-100 last:border-b-0">
                                    <td className="py-3 pr-4 text-secondary-900 font-medium">{item.itemName}</td>
                                    <td className="py-3 text-right text-secondary-700 font-mono">
                                      {item.price?.toFixed(2) ?? "0.00"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-secondary-100/50">
                                  <td className="py-3 pr-4 font-bold text-secondary-900">Total</td>
                                  <td className="py-3 text-right font-bold text-primary-700 text-lg">
                                    {transaction.totalPrice?.toFixed(2) ?? "0.00"}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-secondary-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Deduction Details
                        </h4>
                        <div className="bg-secondary-50 rounded-xl p-6 border border-secondary-100">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-secondary-200">
                                  <th className="py-3 pr-4 font-semibold text-secondary-600 text-left">User</th>
                                  <th className="py-3 pr-4 font-semibold text-secondary-600 text-right">Balance Before</th>
                                  <th className="py-3 pr-4 font-semibold text-secondary-600 text-right">Deduction</th>
                                  <th className="py-3 font-semibold text-secondary-600 text-right">Balance After</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transaction.sharedUsers.map(sharedUserObj => {
                                  const balanceAtTimeObj = transaction.usersBalancesAtTransactionTime?.find(
                                    u => u._id.toString() === sharedUserObj._id.toString()
                                  );
                                  const balanceBefore = balanceAtTimeObj
                                    ? balanceAtTimeObj.balanceAtTime + (transaction.individualDeduction ?? 0)
                                    : sharedUserObj.balanceBeforeTransaction ?? null;

                                  const hasHistoricalData = balanceAtTimeObj || sharedUserObj.balanceBeforeTransaction !== undefined;
                                  const fallbackBalanceBefore = (sharedUserObj.balance ?? 0) + (transaction.individualDeduction ?? 0);
                                  const displayBalanceBefore = hasHistoricalData ? balanceBefore : fallbackBalanceBefore;
                                  const afterBalance = displayBalanceBefore - (transaction.individualDeduction ?? 0);

                                  return (
                                    <tr key={sharedUserObj._id} className="border-b border-secondary-100 last:border-b-0">
                                      <td className="py-3 pr-4 text-secondary-900 font-medium">{sharedUserObj.name}</td>
                                      <td className="py-3 pr-4 text-right text-secondary-600">
                                        {displayBalanceBefore?.toFixed(2) ?? "0.00"} tk
                                        {!hasHistoricalData && <span className="text-xs text-secondary-400 ml-1">(est.)</span>}
                                      </td>
                                      <td className="py-3 pr-4 text-right text-rose-600 font-bold">
                                        − {transaction.individualDeduction?.toFixed(2) ?? "0.00"} tk
                                      </td>
                                      <td className={`py-3 text-right font-bold ${afterBalance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                        {afterBalance?.toFixed(2) ?? "0.00"} tk
                                        {!hasHistoricalData && <span className="text-xs text-secondary-400 ml-1">(est.)</span>}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          {!transaction.usersBalancesAtTransactionTime?.length && (
                            <p className="text-xs text-secondary-400 mt-3 italic">
                              * Balances estimated from current values due to missing historical data.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-secondary-100">
                    <h4 className="font-semibold text-secondary-900 mb-4 text-sm uppercase tracking-wider">
                      Balances at Transaction Time
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {transaction.usersBalancesAtTransactionTime?.map((u, index) => (
                        <div
                          key={u._id || `user-balance-${transaction._id}-${index}`}
                          className="bg-white rounded-xl p-4 shadow-sm border border-secondary-200 flex justify-between items-center"
                        >
                          <span className="font-medium text-secondary-700">{u.name}</span>
                          <span className={`font-bold ${
                            (u.balanceAtTime ?? 0) < 0 ? "text-rose-600" : "text-emerald-600"
                          }`}>
                            {u.balanceAtTime?.toFixed(2) ?? "0.00"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {!transaction.usersBalancesAtTransactionTime?.length && (
                      <p className="text-secondary-500 text-sm italic">
                        Historical user balances not available for this record.
                      </p>
                    )}
                  </div>
                </div>

                {isCreator && isLatestTransaction && (
                  <div className="p-4 border-t border-secondary-100 bg-secondary-50/50 flex justify-end gap-3">
                    <button
                      onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
                      className="px-5 py-2.5 bg-white border border-secondary-200 text-secondary-700 rounded-lg hover:bg-secondary-50 hover:text-primary-600 hover:border-primary-200 transition-all duration-200 text-sm font-semibold shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="px-5 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg hover:bg-rose-100 hover:border-rose-200 transition-all duration-200 text-sm font-semibold shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-6">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-6 py-3 bg-white border border-secondary-200 text-secondary-700 rounded-xl hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Previous
            </button>
            <span className="text-secondary-600 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-secondary-100">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-6 py-3 bg-white border border-secondary-200 text-secondary-700 rounded-xl hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium flex items-center gap-2"
            >
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingDetails;
