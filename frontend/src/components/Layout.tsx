import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AppWindow,
  BadgeCheck,
  CreditCard,
  ListChecks,
  Palette,
  Store,
  UploadCloud,
} from 'lucide-react'
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
import { isMobileBuilderProject } from '../lib/configGuard'
import { formatConfig, sampleConfig } from '../lib/sampleConfig'
import type {
  AppTab,
  ConfigSummary,
  FulfillmentMode,
  MobileBuilderProject,
} from '../lib/types'

type SectionId =
  | 'client'
  | 'theme'
  | 'capabilities'
  | 'store'
  | 'menu'
  | 'home'
  | 'release'
  | 'json'

const sections: Array<{
  id: SectionId
  label: string
  description: string
  icon: typeof Store
}> = [
  {
    id: 'client',
    label: 'Client',
    description: 'Account, brand, and location identity',
    icon: Store,
  },
  {
    id: 'theme',
    label: 'Theme',
    description: 'Mobile colors and typography',
    icon: Palette,
  },
  {
    id: 'capabilities',
    label: 'Capabilities',
    description: 'Tabs, features, payments, fulfillment',
    icon: ListChecks,
  },
  {
    id: 'store',
    label: 'Store',
    description: 'Hours, pickup, tax, prep ETA',
    icon: AppWindow,
  },
  {
    id: 'menu',
    label: 'Menu',
    description: 'Platform-managed mobile catalog preview',
    icon: BadgeCheck,
  },
  {
    id: 'home',
    label: 'Home',
    description: 'News cards shown on the home tab',
    icon: UploadCloud,
  },
  {
    id: 'release',
    label: 'Release',
    description: 'Bundle ID and launch readiness',
    icon: CreditCard,
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'Advanced Gazelle-compatible export',
    icon: AppWindow,
  },
]

const allTabs: AppTab[] = ['home', 'menu', 'orders', 'account']

