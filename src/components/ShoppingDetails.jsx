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
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const navigate = useNavigate();
  const limit = 10;

  const [users, setUsers] = useState([]);

  const fetchData = useCallback(async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoadingTransactions(true);
      
      // Fetch transactions
      const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
      const transactionResponse = await axios.get(
        `${API_URL}/api/transactions?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      const data = transactionResponse.data.data || {};
      setTransactions(data.transactions || []);
      setCentralBalance(data.centralBalance || 0);
      setTotalPages(data.totalPages || 1);

      // Fetch all users for balance display
      const usersResponse = await axios.get(
        `${API_URL}/api/users`,
        { withCredentials: true }
      );
      // Handle different response structures (array direct or inside data object)
      const usersData = usersResponse.data.data;
      setUsers(Array.isArray(usersData) ? usersData : usersData?.users || []);

    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch data");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setLoadingTransactions(false);
    }
  }, [user, navigate, page]);

  useEffect(() => {
    if (user && !authLoading) fetchData();
  }, [page, user, authLoading, fetchData]);

  useEffect(() => {
    if (!user && !authLoading) navigate("/login");
  }, [user, authLoading, navigate]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
      await axios.delete(
        `${API_URL}/api/transactions/${id}`,
        { withCredentials: true }
      );
      setSuccess("Transaction deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete transaction");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (authLoading || loadingTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-primary">Dashboard</h1>
            <p className="text-slate-400 text-sm md:text-base">Welcome back, {user.name}</p>
          </div>
          <button onClick={() => navigate("/upload-transaction")} className="btn-primary">
            + New Transaction
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert-error animate-in flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-success animate-in flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Balances Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Central Pool Balance */}
          <div className="glass-card p-6 text-center lg:col-span-4 bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border-primary-500/20">
            <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">Central Pool Balance</p>
            <p className={`text-4xl md:text-5xl font-bold ${centralBalance >= 0 ? 'text-success-500' : 'text-error-500'}`}>
              ৳{centralBalance.toFixed(2)}
            </p>
          </div>

          {/* Individual User Balances */}
          {users.map((u) => (
            <div key={u._id} className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{u.name}</p>
                <p className={`text-lg font-bold ${(u.balance ?? 0) >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                  ৳{(u.balance ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold">Transaction History</h2>

          {transactions.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">No transactions yet</h3>
                <p className="text-slate-400 mt-2">Get started by creating your first transaction</p>
              </div>
              <button onClick={() => navigate("/upload-transaction")} className="btn-primary mx-auto">
                Create Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, idx) => {
                const isBalanceTransaction = 
                  transaction.items[0]?.itemName === "Balance Addition" || 
                  transaction.items[0]?.itemName === "Balance Removal";
                const isExpanded = expandedTransaction === transaction._id;

                return (
                  <div key={transaction._id} className="glass-card overflow-hidden">
                    {/* Transaction Header */}
                    <div className="p-4 md:p-6 bg-neutral-900/40 border-b border-white/10">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {transaction.items[0]?.itemName === "Balance Addition" ? (
                              <span className="badge-success">Balance Addition</span>
                            ) : transaction.items[0]?.itemName === "Balance Removal" ? (
                              <span className="badge-error">Balance Removal</span>
                            ) : (
                              <span className="badge-info">Shopping</span>
                            )}
                            <span className="text-xs text-slate-500">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">
                            Created by <span className="text-white font-medium">{transaction.createdBy?.name}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Total Amount</p>
                            <p className="text-2xl md:text-3xl font-bold text-gradient-primary">
                              ৳{transaction.totalPrice?.toFixed(2)}
                            </p>
                          </div>
                          {/* Only show actions if user is creator AND it is the latest transaction */}
                          {transaction.createdBy?._id === user.id && page === 1 && idx === 0 && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
                                className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                                title="Edit (Latest Only)"
                              >
                                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(transaction._id)}
                                className="p-2 hover:bg-error-500/10 rounded-lg transition-colors"
                                title="Delete (Latest Only)"
                              >
                                <svg className="w-5 h-5 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="p-4 md:p-6 space-y-4">
                      {/* Items Table */}
                      {!isBalanceTransaction && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm text-slate-300">Items Purchased</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-neutral-900/60">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Item Name</th>
                                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400">Price</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {transaction.items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-white/5">
                                    <td className="px-3 py-2 text-slate-300">{item.itemName}</td>
                                    <td className="px-3 py-2 text-right font-medium">৳{item.price?.toFixed(2)}</td>
                                  </tr>
                                ))}
                                <tr className="bg-neutral-900/40 font-semibold">
                                  <td className="px-3 py-2">Total</td>
                                  <td className="px-3 py-2 text-right text-primary-400">৳{transaction.totalPrice?.toFixed(2)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* User Balance Changes */}
                      {!isBalanceTransaction && transaction.sharedUsers && transaction.sharedUsers.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm text-slate-300">Expense Split & Balance History</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-neutral-900/60">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">User</th>
                                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400">Balance Before</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-400">Share</th>
                                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400">Balance After</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {transaction.sharedUsers.map((sharedUser, idx) => {
                                  // Find historical balance if available
                                  const historicalData = transaction.usersBalancesAtTransactionTime?.find(
                                    u => u._id === sharedUser._id || u._id === sharedUser.userId?._id
                                  );
                                  
                                  const balanceAfter = historicalData ? historicalData.balanceAtTime : (sharedUser.balance ?? 0);
                                  const deduction = transaction.individualDeduction || 0;
                                  const balanceBefore = balanceAfter + deduction;

                                  return (
                                    <tr key={idx} className="hover:bg-white/5">
                                      <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {(sharedUser?.name || 'U').charAt(0).toUpperCase()}
                                          </div>
                                          <span className="text-slate-300">{sharedUser?.name || 'Unknown'}</span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-right font-medium text-slate-400">
                                        ৳{balanceBefore.toFixed(2)}
                                      </td>
                                      <td className="px-3 py-2 text-center font-medium text-error-400">
                                        -৳{deduction.toFixed(2)}
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-slate-200">
                                        ৳{balanceAfter.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr className="bg-neutral-900/40">
                                  <td className="px-3 py-2 font-semibold">Total</td>
                                  <td className="px-3 py-2"></td>
                                  <td className="px-3 py-2 text-center font-semibold text-error-500">
                                    -৳{transaction.totalPrice?.toFixed(2)}
                                  </td>
                                  <td className="px-3 py-2"></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Balance Transaction Info */}
                      {isBalanceTransaction && (
                        <div className="bg-neutral-900/40 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Balance Impact</span>
                            <span className={`text-lg font-bold ${
                              transaction.items[0]?.itemName === "Balance Addition" ? 'text-success-500' : 'text-error-500'
                            }`}>
                              {transaction.items[0]?.itemName === "Balance Addition" ? '+' : '-'}৳{transaction.totalPrice?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-slate-400 px-4 text-sm md:text-base">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
