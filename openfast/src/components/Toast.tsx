interface ToastProps {
  message: string;
  visible: boolean;
  onDone?: () => void;
}

export function Toast({ message, visible, onDone: _onDone }: ToastProps) {
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[rgba(240,240,250,0.1)] border border-[rgba(240,240,250,0.35)] text-[#f0f0fa] text-sm font-medium transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {message}
    </div>
  );
}
