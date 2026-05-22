export function ValidationPanel() {
  return (
    <aside className="border-t border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Validation</h3>
        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
          Not connected
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Syntax and schema validation will appear here.
      </p>
    </aside>
  )
}
