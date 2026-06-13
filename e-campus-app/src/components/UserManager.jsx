import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, Shield, User as UserIcon, Mail, Phone, MapPin, Package, RefreshCw } from 'lucide-react'
import api from '../services/api'

export default function UserManager({ authToken, showToast, showConfirmModal, closeConfirmModal }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const fetchUsers = useCallback(async (page = 1, searchTerm = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: 20 }
      if (searchTerm) params.search = searchTerm
      const response = await api.getAllUsers(authToken, params)
      setUsers(response.data.users || [])
      setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
    } catch (err) {
      setError(err.message || 'Failed to load users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    fetchUsers(1, search)
  }, [fetchUsers, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const handleDelete = (u) => {
    showConfirmModal(
      'Delete User',
      `Permanently delete "${u.username}" and all of their listings? This action cannot be undone.`,
      async () => {
        closeConfirmModal()
        try {
          await api.deleteUser(u.id, authToken)
          showToast(`User "${u.username}" deleted`, 'success')
          // Refresh current page
          fetchUsers(pagination.page, search)
        } catch (err) {
          showToast(err.message || 'Failed to delete user', 'error')
        }
      }
    )
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return '—'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-teal-600" size={26} />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} registered {pagination.total === 1 ? 'user' : 'users'}
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search username or email"
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-72"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => { setSearchInput(''); setSearch('') }}
            title="Reset"
            className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={18} />
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-500">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <UserIcon size={40} className="mx-auto mb-3 text-gray-300" />
          No users found{search ? ` for "${search}"` : ''}.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Campus</th>
                  <th className="px-4 py-3 font-semibold text-center">Listings</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-1.5">
                            {u.username}
                            {u.role === 'admin' && (
                              <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase">Admin</span>
                            )}
                          </div>
                          {u.name && <div className="text-xs text-gray-500">{u.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.campus || '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{u.listingsCount}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {u.role === 'admin' ? (
                        <span className="text-xs text-gray-400">Protected</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(u)}
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {u.username}
                        {u.role === 'admin' && (
                          <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase">Admin</span>
                        )}
                      </div>
                      {u.name && <div className="text-xs text-gray-500">{u.name}</div>}
                    </div>
                  </div>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleDelete(u)}
                      className="text-red-600 p-2 rounded-lg hover:bg-red-50"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" />{u.email}</div>
                  {u.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" />{u.phone}</div>}
                  {u.campus && <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" />{u.campus}</div>}
                  <div className="flex items-center gap-2"><Package size={14} className="text-gray-400" />{u.listingsCount} listings · joined {formatDate(u.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchUsers(pagination.page - 1, search)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchUsers(pagination.page + 1, search)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
