import { GraphView } from '../../features/graph';
import { useNavigate } from 'react-router-dom';

/**
 * Graph Page - Interactive Force-Directed Graph Visualization
 * 
 * Displays notes as nodes in a network with:
 * - Force-directed layout
 * - Zoom and pan controls
 * - Hover to highlight connections
 * - Click to open notes
 * - Performance optimizations for large datasets
 */
export function GraphPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-none transition-colors text-sm font-medium"
            title="Back to Dashboard"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Graph View</h1>
            <p className="text-xs text-neutral-500">Interactive force-directed visualization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E5E7EB]"></span>
            Node
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0066FF]"></span>
            Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-px bg-[#A3A3A3]"></span>
            Link
          </span>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 overflow-hidden">
        <GraphView 
          className="w-full h-full"
          initialLimit={500}
        />
      </div>
    </div>
  );
}

export default GraphPage;
