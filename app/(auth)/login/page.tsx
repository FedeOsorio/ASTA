import { LoginForm } from "@/features/auth/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Sistema de turnos
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Ingresá con tu cuenta
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}