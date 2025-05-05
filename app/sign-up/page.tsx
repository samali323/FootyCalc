"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedBackground from "@/components/animatedBackground"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { session, isLoading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Redirect authenticated users to appropriate page
        if (!authLoading && session) {
            router.push("/dashboard") // Adjust based on user role if needed
        }
    }, [session, authLoading, router])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const firstName = formData.get("first-name") as string
        const lastName = formData.get("last-name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirm-password") as string

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            toast.error("Passwords do not match")
            setIsLoading(false)
            return
        }

        try {
            // Sign up the user
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                    // Configure email redirect (optional)
                    emailRedirectTo: `${window.location.origin}/auth/login`,
                },
            })

            if (error) {
                throw new Error(error.message)
            }

            if (data.user) {
                // Insert user profile with "user" role
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert([
                        {
                            id: data.user.id, // Match with auth.users.id
                            first_name: firstName,
                            last_name: lastName,
                            email: email,
                            role: "user",
                        },
                    ])

                if (profileError) {
                    throw new Error("Failed to assign user role: " + profileError.message)
                }

                toast.success("Account created! Please check your email to confirm.", {
                    onClose: () => {
                        setTimeout(() => {
                            router.push("/auth/login")
                        }, 200)
                    },
                })
            }
        } catch (err: any) {
            const errorMessage = err.message || "An error occurred during signup"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            <AnimatedBackground />
            <div className="container relative z-10 flex flex-col items-center justify-center gap-6 px-4 py-8">
                <Card className="w-full max-w-md bg-gray-900/70 backdrop-blur-xl border-green-600/40 text-white">
                    <CardHeader>
                        <CardTitle className="text-2xl text-green-400">Create an account</CardTitle>
                        <CardDescription className="text-white/70">Enter your details to create your account</CardDescription>
                    </CardHeader>
                    <form onSubmit={onSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="text-red-400 text-sm text-center">{error}</div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first-name" className="text-white">First name</Label>
                                    <Input
                                        id="first-name"
                                        name="first-name"
                                        placeholder="John"
                                        required
                                        className="bg-gray-800/60 border-green-600/50 text-white placeholder:text-white/60 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last-name" className="text-white">Last name</Label>
                                    <Input
                                        id="last-name"
                                        name="last-name"
                                        placeholder="Doe"
                                        required
                                        className="bg-gray-800/60 border-green-600/50 text-white placeholder:text-white/60 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    className="bg-gray-800/60 border-green-600/50 text-white placeholder:text-white/60 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-white">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-gray-800/60 border-green-600/50 text-white focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password" // Fixed typo
                                    required
                                    className="bg-gray-800/60 border-green-600/50 text-white focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                type="submit"
                                className="w-full bg-green-600 text-white hover:bg-green-500 disabled:bg-green-700"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating account..." : "Create account"}
                            </Button>
                            <div className="text-center text-sm text-white/70">
                                Already have an account?{" "}
                                <Link href="/auth/login" className="text-green-300 hover:text-green-400">
                                    Login
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </div>
    )
}