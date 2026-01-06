'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugDbPage() {
  const [status, setStatus] = useState<any>({
    loading: true,
    data: null,
    error: null,
    rawResponse: null
  })

  useEffect(() => {
    async function testSupabase() {
      try {
        console.log('Testing Supabase connection...')
        
        // Test 1: Basic connection
        const { data, error, status: statusCode, statusText } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('category', { ascending: true })
        
        console.log('Supabase Response:', { data, error, statusCode, statusText })
        
        setStatus({
          loading: false,
          data: data,
          error: error,
          rawResponse: { statusCode, statusText }
        })
      } catch (err) {
        console.error('Caught error:', err)
        setStatus({
          loading: false,
          data: null,
          error: err,
          rawResponse: null
        })
      }
    }
    
    testSupabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          🔍 Supabase Database Debug
        </h1>

        {/* Loading State */}
        {status.loading && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded">
            <p className="text-blue-900 font-semibold">Loading...</p>
          </div>
        )}

        {/* Success State */}
        {!status.loading && status.data && !status.error && (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded">
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                ✅ Success! Database Connected
              </h2>
              <p className="text-green-800">
                Found {status.data.length} menu item(s)
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Menu Items Data:</h3>
              <div className="space-y-4">
                {status.data.map((item: any, index: number) => (
                  <div key={item.id || index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-gray-700 text-sm">{item.description}</p>
                    <p className="text-gray-600 text-sm">Price: {item.price} SEK</p>
                    <p className="text-gray-600 text-sm">Category: {item.category}</p>
                    <p className="text-gray-600 text-sm">Available: {item.available ? 'Yes' : 'No'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 rounded p-4">
              <h4 className="font-semibold mb-2">Raw Response:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(status.rawResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Error State */}
        {!status.loading && status.error && (
          <div className="space-y-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded">
              <h2 className="text-xl font-semibold text-red-900 mb-4">
                ❌ Error Detected
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-red-800">Error Message:</p>
                  <p className="text-red-700 font-mono text-sm bg-red-100 p-2 rounded mt-1">
                    {status.error.message || 'Unknown error'}
                  </p>
                </div>

                {status.error.code && (
                  <div>
                    <p className="font-semibold text-red-800">Error Code:</p>
                    <p className="text-red-700 font-mono text-sm bg-red-100 p-2 rounded mt-1">
                      {status.error.code}
                    </p>
                  </div>
                )}

                {status.error.details && (
                  <div>
                    <p className="font-semibold text-red-800">Details:</p>
                    <p className="text-red-700 font-mono text-sm bg-red-100 p-2 rounded mt-1">
                      {status.error.details}
                    </p>
                  </div>
                )}

                {status.error.hint && (
                  <div>
                    <p className="font-semibold text-red-800">Hint:</p>
                    <p className="text-red-700 font-mono text-sm bg-red-100 p-2 rounded mt-1">
                      {status.error.hint}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-semibold text-yellow-900 mb-2">Common Fixes:</h3>
                <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
                  <li>Check if menu_items table exists in Supabase</li>
                  <li>Verify Row Level Security (RLS) policies allow SELECT</li>
                  <li>Ensure menu items exist with available=true</li>
                  <li>Check Supabase URL and keys are correct</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-100 rounded p-4">
              <h4 className="font-semibold mb-2">Full Error Object:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(status.error, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* No Data */}
        {!status.loading && status.data && status.data.length === 0 && !status.error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">
              ⚠️ No Menu Items Found
            </h2>
            <p className="text-yellow-800 mb-4">
              The query succeeded, but no menu items were returned.
            </p>
            <div className="space-y-2 text-sm text-yellow-800">
              <p className="font-semibold">Possible reasons:</p>
              <ul className="list-disc list-inside ml-4">
                <li>No items in the menu_items table</li>
                <li>All items have available=false</li>
                <li>RLS policy is blocking access</li>
              </ul>
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Connection Details:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700">Supabase URL:</span>
              <span className="text-gray-600 font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-gray-700">Anon Key:</span>
              <span className="text-gray-600 font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
                  : 'NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="/menu"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors mr-4"
          >
            Go to Menu Page
          </a>
          <a
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

