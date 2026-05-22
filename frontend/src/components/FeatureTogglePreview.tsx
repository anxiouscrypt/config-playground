type FeatureTogglePreviewProps = {
  label: string
  enabled: boolean
}

export function FeatureTogglePreview({
  label,
  enabled,
}: FeatureTogglePreviewProps) {
  return (
    <div
      className={
        enabled
          ? 'rounded-md bg-emerald-50 px-3 py-2 text-emerald-800'
          : 'rounded-md bg-slate-100 px-3 py-2 text-slate-500'
      }
    >
      <div className="flex items-center gap-2">
        <span
          className={
            enabled
              ? 'h-2 w-2 rounded-full bg-emerald-600'
              : 'h-2 w-2 rounded-full bg-slate-400'
          }
        />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </div>
  )
}
