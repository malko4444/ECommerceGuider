import Link from "next/link";
import AboutProject from "./component/AboutProject";
import Footer from "./component/Footet";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center text-center">
        {/* Background Image with overlay */}
        <img
          src="/assets/images/4.jpg"
          alt="Ecommerce illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-br from-black/70 via-teal-700/40 to-black/70" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
            Launch & Grow Your <span className="text-orange-400">Ecommerce</span> Journey
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-200 drop-shadow">
            Empowering entrepreneurs in Pakistan with AI-powered tools, guides, and insights to succeed in online business.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login">
              <button className="px-8 py-3 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition shadow-lg">
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-8 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition shadow-lg">
                Signup
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Project Section */}
      <div className="mt-7">
        <AboutProject />
        <Footer/>
      </div>
      
    </div>
  );
}
