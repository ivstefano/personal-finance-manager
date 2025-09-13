'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Personal Finance Manager</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {session?.user?.name || session?.user?.email}
              </span>
              <Button onClick={() => signOut({ callbackUrl: '/' })} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Balance</CardTitle>
              <CardDescription>All accounts combined</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">
                Connect your accounts to see your balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Month's Spending</CardTitle>
              <CardDescription>Total expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">
                No transactions yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
              <CardDescription>Monthly budget progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">No budget set</div>
              <p className="text-xs text-muted-foreground">
                Create your first budget to get started
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Set up your personal finance manager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Connect Your Bank Accounts</h3>
                  <p className="text-sm text-muted-foreground">
                    Securely link your accounts to automatically import transactions
                  </p>
                </div>
                <Button>Connect</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Create Your First Budget</h3>
                  <p className="text-sm text-muted-foreground">
                    Set spending limits for different categories
                  </p>
                </div>
                <Button variant="outline">Create Budget</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Set Financial Goals</h3>
                  <p className="text-sm text-muted-foreground">
                    Define and track your savings goals
                  </p>
                </div>
                <Button variant="outline">Set Goals</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}