export default function Solution() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary-50 via-white to-blue-50/50 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            What If They Were{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Pre-Screened?
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-premium border border-gray-100">
          <div className="prose prose-lg md:prose-xl max-w-none text-gray-700 space-y-6 leading-relaxed">
            <p className="text-xl text-gray-800 font-medium">
              WorkScreen is intake filtering built specifically for plaintiff employment lawyers.
            </p>
            <p className="text-lg text-gray-700">
              You get a branded link — <span className="font-mono bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-200 font-semibold">yourfirm.workchat.law</span> — that you text, email, or post anywhere potential clients find you. They answer a short series of questions about their situation. WorkScreen flags the obvious disqualifiers and only forwards you the claims worth your time.
            </p>
            <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg mt-8">
              <p className="text-lg text-gray-800 font-medium">
                ✓ No software to install. ✓ No website to rebuild. ✓ No intake staff to train. Just a link that does the qualifying you're currently doing live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
