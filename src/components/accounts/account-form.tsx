'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
import { formatCurrency } from '@/lib/utils'
import { Account } from '@/lib/db/schema'

const accountFormSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  type: z.enum(['checking', 'savings', 'credit_card', 'investment', 'loan', 'cash']),
  institutionName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  balance: z.number(),
  availableBalance: z.number().optional(),
  creditLimit: z.number().optional(),
  interestRate: z.number().optional(),
  currency: z.string().default('USD'),
  color: z.string().optional(),
})

type AccountFormData = z.infer<typeof accountFormSchema>

interface AccountFormProps {
  isOpen: boolean
  onClose: () => void
  account?: Account
}

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account', icon: '🏦' },
  { value: 'savings', label: 'Savings Account', icon: '💰' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'investment', label: 'Investment Account', icon: '📈' },
  { value: 'loan', label: 'Loan Account', icon: '🏠' },
  { value: 'cash', label: 'Cash Account', icon: '💵' },
]

const ACCOUNT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
  '#F97316', '#84CC16', '#EC4899', '#6B7280'
]

export function AccountForm({ isOpen, onClose, account }: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: account ? {
      accountName: account.accountName,
      type: account.type as any,
      institutionName: account.institutionName || '',
      accountNumber: account.accountNumber || '',
      routingNumber: account.routingNumber || '',
      balance: account.balance,
      availableBalance: account.availableBalance || undefined,
      creditLimit: account.creditLimit || undefined,
      interestRate: account.interestRate || undefined,
      currency: account.currency,
      color: account.color || '',
    } : {
      accountName: '',
      type: 'checking',
      institutionName: '',
      accountNumber: '',
      routingNumber: '',
      balance: 0,
      currency: 'USD',
      color: ACCOUNT_COLORS[0],
    }
  })

  const accountType = watch('type')
  const selectedColor = watch('color')

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create account')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      onClose()
      reset()
    },
  })

  const updateAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const response = await fetch(`/api/accounts/${account!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update account')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      onClose()
    },
  })

  const onSubmit = async (data: AccountFormData) => {
    setIsLoading(true)
    try {
      if (account) {
        await updateAccountMutation.mutateAsync(data)
      } else {
        await createAccountMutation.mutateAsync(data)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!account) reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          <DialogDescription>
            {account ? 'Update your account details below.' : 'Add a new account to track your finances.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name *</Label>
              <Input
                id="accountName"
                {...register('accountName')}
                placeholder="My Checking Account"
                disabled={isLoading}
              />
              {errors.accountName && (
                <p className="text-sm text-destructive">{errors.accountName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Account Type *</Label>
              <Select
                value={accountType}
                onValueChange={(value) => setValue('type', value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Bank/Institution</Label>
              <Input
                id="institutionName"
                {...register('institutionName')}
                placeholder="Chase, Wells Fargo, etc."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                {...register('accountNumber')}
                placeholder="****1234"
                disabled={isLoading}
              />
            </div>
          </div>

          {(accountType === 'checking' || accountType === 'savings') && (
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                {...register('routingNumber')}
                placeholder="123456789"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance *</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                {...register('balance', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.balance && (
                <p className="text-sm text-destructive">{errors.balance.message}</p>
              )}
            </div>

            {accountType === 'credit_card' && (
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  {...register('creditLimit', { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
            )}

            {(accountType === 'credit_card' || accountType === 'loan') && (
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  {...register('interestRate', { valueAsNumber: true })}
                  placeholder="4.25"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Account Color</Label>
            <div className="flex gap-2">
              {ACCOUNT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-ring border-offset-2' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('color', color)}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (account ? 'Updating...' : 'Creating...') : (account ? 'Update Account' : 'Create Account')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}