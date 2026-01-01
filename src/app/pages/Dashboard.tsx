import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface Note {
  id: string;
  title: string;
  updated_at: string;
}

interface DashboardStats {
  totalNotes: number;
  totalFolders: number;
  totalTags: number;
  recentNotes: Note[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalNotes: 0,
    totalFolders: 0,
    totalTags: 0,
    recentNotes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('Manager');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const notes = await invoke('get_notes') as any[];
      const folders = await invoke('get_folders') as any[];
      const tags = await invoke('get_tags') as any[];

      const recentNotes = (notes || [])
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      setStats({
        totalNotes: notes?.length || 0,
        totalFolders: folders?.length || 0,
        totalTags: tags?.length || 0,
        recentNotes: recentNotes.map(n => ({
          id: n.id,
          title: n.title || 'Untitled',
          updated_at: n.updated_at || new Date().toISOString(),
        })),
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setStats({
        totalNotes: 0,
        totalFolders: 0,
        totalTags: 0,
        recentNotes: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ marginLeft: 240, minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: 240, minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header style={{
        height: 60,
        backgroundColor: '#eeeeee',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <span style={{ fontSize: 20, fontWeight: 500, color: '#000' }}>SecondBrain</span>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            padding: '6px 12px',
            fontSize: 14,
            border: '1px solid #212121',
            borderRadius: 4,
            backgroundColor: '#ffffff',
            cursor: 'pointer',
          }}
        >
          <option value="Manager">Manager</option>
          <option value="Learner">Learner</option>
          <option value="Researcher">Researcher</option>
        </select>
      </header>

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 60,
        width: 240,
        height: 'calc(100vh - 60px)',
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #ddd',
        padding: '20px',
      }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#666', letterSpacing: '0.5px' }}>
            FOLDERS
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{
            padding: '8px 12px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#000',
            borderRadius: 4,
          }}>
            All Notes
          </button>
          <button style={{
            padding: '8px 12px',
            textAlign: 'left',
            backgroundColor: '#e0e0e0',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#000',
            borderRadius: 4,
          }}>
            Recent
          </button>
          <button style={{
            padding: '8px 12px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#666',
            borderRadius: 4,
          }}>
            Favorites
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ padding: '40px 20px' }}>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {/* Widget 1: Activity Heatmap */}
          <div style={{
            width: 360,
            minHeight: 280,
            backgroundColor: '#ffffff',
            border: '1px solid #212121',
            borderRadius: 8,
            padding: 20,
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 500, color: '#000' }}>
              Activity Heatmap
            </h3>
            <ActivityHeatmap />
          </div>

          {/* Widget 2: Quick Stats */}
          <div style={{
            width: 360,
            minHeight: 280,
            backgroundColor: '#ffffff',
            border: '1px solid #212121',
            borderRadius: 8,
            padding: 20,
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 500, color: '#000' }}>
              Quick Stats
            </h3>
            <QuickStats stats={stats} />
          </div>

          {/* Widget 3: Recent Notes */}
          <div style={{
            width: 360,
            minHeight: 280,
            backgroundColor: '#ffffff',
            border: '1px solid #212121',
            borderRadius: 8,
            padding: 20,
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 500, color: '#000' }}>
              Recent Notes
            </h3>
            <RecentNotes notes={stats.recentNotes} />
          </div>
        </div>
      </main>
    </div>
  );
}

function ActivityHeatmap() {
  const days = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    active: Math.random() > 0.5,
    intensity: Math.random(),
  }));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 4,
      marginTop: 10,
    }}>
      {days.map((d) => (
        <div
          key={d.day}
          style={{
            aspectRatio: 1,
            backgroundColor: d.active
              ? `rgba(33, 150, 243, ${0.3 + d.intensity * 0.7})`
              : '#f0f0f0',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
          }}
          title={`Day ${d.day}: ${d.active ? 'Active' : 'No activity'}`}
        />
      ))}
    </div>
  );
}

function QuickStats({ stats }: { stats: DashboardStats }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 300, color: '#000' }}>
          {stats.totalNotes.toLocaleString()}
        </div>
        <div style={{ fontSize: 16, color: '#666', marginTop: 4 }}>Notes</div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        borderTop: '1px solid #eee',
        paddingTop: 16,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 300, color: '#000' }}>
            {stats.totalFolders}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Folders</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 300, color: '#000' }}>
            {stats.totalTags}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Tags</div>
        </div>
      </div>
    </div>
  );
}

function RecentNotes({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>
        No notes yet. Create your first note to get started.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ fontSize: 14, color: '#000', fontWeight: 400 }}>
            {note.title}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            {new Date(note.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
