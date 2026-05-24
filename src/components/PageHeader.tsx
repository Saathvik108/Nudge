export const PageHeader = ({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="text-sm text-ink-500 mt-1">{subtitle}</p>
      ) : null}
    </div>
    {right ? <div>{right}</div> : null}
  </div>
);
