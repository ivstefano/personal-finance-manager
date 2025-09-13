import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { TransactionService } from '@/lib/services/transactions'
import { authOptions } from '@/lib/auth/config'

const createTransactionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().optional().transform(val => val === '' ? undefined : val),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense', 'transfer']),
  description: z.string().min(1, 'Description is required'),
  merchant: z.string().optional().transform(val => val === '' ? undefined : val),
  date: z.string().transform((str) => new Date(str)),
  pending: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const query = searchParams.get('query') || ''
    const accountId = searchParams.get('accountId') || undefined
    const categoryId = searchParams.get('categoryId') || undefined
    const type = searchParams.get('type') as 'income' | 'expense' | 'transfer' | undefined
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    let transactions
    if (query || accountId || categoryId || type || startDate || endDate) {
      transactions = await TransactionService.searchTransactions(session.user.id, query, {
        accountId,
        categoryId,
        type,
        startDate,
        endDate,
      })
    } else {
      transactions = await TransactionService.getUserTransactions(session.user.id, limit, offset)
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    const transaction = await TransactionService.createTransaction({
      ...validatedData,
      userId: session.user.id,
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}