import React from 'react';

export default function ThemeShowcase() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-card text-card-foreground shadow p-4">
          <h2 className="text-xl font-semibold tracking-wide">Kart Başlık</h2>
          <p className="text-muted-foreground">Bu kart, OKLCH temadan besleniyor.</p>
          <button className="mt-3 rounded-md bg-primary text-primary-foreground px-4 py-2 shadow-sm">
            Birincil Buton
          </button>
        </div>
        <div className="rounded-lg bg-accent text-accent-foreground shadow p-4">
          <h2 className="text-xl font-semibold">Accent Panel</h2>
          <p className="text-muted-foreground">Accent arka plan + foreground</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-2">Border ve Ring Test</p>
        <input
          className="w-full rounded-md border-input bg-background px-3 py-2 ring-1 ring-ring focus:outline-none"
          placeholder="Input alanı"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-block size-4 rounded-full" style={{ background: 'var(--chart-1)' }} />
        <span className="inline-block size-4 rounded-full" style={{ background: 'var(--chart-2)' }} />
        <span className="inline-block size-4 rounded-full" style={{ background: 'var(--chart-3)' }} />
        <span className="inline-block size-4 rounded-full" style={{ background: 'var(--chart-4)' }} />
        <span className="inline-block size-4 rounded-full" style={{ background: 'var(--chart-5)' }} />
      </div>
    </div>
  );
}
