"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null); 
        setLoading(true);

        const formData = new FormData(e.currentTarget)

        const result = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,
        })

        if (result?.error) {
            setError("Email o contraseña incorrectos");
            setLoading(false);
            return;
        }

        router.push("/turnos");
    }

  return (
    <Card className="border-slate-200/80 bg-white shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg text-slate-900">Iniciar sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              className="border-slate-300 focus-visible:ring-slate-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="border-slate-300 focus-visible:ring-slate-400"
              required
            />
          </div>
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}