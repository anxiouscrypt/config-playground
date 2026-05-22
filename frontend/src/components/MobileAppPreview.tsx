import type { TenantConfig } from '../lib/types'
import { FeatureTogglePreview } from './FeatureTogglePreview'

type MobileAppPreviewProps = {
  config: TenantConfig
}

export function MobileAppPreview({ config }: MobileAppPreviewProps) {
  const primaryColor = config.brand.primaryColor || '#134733'
  const secondaryColor = config.brand.secondaryColor || '#F5EFE6'
  const categories = config.menu?.categories ?? []
  const featuredCategory = categories[0]
  const navItems = config.navigation?.length
    ? config.navigation.slice(0, 4)
    : ['Home', 'Menu', 'Orders', 'Profile']

  return (
    <div className="flex h-[620px] w-full max-w-[320px] flex-col overflow-hidden rounded-[28px] border-[10px] border-slate-900 bg-white shadow-xl">
      <div className="px-5 pb-6 pt-8 text-white" style={{ background: primaryColor }}>
        <p className="text-xs uppercase tracking-wide opacity-80">Preview</p>
        <div className="mt-2 flex items-center gap-3">
          {config.brand.logoUrl ? (
            <img
              alt=""
              className="h-10 w-10 rounded-md bg-white object-cover"
              src={config.brand.logoUrl}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/15 text-sm font-semibold">
              {config.brand.name.slice(0, 1) || 'C'}
            </div>
          )}
          <h3 className="min-w-0 text-2xl font-semibold leading-tight">
            {config.brand.name || 'Unnamed Tenant'}
          </h3>
        </div>
        <p className="mt-3 text-sm opacity-85">
          {config.features.mobileOrdering
            ? 'Mobile ordering is available today'
            : 'Browsing mode without mobile checkout'}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="rounded-lg p-4" style={{ background: secondaryColor }}>
          <p className="text-xs font-semibold uppercase text-slate-500">Menu</p>
          <h4 className="mt-2 text-lg font-semibold text-slate-900">
            {featuredCategory?.name ?? 'No categories yet'}
          </h4>
          <p className="mt-1 text-sm text-slate-600">
            {featuredCategory?.items?.join(', ') ?? 'Add menu items in JSON'}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Categories
          </p>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                className="rounded-md border border-slate-200 px-3 py-2"
                key={category.id}
              >
                <p className="text-sm font-medium text-slate-900">{category.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {category.items.length} items
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <FeatureTogglePreview
            enabled={config.features.mobileOrdering}
            label="Ordering"
          />
          <FeatureTogglePreview enabled={config.features.loyalty} label="Loyalty" />
          <FeatureTogglePreview
            enabled={config.features.orderTracking}
            label="Tracking"
          />
          <FeatureTogglePreview
            enabled={config.features.guestCheckout}
            label="Guest checkout"
          />
        </div>
      </div>
      <nav className="grid grid-cols-4 border-t border-slate-200 text-center text-xs text-slate-600">
        {navItems.map((item) => (
          <span className="truncate px-1 py-3" key={item}>
            {item}
          </span>
        ))}
      </nav>
    </div>
  )
}
