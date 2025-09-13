import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  name: text('name'),
  password: text('password').notNull(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  categories: many(categories),
  budgets: many(budgets),
  goals: many(goals),
  bills: many(bills),
  sessions: many(sessions),
}))

// Sessions table for NextAuth
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text('session_token').unique().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

// Enhanced Accounts table
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // checking, savings, credit_card, investment, loan, cash
  subtype: text('subtype'), // specific account subtype
  provider: text('provider'), // plaid, manual
  providerAccountId: text('provider_account_id'),
  institutionName: text('institution_name'), // Bank name
  accountName: text('account_name').notNull(),
  accountNumber: text('account_number'),
  routingNumber: text('routing_number'),
  balance: real('balance').default(0).notNull(),
  availableBalance: real('available_balance'), // Available balance (different from current for credit cards)
  creditLimit: real('credit_limit'), // For credit cards
  interestRate: real('interest_rate'), // APR for loans/credit cards
  currency: text('currency').default('USD').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  isHidden: integer('is_hidden', { mode: 'boolean' }).default(false).notNull(),
  color: text('color'), // UI color for account
  icon: text('icon'), // UI icon for account
  lastSynced: integer('last_synced', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
}))

// Enhanced Categories table
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  type: text('type').notNull(), // income, expense
  parentId: text('parent_id').references(() => categories.id),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories),
  transactions: many(transactions),
  budgetItems: many(budgetItems),
}))

// Enhanced Transactions table
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').references(() => categories.id),
  amount: real('amount').notNull(),
  type: text('type').notNull(), // debit, credit, transfer
  description: text('description').notNull(),
  originalDescription: text('original_description'), // Original bank description
  merchant: text('merchant'),
  merchantLogo: text('merchant_logo'), // URL to merchant logo
  date: integer('date', { mode: 'timestamp' }).notNull(),
  pending: integer('pending', { mode: 'boolean' }).default(false).notNull(),
  excluded: integer('excluded', { mode: 'boolean' }).default(false).notNull(), // Exclude from budget calculations
  notes: text('notes'),
  receipt: text('receipt'), // URL to receipt image
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  location: text('location', { mode: 'json' }).$type<Record<string, any>>(),
  confidence: real('confidence'), // Auto-categorization confidence
  isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false).notNull(),
  recurringId: text('recurring_id'), // Link to recurring transaction pattern
  transferAccountId: text('transfer_account_id').references(() => accounts.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
  transferAccount: one(accounts, { fields: [transactions.transferAccountId], references: [accounts.id] }),
}))

// Budgets table
export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  items: many(budgetItems),
}))

// Budget items table
export const budgetItems = sqliteTable('budget_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  budgetId: text('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => categories.id),
  amount: real('amount').notNull(),
  spent: real('spent').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  budget: one(budgets, { fields: [budgetItems.budgetId], references: [budgets.id] }),
  category: one(categories, { fields: [budgetItems.categoryId], references: [categories.id] }),
}))

// Enhanced Goals table
export const goals = sqliteTable('goals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').default(0).notNull(),
  targetDate: integer('target_date', { mode: 'timestamp' }),
  category: text('category').notNull(), // emergency, vacation, debt, retirement, custom
  status: text('status').default('active').notNull(), // active, completed, paused
  priority: integer('priority').default(1).notNull(), // 1-5 priority level
  color: text('color'), // UI color
  icon: text('icon'), // UI icon
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false).notNull(),
  linkedAccountId: text('linked_account_id').references(() => accounts.id),
  autoContribute: integer('auto_contribute', { mode: 'boolean' }).default(false).notNull(),
  monthlyTarget: real('monthly_target'), // Monthly savings target
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
  linkedAccount: one(accounts, { fields: [goals.linkedAccountId], references: [accounts.id] }),
}))

// Bills table
export const bills = sqliteTable('bills', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  dueDay: integer('due_day').notNull(), // Day of month (1-31)
  frequency: text('frequency').notNull(), // monthly, weekly, biweekly, quarterly, annually
  category: text('category'),
  isAutomatic: integer('is_automatic', { mode: 'boolean' }).default(false).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  lastPaid: integer('last_paid', { mode: 'timestamp' }),
  nextDue: integer('next_due', { mode: 'timestamp' }).notNull(),
  reminder: integer('reminder', { mode: 'boolean' }).default(true).notNull(),
  reminderDays: integer('reminder_days').default(3).notNull(), // Days before due date
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
})

export const billsRelations = relations(bills, ({ one }) => ({
  user: one(users, { fields: [bills.userId], references: [users.id] }),
}))

// We can add Zod schemas later if needed

// Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Budget = typeof budgets.$inferSelect
export type NewBudget = typeof budgets.$inferInsert
export type Goal = typeof goals.$inferSelect
export type NewGoal = typeof goals.$inferInsert
export type Bill = typeof bills.$inferSelect
export type NewBill = typeof bills.$inferInsert