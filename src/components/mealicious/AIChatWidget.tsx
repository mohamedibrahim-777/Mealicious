'use client'

import { motion } from 'framer-motion'

const WHATSAPP_NUMBER = '917397075166'
const WHATSAPP_MESSAGE = 'Hi Mealicious! I have a question about your products.'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 175.216 175.552"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wa-bg" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
      </defs>
      <path
        fill="#fff"
        d="M147.516 27.516C131.275 11.252 109.679 2.296 86.704 2.286 39.357 2.286.823 40.81.803 88.169c-.006 15.143 3.95 29.926 11.467 42.957L.078 175.216l45.122-11.83c12.554 6.846 26.683 10.456 41.06 10.461h.035c47.343 0 85.88-38.532 85.901-85.892.01-22.945-8.913-44.535-25.137-60.793z"
      />
      <path
        fill="url(#wa-bg)"
        d="M86.74 16.703c-39.395 0-71.451 32.054-71.467 71.45-.006 13.494 3.769 26.628 10.916 38.005l1.697 2.7-7.215 26.34 27.022-7.087 2.609 1.547c10.973 6.515 23.555 9.95 36.387 9.957h.029c39.366 0 71.421-32.057 71.437-71.453.008-19.097-7.426-37.054-20.929-50.566-13.503-13.512-31.452-20.953-50.486-20.963z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M65.49 49.891c-1.61-3.579-3.302-3.651-4.832-3.713l-4.117-.05c-1.43 0-3.755.537-5.722 2.683-1.968 2.146-7.514 7.34-7.514 17.903s7.693 20.77 8.766 22.202c1.073 1.43 14.85 23.794 36.671 32.39 18.137 7.146 21.825 5.725 25.76 5.368 3.935-.358 12.7-5.193 14.49-10.205 1.79-5.012 1.79-9.308 1.253-10.207-.537-.895-1.968-1.43-4.116-2.504-2.146-1.073-12.7-6.265-14.668-6.98-1.968-.715-3.398-1.073-4.832 1.075-1.43 2.144-5.541 6.978-6.794 8.41-1.253 1.434-2.504 1.612-4.65.538-2.149-1.075-9.066-3.344-17.27-10.661-6.385-5.692-10.694-12.726-11.946-14.873-1.253-2.146-.134-3.308.945-4.378.962-.961 2.146-2.504 3.22-3.757 1.073-1.253 1.43-2.146 2.146-3.578.715-1.432.358-2.685-.18-3.758-.535-1.075-4.696-11.65-6.594-15.91z"
      />
    </svg>
  )
}

export default function AIChatWidget() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60 animate-ping" />
      <WhatsAppIcon className="relative h-14 w-14" />
    </motion.a>
  )
}
