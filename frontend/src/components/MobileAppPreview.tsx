import type { TenantConfig } from '../lib/types'

type MobileAppPreviewProps = {
  config: TenantConfig
}

export function MobileAppPreview({ config }: MobileAppPreviewProps) {
  return (
    <div className="h-[620px] w-full max-w-[320px] overflow-hidden rounded-[28px] border-[10px] border-slate-900 bg-white shadow-xl">
      <div className="bg-emerald-900 px-5 pb-6 pt-8 text-white">
        <p className="text-xs uppercase tracking-wide text-emerald-100">Preview</p>
        <h3 className="mt-2 text-2xl font-semibold">{config.brand.name}</h3>
        <p className="mt-2 text-sm text-emerald-50">Mobile ordering enabled</p>
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-lg bg-[#f5efe6] p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Menu</p>
          <h4 className="mt-2 text-lg font-semibold text-slate-900">
            Coffee & Espresso
          </h4>
          <p className="mt-1 text-sm text-slate-600">
            Latte, Americano, Cappuccino
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">
            Order tracking
          </span>
          <span className="rounded-md bg-slate-100 px-3 py-2 text-slate-700">
            Guest checkout
          </span>
        </div>
      </div>
      <nav className="mt-auto grid grid-cols-4 border-t border-slate-200 text-center text-xs text-slate-600">
        {['Home', 'Menu', 'Orders', 'Profile'].map((item) => (
          <span className="py-3" key={item}>
            {item}
          </span>
        ))}
      </nav>
    </div>
  )
}
