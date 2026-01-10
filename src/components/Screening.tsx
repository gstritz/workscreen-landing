export default function Screening() {
  const criteria = [
    'Employment relationship — Employee vs. independent contractor',
    'Timing — Statute of limitations and agency filing deadlines',
    'Employer characteristics — Company size for Title VII, ADEA, ADA coverage',
    'Protected class / adverse action — Basic elements of a viable claim',
    'Documentation — What evidence exists',
    'Prior legal action — EEOC status, existing representation, prior lawsuits',
  ]

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            We Screen For{' '}
            <span className="text-primary-600">the Basics</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-premium border border-gray-100">
          <p className="text-xl text-gray-800 mb-8 font-medium text-center">
            WorkScreen checks for the threshold issues that kill most employment inquiries:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {criteria.map((criterion, index) => (
              <div 
                key={index} 
                className="flex items-start p-4 bg-gradient-to-br from-primary-50/50 to-transparent rounded-xl border border-primary-100 hover:border-primary-300 transition-all duration-300"
              >
                <span className="text-primary-600 mr-3 mt-1 text-xl font-bold">✓</span>
                <span className="text-gray-700 font-medium">{criterion}</span>
              </div>
            ))}
          </div>
          <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-r-lg">
            <p className="text-lg text-gray-800 font-semibold">
              You get a summary of their answers plus any red flags. You decide whether to follow up.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
