interface LoadingBlockProps {
  label: string;
}

export const LoadingBlock = ({ label }: LoadingBlockProps) => {
  return (
    <div className="section-card flex items-center gap-3 text-sm text-slate-600">
      <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-700" />
      <span>{label}</span>
    </div>
  );
};

