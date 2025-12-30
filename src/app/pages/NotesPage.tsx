import { LayoutProps } from '../layout';
import type { Note } from '../Note';

export function NotesPage() {
  const [notes, setNotes] = React.useState<Note[]>([]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notes</h1>
      
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No notes yet. Create your first note!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border p-4 rounded-lg bg-white shadow">
              <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{note.content}</p>
              <p className="text-xs text-gray-400">
                {note.createdAt.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}