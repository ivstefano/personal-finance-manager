import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { AccountService } from '@/lib/services/accounts'
import { authOptions } from '@/lib/auth/config'

const createAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  type: z.enum(['checking', 'savings', 'credit_card', 'investment', 'loan', 'cash']),
  subtype: z.string().optional(),
  institutionName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  balance: z.number().default(0),
  availableBalance: z.number().optional(),
  creditLimit: z.number().optional(),
  interestRate: z.number().optional(),
  currency: z.string().default('USD'),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await AccountService.getUserAccounts(session.user.id)
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAccountSchema.parse(body)

    const account = await AccountService.createAccount({
      ...validatedData,
      userId: session.user.id,
    })

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.errors },
        { status: 400 }
      )
    }

    console.error('Create account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}