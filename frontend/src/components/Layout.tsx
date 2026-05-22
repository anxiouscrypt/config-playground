import { useEffect, useMemo, useState } from 'react'
import { ConfigEditor } from './ConfigEditor'
import { PreviewPanel } from './PreviewPanel'
import { SavedConfigList } from './SavedConfigList'
import { Toolbar } from './Toolbar'
import { ValidationPanel } from './ValidationPanel'
import {
  deleteConfig,
  getConfig,
  listConfigs,
  saveConfig,
  validateConfig,
} from '../lib/api'
import { isTenantConfig } from '../lib/configGuard'
import { formatConfig, sampleConfig } from '../lib/sampleConfig'
import type { ConfigSummary, TenantConfig } from '../lib/types'

export function Layout() {
  const [editorText, setEditorText] = useState(formatConfig(sampleConfig))
  const [lastValidConfig, setLastValidConfig] =
    useState<TenantConfig>(sampleConfig)
  const [syntaxError, setSyntaxError] = useState<string | null>(null)
  const [schemaErrors, setSchemaErrors] = useState<string[]>([])
  const [savedConfigs, setSavedConfigs] = useState<ConfigSummary[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)

  const validation = useMemo(
    () => ({
      syntaxError,
      schemaErrors,
    }),
    [schemaErrors, syntaxError],
  )

  useEffect(() => {
    void refreshSavedConfigs()
  }, [])

  async function refreshSavedConfigs() {
    try {
      setSavedConfigs(await listConfigs())
      setApiError(null)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not load configs')
    }
  }

  function handleEditorChange(nextText: string) {
    setEditorText(nextText)

    try {
      const parsed = JSON.parse(nextText) as unknown
      setSyntaxError(null)
      setSchemaErrors([])

      if (isTenantConfig(parsed)) {
        setLastValidConfig(parsed)
      } else {
        setSchemaErrors(['JSON parses, but it is not a complete tenant config.'])
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      setSyntaxError(message)
    }
  }

  function handleReset() {
    setEditorText(formatConfig(sampleConfig))
    setLastValidConfig(sampleConfig)
    setSyntaxError(null)
    setSchemaErrors([])
    setApiError(null)
    setSelectedConfigId(null)
  }

  function handleImport() {
    const nextText = window.prompt('Paste a tenant config JSON payload')

    if (nextText !== null) {
      handleEditorChange(nextText)
    }
  }

  function handleExport() {
    const file = new Blob([formatConfig(lastValidConfig)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `${lastValidConfig.id || 'tenant-config'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleSave() {
    if (syntaxError || schemaErrors.length > 0) {
      setApiError('Fix validation errors before saving.')
      return
    }

    setIsSaving(true)
    setApiError(null)

    try {
      const result = await validateConfig(lastValidConfig)

      if (!result.valid) {
        setSchemaErrors(result.errors)
        return
      }

      const saved = await saveConfig(lastValidConfig)
      setSelectedConfigId(saved.id)
      await refreshSavedConfigs()
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not save config')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLoad(configId: string) {
    try {
      const stored = await getConfig(configId)
      setEditorText(formatConfig(stored.config))
      setLastValidConfig(stored.config)
      setSelectedConfigId(stored.id)
      setSyntaxError(null)
      setSchemaErrors([])
      setApiError(null)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not load config')
    }
  }

  async function handleDelete(configId: string) {
    try {
      await deleteConfig(configId)
      if (selectedConfigId === configId) {
        setSelectedConfigId(null)
      }
      await refreshSavedConfigs()
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not delete config')
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <Toolbar
          onExport={handleExport}
          onImport={handleImport}
          onReset={handleReset}
          onSave={handleSave}
          saving={isSaving}
        />
        <div className="grid min-h-0 flex-1 gap-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)_420px]">
          <SavedConfigList
            configs={savedConfigs}
            onDelete={handleDelete}
            onLoad={handleLoad}
            selectedConfigId={selectedConfigId}
          />
          <section className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h1 className="text-base font-semibold">Tenant JSON</h1>
              <p className="text-sm text-slate-500">
                Edit configuration and validate before saving.
              </p>
            </div>
            <ConfigEditor value={editorText} onChange={handleEditorChange} />
            <ValidationPanel apiError={apiError} validation={validation} />
          </section>
          <PreviewPanel config={lastValidConfig} />
        </div>
      </div>
    </main>
  )
}
