"use client";

import { useState } from "react";
import { ApiKey } from "../_types";
import { maskKey } from "../_utils/apiKeyUtils";

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  isLoading: boolean;
  onEdit: (key: ApiKey) => void;
  onDelete: (id: string) => void;
  onCopy: (key: string) => void;
  onCreateNew: () => void;
}

export function ApiKeyTable({
  apiKeys,
  isLoading,
  onEdit,
  onDelete,
  onCopy,
  onCreateNew,
}: ApiKeyTableProps) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const handleCopy = (apiKey: ApiKey) => {
    navigator.clipboard.writeText(apiKey.key);
    setCopiedId(apiKey.id);
    setTimeout(() => setCopiedId(null), 2000);
    onCopy(apiKey.key);
  };

  if (isLoading) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-500">Loading API keys...</p>
      </div>
    );
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900">{apiKey.name}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{apiKey.usage}</span>
              </td>
              <td className="px-6 py-4">
                <code className="px-3 py-1.5 bg-gray-100 rounded-md font-mono text-sm text-gray-600">
                  {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                </code>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  <VisibilityButton
                    isVisible={visibleKeys.has(apiKey.id)}
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                  />
                  <CopyButton
                    isCopied={copiedId === apiKey.id}
                    onClick={() => handleCopy(apiKey)}
                  />
                  <EditButton onClick={() => onEdit(apiKey)} />
                  <DeleteButton onClick={() => onDelete(apiKey.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {apiKeys.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-4">No API keys yet</p>
          <button
            onClick={onCreateNew}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Create your first key
          </button>
        </div>
      )}
    </>
  );
}

function VisibilityButton({ isVisible, onClick }: { isVisible: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      title={isVisible ? "Hide key" : "Show key"}
    >
      {isVisible ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}

function CopyButton({ isCopied, onClick }: { isCopied: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copy to clipboard"
    >
      {isCopied ? (
        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      title="Edit"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
      title="Delete"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}

