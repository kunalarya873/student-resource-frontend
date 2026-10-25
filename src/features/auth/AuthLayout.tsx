import { Outlet } from 'react-router-dom'

import { BrandMark } from '@/components/BrandMark'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand hero — the one deliberate, memorable moment. Hidden on small screens. */}
      <aside className="relative hidden w-[46%] max-w-[560px] overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(circle_at_20%_20%,white,transparent_55%)]" />

        {/* Quiet stacked-archive motif, drawn once, large and off-center */}
        <div aria-hidden className="pointer-events-none absolute -right-16 bottom-10 opacity-20">
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-white/40"
                style={{ width: `${340 - i * 26}px` }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-3 p-12">
          <BrandMark variant="light" />
        </div>

        <div className="relative z-10 mt-auto flex flex-col gap-5 p-12">
          <h1 className="max-w-md font-display text-4xl font-medium leading-[1.1]">
            Every file for your course, kept in one calm place.
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/80">
            Upload lecture notes, share reading lists, and pick up where your
            class left off — organised the way a library would.
          </p>
        </div>

        <p className="relative z-10 px-12 pb-10 text-xs text-primary-foreground/60">
          Student Resource Management · Aligarh Muslim University
        </p>
      </aside>

      {/* Form column */}
      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between p-6 lg:hidden">
          <BrandMark variant="dark" />
        </header>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8">
          <div className="w-full max-w-[400px] animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
