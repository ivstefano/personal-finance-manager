import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Personal Finance Manager</h1>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-5xl font-bold">
              Take Control of Your Financial Future
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Track spending, manage budgets, and achieve your financial goals with our comprehensive personal finance management platform.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="border-t py-20">
          <div className="container mx-auto px-4">
            <h3 className="mb-12 text-center text-3xl font-bold">Key Features</h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Budget Management"
                description="Create flexible monthly budgets with real-time tracking and smart alerts"
              />
              <FeatureCard
                title="Bank Sync"
                description="Securely connect all your accounts for automatic transaction import"
              />
              <FeatureCard
                title="Financial Goals"
                description="Set and track goals with automated savings recommendations"
              />
              <FeatureCard
                title="Bill Tracking"
                description="Never miss a payment with bill calendar and reminders"
              />
              <FeatureCard
                title="Reports & Analytics"
                description="Detailed spending analysis with beautiful visualizations"
              />
              <FeatureCard
                title="Investment Tracking"
                description="Monitor your portfolio and calculate net worth automatically"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Personal Finance Manager. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border p-6">
      <h4 className="mb-2 text-xl font-semibold">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}