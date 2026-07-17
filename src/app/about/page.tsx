import { Users, Globe, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-zinc-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Our Mission</h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-zinc-300">
            We built this platform to democratize e-commerce. Connecting independent creators directly with passionate buyers, securely and instantly.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
              <Globe className="h-8 w-8 text-zinc-900" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Global Reach</h3>
            <p className="text-zinc-500 leading-relaxed">
              Our marketplace breaks down borders. Whether you are selling out of your garage or a massive warehouse, we put your products on the world stage.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-zinc-900" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Community First</h3>
            <p className="text-zinc-500 leading-relaxed">
              We empower our vendors. By providing enterprise-grade tools, deep analytics, and seamless fulfillment, we let you focus on what you do best: creating.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
              <Award className="h-8 w-8 text-zinc-900" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Unmatched Quality</h3>
            <p className="text-zinc-500 leading-relaxed">
              Every vendor is verified and every transaction is secured by Stripe. We maintain the highest standards of trust in digital commerce.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}