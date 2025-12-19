"use client";

interface ApiKeyModalProps {
  isOpen: boolean;
  isEditing: boolean;
  keyName: string;
  onKeyNameChange: (name: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ApiKeyModal({
  isOpen,
  isEditing,
  keyName,
  onKeyNameChange,
  onClose,
  onSubmit,
}: ApiKeyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 p-6 rounded-2xl bg-white shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {isEditing ? "Edit API Key" : "Create New API Key"}
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
              Key Name
            </label>
            <input
              id="keyName"
              type="text"
              value={keyName}
              onChange={(e) => onKeyNameChange(e.target.value)}
              placeholder="e.g., my-api-key"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
          {!isEditing && (
            <p className="text-sm text-gray-500">
              A new API key will be generated automatically.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!keyName.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium transition-all disabled:cursor-not-allowed"
          >
            {isEditing ? "Save Changes" : "Create Key"}
          </button>
        </div>
      </div>
    </div>
  );
}

