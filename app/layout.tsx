import type { Metadata } from 'next'
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import Chatbot from '@/components/Chatbot'
import { Button } from '@/components/ui/button'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AI Law Interpreter',
  description: 'Decode complex legal jargon into plain English instantly.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}>
        {/* Ambient background glow effects */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        </div>

        <ClerkProvider>
          <header className="fixed top-0 w-full z-50 bg-[#0A0F1C]/80 backdrop-blur-xl border-b border-border transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-primary-foreground text-sm font-black">AI</span>
                  </div>
                  <span className="text-foreground">Law Interpreter</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                  <Link href="/" className="hover:text-white transition-colors">Home</Link>
                  <Show when="signed-in">
                    <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                    <Link href="/analyze" className="hover:text-foreground transition-colors flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      Analyze
                    </Link>
                  </Show>
                  <Link href="/about" className="hover:text-white transition-colors">About</Link>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <Show when="signed-out">
                  <SignInButton>
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button className="rounded-full">
                      Get Started
                    </Button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-purple-500/30" } }} />
                </Show>
              </div>
            </div>
          </header>
          
          <main className="pt-24 pb-16 min-h-screen">
            {children}
          </main>
          <Chatbot />
        </ClerkProvider>
      </body>
    </html>
  )
}