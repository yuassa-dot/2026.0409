import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { api } from '../services/api'

interface UserSubscription {
  id?: number
  email: string
  subscriptionType: 'all' | 'symbol'
  symbol?: string
  thresholdChange?: number
  enabled?: boolean
}

const Subscriptions: React.FC = () => {
  const navigate = useNavigate()
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState<UserSubscription>({
    email: '',
    subscriptionType: 'all',
    symbol: '',
    thresholdChange: 5,
    enabled: true,
  })

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get<any>('/subscriptions')
      if (response.data && response.data.data) {
        setSubscriptions(response.data.data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)

      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address')
        return
      }

      if (
        formData.subscriptionType === 'symbol' &&
        !formData.symbol
      ) {
        setError('Please enter a stock symbol for symbol subscription')
        return
      }

      const payload = {
        email: formData.email,
        subscriptionType: formData.subscriptionType,
        ...(formData.subscriptionType === 'symbol' && {
          symbol: formData.symbol,
        }),
        thresholdChange: formData.thresholdChange,
      }

      const response = await api.post('/subscriptions', payload)

      if (response.data && response.data.data) {
        setSubscriptions([...subscriptions, response.data.data])
        setFormData({
          email: '',
          subscriptionType: 'all',
          symbol: '',
          thresholdChange: 5,
          enabled: true,
        })
        setShowForm(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription')
    }
  }

  const handleDelete = async (id?: number) => {
    if (!id) return

    try {
      await api.delete(`/subscriptions/${id}`)
      setSubscriptions(subscriptions.filter((sub) => sub.id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete subscription')
    }
  }

  const handleToggle = async (id?: number, enabled?: boolean) => {
    if (!id) return

    try {
      const endpoint = enabled ? 'disable' : 'enable'
      const response = await api.patch(`/subscriptions/${id}/${endpoint}`)

      if (response.data && response.data.data) {
        setSubscriptions(
          subscriptions.map((sub) =>
            sub.id === id
              ? { ...sub, enabled: response.data.data.enabled }
              : sub
          )
        )
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle subscription')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Subscriptions & Preferences
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {showForm ? 'Cancel' : 'New Subscription'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Subscription Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Create New Subscription
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Subscription Type *
                </label>
                <select
                  value={formData.subscriptionType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subscriptionType: e.target.value as 'all' | 'symbol',
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stocks</option>
                  <option value="symbol">Specific Symbol</option>
                </select>
              </div>

              {formData.subscriptionType === 'symbol' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Stock Symbol *
                  </label>
                  <input
                    type="text"
                    value={formData.symbol || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        symbol: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2330"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Change Alert Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.thresholdChange || 5}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      thresholdChange: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Receive alerts when price change exceeds this threshold
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Subscribe
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subscriptions List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No subscriptions yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Create Your First Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  sub.enabled ? '' : 'opacity-60'
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {sub.email}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Type:</span>{' '}
                    {sub.subscriptionType === 'all'
                      ? 'All Stocks'
                      : `Symbol: ${sub.symbol}`}
                  </p>
                  {sub.thresholdChange !== undefined && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Alert Threshold:</span>{' '}
                      {sub.thresholdChange}%
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span
                    className={`text-sm font-medium ${
                      sub.enabled
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {sub.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(sub.id, sub.enabled)}
                      className={`px-3 py-1 rounded text-sm transition ${
                        sub.enabled
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {sub.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Back to Home
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Subscriptions
