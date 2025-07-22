'use client'
import { useState } from 'react'

export default function AdminSyncPage() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function handleFullSync() {
    setLoading(true)
    setStatus('Starting full sync...')
    try {
      const res = await fetch('/api/sync/full')
      const data = await res.json()
      setStatus(data.message || (data.success ? 'Full sync started.' : 'Error: ' + data.error))
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    }
    setLoading(false)
  }

  async function handleClubSync() {
    setLoading(true)
    setStatus('Syncing club signups...')
    try {
      const res = await fetch('/api/sync/club', { method: 'POST' })
      const data = await res.json()
      setStatus(data.success ? 'Club signups sync complete.' : 'Error: ' + data.error)
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Admin Data Sync</h1>
        <button
          onClick={handleFullSync}
          disabled={loading}
          className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Start Full Sync'}
        </button>
        <button
          onClick={handleClubSync}
          disabled={loading}
          className="w-full mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Sync Club Signups Only'}
        </button>
        {status && <div className="mt-4 text-center text-gray-700">{status}</div>}
      </div>
    </div>
  )
} 