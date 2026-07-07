type ChartEmptyStateProps = {
  message: string;
};

export function ChartEmptyState({ message }: ChartEmptyStateProps) {
  return (
    <p className="flex h-[280px] items-center justify-center text-sm text-brand-muted">
      {message}
    </p>
  );
}
