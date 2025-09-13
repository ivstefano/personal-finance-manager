export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Personal Finance Manager</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Take control of your financial future
            </p>
          </div>
          {children}
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary to-primary/80">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-6">Welcome Back</h2>
            <p className="text-xl mb-8">
              Track your spending, manage budgets, and achieve your financial goals with confidence.
            </p>
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>Real-time transaction tracking</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>Smart budget management</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>Secure bank connections</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3" />
                <span>Beautiful analytics & reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}