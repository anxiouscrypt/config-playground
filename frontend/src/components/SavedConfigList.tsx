export function SavedConfigList() {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold">Saved Configs</h2>
        <p className="text-sm text-slate-500">Backend integration pending.</p>
      </div>
      <div className="p-3">
        <button
          className="w-full rounded-md border border-dashed border-slate-300 px-3 py-8 text-sm text-slate-500"
          type="button"
        >
          No saved configs yet
        </button>
      </div>
    </aside>
  )
}
