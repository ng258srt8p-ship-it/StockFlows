import React from 'react';

const testimonials = [
  {
    quote: "StockFlows replaced our entire inventory workflow. The dynamic transfers alone saved us 12 hours a week.",
    author: "Sarah Chen",
    role: "Operations Lead, FreshCart",
    rating: 5,
  },
  {
    quote: "Migrating from Stocky was seamless. We didn't lose a single data point and the forecasting is leagues ahead.",
    author: "Marcus Williams",
    role: "Founder, Urban Gear Co.",
    rating: 5,
  },
  {
    quote: "The camera scan feature is a game-changer for our warehouse team. Real-time updates, zero errors.",
    author: "Priya Patel",
    role: "Inventory Manager, Bloom & Branch",
    rating: 5,
  },
];

const stats = [
  { value: '500+', label: 'Merchants' },
  { value: '2M+', label: 'Inventory Items Tracked' },
  { value: '99.9%', label: 'Uptime' },
];

export const SocialProof: React.FC = () => {
  return (
    <section className="py-24 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* G2 Rating Badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full px-6 py-3 mb-8">
            <div className="flex text-[var(--accent)]">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i} className="text-lg">{star}</span>
              ))}
            </div>
            <span className="text-[var(--text-primary)] font-semibold">Rated 4.8/5 on G2</span>
          </div>
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Trusted by Growing Merchants
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            See why merchants are making the switch to StockFlows
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-8 hover:border-[var(--accent)]/30 transition-colors"
            >
              <div className="flex text-[var(--accent)] mb-4">
                {'★'.repeat(testimonial.rating).split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="text-[var(--text-primary)] text-lg mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-[var(--text-primary)] font-semibold">{testimonial.author}</p>
                <p className="text-[var(--text-secondary)] text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold text-[var(--accent)] mb-2">{stat.value}</div>
              <div className="text-[var(--text-secondary)] text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
