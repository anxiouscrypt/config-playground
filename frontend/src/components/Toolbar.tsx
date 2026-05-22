import { Download, RotateCcw, Save, Upload } from 'lucide-react'

const buttonClass =
  'inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50'

export function Toolbar() {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-700">Config Playground</p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Preview tenant settings before release
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={buttonClass} type="button" title="Reset sample config">
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <button className={buttonClass} type="button" title="Import JSON">
          <Upload className="h-4 w-4" />
          Import
        </button>
        <button className={buttonClass} type="button" title="Export JSON">
          <Download className="h-4 w-4" />
          Export
        </button>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          type="button"
          title="Save config"
        >
          <Save className="h-4 w-4" />
          Save
        </button>
      </div>
    </header>
  )
}
