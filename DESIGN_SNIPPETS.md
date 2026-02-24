# Design Snippets — saved components for later use

## Pill-shaped double CTA button (mic + keyboard)

```tsx
<div className="flex justify-center">
  <div className="inline-flex items-center bg-white rounded-full border border-slate-200 shadow-md overflow-hidden">
    <button onClick={() => onNavigate('chat_checkin', { ttsOn: true })} className="px-5 py-4 flex items-center justify-center text-indigo-600 hover:bg-slate-50 transition-colors active:scale-95"><Mic size={22} /></button>
    <div className="w-px h-6 bg-slate-200" />
    <button onClick={() => onNavigate('chat_checkin')} className="px-5 py-4 flex items-center justify-center text-indigo-600 hover:bg-slate-50 transition-colors active:scale-95"><Keyboard size={22} /></button>
  </div>
</div>
```

## "Start check-in" label (used above the pill button)

```tsx
<p className="text-sm font-semibold text-slate-600 mb-4">Start check-in</p>
```
