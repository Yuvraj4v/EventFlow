import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Ticket, PlusCircle, Zap, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/events', icon: Calendar, label: 'Events' },
  { href: '/admin/events/new', icon: PlusCircle, label: 'Add Event' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/bookings', icon: Ticket, label: 'Bookings' },
];

export default function AdminLayout({ children, title }) {
  const location = useLocation();

  const isActive = (href, exact) => exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className="pt-16 min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">Admin Panel</div>
              <div className="text-xs text-gray-400">EventFlow</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href, item.exact)
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-40 flex">
        {navItems.map(item => (
          <Link key={item.href} to={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
              isActive(item.href, item.exact) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 lg:ml-56 p-4 lg:p-6 pb-20 lg:pb-6">
        {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
