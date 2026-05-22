import { useMemo, useState } from 'react'
import { ConfigEditor } from './ConfigEditor'
import { PreviewPanel } from './PreviewPanel'
import { SavedConfigList } from './SavedConfigList'
import { Toolbar } from './Toolbar'
import { ValidationPanel } from './ValidationPanel'
import { formatConfig, sampleConfig } from '../lib/sampleConfig'
import type { TenantConfig } from '../lib/types'

export function Layout() {
  const [editorText, setEditorText] = useState(formatConfig(sampleConfig))
  const [lastValidConfig, setLastValidConfig] =
    useState<TenantConfig>(sampleConfig)
  const [syntaxError, setSyntaxError] = useState<string | null>(null)

  const validation = useMemo(
    () => ({
      syntaxError,
      schemaErrors: [],
    }),
    [syntaxError],
  )

  function handleEditorChange(nextText: string) {
    setEditorText(nextText)

    try {
      const parsed = JSON.parse(nextText) as TenantConfig
      setLastValidConfig(parsed)
      setSyntaxError(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      setSyntaxError(message)
    }
  }

  function handleReset() {
    setEditorText(formatConfig(sampleConfig))
    setLastValidConfig(sampleConfig)
    setSyntaxError(null)
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <Toolbar onReset={handleReset} />
        <div className="grid min-h-0 flex-1 gap-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)_420px]">
          <SavedConfigList />
          <section className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h1 className="text-base font-semibold">Tenant JSON</h1>
              <p className="text-sm text-slate-500">
                Edit configuration and validate before saving.
              </p>
            </div>
            <ConfigEditor value={editorText} onChange={handleEditorChange} />
            <ValidationPanel validation={validation} />
          </section>
          <PreviewPanel config={lastValidConfig} />
        </div>
      </div>
    </main>
  )
}
