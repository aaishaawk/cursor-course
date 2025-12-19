"use client";

interface PlanCardProps {
  totalUsage: number;
  usageLimit?: number;
}

export function PlanCard({ totalUsage, usageLimit = 1000 }: PlanCardProps) {
  const usagePercentage = (totalUsage / usageLimit) * 100;

  return (
    <div
      className="rounded-2xl p-6 mb-8 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #667eea 0%, #a855f7 25%, #ec4899 50%, #f97316 75%, #fbbf24 100%)",
      }}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white uppercase tracking-wide">
            Current Plan
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Manage Plan
          </button>
        </div>

        <h2 className="text-4xl font-bold text-white mb-8">Researcher</h2>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/90 text-sm font-medium">API Limit</span>
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <p className="text-white/90 text-sm">
            {totalUsage}/{usageLimit.toLocaleString()} Requests
          </p>
        </div>
      </div>
    </div>
  );
}

