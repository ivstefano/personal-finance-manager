'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { Plus, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountCard } from '@/components/accounts/account-card'
import { AccountForm } from '@/components/accounts/account-form'
import { TransactionCard } from '@/components/transactions/transaction-card'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { formatCurrency } from '@/lib/utils'
import { Account, Transaction } from '@/lib/db/schema'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')
      return response.json()
    },
  })

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions?limit=10')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return response.json()
    },
  })

  const accounts: Account[] = accountsData?.accounts || []
  const transactions: (Transaction & { accountName?: string; categoryName?: string; categoryIcon?: string })[] = transactionsData?.transactions || []

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
            <a href="/" className="text-2xl font-bold hover:text-primary transition-colors">
              Personal Finance Manager
            </a>
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

        {/* Recent Transactions Section */}
        {accounts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Recent Transactions</h2>
                <p className="text-muted-foreground">
                  Your latest spending and income
                </p>
              </div>
              <Button onClick={() => setIsAddTransactionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </div>

            {isLoadingTransactions ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-muted rounded-full" />
                          <div>
                            <div className="h-4 bg-muted rounded w-32 mb-2" />
                            <div className="h-3 bg-muted rounded w-24" />
                          </div>
                        </div>
                        <div className="h-6 bg-muted rounded w-16" />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first transaction to start tracking your spending
                </p>
                <Button onClick={() => setIsAddTransactionOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Transaction
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Implementation Roadmap */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Roadmap</CardTitle>
              <CardDescription>Track our progress building this financial manager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                <div>
                  <h3 className="font-medium text-green-800">✅ Enhanced Account Management</h3>
                  <p className="text-sm text-green-600">
                    Multiple account types, balance tracking, visual organization - COMPLETED
                  </p>
                </div>
                <div className="text-green-700 font-semibold">Phase 1</div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                <div>
                  <h3 className="font-medium text-green-800">✅ Transaction System & Categories</h3>
                  <p className="text-sm text-green-600">
                    Add/edit transactions, smart categorization, spending tracking - COMPLETED
                  </p>
                </div>
                <div className="text-green-700 font-semibold">Phase 1</div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">🏗️ Dashboard & Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Net worth trends, spending analytics, account balance history
                  </p>
                </div>
                <div className="text-muted-foreground font-semibold">Phase 2</div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">📊 Budget Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Create budgets, track spending limits, budget vs actual reports
                  </p>
                </div>
                <div className="text-muted-foreground font-semibold">Phase 2</div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">🎯 Financial Goals</h3>
                  <p className="text-sm text-muted-foreground">
                    Savings goals, debt payoff tracking, goal progress visualization
                  </p>
                </div>
                <div className="text-muted-foreground font-semibold">Phase 3</div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">💳 Bank Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to banks, automatic transaction import, real-time balances
                  </p>
                </div>
                <div className="text-muted-foreground font-semibold">Phase 4</div>
              </div>
            </CardContent>
          </Card>
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
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <AccountForm
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />

      <TransactionForm
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
      />
    </div>
  )
}