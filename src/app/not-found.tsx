import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-serif font-bold text-gold-500 mb-4">404</p>
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-navy-500 text-sm leading-relaxed mb-8">
          The page you are looking for does not exist. It may have been moved,
          deleted, or you may have followed a broken link.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={16} />
            Go to Homepage
          </Link>
          <Link href="/gallery" className="btn-outline">
            Browse Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
