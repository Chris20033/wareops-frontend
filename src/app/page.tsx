import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const foundation = [
  ["Aplicación", "Next.js 16 · App Router"],
  ["Interfaz", "Tailwind CSS · shadcn/ui"],
  ["Estado remoto", "TanStack Query"],
  ["Estado cliente", "Zustand"],
] as const;

export default function Home() {
  return (
    <main className="flex min-h-screen items-center bg-[#f4f5f2] px-5 py-10 text-neutral-950 sm:px-8 lg:px-12">
      <section
        aria-labelledby="foundation-title"
        className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)] lg:grid-cols-[1.25fr_0.75fr]"
      >
        <div className="flex min-h-[34rem] flex-col justify-between p-7 sm:p-10 lg:p-14">
          <header className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold tracking-[-0.02em]">
              WareOps
            </span>
            <Badge
              variant="outline"
              className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-800"
            >
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-emerald-600"
              />
              Frontend activo
            </Badge>
          </header>

          <div className="max-w-2xl py-16 sm:py-20">
            <h1
              id="foundation-title"
              className="max-w-xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl"
            >
              La fundación de WareOps está lista.
            </h1>
            <p className="mt-6 max-w-[62ch] text-base leading-7 text-pretty text-neutral-600 sm:text-lg sm:leading-8">
              El frontend arranca con una base reproducible, tipada y preparada
              para construir los flujos operativos de los siguientes sprints.
            </p>
          </div>

          <p className="text-sm leading-6 text-neutral-500">
            Sprint 00 · Comprobación técnica de arranque
          </p>
        </div>

        <aside
          aria-label="Base técnica disponible"
          className="border-t border-neutral-200 bg-neutral-950 p-7 text-neutral-50 sm:p-10 lg:border-t-0 lg:border-l lg:p-12"
        >
          <div className="flex h-full flex-col justify-center">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">
              Base técnica
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Dependencias iniciales verificables, sin lógica de negocio
              adelantada.
            </p>
            <Separator className="my-8 bg-neutral-800" />
            <dl className="space-y-6">
              {foundation.map(([term, detail]) => (
                <div key={term} className="grid gap-1 sm:grid-cols-[8rem_1fr]">
                  <dt className="text-sm text-neutral-400">{term}</dt>
                  <dd className="text-sm font-medium text-neutral-100">
                    {detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </section>
    </main>
  );
}
