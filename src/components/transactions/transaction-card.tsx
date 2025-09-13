'use client'

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
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
import { Transaction } from '@/lib/db/schema'
import { TransactionForm } from './transaction-form'

interface TransactionCardProps {
  transaction: Transaction & {
    accountName?: string
    categoryName?: string
    categoryIcon?: string
  }
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteTransactionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      deleteTransactionMutation.mutate()
    }
  }

  const getAmountColor = () => {
    if (transaction.type === 'income') return 'text-success'
    if (transaction.type === 'expense') return 'text-destructive'
    return 'text-foreground'
  }

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'income': return '💰'
      case 'expense': return '💸'
      case 'transfer': return '🔄'
      default: return '💳'
    }
  }

  const formatTransactionAmount = (amount: number, type: string) => {
    const sign = type === 'expense' ? '-' : '+'
    return `${sign}${formatCurrency(amount)}`
  }

  return (
    <>
      <Card className={`transition-all hover:shadow-md ${transaction.pending ? 'opacity-70' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {transaction.categoryIcon || getTypeIcon()}
              </div>
              <div>
                <CardTitle className="text-lg">{transaction.description}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  {transaction.merchant && (
                    <>
                      <span>{transaction.merchant}</span>
                      <span>•</span>
                    </>
                  )}
                  {transaction.categoryName && (
                    <>
                      <span>{transaction.categoryName}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{transaction.accountName}</span>
                  {transaction.pending && (
                    <>
                      <span>•</span>
                      <span className="text-warning">Pending</span>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className={`text-lg font-semibold ${getAmountColor()}`}>
                  {formatTransactionAmount(transaction.amount, transaction.type)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
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
                    Edit Transaction
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Transaction
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      <TransactionForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        transaction={transaction}
      />
    </>
  )
}