import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Get in touch</h1>
          <p className="text-lg text-zinc-500 mt-4 max-w-2xl mx-auto">
            Have a question about your order, or want to partner with us as a top-tier vendor? Our support team is here to help 24/7.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Contact Info Side */}
          <div className="bg-zinc-900 text-white p-10 md:w-2/5 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-zinc-400" />
                  <span>support@marketplace.com</span>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-zinc-400" />
                  <span>+1 (800) 123-4567</span>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-zinc-400" />
                  <span>123 Commerce Avenue<br/>San Francisco, CA 94105</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Side (UI Only placeholder) */}
          <div className="p-10 md:w-3/5">
            {/* THE FIX: Removed the onSubmit event handler */}
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">First Name</label>
                  <input type="text" className="w-full border border-zinc-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-zinc-900 focus:outline-none" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Last Name</label>
                  <input type="text" className="w-full border border-zinc-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-zinc-900 focus:outline-none" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900">Email Address</label>
                <input type="email" className="w-full border border-zinc-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-zinc-900 focus:outline-none" placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900">Message</label>
                <textarea rows={4} className="w-full border border-zinc-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-zinc-900 focus:outline-none resize-none" placeholder="How can we help you?"></textarea>
              </div>

              <Button type="button" className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-zinc-800">
                Send Message
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}