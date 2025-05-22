import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-12 border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <nav className="flex gap-4">
            <Link
              href="/sitemap"
              className="text-accent hover:text-foreground transition-colors"
            >
              מפת אתר
            </Link>
            <Link
              href="/terms-and-privacy"
              className="text-accent hover:text-foreground transition-colors"
            >
              תנאי שימוש ופרטיות
            </Link>
          </nav>

          {/* <div className="flex items-center gap-4">
            <a
              href="https://twitter.com/share"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-foreground transition-colors"
              aria-label="שתף ב-X"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733-16z" />
                <path d="M4 20l6.768-6.768" />
                <path d="M19.5 4l-6.768 6.768" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-foreground transition-colors"
              aria-label="שתף בפייסבוק"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-foreground transition-colors"
              aria-label="שתף באינסטגרם"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://api.whatsapp.com/send?text="
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-foreground transition-colors"
              aria-label="שתף בוואטסאפ"
            >
              <svg width="20" height="20" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M26,0C11.663,0,0,11.663,0,26c0,4.891,1.359,9.639,3.937,13.762C2.91,43.36,1.055,50.166,1.035,50.237 c-0.096,0.352,0.007,0.728,0.27,0.981c0.263,0.253,0.643,0.343,0.989,0.237L12.6,48.285C16.637,50.717,21.26,52,26,52 c14.337,0,26-11.663,26-26S40.337,0,26,0z M26,50c-4.519,0-8.921-1.263-12.731-3.651c-0.161-0.101-0.346-0.152-0.531-0.152 c-0.099,0-0.198,0.015-0.294,0.044l-8.999,2.77c0.661-2.413,1.849-6.729,2.538-9.13c0.08-0.278,0.035-0.578-0.122-0.821 C3.335,35.173,2,30.657,2,26C2,12.767,12.767,2,26,2s24,10.767,24,24S39.233,50,26,50z" />
                <path d="M42.985,32.126c-1.846-1.025-3.418-2.053-4.565-2.803c-0.876-0.572-1.509-0.985-1.973-1.218 c-1.297-0.647-2.28-0.19-2.654,0.188c-0.047,0.047-0.089,0.098-0.125,0.152c-1.347,2.021-3.106,3.954-3.621,4.058 c-0.595-0.093-3.38-1.676-6.148-3.981c-2.826-2.355-4.604-4.61-4.865-6.146C20.847,20.51,21.5,19.336,21.5,18 c0-1.377-3.212-7.126-3.793-7.707c-0.583-0.582-1.896-0.673-3.903-0.273c-0.193,0.039-0.371,0.134-0.511,0.273 c-0.243,0.243-5.929,6.04-3.227,13.066c2.966,7.711,10.579,16.674,20.285,18.13c1.103,0.165,2.137,0.247,3.105,0.247 c5.71,0,9.08-2.873,10.029-8.572C43.556,32.747,43.355,32.331,42.985,32.126z" />
              </svg>
            </a>
          </div> */}

          <div className="text-sm text-accent">
            © {currentYear} בְּלוֹגנָבוֹן. כל הזכויות שמורות.
          </div>
        </div>
      </div>
    </footer>
  )
}
