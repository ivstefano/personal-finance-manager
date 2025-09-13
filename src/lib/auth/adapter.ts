import { db } from '@/lib/db'
import { users, sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export class AuthService {
  static async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email))
    return user || null
  }

  static async getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    return user || null
  }

  static async createUser(data: { name: string; email: string; password: string }) {
    const [user] = await db.insert(users).values(data).returning()
    return user
  }
}