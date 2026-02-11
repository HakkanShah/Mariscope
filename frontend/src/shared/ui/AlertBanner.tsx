interface AlertBannerProps {
  title: string;
  message: string;
  variant?: 'error' | 'success' | 'warning' | 'info';
  onDismiss?: () => void;
}

const styleByVariant: Record<NonNullable<AlertBannerProps['variant']>, string> = {
  error: 'border-red-200 bg-red-50 text-red-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-cyan-200 bg-cyan-50 text-cyan-900',
};

export const AlertBanner = ({
  title,
  message,
  variant = 'info',
  onDismiss,
}: AlertBannerProps) => {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styleByVariant[variant]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-semibold">{title}</p>
          <p className="opacity-90">{message}</p>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md px-2 py-1 text-xs font-semibold hover:bg-white/50"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
};

