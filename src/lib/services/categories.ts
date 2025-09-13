import { db } from '@/lib/db'
import { categories, type Category, type NewCategory } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export class CategoryService {
  static async getUserCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.isActive, true)))
      .orderBy(categories.type, categories.name)
  }

  static async getCategoryById(id: string, userId: string): Promise<Category | null> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    return category || null
  }

  static async createCategory(data: Omit<NewCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const [category] = await db.insert(categories).values(data).returning()
    return category
  }

  static async updateCategory(
    id: string,
    userId: string,
    data: Partial<Omit<NewCategory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Category | null> {
    const [category] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning()
    return category || null
  }

  static async deleteCategory(id: string, userId: string): Promise<boolean> {
    const [category] = await db
      .update(categories)
      .set({ isActive: false })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning()
    return !!category
  }

  static async getCategoriesByType(userId: string, type: 'income' | 'expense'): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.type, type),
          eq(categories.isActive, true)
        )
      )
      .orderBy(categories.name)
  }

  static async createDefaultCategories(userId: string): Promise<Category[]> {
    const defaultCategories = [
      // Income Categories
      { name: 'Salary', type: 'income', icon: '💼', color: '#10B981', userId },
      { name: 'Freelance', type: 'income', icon: '💻', color: '#3B82F6', userId },
      { name: 'Investment', type: 'income', icon: '📈', color: '#8B5CF6', userId },
      { name: 'Other Income', type: 'income', icon: '💰', color: '#06B6D4', userId },

      // Expense Categories
      { name: 'Food & Dining', type: 'expense', icon: '🍽️', color: '#F59E0B', userId },
      { name: 'Groceries', type: 'expense', icon: '🛒', color: '#84CC16', userId },
      { name: 'Transportation', type: 'expense', icon: '🚗', color: '#EF4444', userId },
      { name: 'Gas & Fuel', type: 'expense', icon: '⛽', color: '#F97316', userId },
      { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#EC4899', userId },
      { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#8B5CF6', userId },
      { name: 'Bills & Utilities', type: 'expense', icon: '📄', color: '#6B7280', userId },
      { name: 'Health & Medical', type: 'expense', icon: '🏥', color: '#EF4444', userId },
      { name: 'Home & Garden', type: 'expense', icon: '🏠', color: '#10B981', userId },
      { name: 'Education', type: 'expense', icon: '📚', color: '#3B82F6', userId },
      { name: 'Travel', type: 'expense', icon: '✈️', color: '#06B6D4', userId },
      { name: 'Personal Care', type: 'expense', icon: '💄', color: '#EC4899', userId },
      { name: 'Gifts & Donations', type: 'expense', icon: '🎁', color: '#F59E0B', userId },
      { name: 'Bank Fees', type: 'expense', icon: '🏦', color: '#6B7280', userId },
      { name: 'Other', type: 'expense', icon: '❓', color: '#9CA3AF', userId },
    ] as const

    const createdCategories: Category[] = []

    for (const categoryData of defaultCategories) {
      try {
        const category = await this.createCategory(categoryData)
        createdCategories.push(category)
      } catch (error) {
        console.error('Error creating default category:', categoryData.name, error)
      }
    }

    return createdCategories
  }
}