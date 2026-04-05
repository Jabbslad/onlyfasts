import { useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmValue?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmValue,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState("");

  if (!open) return null;

  const canConfirm = confirmValue === undefined || inputValue === confirmValue;

  function handleConfirm() {
    if (canConfirm) {
      setInputValue("");
      onConfirm();
    }
  }

  function handleCancel() {
    setInputValue("");
    onCancel();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div className="bg-black rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
        <p className="text-gray-400 text-sm">{message}</p>

        {confirmValue !== undefined && (
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-xs">
              Type <span className="text-white font-mono">{confirmValue}</span> to confirm
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-black border border-[rgba(240,240,250,0.35)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[rgba(240,240,250,0.6)]"
              placeholder={confirmValue}
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg text-sm text-[#f0f0fa]/70 bg-[rgba(240,240,250,0.06)] hover:bg-[rgba(240,240,250,0.1)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-4 py-2 rounded-lg text-sm text-[#f0f0fa] bg-[rgba(240,240,250,0.1)] border border-[rgba(240,240,250,0.35)] hover:bg-[rgba(240,240,250,0.15)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
