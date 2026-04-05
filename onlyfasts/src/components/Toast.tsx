interface ToastProps {
  message: string;
  visible: boolean;
  onDone?: () => void;
}

export function Toast({ message, visible, onDone: _onDone }: ToastProps) {
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {message}
    </div>
  );
}
