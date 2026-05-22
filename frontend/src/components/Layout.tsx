import { ConfigEditor } from './ConfigEditor'
import { PreviewPanel } from './PreviewPanel'
import { SavedConfigList } from './SavedConfigList'
import { Toolbar } from './Toolbar'
import { ValidationPanel } from './ValidationPanel'

export function Layout() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <Toolbar />
        <div className="grid min-h-0 flex-1 gap-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)_420px]">
          <SavedConfigList />
          <section className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h1 className="text-base font-semibold">Tenant JSON</h1>
              <p className="text-sm text-slate-500">
                Edit configuration and validate before saving.
              </p>
            </div>
            <ConfigEditor />
            <ValidationPanel />
          </section>
          <PreviewPanel />
        </div>
      </div>
    </main>
  )
}
