'use client'

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'
import { Account } from '@/lib/db/schema'
import { AccountForm } from './account-form'

interface AccountCardProps {
  account: Account
}

const ACCOUNT_TYPE_ICONS: Record<string, string> = {
  checking: '🏦',
  savings: '💰',
  credit_card: '💳',
  investment: '📈',
  loan: '🏠',
  cash: '💵',
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  investment: 'Investment',
  loan: 'Loan',
  cash: 'Cash',
}

export function AccountCard({ account }: AccountCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete account')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  const toggleVisibilityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: !account.isHidden }),
      })
      if (!response.ok) throw new Error('Failed to update account')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      deleteAccountMutation.mutate()
    }
  }

  const getBalanceColor = () => {
    if (account.type === 'credit_card') {
      return account.balance > 0 ? 'text-destructive' : 'text-muted-foreground'
    }
    if (account.type === 'loan') {
      return 'text-destructive'
    }
    return account.balance < 0 ? 'text-destructive' : 'text-foreground'
  }

  const getAvailableBalance = () => {
    if (account.type === 'credit_card' && account.creditLimit) {
      const available = account.creditLimit - Math.abs(account.balance)
      return available
    }
    return account.availableBalance
  }

  return (
    <>
      <Card className={`transition-all hover:shadow-md ${account.isHidden ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-white text-lg font-semibold"
                style={{ backgroundColor: account.color || '#3B82F6' }}
              >
                {ACCOUNT_TYPE_ICONS[account.type] || '💳'}
              </div>
              <div>
                <CardTitle className="text-lg">{account.accountName}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <span>{ACCOUNT_TYPE_LABELS[account.type] || account.type}</span>
                  {account.institutionName && (
                    <>
                      <span>•</span>
                      <span>{account.institutionName}</span>
                    </>
                  )}
                  {account.isHidden && (
                    <>
                      <span>•</span>
                      <EyeOff className="h-3 w-3" />
                    </>
                  )}
                </CardDescription>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleVisibilityMutation.mutate()}>
                  {account.isHidden ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Show Account
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide Account
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Current Balance</span>
              {account.accountNumber && (
                <span className="text-xs text-muted-foreground">
                  ****{account.accountNumber.slice(-4)}
                </span>
              )}
            </div>
            <div className={`text-2xl font-semibold ${getBalanceColor()}`}>
              {formatCurrency(account.balance, account.currency)}
            </div>
          </div>

          {getAvailableBalance() !== undefined && (
            <div>
              <span className="text-sm text-muted-foreground">
                {account.type === 'credit_card' ? 'Available Credit' : 'Available Balance'}
              </span>
              <div className="text-lg font-medium text-muted-foreground">
                {formatCurrency(getAvailableBalance()!, account.currency)}
              </div>
            </div>
          )}

          {account.creditLimit && account.type === 'credit_card' && (
            <div>
              <span className="text-sm text-muted-foreground">Credit Limit</span>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(account.creditLimit, account.currency)}
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    Math.abs(account.balance) / account.creditLimit > 0.8
                      ? 'bg-destructive'
                      : Math.abs(account.balance) / account.creditLimit > 0.6
                      ? 'bg-warning'
                      : 'bg-primary'
                  }`}
                  style={{
                    width: `${Math.min((Math.abs(account.balance) / account.creditLimit) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {((Math.abs(account.balance) / account.creditLimit) * 100).toFixed(1)}% used
              </div>
            </div>
          )}

          {account.interestRate && (
            <div>
              <span className="text-sm text-muted-foreground">Interest Rate</span>
              <div className="text-sm text-muted-foreground">
                {account.interestRate.toFixed(2)}% APR
              </div>
            </div>
          )}

          {account.lastSynced && (
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(account.lastSynced).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      <AccountForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        account={account}
      />
    </>
  )
}