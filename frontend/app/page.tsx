import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Database, ArrowRight, Shield, Zap, Lock, FileText, Search, ChevronRight } from 'lucide-react'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value

  if (token) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">CyborgDB</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/auth/login"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Vector Storage</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Chat with your documents,
            <br />
            <span className="text-primary">securely.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload PDFs, docs, and files. Ask questions in natural language. 
            Get accurate answers with source citations. All encrypted end-to-end.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful features to help you work with documents intelligently
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Shield}
              title="End-to-End Encryption"
              description="Your documents are encrypted before storage. Only you can access your data."
            />
            <FeatureCard 
              icon={Search}
              title="Semantic Search"
              description="Find information by meaning, not keywords. Ask questions naturally."
            />
            <FeatureCard 
              icon={Zap}
              title="Instant Answers"
              description="Get accurate responses with source citations in seconds."
            />
            <FeatureCard 
              icon={FileText}
              title="Multi-Format"
              description="Support for PDF, DOCX, TXT, images, spreadsheets, and more."
            />
            <FeatureCard 
              icon={Database}
              title="Vector Database"
              description="Powered by CyborgDB's encrypted vector storage technology."
            />
            <FeatureCard 
              icon={Lock}
              title="Privacy First"
              description="Zero-knowledge architecture. Your keys never leave your control."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start chatting with your documents in minutes. No credit card required.
          </p>
          <Link 
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-medium text-lg hover:bg-primary/90 transition-colors"
          >
            Get Started Free
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">CyborgDB</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CyborgDB. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string 
}) {
  return (
    <div className="p-6 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}
