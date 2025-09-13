import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { AccountService } from '@/lib/services/accounts'
import { authOptions } from '@/lib/auth/config'

const updateAccountSchema = z.object({
  accountName: z.string().min(1).optional(),
  type: z.enum(['checking', 'savings', 'credit_card', 'investment', 'loan', 'cash']).optional(),
  subtype: z.string().optional(),
  institutionName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  balance: z.number().optional(),
  availableBalance: z.number().optional(),
  creditLimit: z.number().optional(),
  interestRate: z.number().optional(),
  currency: z.string().optional(),
  isHidden: z.boolean().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const account = await AccountService.getAccountById(params.id, session.user.id)
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Get account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAccountSchema.parse(body)

    const account = await AccountService.updateAccount(params.id, session.user.id, validatedData)
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.errors },
        { status: 400 }
      )
    }

    console.error('Update account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await AccountService.deleteAccount(params.id, session.user.id)
    if (!success) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}