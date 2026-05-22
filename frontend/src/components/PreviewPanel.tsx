import { MobileAppPreview } from './MobileAppPreview'
import type { MobileBuilderProject } from '../lib/types'

type PreviewPanelProps = {
  config: MobileBuilderProject
  readinessChecks: Array<{ label: string; passed: boolean }>
}

export function PreviewPanel({ config, readinessChecks }: PreviewPanelProps) {
  const passedCount = readinessChecks.filter((check) => check.passed).length

  return (
    <section className="flex min-h-[680px] flex-col overflow-hidden rounded-lg border border-[#D9D3C7] bg-white">
      <div className="border-b border-[#E3DED4] px-4 py-3">
        <h2 className="text-base font-semibold">Mobile Preview</h2>
        <p className="text-sm text-[#777069]">
          {config.build.bundleId} · {passedCount}/{readinessChecks.length} ready
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#ECEDE8] p-5">
        <MobileAppPreview config={config} />
      </div>
      <div className="border-t border-[#E3DED4] bg-[#F8F6F1] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#777069]">
          Export contract
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {['appConfig', 'storeConfig', 'menu', 'homeCards'].map((item) => (
            <span className="rounded-md border border-[#D9D3C7] bg-white px-2 py-2 font-mono" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
