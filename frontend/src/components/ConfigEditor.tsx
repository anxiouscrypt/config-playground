type ConfigEditorProps = {
  value: string
  onChange: (value: string) => void
}

export function ConfigEditor({ value, onChange }: ConfigEditorProps) {
  return (
    <textarea
      className="h-[460px] min-h-0 w-full resize-none border-0 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
    />
  )
}
