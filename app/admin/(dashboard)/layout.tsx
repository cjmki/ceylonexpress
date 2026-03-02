import { redirect } from 'next/navigation'
import { getUserWithRole, signOut } from '../../actions/auth'
import { getRoleLabel } from '../../constants/roles'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role } = await getUserWithRole()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Image 
                src="/images/logo_transparent.png" 
                alt="Ceylon Express" 
                width={60} 
                height={45}
                className="object-contain"
                style={{ width: 'auto', height: '40px' }}
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ceylon Express</h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/" 
                target="_blank"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                View Site
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-sm font-medium text-gray-900">{user.email?.split('@')[0]}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleLabel(role)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
