import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Calendar className="h-8 w-8" />
            <span className="text-xl font-semibold">EventIUT</span>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Erreur d'authentification</CardTitle>
              <CardDescription>Une erreur est survenue lors de l'authentification. Veuillez réessayer.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">Réessayer</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/sign-up">Créer un compte</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
