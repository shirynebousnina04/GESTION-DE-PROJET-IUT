"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-background flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center gap-2 text-primary">
            <div className="relative h-10 w-40">
              <Image
                src="/iut-logo.svg"
                alt="IUT - Université de Toulon"
                fill
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
            <span className="text-sm font-medium text-foreground/70">Plateforme interne de gestion d&apos;événements</span>
          </div>
          <Card className="border border-border/60 shadow-lg shadow-primary/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Connexion</CardTitle>
              <CardDescription>
                Connectez-vous avec vos identifiants IUT pour accéder à l&apos;espace événementiel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="prenom.nom@univ.fr"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-md hover:shadow-primary/30"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Pas encore de compte ?{" "}
                  <Link href="/auth/sign-up" className="underline underline-offset-4 hover:text-primary">
                    Créer un compte
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
