export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030303] py-6">
      <div className="container mx-auto px-5">
        <div className="text-center">
          <div className="inline-block text-sm font-medium bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] text-transparent bg-clip-text animate-pulse relative">
            <span className="relative">
              © {new Date().getFullYear()} NEXUS. All rights reserved.
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine bg-[length:200%_100%]"></span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
