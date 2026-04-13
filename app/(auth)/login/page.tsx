import { LoginForm } from "@/features/auth/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-200/70 blur-3xl" />
        <div className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-2xl backdrop-blur-sm lg:min-h-[620px] lg:flex-row">
        <section className="flex flex-1 flex-col justify-between bg-slate-900 p-8 text-slate-100 sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium tracking-wide text-slate-200">
              Acceso profesional
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Gestiona tus turnos de manera rápida y eficiente
              </h1>
              <p className="max-w-md text-sm text-slate-300 sm:text-base">
                Entrá al panel para organizar agenda, contactos y servicios desde un solo lugar.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>By Federico Osorio</span>
              <a
                href="https://linkedin.com/in/fedeosorio"
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 underline-offset-2 transition hover:text-slate-100 hover:underline"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:py-16">
          <div className="w-full max-w-md lg:mt-6">
            <div className="mb-8 text-center lg:text-left">
              <p className="text-4xl font-extrabold uppercase tracking-[0.22em] text-slate-900 sm:text-5xl">A.S.T.A.</p>
              <p className="mt-2 text-sm text-slate-500">Ingresá con tu cuenta para continuar.</p>
            </div>
            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  )
}