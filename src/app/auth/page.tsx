"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { Background } from "@/components/Background"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false) // To toggle between Sign In and Sign Up
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.push("/") // Redirect to home if logged in
        }
      }
    )

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/")
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        // Sign Up
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          },
        })
        if (signUpError) throw signUpError
        setMessage("בדוק את תיבת הדואר שלך לקישור האימות!")
      } else {
        // Sign In
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        // router.push('/'); // Redirect handled by onAuthStateChange
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err && 'error_description' in err) {
        setError((err as { error_description: string }).error_description);
      } else {
        setError('An unexpected error occurred');
      }
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError("אנא הזן את כתובת האימייל שלך לאיפוס הסיסמה.")
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      }
    )
    if (resetError) {
      setError(resetError.message)
    } else {
      setMessage("בדוק את תיבת הדואר שלך לקישור איפוס הסיסמה.")
    }
    setLoading(false)
  }

  return (
    <div className="">
      <Background>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div dir="rtl">
              <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground leading-loose">
                {isSignUp ? "צור חשבון חדש" : "התחבר לחשבון שלך"}
              </h2>
            </div>
            <form
              className="mt-8 flex flex-col gap-6"
              onSubmit={handleAuthAction}
            >
              <div className="rounded-md shadow-sm -space-y-px" dir="rtl">
                <div>
                  <Label htmlFor="email-address" className="sr-only">
                    כתובת אימייל
                  </Label>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full appearance-none rounded-none rounded-t-md border mb-2 border-border px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    placeholder="כתובת אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="sr-only">
                    סיסמה
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                    required
                    className="relative block w-full appearance-none rounded-none rounded-b-md border border-border px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    placeholder="סיסמה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <p className="mt-2 text-sm text-destructive" dir="rtl">{error}</p>
              )}
              {message && (
                <p className="mt-2 text-sm text-green-600" dir="rtl">{message}</p>
              )}

              <div>
                <Button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : isSignUp ? (
                    "הרשמה"
                  ) : (
                    "כניסה"
                  )}
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
                  או המשך עם
                </span>
              </div>
            </div>

            <div>
              <Button
                variant="outline"
                className="group relative flex w-full justify-center rounded-md py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Icons.google className="mr-2 h-4 w-4" /> Google
                  </>
                )}
              </Button>
            </div>

            <div className="text-sm text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setMessage(null)
                }}
                className="font-medium text-primary hover:text-primary/90"
                disabled={loading}
              >
                {isSignUp
                  ? "כבר יש לך חשבון? התחבר"
                  : "אין לך חשבון? הירשם"}
              </button>
            </div>

            <div className="text-sm text-center">
              <button
                onClick={handlePasswordReset}
                className="font-medium text-primary hover:text-primary/90"
                disabled={loading || !email}
              >
                שכחת סיסמה?
              </button>
            </div>
          </div>
        </div>
      </Background>
    </div>
  )
}
