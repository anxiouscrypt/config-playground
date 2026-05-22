import type { ValidationState } from '../lib/types'

type ValidationPanelProps = {
  apiError: string | null
  validation: ValidationState
}

export function ValidationPanel({ apiError, validation }: ValidationPanelProps) {
  const hasErrors =
    Boolean(apiError) ||
    Boolean(validation.syntaxError) ||
    validation.schemaErrors.length > 0

  return (
    <aside className="border-t border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Validation</h3>
        <span
          className={
            hasErrors
              ? 'rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700'
              : 'rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700'
          }
        >
          {hasErrors ? 'Needs attention' : 'Syntax valid'}
        </span>
      </div>
      {validation.syntaxError && (
        <p className="mt-2 font-mono text-sm text-rose-700">
          {validation.syntaxError}
        </p>
      )}
      {validation.schemaErrors.map((error) => (
        <p className="mt-2 font-mono text-sm text-rose-700" key={error}>
          {error}
        </p>
      ))}
      {apiError && <p className="mt-2 text-sm text-rose-700">{apiError}</p>}
      {!hasErrors && (
        <p className="mt-2 text-sm text-slate-500">
          JSON parses successfully and is ready to save.
        </p>
      )}
    </aside>
  )
}
