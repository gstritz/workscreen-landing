export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Get Your Link',
      description: 'Sign up and we generate a branded WorkScreen URL for your firm. Takes two minutes. No technical setup.',
      icon: '🔗',
    },
    {
      number: '2',
      title: 'Share It Everywhere',
      description: 'Send the link to anyone who contacts you about a potential employment case. Add it to your email signature, website contact page, intake voicemail, or Google Business profile.',
      icon: '📤',
    },
    {
      number: '3',
      title: 'Review Qualified Inquiries',
      description: 'WorkScreen asks the questions you\'d ask anyway - employment relationship, timeline, employer size, documentation, what happened. Qualified inquiries hit your inbox. Unqualified ones get a polite explanation and never waste your time.',
      icon: '✅',
    },
  ]

  return (
    <section className="relative py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Three Simple{' '}
            <span className="text-primary-600">Steps</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-premium-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 to-primary-400 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-400 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-premium group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
