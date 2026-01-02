import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { motion } from 'framer-motion';
import { TopBar } from '../../shared/components/layout/TopBar';
import { Card } from '../../shared/components/dashboard/Card';
import { Button } from '../../shared/components/Button';
import { useSettingsStore } from '../../shared/stores/settingsStore';
import { useThemeStore } from '../../shared/stores/themeStore';

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
  
  // Accessibility settings
  const { 
    highContrastMode, 
    reducedMotion, 
    setHighContrastMode, 
    setReducedMotion 
  } = useSettingsStore();
  
  const { updateTheme } = useThemeStore();

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

  const handleToggleHighContrast = () => {
    const newValue = !highContrastMode;
    setHighContrastMode(newValue);
    updateTheme();
  };

  const handleToggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-neutral-50 flex items-center justify-center"
      >
        <motion.div
          className="font-sans text-neutral-600 text-center"
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
      className="min-h-screen bg-neutral-50"
    >
      <TopBar title="Settings" />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8" role="main">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Intelligence Section */}
          <Card>
            <div className="space-y-6">
              <h3 className="font-sans font-bold text-xl text-neutral-900">Intelligence</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-sans font-semibold text-neutral-900 mb-1">Local AI Model</p>
                  <div className="font-mono text-sm text-neutral-600 mb-2">
                    Status: {
                      modelStatus.downloaded
                        ? <span className="text-primary font-bold">Downloaded</span>
                        : <span className="text-neutral-500">Not downloaded</span>
                    }
                  </div>

                  {modelStatus.downloaded && (
                    <div className="font-mono text-xs text-neutral-500 space-y-0.5">
                      <div>Path: {modelStatus.modelPath || 'N/A'}</div>
                      {modelStatus.modelSize && <div>Size: {modelStatus.modelSize}</div>}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {!modelStatus.downloaded ? (
                    <Button
                      ariaLabel="Download AI model"
                      onClick={handleDownloadModel}
                      className="flex-1"
                    >
                      Download Model
                    </Button>
                  ) : (
                    <Button
                      ariaLabel="Delete downloaded AI model"
                      variant="danger"
                      onClick={handleDeleteModel}
                      className="flex-1"
                    >
                      Delete Model
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Application Settings */}
          <Card>
            <div className="space-y-6">
              <h3 className="font-sans font-bold text-xl text-neutral-900">Application</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans font-semibold text-neutral-900">Theme</p>
                    <p className="font-mono text-xs text-neutral-600">Light mode (Rational Grid)</p>
                  </div>
                  <Button
                    ariaLabel="Theme (currently Light)"
                    variant="secondary"
                    disabled
                  >
                    Light
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans font-semibold text-neutral-900">Auto-Save</p>
                    <p className="font-mono text-xs text-neutral-600">Save notes automatically</p>
                  </div>
                  <Button
                    ariaLabel="Auto-save is enabled"
                    variant="primary"
                    onClick={() => {}}
                  >
                    On
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans font-semibold text-neutral-900">Notifications</p>
                    <p className="font-mono text-xs text-neutral-600">Show subconscious insights</p>
                  </div>
                  <Button
                    ariaLabel="Notifications are enabled"
                    variant="primary"
                    onClick={() => {}}
                  >
                    On
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Accessibility Settings */}
          <Card>
            <div className="space-y-6">
              <h3 className="font-sans font-bold text-xl text-neutral-900">Accessibility</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans font-semibold text-neutral-900">High Contrast Mode</p>
                    <p className="font-mono text-xs text-neutral-600">WCAG AAA compliant (7:1 ratio)</p>
                  </div>
                  <Button
                    ariaLabel={highContrastMode ? 'Disable high contrast mode' : 'Enable high contrast mode'}
                    variant={highContrastMode ? 'primary' : 'secondary'}
                    onClick={handleToggleHighContrast}
                  >
                    {highContrastMode ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans font-semibold text-neutral-900">Reduced Motion</p>
                    <p className="font-mono text-xs text-neutral-600">Disable decorative animations</p>
                  </div>
                  <Button
                    ariaLabel={reducedMotion ? 'Disable reduced motion' : 'Enable reduced motion'}
                    variant={reducedMotion ? 'primary' : 'secondary'}
                    onClick={handleToggleReducedMotion}
                  >
                    {reducedMotion ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <p className="font-mono text-xs text-neutral-600">
                  Accessibility features improve keyboard navigation and screen reader support
                </p>
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card>
            <div className="space-y-6">
              <h3 className="font-sans font-bold text-xl text-neutral-900">Data Management</h3>
              
              <div className="space-y-4">
                <Button
                  ariaLabel="Export all notes to file"
                  variant="secondary"
                  className="w-full"
                >
                  Export All Notes
                </Button>
                <Button
                  ariaLabel="Import notes from file"
                  variant="ghost"
                  className="w-full"
                >
                  Import Notes
                </Button>
                <Button
                  ariaLabel="Clear all data permanently"
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700"
                >
                  Clear All Data
                </Button>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card>
            <div className="space-y-6">
              <h3 className="font-sans font-bold text-xl text-neutral-900">About</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-sans text-neutral-700">Version</span>
                  <span className="font-mono text-neutral-900 font-bold">1.6.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-neutral-700">Build</span>
                  <span className="font-mono text-neutral-900 font-bold">2026.01.02</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-neutral-700">Design System</span>
                  <span className="font-mono text-primary font-bold">Rational Grid</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <p className="font-mono text-xs text-neutral-600">
                  KnowledgeBase Pro - Precision-engineered for clarity
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </motion.div>
  );
}