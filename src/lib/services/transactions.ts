import { db } from '@/lib/db'
import { transactions, accounts, categories, type Transaction, type NewTransaction } from '@/lib/db/schema'
import { eq, and, desc, gte, lte, like, or } from 'drizzle-orm'

export class TransactionService {
  static async getUserTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Transaction[]> {
    return await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        accountId: transactions.accountId,
        categoryId: transactions.categoryId,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        merchant: transactions.merchant,
        date: transactions.date,
        pending: transactions.pending,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        accountName: accounts.accountName,
        categoryName: categories.name,
        categoryIcon: categories.icon,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)
      .offset(offset)
  }

  static async getTransactionById(id: string, userId: string): Promise<Transaction | null> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    return transaction || null
  }

  static async createTransaction(data: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(data).returning()

    // Update account balance
    if (transaction.accountId && !transaction.pending) {
      // First get the current account balance
      const [currentAccount] = await db
        .select({ balance: accounts.balance })
        .from(accounts)
        .where(and(eq(accounts.id, transaction.accountId), eq(accounts.userId, transaction.userId)))

      if (currentAccount) {
        const balanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount
        const newBalance = currentAccount.balance + balanceChange

        await db
          .update(accounts)
          .set({
            balance: newBalance,
            lastSynced: new Date()
          })
          .where(and(eq(accounts.id, transaction.accountId), eq(accounts.userId, transaction.userId)))
      }
    }

    return transaction
  }

  static async updateTransaction(
    id: string,
    userId: string,
    data: Partial<Omit<NewTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Transaction | null> {
    const existingTransaction = await this.getTransactionById(id, userId)
    if (!existingTransaction) return null

    const [transaction] = await db
      .update(transactions)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning()

    // Update account balance if amount or type changed
    if (transaction && transaction.accountId && (data.amount !== undefined || data.type !== undefined)) {
      const oldBalanceChange = existingTransaction.type === 'expense' ? -existingTransaction.amount : existingTransaction.amount
      const newBalanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount
      const netChange = newBalanceChange - oldBalanceChange

      if (netChange !== 0) {
        // First get the current account balance
        const [currentAccount] = await db
          .select({ balance: accounts.balance })
          .from(accounts)
          .where(and(eq(accounts.id, transaction.accountId), eq(accounts.userId, transaction.userId)))

        if (currentAccount) {
          const newBalance = currentAccount.balance + netChange

          await db
            .update(accounts)
            .set({
              balance: newBalance,
              lastSynced: new Date()
            })
            .where(and(eq(accounts.id, transaction.accountId), eq(accounts.userId, transaction.userId)))
        }
      }
    }

    return transaction || null
  }

  static async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const existingTransaction = await this.getTransactionById(id, userId)
    if (!existingTransaction) return false

    const [deletedTransaction] = await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning()

    // Reverse the account balance change
    if (deletedTransaction && deletedTransaction.accountId && !deletedTransaction.pending) {
      // First get the current account balance
      const [currentAccount] = await db
        .select({ balance: accounts.balance })
        .from(accounts)
        .where(and(eq(accounts.id, deletedTransaction.accountId), eq(accounts.userId, deletedTransaction.userId)))

      if (currentAccount) {
        const balanceReversal = deletedTransaction.type === 'expense' ? deletedTransaction.amount : -deletedTransaction.amount
        const newBalance = currentAccount.balance + balanceReversal

        await db
          .update(accounts)
          .set({
            balance: newBalance,
            lastSynced: new Date()
          })
          .where(and(eq(accounts.id, deletedTransaction.accountId), eq(accounts.userId, deletedTransaction.userId)))
      }
    }

    return !!deletedTransaction
  }

  static async getTransactionsByAccount(
    accountId: string,
    userId: string,
    limit: number = 50
  ): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.userId, userId)
        )
      )
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)
  }

  static async getTransactionsByCategory(
    categoryId: string,
    userId: string,
    limit: number = 50
  ): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.categoryId, categoryId),
          eq(transactions.userId, userId)
        )
      )
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)
  }

  static async searchTransactions(
    userId: string,
    query: string,
    filters?: {
      accountId?: string
      categoryId?: string
      type?: 'income' | 'expense' | 'transfer'
      startDate?: Date
      endDate?: Date
      minAmount?: number
      maxAmount?: number
    }
  ): Promise<Transaction[]> {
    let whereConditions = [eq(transactions.userId, userId)]

    if (query) {
      whereConditions.push(
        or(
          like(transactions.description, `%${query}%`),
          like(transactions.merchant, `%${query}%`)
        )!
      )
    }

    if (filters?.accountId) {
      whereConditions.push(eq(transactions.accountId, filters.accountId))
    }

    if (filters?.categoryId) {
      whereConditions.push(eq(transactions.categoryId, filters.categoryId))
    }

    if (filters?.type) {
      whereConditions.push(eq(transactions.type, filters.type))
    }

    if (filters?.startDate) {
      whereConditions.push(gte(transactions.date, filters.startDate))
    }

    if (filters?.endDate) {
      whereConditions.push(lte(transactions.date, filters.endDate))
    }

    if (filters?.minAmount) {
      whereConditions.push(gte(transactions.amount, filters.minAmount))
    }

    if (filters?.maxAmount) {
      whereConditions.push(lte(transactions.amount, filters.maxAmount))
    }

    return await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        accountId: transactions.accountId,
        categoryId: transactions.categoryId,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        merchant: transactions.merchant,
        date: transactions.date,
        pending: transactions.pending,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        accountName: accounts.accountName,
        categoryName: categories.name,
        categoryIcon: categories.icon,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...whereConditions))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(100)
  }

  static async getSpendingByCategory(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ categoryId: string; categoryName: string; categoryIcon: string; total: number }>> {
    return await db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        total: transactions.amount,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.amount))
  }

  static async getMonthlySpending(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const result = await db
      .select({ total: transactions.amount })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          eq(transactions.pending, false)
        )
      )

    return result.reduce((sum, row) => sum + row.total, 0)
  }
}