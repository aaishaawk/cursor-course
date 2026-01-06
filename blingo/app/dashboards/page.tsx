"use client";

import { useState } from "react";
import { useApiKeys, useToast } from "./_hooks";
import {
  Toast,
  ApiKeyModal,
  ApiKeyTable,
  PlanCard,
  Header,
  ErrorBanner,
} from "./_components";
import { ApiKey } from "./_types";

const USAGE_LIMIT = 1000;

export default function OverviewPage() {
  const { apiKeys, isLoading, error, clearError, createKey, updateKey, deleteKey, totalUsage } = useApiKeys();
  const { toast, showToast, hideToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [newKeyName, setNewKeyName] = useState("");

  const handleCreate = async () => {
    const success = await createKey(newKeyName);
    if (success) {
      setNewKeyName("");
      setIsModalOpen(false);
      showToast("API key created successfully!", "success");
    }
  };

  const handleUpdate = async () => {
    if (!editingKey) return;
    const success = await updateKey(editingKey.id, newKeyName);
    if (success) {
      setEditingKey(null);
      setNewKeyName("");
      setIsModalOpen(false);
      showToast("API key updated successfully!", "edit");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteKey(id);
    if (success) {
      showToast("API key deleted successfully!", "delete");
    }
  };

  const handleCopy = () => {
    showToast("API key copied to clipboard!", "success");
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key);
    setNewKeyName(key.name);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingKey(null);
    setNewKeyName("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    setNewKeyName("");
  };

  return (
    <>
      <Header title="Overview" />

      <div className="p-4 sm:p-6 lg:p-8">
        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        <PlanCard totalUsage={totalUsage} usageLimit={USAGE_LIMIT} />

        {/* API Keys Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">API Keys</h3>
              <button
                onClick={openCreateModal}
                className="w-7 h-7 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              The key is used to authenticate your requests to the{" "}
              <a href="#" className="text-gray-700 underline hover:text-gray-900">
                Research API
              </a>
              . To learn more, see the{" "}
              <a href="#" className="text-gray-700 underline hover:text-gray-900">
                documentation
              </a>{" "}
              page.
            </p>
          </div>

          <ApiKeyTable
            apiKeys={apiKeys}
            isLoading={isLoading}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onCreateNew={openCreateModal}
          />
        </div>
      </div>

      <ApiKeyModal
        isOpen={isModalOpen}
        isEditing={!!editingKey}
        keyName={newKeyName}
        onKeyNameChange={setNewKeyName}
        onClose={closeModal}
        onSubmit={editingKey ? handleUpdate : handleCreate}
      />

      <Toast toast={toast} onClose={hideToast} />
    </>
  );
}
