export default function Customization() {
  const caseTypes = [
    'Discrimination (Title VII, ADA, ADEA, Pregnancy, State law)',
    'Retaliation and whistleblower claims',
    'Sexual harassment and hostile work environment',
    'Wrongful termination',
    'Wage and hour / FLSA',
    'FMLA and leave interference',
    'Non-compete and trade secret disputes',
  ]

  return (
    <section className="relative py-20 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Your Practice.{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Your Filters.
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-gradient-to-br from-primary-50/30 to-blue-50/30 rounded-3xl p-8 md:p-12 shadow-premium border border-primary-100">
          <p className="text-xl text-gray-800 mb-8 font-medium text-center">
            Not every employment lawyer handles every case type. Configure WorkScreen for what you actually take:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {caseTypes.map((caseType, index) => (
              <div 
                key={index} 
                className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300"
              >
                <span className="text-primary-600 mr-3 text-xl font-bold">⚙️</span>
                <span className="text-gray-700 font-medium">{caseType}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 border border-primary-200">
            <p className="text-lg text-gray-800 font-semibold text-center">
              Set your state coverage. Set your employer-size minimums. WorkScreen screens accordingly.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
