import { Trash2 } from 'lucide-react'
import type { ConfigSummary } from '../lib/types'

type SavedConfigListProps = {
  configs: ConfigSummary[]
  onDelete: (configId: string) => void
  onLoad: (configId: string) => void
  selectedConfigId: string | null
}

export function SavedConfigList({
  configs,
  onDelete,
  onLoad,
  selectedConfigId,
}: SavedConfigListProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold">Builder Projects</h2>
        <p className="text-sm text-slate-500">{configs.length} local drafts</p>
      </div>
      {configs.length === 0 ? (
        <div className="p-3">
          <div className="rounded-md border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-500">
            No app projects yet
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {configs.map((config) => (
            <div
              className={
                config.id === selectedConfigId
                  ? 'bg-emerald-50 p-3'
                  : 'bg-white p-3'
              }
              key={config.id}
            >
              <button
                className="w-full text-left"
                onClick={() => onLoad(config.id)}
                type="button"
              >
                <p className="truncate text-sm font-medium text-slate-900">
                  {config.brandName}
                </p>
                <p className="mt-1 truncate font-mono text-xs text-slate-500">
                  {config.id}
                </p>
              </button>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {new Date(config.updatedAt).toLocaleDateString()}
                </span>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => onDelete(config.id)}
                  title="Delete project"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
