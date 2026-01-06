export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Environment Variables Test
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Supabase Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NEXT_PUBLIC_SUPABASE_URL
              </label>
              <div className={`p-3 rounded font-mono text-sm ${
                supabaseUrl ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
              }`}>
                {supabaseUrl || '❌ MISSING - Not defined!'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </label>
              <div className={`p-3 rounded font-mono text-sm ${
                supabaseKey ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
              }`}>
                {supabaseKey 
                  ? `✅ Loaded: ${supabaseKey.substring(0, 30)}...${supabaseKey.substring(supabaseKey.length - 10)}`
                  : '❌ MISSING - Not defined!'
                }
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Status Summary
          </h2>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${supabaseUrl ? '✅' : '❌'}`}>
                {supabaseUrl ? '✅' : '❌'}
              </span>
              <span className="text-gray-700">
                Supabase URL: {supabaseUrl ? 'Configured' : 'Missing'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${supabaseKey ? '✅' : '❌'}`}>
                {supabaseKey ? '✅' : '❌'}
              </span>
              <span className="text-gray-700">
                Anon Key: {supabaseKey ? 'Configured' : 'Missing'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${(supabaseUrl && supabaseKey) ? '✅' : '❌'}`}>
                {(supabaseUrl && supabaseKey) ? '✅' : '❌'}
              </span>
              <span className="text-gray-700 font-semibold">
                Overall Status: {(supabaseUrl && supabaseKey) ? 'Ready ✨' : 'Configuration Incomplete'}
              </span>
            </div>
          </div>
        </div>

        {!(supabaseUrl && supabaseKey) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              ⚠️ Action Required
            </h3>
            <p className="text-yellow-800 mb-2">
              Environment variables are not configured. Please set them in Netlify:
            </p>
            <ol className="list-decimal list-inside text-yellow-800 space-y-1 text-sm">
              <li>Go to Netlify Dashboard → Site Settings → Environment Variables</li>
              <li>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>Trigger a new deploy</li>
            </ol>
          </div>
        )}

        <div className="mt-6">
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-600">
          <p className="font-mono">
            Build time: {new Date().toISOString()}
          </p>
          <p className="font-mono mt-1">
            Node environment: {process.env.NODE_ENV}
          </p>
        </div>
      </div>
    </div>
  )
}

