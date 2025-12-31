
// Mocks for Tauri IPC to allow the frontend to run in a standard web browser
if (typeof window !== 'undefined' && !window.__TAURI_IPC__) {
    console.warn('Running in browser mode: Mocking Tauri IPC');

    // Create a mock __TAURI__ object which many apps expect
    const mockInvoke = async (cmd: string, args: any) => {
        console.log(`[MOCK INVOKE] ${cmd}`, args);
        // Simulate network/IPC delay
        await new Promise(resolve => setTimeout(resolve, 50));

        switch (cmd) {
            case 'get_folders':
                return [
                    { id: '1', name: 'Personal', parent_id: null },
                    { id: '2', name: 'Work', parent_id: null },
                    { id: '3', name: 'Projects', parent_id: '2' },
                ];
            case 'get_dashboard_stats':
                return { total_notes: 142, recent_notes: 5, tags_count: 12 };
            case 'get_notes':
                return [];
            case 'get_note_tags':
                return [];
            default:
                return null;
        }
    };

    (window as any).__TAURI__ = {
        invoke: mockInvoke,
        event: {
            listen: async (eventName: string, handler: (event: any) => void) => {
                console.log(`[MOCK LISTEN] ${eventName}`);
                return () => console.log(`[MOCK UNLISTEN] ${eventName}`);
            }
        }
    };

    // Robust __TAURI_IPC__ mock
    (window as any).__TAURI_IPC__ = (message: any) => {
        const { cmd, callback, error } = message;
        if (cmd \u0026\u0026 callback \u0026\u0026(window as any)[callback]) {
            mockInvoke(cmd, message).then(data => {
                const cb = (window as any)[callback];
                if (typeof cb === 'function') {
                    cb(data);
                    // Standard Tauri cleanup
                    delete (window as any)[callback];
                    delete (window as any)[error];
                }
            });
        }
    };

    (window as any).__TAURI_INVOKE__ = mockInvoke;
    (window as any).__TAURI_METADATA__ = { _version: '1.0.0' };

    // Patch organizationService globally if it's imported (this is a backup)
    // In Vite, this can be tricky, but we can try to intercept calls to the service
    // if the user tries to debug in console.
}
