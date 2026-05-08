export function SettingsPage({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="text-muted-foreground text-sm mt-0.5">{description}</p>}
      </div>
      <div className="divide-y">
        {children}
      </div>
    </div>
  )
}

export function SettingsRow({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-5 space-y-4">{children}</div>
}

export function SettingsDanger({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-5 space-y-4 bg-destructive/5 border-t border-destructive/20">
      <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Danger zone</p>
      {children}
    </div>
  )
}
