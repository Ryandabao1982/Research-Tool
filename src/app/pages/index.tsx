import { Layout } from '../layout';
import { NotesPage } from './NotesPage';

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-8 px-6">
        <div className="bg-white/90 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            KnowledgeBase Pro
          </h1>
          <p className="text-gray-300 text-sm">
            AI-powered research paper and knowledge management
          </p>
          <div className="mt-8">
            <NotesPage />
          </div>
        </div>
      </div>
    </Layout>
  );
}