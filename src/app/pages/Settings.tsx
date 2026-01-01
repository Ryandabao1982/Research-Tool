import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { motion } from 'framer-motion';

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="ml-60 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center"
      >
        <motion.div
          className="text-slate-300 text-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading settings...
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="ml-60 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="h-15 bg-white/5 backdrop-blur-2xl border-b border-white/10 flex items-center px-6"
      >
        <motion.span
          className="text-xl font-medium text-white"
          whileHover={{ scale: 1.05 }}
        >
          Settings
        </motion.span>
      </motion.header>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-10 max-w-[800px]"
      >
        {/* Intelligence Section */}
        <motion.section
          className="mb-10"
          whileHover={{ scale: 1.01 }}
        >
          <motion.h2
            className="text-xl font-bold text-white mb-5 pb-2.5 border-b border-white/10"
            whileHover={{ scale: 1.05 }}
          >
            Intelligence
          </motion.h2>

          <motion.div
            className="p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <motion.h3
              className="text-lg font-medium text-white mb-3"
              whileHover={{ scale: 1.05 }}
            >
              Local AI Model
            </motion.h3>

            <div className="mb-4">
              <div className="text-sm text-slate-300 mb-2">
                Status: {
                  modelStatus.downloaded
                    ? <motion.span className="text-green-400" whileHover={{ scale: 1.1 }}>Downloaded</motion.span>
                    : <motion.span className="text-slate-400" whileHover={{ scale: 1.1 }}>Not downloaded</motion.span>
                }
              </div>

              {modelStatus.downloaded && (
                <div className="text-xs text-slate-500">
                  Path: {modelStatus.modelPath || 'N/A'}
                  {modelStatus.modelSize && ` | Size: ${modelStatus.modelSize}`}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!modelStatus.downloaded ? (
                <motion.button
                  onClick={handleDownloadModel}
                  className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 hover:scale-105 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Download Model
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleDeleteModel}
                  className="px-5 py-2.5 text-sm border border-red-500 bg-transparent text-red-400 rounded-lg cursor-pointer hover:bg-red-500/10 hover:scale-105 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete Model
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.section>

        {/* Data Management Section */}
        <motion.section
          className="opacity-50"
          whileHover={{ scale: 1.01 }}
        >
          <motion.h2
            className="text-xl font-bold text-white mb-5 pb-2.5 border-b border-white/10"
            whileHover={{ scale: 1.05 }}
          >
            Data Management
          </motion.h2>

          <motion.div
            className="p-5 bg-slate-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-sm text-slate-400">
              Backup & Restore features coming soon.
            </p>
          </motion.div>
        </motion.section>
      </motion.main>
    </motion.div>
  );
}