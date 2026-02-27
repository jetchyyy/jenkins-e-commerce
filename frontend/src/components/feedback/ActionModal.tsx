type ActionModalProps = {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export const ActionModal = ({ isOpen, type, title, message, confirmLabel = 'OK', onConfirm }: ActionModalProps) => {
  if (!isOpen) {
    return null;
  }

  const toneClass = type === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
  const buttonClass = type === 'success' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500';
  const icon = type === 'success' ? '✓' : '!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full font-bold ${toneClass}`}>{icon}</div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${buttonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