export function Layout() {
  const [project, setProject] =
    useState<MobileBuilderProject>(sampleConfig)
  const [editorText, setEditorText] = useState(formatConfig(sampleConfig))
  const [activeSection, setActiveSection] = useState<SectionId>('client')
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

  const visibleItems = project.menu.categories.flatMap((category) =>
    category.items.filter((item) => item.visible),
  )

  const readinessChecks = [
    {
      label: 'Owner account',
      passed: project.client.ownerEmail.includes('@'),
    },
    {
      label: 'Menu has visible items',
      passed: visibleItems.length > 0,
    },
    {
      label: 'Hours configured',
      passed: project.storeConfig.hoursText.trim().length > 0,
    },
    {
      label: 'Bundle ID set',
      passed: project.build.bundleId.includes('.'),
    },
    {
      label: 'Payments selected',
      passed:
        project.appConfig.paymentCapabilities.card ||
        project.appConfig.paymentCapabilities.applePay ||
        project.appConfig.paymentCapabilities.cash,
    },
  ]

  useEffect(() => {
    void refreshSavedConfigs()
  }, [])

  async function refreshSavedConfigs() {
    try {
      setSavedConfigs(await listConfigs())
      setApiError(null)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not load projects')
    }
  }

  function commitProject(nextProject: MobileBuilderProject) {
    setProject(nextProject)
    setEditorText(formatConfig(nextProject))
    setSyntaxError(null)
    setSchemaErrors([])
    setApiError(null)
  }

  function updateProject(recipe: (draft: MobileBuilderProject) => void) {
    const nextProject = JSON.parse(JSON.stringify(project)) as MobileBuilderProject
    recipe(nextProject)
    commitProject(nextProject)
  }

  function syncBrandName(value: string) {
    updateProject((draft) => {
      draft.client.clientName = value
      draft.appConfig.brand.brandName = value
      draft.build.appName = value
    })
  }

  function syncLocationId(value: string) {
    updateProject((draft) => {
      draft.appConfig.brand.locationId = value
      draft.storeConfig.locationId = value
      draft.menu.locationId = value
      draft.homeCards.locationId = value
    })
  }

  function setFulfillmentMode(value: FulfillmentMode) {
    updateProject((draft) => {
      draft.appConfig.fulfillment.mode = value
      draft.appConfig.storeCapabilities.operations.fulfillmentMode = value
    })
  }

  function setCapability(key: keyof MobileBuilderProject['appConfig']['featureFlags'], value: boolean) {
    updateProject((draft) => {
      draft.appConfig.featureFlags[key] = value

      if (key === 'loyalty') {
        draft.appConfig.loyaltyEnabled = value
        draft.appConfig.storeCapabilities.loyalty.visible = value
      }

      if (key === 'orderTracking') {
        draft.appConfig.storeCapabilities.operations.liveOrderTrackingEnabled = value
      }

      if (key === 'staffDashboard') {
        draft.appConfig.storeCapabilities.operations.dashboardEnabled = value
      }

      if (key === 'menuEditing') {
        draft.appConfig.storeCapabilities.menu.source = value
          ? 'platform_managed'
          : 'external_sync'
      }
    })
  }

  function toggleTab(tab: AppTab) {
    updateProject((draft) => {
      if (draft.appConfig.enabledTabs.includes(tab)) {
        if (draft.appConfig.enabledTabs.length === 1) {
          return
        }
        draft.appConfig.enabledTabs = draft.appConfig.enabledTabs.filter(
          (item) => item !== tab,
        )
      } else {
        draft.appConfig.enabledTabs.push(tab)
      }
    })
  }

  function handleEditorChange(nextText: string) {
    setEditorText(nextText)

    try {
      const parsed = JSON.parse(nextText) as unknown
      setSyntaxError(null)
      setSchemaErrors([])

      if (isMobileBuilderProject(parsed)) {
        setProject(parsed)
      } else {
        setSchemaErrors(['JSON parses, but it is not a complete mobile builder project.'])
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      setSyntaxError(message)
    }
  }

  function handleReset() {
    commitProject(sampleConfig)
    setSelectedConfigId(null)
  }

  function handleImport() {
    const nextText = window.prompt('Paste a Gazelle mobile builder JSON payload')

    if (nextText !== null) {
      handleEditorChange(nextText)
    }
  }

  function handleExport() {
    const exportPayload = {
      appConfig: project.appConfig,
      storeConfig: project.storeConfig,
      menu: project.menu,
      homeCards: project.homeCards,
      build: project.build,
    }
    const file = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.id || 'gazelle-mobile-config'}.json`
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
      const result = await validateConfig(project)

      if (!result.valid) {
        setSchemaErrors(result.errors)
        return
      }

      const saved = await saveConfig({
        ...project,
        publish: {
          ...project.publish,
          status: 'validated',
          lastValidatedAt: new Date().toISOString(),
        },
      })
      setSelectedConfigId(saved.id)
      commitProject(saved.config)
      await refreshSavedConfigs()
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not save project')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLoad(configId: string) {
    try {
      const stored = await getConfig(configId)
      commitProject(stored.config)
      setSelectedConfigId(stored.id)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not load project')
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
      setApiError(error instanceof Error ? error.message : 'Could not delete project')
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F5F2] text-[#171513]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <Toolbar
          onExport={handleExport}
          onImport={handleImport}
          onReset={handleReset}
          onSave={handleSave}
          saving={isSaving}
        />
        <div className="grid min-h-0 flex-1 gap-4 py-4 xl:grid-cols-[250px_minmax(0,1fr)_420px]">
          <SavedConfigList
            configs={savedConfigs}
            onDelete={handleDelete}
            onLoad={handleLoad}
            selectedConfigId={selectedConfigId}
          />
          <section className="min-h-[680px] overflow-hidden rounded-lg border border-[#D9D3C7] bg-white">
            <div className="border-b border-[#E3DED4] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#605B55]">
                Gazelle mobile configurator
              </p>
              <h1 className="mt-1 text-xl font-semibold">
                Design a white-label mobile app from one source of truth
              </h1>
            </div>
            <div className="grid min-h-0 lg:grid-cols-[230px_minmax(0,1fr)]">
              <nav className="border-b border-[#E3DED4] bg-[#F8F6F1] p-3 lg:border-b-0 lg:border-r">
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon
                    const active = activeSection === section.id
                    return (
                      <button
                        className={`flex w-full gap-3 rounded-md px-3 py-3 text-left transition ${
                          active
                            ? 'bg-[#171513] text-white'
                            : 'text-[#3D3934] hover:bg-[#EFE9DE]'
                        }`}
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        type="button"
                      >
                        <Icon className="mt-0.5 h-4 w-4 flex-none" />
                        <span>
                          <span className="block text-sm font-semibold">{section.label}</span>
                          <span className={`mt-0.5 block text-xs ${active ? 'text-white/70' : 'text-[#777069]'}`}>
                            {section.description}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </nav>
              <div className="min-h-[560px] p-5">
                {activeSection === 'client' && (
                  <Panel title="Client & Location" kicker="Account setup">
                    <FieldGrid>
                      <TextField
                        label="Project ID"
                        value={project.id}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.id = value
                          })
                        }
                      />
                      <TextField
                        label="Client ID"
                        value={project.client.clientId}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.client.clientId = value
                          })
                        }
                      />
                      <TextField
                        label="Brand / Client name"
                        value={project.client.clientName}
                        onChange={syncBrandName}
                      />
                      <TextField
                        label="Owner email"
                        value={project.client.ownerEmail}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.client.ownerEmail = value
                          })
                        }
                      />
                      <TextField
                        label="Owner name"
                        value={project.client.ownerName}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.client.ownerName = value
                          })
                        }
                      />
                      <TextField
                        label="Brand ID"
                        value={project.appConfig.brand.brandId}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.brand.brandId = value
                          })
                        }
                      />
                      <TextField
                        label="Location ID"
                        value={project.appConfig.brand.locationId}
                        onChange={syncLocationId}
                      />
                      <TextField
                        label="Location name"
                        value={project.appConfig.brand.locationName}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.brand.locationName = value
                          })
                        }
                      />
                      <TextField
                        label="Market label"
                        value={project.appConfig.brand.marketLabel}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.brand.marketLabel = value
                          })
                        }
                      />
                    </FieldGrid>
                  </Panel>
                )}

                {activeSection === 'theme' && (
                  <Panel title="Brand Theme" kicker="Mobile look and feel">
                    <FieldGrid>
                      <ColorField
                        label="Background"
                        value={project.appConfig.theme.background}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.theme.background = value
                            draft.appConfig.header.background = value
                          })
                        }
                      />
                      <ColorField
                        label="Surface"
                        value={project.appConfig.theme.surface}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.theme.surface = value
                          })
                        }
                      />
                      <ColorField
                        label="Foreground"
                        value={project.appConfig.theme.foreground}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.theme.foreground = value
                            draft.appConfig.header.foreground = value
                          })
                        }
                      />
                      <ColorField
                        label="Primary"
                        value={project.appConfig.theme.primary}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.theme.primary = value
                          })
                        }
                      />
                      <ColorField
                        label="Accent"
                        value={project.appConfig.theme.accent}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.theme.accent = value
                          })
                        }
                      />
                      <ColorField
                        label="Muted"
                        value={project.appConfig.theme.muted}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.theme.muted = value
                          })
                        }
                      />
                      <TextField
                        label="Body font"
                        value={project.appConfig.theme.fontFamily ?? ''}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.theme.fontFamily = value
                          })
                        }
                      />
                      <TextField
                        label="Display font"
                        value={project.appConfig.theme.displayFontFamily ?? ''}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.appConfig.theme.displayFontFamily = value
                          })
                        }
                      />
                    </FieldGrid>
                  </Panel>
                )}

                {activeSection === 'capabilities' && (
                  <Panel title="Capabilities" kicker="Gazelle appConfig flags">
                    <div className="grid gap-5 lg:grid-cols-2">
                      <ControlGroup title="Tabs">
                        {allTabs.map((tab) => (
                          <Toggle
                            key={tab}
                            label={tab}
                            checked={project.appConfig.enabledTabs.includes(tab)}
                            onChange={() => toggleTab(tab)}
                          />
                        ))}
                      </ControlGroup>
                      <ControlGroup title="Feature flags">
                        {Object.entries(project.appConfig.featureFlags).map(([key, value]) => (
                          <Toggle
                            key={key}
                            label={formatLabel(key)}
                            checked={value}
                            onChange={(checked) =>
                              setCapability(
                                key as keyof MobileBuilderProject['appConfig']['featureFlags'],
                                checked,
                              )
                            }
                          />
                        ))}
                      </ControlGroup>
                      <ControlGroup title="Payments">
                        <Toggle
                          label="Apple Pay"
                          checked={project.appConfig.paymentCapabilities.applePay}
                          onChange={(checked) =>
                            updateProject((draft) => {
                              draft.appConfig.paymentCapabilities.applePay = checked
                            })
                          }
                        />
                        <Toggle
                          label="Card"
                          checked={project.appConfig.paymentCapabilities.card}
                          onChange={(checked) =>
                            updateProject((draft) => {
                              draft.appConfig.paymentCapabilities.card = checked
                            })
                          }
                        />
                        <Toggle
                          label="Cash"
                          checked={project.appConfig.paymentCapabilities.cash}
                          onChange={(checked) =>
                            updateProject((draft) => {
                              draft.appConfig.paymentCapabilities.cash = checked
                            })
                          }
                        />
                        <Toggle
                          label="Refunds"
                          checked={project.appConfig.paymentCapabilities.refunds}
                          onChange={(checked) =>
                            updateProject((draft) => {
                              draft.appConfig.paymentCapabilities.refunds = checked
                              draft.appConfig.featureFlags.refunds = checked
                            })
                          }
                        />
                      </ControlGroup>
                      <ControlGroup title="Fulfillment">
                        <SelectField
                          label="Mode"
                          value={project.appConfig.fulfillment.mode}
                          options={[
                            { label: 'Staff controlled', value: 'staff' },
                            { label: 'Time based', value: 'time_based' },
                          ]}
                          onChange={(value) => setFulfillmentMode(value as FulfillmentMode)}
                        />
                        <NumberField
                          label="In prep minutes"
                          value={project.appConfig.fulfillment.timeBasedScheduleMinutes.inPrep}
                          onChange={(value) =>
                            updateProject((draft) => {
                              draft.appConfig.fulfillment.timeBasedScheduleMinutes.inPrep = value
                            })
                          }
                        />
                        <NumberField
                          label="Ready minutes"
                          value={project.appConfig.fulfillment.timeBasedScheduleMinutes.ready}
                          onChange={(value) =>
                            updateProject((draft) => {
                              draft.appConfig.fulfillment.timeBasedScheduleMinutes.ready = value
                            })
                          }
                        />
                      </ControlGroup>
                    </div>
                  </Panel>
                )}

                {activeSection === 'store' && (
                  <Panel title="Store Operations" kicker="Mobile store config">
                    <FieldGrid>
                      <TextField
                        label="Hours"
                        value={project.storeConfig.hoursText}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.storeConfig.hoursText = value
                          })
                        }
                      />
                      <NumberField
                        label="Prep ETA minutes"
                        value={project.storeConfig.prepEtaMinutes}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.storeConfig.prepEtaMinutes = value
                          })
                        }
                      />
                      <NumberField
                        label="Tax basis points"
                        value={project.storeConfig.taxRateBasisPoints}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.storeConfig.taxRateBasisPoints = value
                          })
                        }
                      />
                      <Toggle
                        label="Store open"
                        checked={project.storeConfig.isOpen}
                        onChange={(checked) =>
                          updateProject((draft) => {
                            draft.storeConfig.isOpen = checked
                          })
                        }
                      />
                    </FieldGrid>
                    <div className="mt-5">
                      <TextAreaField
                        label="Pickup instructions"
                        value={project.storeConfig.pickupInstructions}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.storeConfig.pickupInstructions = value
                          })
                        }
                      />
                    </div>
                  </Panel>
                )}

                {activeSection === 'menu' && (
                  <Panel title="Menu Preview Data" kicker="Catalog payload">
                    <div className="space-y-4">
                      {project.menu.categories.map((category, categoryIndex) => (
                        <div className="rounded-md border border-[#E3DED4] p-4" key={category.id}>
                          <TextField
                            label="Category title"
                            value={category.title}
                            onChange={(value) =>
                              updateProject((draft) => {
                                draft.menu.categories[categoryIndex].title = value
                              })
                            }
                          />
                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            {category.items.map((item, itemIndex) => (
                              <div className="rounded-md bg-[#F8F6F1] p-3" key={item.id}>
                                <TextField
                                  label="Item name"
                                  value={item.name}
                                  onChange={(value) =>
                                    updateProject((draft) => {
                                      draft.menu.categories[categoryIndex].items[itemIndex].name = value
                                    })
                                  }
                                />
                                <NumberField
                                  label="Price cents"
                                  value={item.priceCents}
                                  onChange={(value) =>
                                    updateProject((draft) => {
                                      draft.menu.categories[categoryIndex].items[itemIndex].priceCents = value
                                    })
                                  }
                                />
                                <Toggle
                                  label="Visible in mobile app"
                                  checked={item.visible}
                                  onChange={(checked) =>
                                    updateProject((draft) => {
                                      draft.menu.categories[categoryIndex].items[itemIndex].visible = checked
                                    })
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                {activeSection === 'home' && (
                  <Panel title="Home Cards" kicker="Mobile home content">
                    <div className="grid gap-4 lg:grid-cols-2">
                      {project.homeCards.cards.map((card, cardIndex) => (
                        <div className="rounded-md border border-[#E3DED4] p-4" key={card.cardId}>
                          <TextField
                            label="Label"
                            value={card.label}
                            onChange={(value) =>
                              updateProject((draft) => {
                                draft.homeCards.cards[cardIndex].label = value
                              })
                            }
                          />
                          <TextField
                            label="Title"
                            value={card.title}
                            onChange={(value) =>
                              updateProject((draft) => {
                                draft.homeCards.cards[cardIndex].title = value
                              })
                            }
                          />
                          <TextAreaField
                            label="Body"
                            value={card.body}
                            onChange={(value) =>
                              updateProject((draft) => {
                                draft.homeCards.cards[cardIndex].body = value
                              })
                            }
                          />
                          <Toggle
                            label="Visible"
                            checked={card.visible}
                            onChange={(checked) =>
                              updateProject((draft) => {
                                draft.homeCards.cards[cardIndex].visible = checked
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                {activeSection === 'release' && (
                  <Panel title="Build & Launch" kicker="White-label release metadata">
                    <FieldGrid>
                      <TextField
                        label="App name"
                        value={project.build.appName}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.build.appName = value
                          })
                        }
                      />
                      <TextField
                        label="Bundle ID"
                        value={project.build.bundleId}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.build.bundleId = value
                          })
                        }
                      />
                      <SelectField
                        label="Release channel"
                        value={project.build.releaseChannel}
                        options={[
                          { label: 'Preview', value: 'preview' },
                          { label: 'App Store', value: 'app_store' },
                        ]}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.build.releaseChannel = value as 'preview' | 'app_store'
                          })
                        }
                      />
                      <TextField
                        label="Icon URL"
                        value={project.build.iconUrl}
                        onChange={(value) =>
                          updateProject((draft) => {
                            draft.build.iconUrl = value
                          })
                        }
                      />
                    </FieldGrid>
                    <div className="mt-5 rounded-md border border-[#E3DED4] bg-[#F8F6F1] p-4">
                      <h3 className="text-sm font-semibold">Readiness checklist</h3>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {readinessChecks.map((check) => (
                          <div className="flex items-center gap-2 text-sm" key={check.label}>
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                check.passed ? 'bg-[#2D6A4F]' : 'bg-[#C44F4F]'
                              }`}
                            />
                            {check.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Panel>
                )}

                {activeSection === 'json' && (
                  <Panel title="Advanced JSON" kicker="Source payload">
                    <div className="overflow-hidden rounded-lg border border-[#E3DED4]">
                      <ConfigEditor value={editorText} onChange={handleEditorChange} />
                    </div>
                    <ValidationPanel apiError={apiError} validation={validation} />
                  </Panel>
                )}
              </div>
            </div>
          </section>
          <PreviewPanel config={project} readinessChecks={readinessChecks} />
        </div>
      </div>
    </main>
  )
}

