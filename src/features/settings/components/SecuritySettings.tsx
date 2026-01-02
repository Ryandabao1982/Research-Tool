import React, { useState, useEffect } from 'react';
import { useEncryptionStore } from '@/shared/stores/useEncryptionStore';
import { Button, Input } from '@/shared/components';

interface SecuritySettingsProps {
  className?: string;
}

/**
 * Security Settings Component
 * 
 * # Features
 * - Toggle encryption on/off
 * - Set/verify passphrase
 * - Migrate notes between encrypted/plaintext
 * - Show security warnings
 * 
 * # Acceptance Criteria
 * AC #1: Enable encryption with passphrase
 * AC #4: Forgotten passphrase warning
 * AC #5: Encrypted backups (handled in backup service)
 * AC #6: Performance <100ms (handled by Rust backend)
 */
export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ className }) => {
  const {
    encryptionEnabled,
    passphraseSet,
    isLoading,
    error,
    setPassphrase,
    verifyPassphrase,
    clearPassphrase,
    migrateToEncrypted,
    migrateToPlaintext,
    checkEncryptionStatus,
  } = useEncryptionStore();

  const [passphraseInput, setPassphraseInput] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [verificationPassphrase, setVerificationPassphrase] = useState('');
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load initial status
  useEffect(() => {
    checkEncryptionStatus();
  }, []);

  // Clear messages after delay
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleEnableEncryption = async () => {
    if (!passphraseInput || passphraseInput.length < 8) {
      alert('Passphrase must be at least 8 characters');
      return;
    }

    if (passphraseInput !== confirmPassphrase) {
      alert('Passphrases do not match');
      return;
    }

    const result = await setPassphrase(passphraseInput);
    
    if (result.success) {
      setSuccessMessage('Encryption enabled successfully! All new notes will be encrypted.');
      setPassphraseInput('');
      setConfirmPassphrase('');
      
      // Offer to migrate existing notes
      if (confirm('Would you like to encrypt all existing notes now? This may take a moment.')) {
        const migration = await migrateToEncrypted();
        if (migration.success) {
          setMigrationStatus(`Successfully encrypted ${migration.migrated} notes`);
        }
      }
    } else {
      alert(`Failed to enable encryption: ${result.error}`);
    }
  };

  const handleDisableEncryption = async () => {
    if (!confirm(
      '⚠️ WARNING: Disabling encryption will convert all notes to plaintext.\n\n' +
      'If you have encrypted notes and forget your passphrase, you CANNOT recover them.\n\n' +
      'Are you sure you want to disable encryption?'
    )) {
      return;
    }

    const verify = prompt('Enter your passphrase to confirm:');
    if (!verify) return;

    const isValid = await verifyPassphrase(verify);
    if (!isValid) {
      alert('Incorrect passphrase');
      return;
    }

    if (confirm(
      'Final warning: All encrypted notes will be converted to plaintext.\n' +
      'This is irreversible. Continue?'
    )) {
      try {
        const migration = await migrateToPlaintext();
        await clearPassphrase();
        
        setMigrationStatus(`Converted ${migration.migrated} notes to plaintext`);
        setSuccessMessage('Encryption disabled successfully');
      } catch (error) {
        alert(`Failed to disable encryption: ${error}`);
      }
    }
  };

  const handleVerifyPassphrase = async () => {
    const isValid = await verifyPassphrase(verificationPassphrase);
    if (isValid) {
      setSuccessMessage('✓ Passphrase is correct');
      setVerificationPassphrase('');
    } else {
      alert('Incorrect passphrase');
    }
  };

  const handleMigrateToEncrypted = async () => {
    if (!confirm('Encrypt all plaintext notes?')) return;
    
    const result = await migrateToEncrypted();
    if (result.success) {
      setMigrationStatus(`✓ Encrypted ${result.migrated} notes`);
    } else {
      alert(`Migration failed: ${result.error}`);
    }
  };

  const handleMigrateToPlaintext = async () => {
    if (!confirm(
      '⚠️ WARNING: This will decrypt all notes to plaintext.\n' +
      'This is irreversible. Continue?'
    )) return;

    const verify = prompt('Enter passphrase to confirm:');
    if (!verify) return;

    const isValid = await verifyPassphrase(verify);
    if (!isValid) {
      alert('Incorrect passphrase');
      return;
    }

    const result = await migrateToPlaintext();
    if (result.success) {
      setMigrationStatus(`✓ Converted ${result.migrated} notes to plaintext`);
    } else {
      alert(`Migration failed: ${result.error}`);
    }
  };

  return (
    <div className={`p-6 bg-white/50 backdrop-blur rounded-lg border border-gray-200 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Security & Encryption</h2>
        <p className="text-sm text-gray-600">Protect your notes with AES-256-GCM encryption</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">
          {successMessage}
        </div>
      )}

      {migrationStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
          {migrationStatus}
        </div>
      )}

      {/* Encryption Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">
              {encryptionEnabled ? '🔒 Encryption Enabled' : '🔓 Encryption Disabled'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {encryptionEnabled 
                ? 'Notes are encrypted with AES-256-GCM'
                : 'Notes are stored in plaintext'
              }
            </div>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={encryptionEnabled}
              onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked) {
                  document.getElementById('passphrase-section')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  await handleDisableEncryption();
                }
              }}
              disabled={isLoading}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* Passphrase Setup */}
      {encryptionEnabled && !passphraseSet && (
        <div id="passphrase-section" className="mb-6 p-4 bg-yellow-50 rounded border border-yellow-200">
          <h3 className="font-semibold mb-3">🔑 Set Encryption Passphrase</h3>
          
          <div className="space-y-3">
            <Input
              label="Passphrase (min 8 characters)"
              type={showPassphrase ? 'text' : 'password'}
              value={passphraseInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassphraseInput(e.target.value)}
              placeholder="Enter a strong passphrase"
              disabled={isLoading}
              className="w-full"
            />

            <Input
              label="Confirm Passphrase"
              type={showPassphrase ? 'text' : 'password'}
              value={confirmPassphrase}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassphrase(e.target.value)}
              placeholder="Re-enter passphrase"
              disabled={isLoading}
              className="w-full"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPassphrase}
                onChange={(e) => setShowPassphrase(e.target.checked)}
                id="show-passphrase"
                className="w-4 h-4"
              />
              <label htmlFor="show-passphrase" className="text-sm">
                Show passphrase
              </label>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <div className="font-semibold text-red-800 mb-1">⚠️ Critical Warning</div>
              <div className="text-sm text-red-700">
                If you forget this passphrase, your encrypted notes CANNOT be recovered. 
                There is no "reset" option. Store it securely.
              </div>
            </div>

            <Button
              ariaLabel="Enable encryption"
              onClick={handleEnableEncryption}
              disabled={isLoading || passphraseInput.length < 8 || passphraseInput !== confirmPassphrase}
              className="w-full"
            >
              {isLoading ? 'Enabling...' : 'Enable Encryption'}
            </Button>
          </div>
        </div>
      )}

      {/* Passphrase Verification */}
      {encryptionEnabled && passphraseSet && (
        <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-semibold mb-3">Verify Passphrase</h3>
          <div className="flex gap-2">
            <Input
              label="Passphrase verification"
              type="password"
              value={verificationPassphrase}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationPassphrase(e.target.value)}
              placeholder="Enter passphrase to verify"
              className="flex-1"
            />
            <Button
              ariaLabel="Verify passphrase"
              onClick={handleVerifyPassphrase}
              disabled={!verificationPassphrase}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Verify
            </Button>
          </div>
        </div>
      )}

      {/* Migration Options */}
      {encryptionEnabled && passphraseSet && (
        <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-semibold mb-2">Note Migration</h3>
          <p className="text-sm text-gray-600 mb-3">
            Manage encryption status of all existing notes
          </p>
          <div className="flex gap-2">
            <Button
              ariaLabel="Encrypt all notes"
              onClick={handleMigrateToEncrypted}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Encrypt All Notes
            </Button>
            <Button
              ariaLabel="Decrypt all notes"
              onClick={handleMigrateToPlaintext}
              className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Decrypt All Notes
            </Button>
          </div>
        </div>
      )}

      {/* Security Information */}
      <div className="text-sm text-gray-600 space-y-2">
        <div className="font-semibold text-gray-800">Security Details</div>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Algorithm: AES-256-GCM (Authenticated Encryption)</li>
          <li>Key Derivation: PBKDF2 with 100,000 iterations</li>
          <li>Nonce: 96-bit random per encryption</li>
          <li>Performance: under 100ms for encryption/decryption</li>
          <li>Search: Transparent - works on decrypted content</li>
          <li>Backups: Automatically encrypted when enabled</li>
        </ul>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Processing...
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
