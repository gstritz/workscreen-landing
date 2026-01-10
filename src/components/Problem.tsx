export default function Problem() {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Dark background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
            You Already Know{' '}
            <span className="text-red-500">How This Goes</span>
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-8">
          <p className="text-2xl md:text-3xl text-gray-200 font-bold leading-tight">
            Someone finds your website. Calls your office. Sends an email. They want to sue their employer.
          </p>
          <p className="text-2xl md:text-3xl text-red-400 font-black">
            Forty-five minutes later, you've learned:
          </p>
          
          <div className="bg-red-950/50 border-l-8 border-red-600 p-8 md:p-10 rounded-r-2xl my-10 shadow-2xl backdrop-blur-sm">
            <ul className="space-y-5 text-xl md:text-2xl">
              <li className="flex items-start">
                <span className="text-red-500 mr-4 mt-1 text-3xl font-black">×</span>
                <span className="text-red-100 font-bold">They were a 1099 contractor, not an employee</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-4 mt-1 text-3xl font-black">×</span>
                <span className="text-red-100 font-bold">The company has 11 people and they're claiming age discrimination</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-4 mt-1 text-3xl font-black">×</span>
                <span className="text-red-100 font-bold">This happened in 2019</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-4 mt-1 text-3xl font-black">×</span>
                <span className="text-red-100 font-bold">They have no emails, no witnesses, no documentation</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-4 mt-1 text-3xl font-black">×</span>
                <span className="text-red-100 font-bold">They already filed with the EEOC and got a right-to-sue letter — eighteen months ago</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-yellow-900/30 border-2 border-yellow-600/50 p-6 md:p-8 rounded-2xl">
            <p className="text-xl md:text-2xl text-yellow-200 font-bold italic leading-relaxed">
              Meanwhile, a solid retaliation case with damages and documentation sat in your voicemail. By the time you got to it, they'd already hired someone else.
            </p>
          </div>
          
          <div className="bg-black border-4 border-red-600 p-10 md:p-12 rounded-3xl shadow-2xl mt-12">
            <p className="text-3xl md:text-4xl font-black text-white leading-tight text-center">
              Employment lawyers lose <span className="text-red-500">hours every week</span> on inquiries that were <span className="text-red-500">dead on arrival</span>. You can't scale intake by adding more hours. <span className="text-red-500 underline decoration-4">The math breaks.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
