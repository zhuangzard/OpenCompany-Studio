'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Eye, Users, FolderKanban, Database,
  MessageSquare, Network, ChevronLeft, ChevronRight, Building2,
} from 'lucide-react'
import { NotificationProvider } from '@/components/opencompany/notifications'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/god-view', label: 'God View', icon: Eye },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/resources', label: 'Resources', icon: Database },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/org', label: 'Org Chart', icon: Network },
]

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-14' : 'w-48'} border-r bg-card flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="px-3 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500 shrink-0" />
            {!collapsed && <span className="text-sm font-bold truncate">OpenCompany</span>}
          </div>
          {!collapsed && <NotificationProvider />}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 mx-1 rounded-md text-xs transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="px-3 py-2 border-t text-muted-foreground hover:text-foreground flex items-center justify-center"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
