import { Link, useLocation } from 'react-router-dom';

export interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/notes', label: 'Notes' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <h1 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  KnowledgeBase Pro
                </h1>
                <p className="text-gray-400 text-sm hidden sm:block">
                  AI-powered research assistant
                </p>
              </Link>
            </div>
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${location.pathname === item.path
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="pt-20 pb-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;