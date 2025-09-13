'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountCard } from '@/components/accounts/account-card'
import { AccountForm } from '@/components/accounts/account-form'
import { formatCurrency } from '@/lib/utils'
import { Account } from '@/lib/db/schema'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')
      return response.json()
    },
  })

  const accounts: Account[] = accountsData?.accounts || []

  const totalBalance = accounts.reduce((total, account) => {
    if (['credit_card', 'loan'].includes(account.type)) {
      return total - Math.abs(account.balance)
    }
    return total + account.balance
  }, 0)

  const totalAssets = accounts
    .filter(account => !['credit_card', 'loan'].includes(account.type))
    .reduce((total, account) => total + account.balance, 0)

  const totalDebt = accounts
    .filter(account => ['credit_card', 'loan'].includes(account.type))
    .reduce((total, account) => total + Math.abs(account.balance), 0)

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
        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth</CardTitle>
              <CardDescription>Assets minus debts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                totalBalance >= 0 ? 'text-foreground' : 'text-destructive'
              }`}>
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                {accounts.length === 0 ? 'Add accounts to see your net worth' : `${accounts.length} accounts connected`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Assets</CardTitle>
              <CardDescription>Cash, savings, investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(totalAssets)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalDebt > 0 ? `${formatCurrency(totalDebt)} in debt` : 'Debt-free!'}
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
        </div>

        {/* Accounts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Accounts</h2>
              <p className="text-muted-foreground">
                Manage your financial accounts
              </p>
            </div>
            <Button onClick={() => setIsAddAccountOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                💳
              </div>
              <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first account to start tracking your finances
              </p>
              <Button onClick={() => setIsAddAccountOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Account
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          )}
        </div>

        {/* Getting Started - only show if no accounts */}
        {accounts.length === 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Set up your personal finance manager</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Add Your Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                      Start by adding your bank accounts, credit cards, and investments
                    </p>
                  </div>
                  <Button onClick={() => setIsAddAccountOpen(true)}>Add Account</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                  <div>
                    <h3 className="font-medium">Create Your First Budget</h3>
                    <p className="text-sm text-muted-foreground">
                      Set spending limits for different categories
                    </p>
                  </div>
                  <Button variant="outline" disabled>Coming Soon</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                  <div>
                    <h3 className="font-medium">Set Financial Goals</h3>
                    <p className="text-sm text-muted-foreground">
                      Define and track your savings goals
                    </p>
                  </div>
                  <Button variant="outline" disabled>Coming Soon</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <AccountForm
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />
    </div>
  )
}