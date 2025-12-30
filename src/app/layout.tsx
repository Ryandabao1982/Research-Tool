import type { LayoutProps } from './types';

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="border-b border-gray-200 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">KnowledgeBase Pro</h1>
                <p className="text-gray-300 text-sm">AI-powered research paper and knowledge management</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="bg-white/10 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors" onClick={() => console.log('Sign in clicked')}>
                  Sign In
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;