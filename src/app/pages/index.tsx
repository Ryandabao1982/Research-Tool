'use client';

import { Layout } from '@/app/layout';

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-8 px-6">
        <div className="bg-white/90 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-white">
            KnowledgeBase Pro
          </h1>
          <p className="text-gray-300 text-sm mt-4">
            AI-powered research paper and knowledge management
          </p>
          <div className="mt-8 space-x-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}