import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import EmptyState from "./EmptyState";
import { TransactionListSkeleton, DashboardStatsSkeleton } from "./LoadingSkeleton";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
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

  // Filter transactions based on search and date
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      transaction.items?.some(item => item.itemName?.toLowerCase().includes(searchLower)) ||
      transaction.createdBy?.name?.toLowerCase().includes(searchLower);

    // Date filter
    const transactionDate = new Date(transaction.createdAt);
    const now = new Date();
    let matchesDate = true;

    if (dateFilter === 'today') {
      matchesDate = transactionDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = transactionDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = transactionDate >= monthAgo;
    }

    return matchesSearch && matchesDate;
  });

  if (authLoading || loadingTransactions) {
    return (
      <div className="min-h-screen py-6 px-4 md:py-10 md:px-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="skeleton-title w-48" />
            <div className="skeleton-text w-64" />
          </div>
          {/* Stats Skeleton */}
          <DashboardStatsSkeleton />
          {/* Transactions Skeleton */}
          <TransactionListSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-400 font-medium flex items-center gap-3 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Synchronized as <span className="text-white font-semibold">{user.name}</span>
            </p>
          </div>
          <button 
            onClick={() => navigate("/upload-transaction")} 
            className="btn-primary group shadow-lg shadow-blue-500/10"
          >
            <svg className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-bold text-xs">New Record</span>
          </button>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {error && (
            <div className="alert-error animate-in flex items-center gap-4 bg-red-500/10 border-red-500/20">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-success animate-in flex items-center gap-4 bg-emerald-500/10 border-emerald-500/20">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold text-sm">{success}</span>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search transactions, items, or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 pr-4"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Date Filter */}
            <div className="flex gap-1 md:gap-2 p-1 md:p-1.5 bg-neutral-900/60 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setDateFilter(filter.id)}
                  className={`px-3 md:px-4 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                    dateFilter === filter.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Results Counter */}
          {(searchQuery || dateFilter !== 'all') && (
            <div className="flex items-center justify-between text-xs">
              <p className="text-slate-400 font-medium">
                Showing <span className="text-white font-bold">{filteredTransactions.length}</span> of <span className="font-semibold">{transactions.length}</span> transactions
              </p>
              {(searchQuery || dateFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDateFilter("all");
                  }}
                  className="text-blue-400 hover:text-white font-bold transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Balances Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Central Pool Balance */}
          <div className="glass-card p-5 md:p-8 lg:col-span-4 bg-gradient-to-br from-blue-900/10 via-neutral-900/60 to-indigo-900/10 border-blue-500/20 group hover:border-blue-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-all duration-700 group-hover:bg-blue-500/10"></div>
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">Total Pool Fund</p>
                    <p className="text-[10px] text-slate-400 font-medium">Accumulated shared balance</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-slate-500 font-bold">৳</span>
                  <p className={`text-4xl md:text-5xl font-bold tracking-tight transition-all duration-700 ${centralBalance >= 0 ? 'text-white' : 'text-rose-500'}`}>
                    {Math.abs(centralBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {centralBalance < 0 && <span className="text-rose-500 text-xs font-bold ml-3 uppercase tracking-wider bg-rose-500/10 px-3 py-0.5 rounded-lg border border-rose-500/20">Deficit</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:pl-10 lg:border-l border-white/5">
                 <div className="space-y-0.5 group/stat">
                   <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Active Pool</p>
                   <p className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{users.length} <span className="text-[10px] font-medium text-slate-600">Users</span></p>
                 </div>
                 <div className="space-y-0.5 group/stat">
                   <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Records</p>
                   <p className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{transactions.length} <span className="text-[10px] font-medium text-slate-600">Log</span></p>
                 </div>
                 <div className="space-y-0.5 group/stat">
                   <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Last Activity</p>
                   <p className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">{transactions[0] ? new Date(transactions[0].createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'N/A'}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Individual User Balances */}
          {users.map((u) => (
            <div key={u.id || u._id} className="glass-card p-5 flex flex-col gap-4 hover:bg-white/[0.03] transition-all duration-300 border border-white/5 hover:border-blue-500/20 group">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <div className="relative w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-blue-600 flex items-center justify-center text-sm font-bold text-white transition-all duration-300">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                   <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase border border-blue-500/10">Contributor</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-400 truncate text-xs uppercase tracking-wider group-hover:text-white transition-colors">{u.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-slate-500 font-bold">৳</span>
                  <p className={`text-2xl font-bold tracking-tight ${(u.balance ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(u.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight uppercase">History Log</h2>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Latest Activity</span>
              <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title={searchQuery || dateFilter !== 'all' ? "No Results Found" : "Void Storage"}
              description={
                searchQuery || dateFilter !== 'all' 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "No financial records detected in the synchronization pool yet."
              }
              actionLabel={searchQuery || dateFilter !== 'all' ? "Clear Filters" : "Initiate Record"}
              onAction={
                searchQuery || dateFilter !== 'all'
                  ? () => {
                      setSearchQuery("");
                      setDateFilter("all");
                    }
                  : () => navigate("/upload-transaction")
              }
            />
          ) : (
            <div className="space-y-6 md:space-y-10">
              {filteredTransactions.map((transaction, idx) => {
                const isAddition = transaction.items?.[0]?.itemName === "Balance Addition";
                const isRemoval = transaction.items?.[0]?.itemName === "Balance Removal";
                const isShopping = !isAddition && !isRemoval;

                return (
                  <div 
                    key={transaction._id}
                    className={`group relative p-4 md:p-5 rounded-3xl border transition-all duration-500 hover:shadow-2xl cursor-pointer overflow-hidden ${
                      expandedTransaction === transaction._id 
                        ? 'bg-neutral-900 border-white/10 shadow-glow' 
                        : 'bg-neutral-900/40 border-white/5 hover:border-white/10 hover:bg-neutral-900/60'
                    }`}
                    onClick={() => setExpandedTransaction(expandedTransaction === transaction._id ? null : transaction._id)}
                  >
                    {/* Category Accent Border */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-r-full transition-all duration-500 ${
                      isAddition ? 'bg-emerald-500/50' : isRemoval ? 'bg-rose-500/50' : 'bg-blue-500/50'
                    } ${expandedTransaction === transaction._id ? 'opacity-100 h-1/2' : 'opacity-0 h-0 group-hover:opacity-100 group-hover:h-3/5'}`}></div>

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg flex-shrink-0 ${
                          isAddition ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20' :
                          isRemoval ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20' :
                          'bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isAddition ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            ) : isRemoval ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            )}
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                             <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md border ${
                               isAddition ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                               isRemoval ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                               'bg-blue-500/10 border-blue-500/20 text-blue-400'
                             }`}>
                               {isAddition ? 'Liquidity IN' : isRemoval ? 'Liquidity OUT' : 'Expense'}
                             </span>
                             <span className="text-[10px] font-bold text-slate-500">{new Date(transaction.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <h3 className={`text-sm font-bold text-white uppercase tracking-wider transition-colors ${
                            isAddition ? 'group-hover:text-emerald-400' :
                            isRemoval ? 'group-hover:text-rose-400' :
                            'group-hover:text-blue-400'
                          }`}>
                            {isAddition ? 'Balance Addition' : isRemoval ? 'Balance Removal' : 'Shared Pool Expense'}
                          </h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            By <span className="text-slate-300 font-bold">{transaction.createdBy?.name || 'Unknown'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 text-right">
                        <div className="flex flex-col items-end">
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact Amount</p>
                           <div className={`flex items-baseline gap-1 font-bold ${
                             isAddition ? 'text-emerald-400' : isRemoval ? 'text-rose-400' : 'text-white'
                           }`}>
                             <span className="text-xs">৳</span>
                             <span className="text-xl tracking-tight">{(transaction.totalPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                           </div>
                        </div>
                        {/* Actions only for creator AND absolute latest transaction */}
                        {(transaction.createdBy?._id === (user.id || user._id) || transaction.createdBy === (user.id || user._id)) && 
                          page === 1 && 
                          transaction._id === transactions[0]?._id && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/edit-transaction/${transaction._id}`); }}
                              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-500 hover:text-white flex items-center justify-center transition-all duration-300 border border-white/5 hover:border-blue-500/30"
                              title="Edit Record"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(transaction._id); }}
                              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-white flex items-center justify-center transition-all duration-300 border border-white/5 hover:border-rose-500/30"
                              title="Delete Record"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded View */}
                    {expandedTransaction === transaction._id && (
                      <div className="mt-6 md:mt-8 animate-in slide-in-from-top-4 duration-500 pb-2">
                        <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-neutral-900/20 border-t border-white/5 rounded-2xl overflow-hidden">
                          {/* Balance Info Single Box */}
                          {(isAddition || isRemoval) && (
                            <div className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] border flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 ${
                              isAddition ? 'bg-emerald-500/[0.03] border-emerald-500/10' : 'bg-rose-500/[0.03] border-rose-500/10'
                            }`}>
                              <div className="space-y-2">
                                 <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                     isAddition ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                   }`}>
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                     </svg>
                                   </div>
                                   <div>
                                     <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">System Impact</p>
                                     <p className="text-white font-bold uppercase text-sm mt-0.5">{isAddition ? 'Balance Addition' : 'Balance Removal'} Event</p>
                                   </div>
                                 </div>
                                 <p className="text-slate-500 text-[10px] font-medium max-w-sm">This operation directly adjusted the central pool liquidity by the specified amount below.</p>
                              </div>
                              <div className={`text-2xl md:text-3xl font-bold tracking-tight ${
                                isAddition ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                <span className="text-base mr-0.5 font-bold">৳</span>
                                {isAddition ? '+' : '-'}{transaction.totalPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          )}

                          {/* Items Details */}
                          {isShopping && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                               <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                 <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Receipt Details</p>
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{transaction.items.length} {transaction.items.length === 1 ? 'Item' : 'Items'}</p>
                               </div>
                              <div className="space-y-2">
                                {transaction.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between py-2 group/item">
                                    <div className="flex items-center gap-3">
                                      <span className="text-[9px] font-bold text-slate-600 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                                      <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors uppercase text-[11px] tracking-wide">{item.itemName}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                       <span className="text-[9px] font-bold text-slate-500">৳</span>
                                       <span className="font-bold text-white text-sm">{(item.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </div>
                                ))}
                                <div className="pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-xs">Subtotal</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xs text-slate-400 font-bold">৳</span>
                                    <span className="text-lg font-bold text-white">{(transaction.totalPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Participant Splits */}
                          {isShopping && transaction.sharedUsers && transaction.sharedUsers.length > 0 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                               <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                 <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Split Distribution</p>
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{transaction.sharedUsers.length} {transaction.sharedUsers.length === 1 ? 'Person' : 'People'}</p>
                               </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {transaction.sharedUsers.map((sharedUser, idx) => {
                                  const historicalData = transaction.usersBalancesAtTransactionTime?.find(
                                    u => u._id === sharedUser._id || u._id === sharedUser.userId?._id
                                  );
                                  const balanceAfter = historicalData ? historicalData.balanceAtTime : (sharedUser.balance ?? 0);
                                  const deduction = transaction.individualDeduction || 0;
                                  const balanceBefore = balanceAfter + deduction;

                                  return (
                                    <div key={idx} className="group/split p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 transition-all duration-300">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white uppercase group-hover/split:bg-indigo-600 transition-colors">
                                          {(sharedUser?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-bold text-slate-200 uppercase text-[9px] tracking-tight truncate">{sharedUser?.name || 'Unknown'}</p>
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                                            <span className="text-[9px] font-bold text-rose-400 tabular-nums">-৳{deduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="space-y-0.5">
                                          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Before</p>
                                          <p className="text-[10px] font-bold text-slate-400">৳{balanceBefore.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="space-y-0.5 text-right">
                                          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">After</p>
                                          <p className="text-xs font-bold text-emerald-400">৳{balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-10 pb-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="py-2.5 px-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              <div className="flex items-center gap-3 px-6 py-2.5 rounded-lg bg-neutral-900 border border-white/5">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Page</span>
                <span className="text-sm font-bold text-white">{page}</span>
                <span className="text-slate-700">/</span>
                <span className="text-sm font-bold text-slate-500">{totalPages}</span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 border border-blue-400/20 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-20 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 active:scale-95"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingDetails;
