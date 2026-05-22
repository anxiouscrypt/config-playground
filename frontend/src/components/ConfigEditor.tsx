export function ConfigEditor() {
  return (
    <textarea
      className="min-h-0 flex-1 resize-none border-0 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none"
      defaultValue={`{\n  "id": "default-cafe",\n  "brand": {\n    "name": "Rawaq Coffee"\n  }\n}`}
      spellCheck={false}
    />
  )
}