function Panel({
  children,
  kicker,
  title,
}: {
  children: ReactNode
  kicker: string
  title: string
}) {
  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#777069]">
          {kicker}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

function ControlGroup({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div className="rounded-md border border-[#E3DED4] p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function TextField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#3D3934]">{label}</span>
      <input
        className="mt-1 h-10 w-full rounded-md border border-[#D9D3C7] bg-white px-3 text-sm outline-none focus:border-[#171513]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function NumberField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: number) => void
  value: number
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#3D3934]">{label}</span>
      <input
        className="mt-1 h-10 w-full rounded-md border border-[#D9D3C7] bg-white px-3 text-sm outline-none focus:border-[#171513]"
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function ColorField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#3D3934]">{label}</span>
      <span className="mt-1 flex h-10 overflow-hidden rounded-md border border-[#D9D3C7] bg-white">
        <input
          className="h-full w-12 border-0 bg-transparent p-1"
          type="color"
          value={value.startsWith('#') ? value : '#171513'}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          className="min-w-0 flex-1 border-0 px-3 text-sm outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  )
}

function TextAreaField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#3D3934]">{label}</span>
      <textarea
        className="mt-1 min-h-24 w-full resize-none rounded-md border border-[#D9D3C7] bg-white px-3 py-2 text-sm outline-none focus:border-[#171513]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#3D3934]">{label}</span>
      <select
        className="mt-1 h-10 w-full rounded-md border border-[#D9D3C7] bg-white px-3 text-sm outline-none focus:border-[#171513]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-[#E3DED4] bg-white px-3 py-2 text-sm">
      <span className="font-medium capitalize text-[#3D3934]">{label}</span>
      <input
        checked={checked}
        className="h-4 w-4 accent-[#171513]"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

function formatLabel(value: string) {
  return value.replace(/([A-Z])/g, ' $1').trim()
}
