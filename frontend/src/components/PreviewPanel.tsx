import { MobileAppPreview } from './MobileAppPreview'

export function PreviewPanel() {
  return (
    <section className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold">Live Preview</h2>
        <p className="text-sm text-slate-500">
          Mobile product shell rendered from config.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#eef2f3] p-6">
        <MobileAppPreview />
      </div>
    </section>
  )
}
