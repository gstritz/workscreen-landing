export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-lg">
          Questions? Contact us at{' '}
          <a 
            href="mailto:contact@workchat.law" 
            className="text-primary-400 hover:text-primary-300 font-semibold transition-colors duration-200 hover:underline"
          >
            contact@workchat.law
          </a>
        </p>
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} WorkScreen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
