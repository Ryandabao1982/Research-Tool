import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface ModelStatus {
  downloaded: boolean;
  modelPath: string;
  modelSize: string;
}

export default function SettingsPage() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    downloaded: false,
    modelPath: '',
    modelSize: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModelStatus();
  }, []);

  const loadModelStatus = async () => {
    try {
      const status = await invoke('get_model_status') as ModelStatus;
      setModelStatus(status);
    } catch (error) {
      console.error('Failed to load model status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadModel = async () => {
    try {
      await invoke('download_model', {});
      await loadModelStatus();
    } catch (error) {
      console.error('Failed to download model:', error);
    }
  };

  const handleDeleteModel = async () => {
    if (!confirm('Delete the downloaded model?')) return;

    try {
      await invoke('delete_model', {});
      await loadModelStatus();
    } catch (error) {
      console.error('Failed to delete model:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ marginLeft: 240, minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Loading settings...
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
        padding: '0 20px',
      }}>
        <span style={{ fontSize: 18, fontWeight: 500, color: '#000' }}>
          Settings
        </span>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px 20px', maxWidth: 800 }}>
        {/* Intelligence Section */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#000',
            marginBottom: 20,
            paddingBottom: 10,
            borderBottom: '1px solid #eee',
          }}>
            Intelligence
          </h2>

          <div style={{
            padding: 20,
            border: '1px solid #ddd',
            borderRadius: 8,
            backgroundColor: '#fff',
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#000',
              marginBottom: 12,
            }}>
              Local AI Model
            </h3>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                Status: {
                  modelStatus.downloaded
                    ? <span style={{ color: '#22c55e' }}>Downloaded</span>
                    : <span style={{ color: '#666' }}>Not downloaded</span>
                }
              </div>

              {modelStatus.downloaded && (
                <div style={{ fontSize: 12, color: '#999' }}>
                  Path: {modelStatus.modelPath || 'N/A'}
                  {modelStatus.modelSize && ` | Size: ${modelStatus.modelSize}`}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {!modelStatus.downloaded ? (
                <button
                  onClick={handleDownloadModel}
                  style={{
                    padding: '10px 20px',
                    fontSize: 14,
                    border: 'none',
                    backgroundColor: '#0066FF',
                    color: '#fff',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Download Model
                </button>
              ) : (
                <button
                  onClick={handleDeleteModel}
                  style={{
                    padding: '10px 20px',
                    fontSize: 14,
                    border: '1px solid #ff4444',
                    backgroundColor: '#fff',
                    color: '#ff4444',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Delete Model
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section style={{ opacity: 0.5 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#000',
            marginBottom: 20,
            paddingBottom: 10,
            borderBottom: '1px solid #eee',
          }}>
            Data Management
          </h2>

          <div style={{
            padding: 20,
            border: '1px solid #ddd',
            borderRadius: 8,
            backgroundColor: '#f9f9f9',
          }}>
            <p style={{ fontSize: 14, color: '#999' }}>
              Backup & Restore features coming soon.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
