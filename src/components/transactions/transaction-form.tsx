'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Account, Category, Transaction } from '@/lib/db/schema'

const transactionFormSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().optional().transform(val => val === '' ? undefined : val),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense', 'transfer']),
  description: z.string().min(1, 'Description is required'),
  merchant: z.string().optional().transform(val => val === '' ? undefined : val),
  date: z.string().min(1, 'Date is required'),
  pending: z.boolean().default(false),
})

type TransactionFormData = z.infer<typeof transactionFormSchema>

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction
}

const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Expense', icon: '💸' },
  { value: 'income', label: 'Income', icon: '💰' },
  { value: 'transfer', label: 'Transfer', icon: '🔄' },
]

export function TransactionForm({ isOpen, onClose, transaction }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')
      return response.json()
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction ? {
      accountId: transaction.accountId,
      categoryId: transaction.categoryId || '',
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      merchant: transaction.merchant || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
      pending: transaction.pending,
    } : {
      accountId: '',
      categoryId: '',
      amount: 0,
      type: 'expense',
      description: '',
      merchant: '',
      date: new Date().toISOString().split('T')[0],
      pending: false,
    }
  })

  const transactionType = watch('type')
  const accounts: Account[] = accountsData?.accounts || []

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', transactionType],
    queryFn: async () => {
      const response = await fetch(`/api/categories?type=${transactionType}`)
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    },
    enabled: transactionType !== 'transfer',
  })

  const categories: Category[] = categoriesData?.categories || []

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      onClose()
      reset()
    },
  })

  const updateTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch(`/api/transactions/${transaction!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      onClose()
    },
  })

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true)
    try {
      if (transaction) {
        await updateTransactionMutation.mutateAsync(data)
      } else {
        await createTransactionMutation.mutateAsync(data)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!transaction) reset()
    onClose()
  }

  const getAccountDisplayName = (account: Account) => {
    return `${account.accountName} (${account.institutionName || 'Cash'})`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
          <DialogDescription>
            {transaction ? 'Update your transaction details below.' : 'Add a new transaction to track your spending.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => setValue('type', value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Account *</Label>
              <Select
                value={watch('accountId')}
                onValueChange={(value) => setValue('accountId', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-sm text-destructive">{errors.accountId.message}</p>
              )}
            </div>

            {transactionType !== 'transfer' && (
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={watch('categoryId')}
                  onValueChange={(value) => setValue('categoryId', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Grocery shopping, salary, etc."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant/Source</Label>
              <Input
                id="merchant"
                {...register('merchant')}
                placeholder="Starbucks, Employer, etc."
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2 flex items-center">
              <input
                id="pending"
                type="checkbox"
                {...register('pending')}
                className="mr-2"
                disabled={isLoading}
              />
              <Label htmlFor="pending">Pending Transaction</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (transaction ? 'Updating...' : 'Creating...') : (transaction ? 'Update Transaction' : 'Create Transaction')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}