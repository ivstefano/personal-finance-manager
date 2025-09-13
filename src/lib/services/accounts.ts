import { db } from '@/lib/db'
import { accounts, type Account, type NewAccount } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export class AccountService {
  static async getUserAccounts(userId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
      .orderBy(desc(accounts.createdAt))
  }

  static async getAccountById(id: string, userId: string): Promise<Account | null> {
    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    return account || null
  }

  static async createAccount(data: Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const [account] = await db.insert(accounts).values(data).returning()
    return account
  }

  static async updateAccount(
    id: string,
    userId: string,
    data: Partial<Omit<NewAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Account | null> {
    const [account] = await db
      .update(accounts)
      .set(data)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning()
    return account || null
  }

  static async deleteAccount(id: string, userId: string): Promise<boolean> {
    // Soft delete by setting isActive to false
    const [account] = await db
      .update(accounts)
      .set({ isActive: false })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning()
    return !!account
  }

  static async updateAccountBalance(id: string, userId: string, balance: number): Promise<Account | null> {
    const [account] = await db
      .update(accounts)
      .set({
        balance,
        lastSynced: new Date()
      })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning()
    return account || null
  }

  static async getTotalNetWorth(userId: string): Promise<number> {
    const userAccounts = await this.getUserAccounts(userId)
    return userAccounts.reduce((total, account) => {
      // For debt accounts (credit cards, loans), subtract the balance
      if (['credit_card', 'loan'].includes(account.type)) {
        return total - Math.abs(account.balance)
      }
      // For asset accounts, add the balance
      return total + account.balance
    }, 0)
  }

  static async getAccountsByType(userId: string, type: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, userId),
          eq(accounts.type, type),
          eq(accounts.isActive, true)
        )
      )
      .orderBy(desc(accounts.balance))
  }
}