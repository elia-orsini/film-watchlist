'use client';

import { useState } from 'react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  error?: string;
}

export default function PasswordModal({
  isOpen,
  onClose,
  onConfirm,
  error,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(password);
    setPassword('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-2">Enter Edit Password</h2>
          <p className="text-zinc-400 mb-4">
            Please enter the password to enable edit mode.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent mb-4"
              placeholder="Password"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-[#0d0d0d] rounded-md transition-colors font-medium"
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


