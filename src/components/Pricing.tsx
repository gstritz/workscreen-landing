export default function Pricing() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-green-500/20 border border-green-400/30 text-green-300 px-6 py-2 rounded-full text-sm font-semibold mb-6">
            FREE DURING EARLY ACCESS
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            No Subscription.{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              No Fees.
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 shadow-premium-lg">
          <div className="prose prose-lg md:prose-xl max-w-none text-gray-200 space-y-6 leading-relaxed">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl">💳</span>
              <p className="text-2xl font-bold text-white m-0">
                No subscription. No per-lead fee. No credit card.
              </p>
            </div>
            <p className="text-xl text-gray-300">
              We're building WorkChat to learn what plaintiff employment lawyers actually need from intake tools. Early access users get the product free. In exchange, we get feedback that shapes what we build.
            </p>
            <div className="bg-white/5 border-l-4 border-primary-400 p-6 rounded-r-lg mt-8">
              <p className="text-lg text-gray-200">
                Eventually there may be paid tiers — CRM integrations, analytics, team features. But the core screening tool will stay free or close to it. We're not trying to monetize intake. We're trying to build something useful enough that you'll want to stick around.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
