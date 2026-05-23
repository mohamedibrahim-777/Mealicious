'use client'

import { motion } from 'framer-motion'

const WHATSAPP_NUMBER = '919876543210'
const WHATSAPP_MESSAGE = 'Hi Mealicious! I have a question about your products.'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M16.003 3C9.374 3 4 8.373 4 14.998c0 2.31.654 4.467 1.79 6.302L4 29l7.892-1.736A11.94 11.94 0 0 0 16.003 28C22.63 28 28 22.626 28 16.001 28 9.376 22.63 3 16.003 3Zm0 22.182a9.96 9.96 0 0 1-5.07-1.385l-.364-.216-4.682 1.03 1.046-4.555-.237-.374a9.95 9.95 0 0 1-1.523-5.282c0-5.515 4.487-10 10.005-10 5.518 0 10.005 4.485 10.005 10s-4.487 10.782-9.18 10.782Zm5.49-7.473c-.3-.15-1.778-.876-2.053-.976-.275-.1-.475-.15-.675.15-.2.3-.776.976-.95 1.176-.176.2-.35.225-.65.075-.3-.15-1.27-.468-2.42-1.494-.895-.798-1.498-1.784-1.674-2.084-.176-.3-.019-.462.132-.612.136-.135.3-.35.45-.525.15-.176.2-.3.3-.5.1-.2.05-.376-.025-.526-.075-.15-.675-1.625-.925-2.225-.244-.586-.493-.508-.675-.516l-.575-.011a1.1 1.1 0 0 0-.8.376c-.275.3-1.05 1.026-1.05 2.5 0 1.476 1.075 2.9 1.225 3.1.15.2 2.114 3.225 5.124 4.52.717.31 1.276.493 1.712.63.72.23 1.376.198 1.894.12.578-.086 1.778-.726 2.029-1.427.25-.7.25-1.302.176-1.426-.075-.124-.275-.2-.575-.35Z"
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
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe57] transition-colors"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60 animate-ping" />
      <WhatsAppIcon className="relative h-7 w-7" />
    </motion.a>
  )
}
