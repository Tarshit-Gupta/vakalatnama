<template>
  <AppLayout title="Upgrade">

    <!-- Payment Coming Soon Modal -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
          <div class="modal-card payment-modal">
            <div class="modal-glow"></div>
            <div style="font-size:2.5rem;margin-bottom:14px;">💳</div>
            <h3 class="modal-title">Payment Coming Soon</h3>
            <p class="modal-body">
              Automated payment integration is being set up.
              To activate Premium immediately, contact us at:
            </p>
            <a href="mailto:support@vakalatnama.in" class="support-link">
              support@vakalatnama.in
            </a>
            <p class="modal-body" style="margin-top:10px;font-size:0.8rem;">
              We'll activate your account within 24 hours of payment confirmation.
            </p>
            <button class="btn btn-gold" style="width:100%;justify-content:center;margin-top:20px;" @click="showPaymentModal = false">
              Got it
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <div class="upgrade-page">

      <!-- ─────────────────────────────────────
           HERO
      ──────────────────────────────────────── -->
      <div class="hero-section">
        <div class="hero-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Premium Plan
        </div>
        <h1 class="hero-title">
          Upgrade to <span class="gold-shimmer">Premium</span>
        </h1>
        <p class="hero-sub">
          AI-powered suggestions for every field.<br>
          Unlimited drafts. Professional legal assistance.
        </p>
      </div>

      <!-- ─────────────────────────────────────
           PRICING CARD
      ──────────────────────────────────────── -->
      <div class="pricing-wrapper">
        <div class="pricing-card">
          <div class="pricing-glow"></div>

          <!-- Billing toggle -->
          <div class="billing-toggle">
            <button
              class="toggle-pill"
              :class="{ active: billing === 'monthly' }"
              @click="billing = 'monthly'"
            >Monthly</button>
            <button
              class="toggle-pill"
              :class="{ active: billing === 'yearly' }"
              @click="billing = 'yearly'"
            >
              Yearly
              <span class="save-tag">Save 17%</span>
            </button>
          </div>

          <!-- Price -->
          <div class="price-display">
            <transition name="price-flip" mode="out-in">
              <div :key="billing" class="price-inner">
                <span class="price-currency">₹</span>
                <span class="price-amount">{{ billing === 'monthly' ? '999' : '9,999' }}</span>
                <span class="price-period">/ {{ billing === 'monthly' ? 'month' : 'year' }}</span>
              </div>
            </transition>
            <div v-if="billing === 'yearly'" class="price-savings">
              Save ₹1,989 vs monthly
            </div>
          </div>

          <!-- Features list -->
          <ul class="features-list">
            <li v-for="f in premiumFeatures" :key="f.text" class="feature-item">
              <span class="feature-check" :class="f.soon ? 'feature-soon' : ''">
                {{ f.soon ? '🔜' : '✅' }}
              </span>
              <span class="feature-text" :class="{ 'text-muted-feat': f.soon }">
                {{ f.text }}
                <span v-if="f.soon" class="soon-badge">Soon</span>
              </span>
            </li>
          </ul>

          <!-- CTA button -->
          <button class="btn btn-gold btn-xl cta-btn" @click="showPaymentModal = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Get Premium Now
          </button>

          <p class="cta-sub">No commitment — cancel anytime</p>
        </div>

        <!-- Free plan comparison -->
        <div class="free-card">
          <div class="free-card-header">
            <span class="free-title">Free Plan — What you have now</span>
          </div>
          <ul class="free-features">
            <li v-for="f in freeFeatures" :key="f.text" class="free-feature-item">
              <span>{{ f.icon }}</span>
              <span>{{ f.text }}</span>
            </li>
          </ul>
          <router-link to="/dashboard" class="free-continue-link">
            Continue with Free →
          </router-link>
        </div>
      </div>

      <!-- ─────────────────────────────────────
           TESTIMONIALS
      ──────────────────────────────────────── -->
      <div class="section-header-row">
        <h2 class="section-title-text">Trusted by Advocates Across India</h2>
        <p class="section-sub-text">See what our Premium members say</p>
      </div>

      <div class="testimonials-grid">
        <div v-for="t in testimonials" :key="t.name" class="testimonial-card card">
          <div class="stars">
            <span v-for="i in 5" :key="i" class="star">★</span>
          </div>
          <p class="testimonial-text">"{{ t.quote }}"</p>
          <div class="testimonial-meta">
            <div class="testimonial-avatar">{{ t.initials }}</div>
            <div>
              <div class="testimonial-name">{{ t.name }}</div>
              <div class="testimonial-role">{{ t.role }}, {{ t.city }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─────────────────────────────────────
           FAQ
      ──────────────────────────────────────── -->
      <div class="section-header-row">
        <h2 class="section-title-text">Frequently Asked Questions</h2>
      </div>

      <div class="faq-list">
        <div
          v-for="(faq, idx) in faqs"
          :key="idx"
          class="faq-item"
          :class="{ open: openFaq === idx }"
          @click="openFaq = openFaq === idx ? null : idx"
        >
          <div class="faq-question">
            <span>{{ faq.q }}</span>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
              class="faq-chevron"
              :style="{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0)' }"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <transition name="faq-expand">
            <div v-if="openFaq === idx" class="faq-answer">
              <p>{{ faq.a }}</p>
            </div>
          </transition>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="bottom-cta">
        <h2 class="bottom-cta-title">Ready to work smarter?</h2>
        <p class="bottom-cta-sub">Join hundreds of advocates already using VakalatNama Premium</p>
        <button class="btn btn-gold btn-xl" @click="showPaymentModal = true">
          ✨ Get Premium Now — ₹999/month
        </button>
      </div>

    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const showPaymentModal = ref(false)
const billing          = ref('monthly')
const openFaq          = ref(null)

const premiumFeatures = [
  { text: 'Unlimited draft generations',            soon: false },
  { text: '10 AI field suggestions per day',        soon: false },
  { text: 'AI case type detection',                 soon: false },
  { text: 'AI law suggestions',                     soon: false },
  { text: 'AI facts completeness analysis',         soon: false },
  { text: 'Priority support',                       soon: false },
  { text: 'Version history',                        soon: false },
  { text: 'PDF export',                             soon: true  },
  { text: 'Client portal',                          soon: true  },
]

const freeFeatures = [
  { icon: '✅', text: '5 draft generations per day' },
  { icon: '✅', text: 'Word document export' },
  { icon: '✅', text: 'Up to 10 clients' },
  { icon: '❌', text: 'AI field suggestions' },
  { icon: '❌', text: 'Unlimited drafts' },
  { icon: '❌', text: 'Priority support' },
]

const testimonials = [
  {
    quote: "VakalatNama Premium cut my drafting time in half. The AI suggestions for applicable acts alone save me hours every week.",
    name: 'Adv. Ravi Shankar',
    role: 'Senior Advocate',
    city: 'New Delhi',
    initials: 'RS',
  },
  {
    quote: "The AI fact completeness checker is brilliant. It caught missing details in my petition that would have caused issues during filing.",
    name: 'Adv. Priya Mehta',
    role: 'Criminal Lawyer',
    city: 'Mumbai',
    initials: 'PM',
  },
  {
    quote: "Unlimited drafts is a game changer for a busy practice. I no longer worry about hitting daily limits during peak season.",
    name: 'Adv. Karan Bhatia',
    role: 'Civil Advocate',
    city: 'Bengaluru',
    initials: 'KB',
  },
]

const faqs = [
  {
    q: 'How does AI Assist work?',
    a: 'AI Assist analyzes the content you enter for each field and provides real-time suggestions powered by Gemini AI. For case type, it verifies your selection; for facts, it checks completeness; for relief and acts, it suggests improvements based on your case details.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, absolutely. There are no long-term commitments. You can cancel your Premium subscription at any time, and you will retain access until the end of your billing period.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All your case data is stored in Supabase with row-level security enabled. Only you can access your cases. No case data is stored by the AI provider — it is only used to generate responses and is immediately discarded.',
  },
  {
    q: 'What happens when the draft limit is reached on the free plan?',
    a: 'On the free plan, you can generate up to 5 AI drafts per day. Once this limit is reached, you will see an upgrade prompt. Your limit resets automatically at midnight IST. Upgrading to Premium removes this restriction entirely.',
  },
]
</script>

<style scoped>
/* ── Page ──────────────────────────────────────── */
.upgrade-page {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 52px;
  padding-bottom: 64px;
}

/* ── Hero ──────────────────────────────────────── */
.hero-section { text-align: center; padding-top: 16px; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 16px;
  background: rgba(201,168,76,0.12);
  border: 1px solid rgba(201,168,76,0.3);
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-gold);
  margin-bottom: 20px;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.15;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.gold-shimmer {
  color: var(--accent-gold);
  background: linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C);
  background-size: 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}
@keyframes shimmer { to { background-position: 200% center; } }

.hero-sub {
  font-size: 1.0625rem;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 520px;
  margin: 0 auto;
}

/* ── Pricing wrapper ───────────────────────────── */
.pricing-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* ── Pricing card ──────────────────────────────── */
.pricing-card {
  position: relative;
  background: var(--bg-surface);
  border: 1.5px solid rgba(201,168,76,0.4);
  border-radius: var(--radius-xl);
  padding: 36px 40px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 0 40px rgba(201,168,76,0.12), var(--shadow-lg);
  overflow: hidden;
}
.pricing-glow {
  position: absolute;
  top: -60px; left: 50%;
  transform: translateX(-50%);
  width: 280px; height: 180px;
  background: radial-gradient(ellipse, rgba(201,168,76,0.18), transparent 70%);
  pointer-events: none;
}

/* Toggle */
.billing-toggle {
  display: inline-flex;
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  border-radius: 99px;
  padding: 4px;
  gap: 2px;
  margin-bottom: 28px;
}
.toggle-pill {
  padding: 7px 20px;
  border-radius: 99px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.toggle-pill.active {
  background: var(--accent-gold);
  color: #0A0E1A;
}
.save-tag {
  background: rgba(34,197,94,0.2);
  color: var(--success);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 99px;
}

/* Price */
.price-display { margin-bottom: 28px; text-align: center; }
.price-inner   { display: flex; align-items: baseline; justify-content: center; gap: 2px; }
.price-currency { font-size: 1.5rem; font-weight: 700; color: var(--accent-gold); }
.price-amount   { font-size: 3.5rem; font-weight: 900; color: var(--accent-gold); line-height: 1; }
.price-period   { font-size: 1rem; color: var(--text-muted); margin-left: 4px; }
.price-savings  { font-size: 0.8125rem; color: var(--success); margin-top: 6px; font-weight: 500; }

/* Price flip animation */
.price-flip-enter-active, .price-flip-leave-active { transition: all 0.2s ease; }
.price-flip-enter-from { opacity: 0; transform: translateY(-10px); }
.price-flip-leave-to   { opacity: 0; transform: translateY(10px); }

/* Features */
.features-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
.feature-item  { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
.feature-check { font-size: 1rem; flex-shrink: 0; }
.feature-text  { color: var(--text-subtle); }
.text-muted-feat { color: var(--text-muted); }
.soon-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.6rem;
  font-weight: 700;
  background: rgba(99,102,241,0.15);
  color: #818CF8;
  padding: 1px 6px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* CTA */
.cta-btn {
  width: 100%;
  justify-content: center;
  font-size: 1.0625rem;
  padding: 16px 24px;
  box-shadow: 0 4px 20px rgba(201,168,76,0.4);
}
.cta-sub { text-align: center; font-size: 0.78rem; color: var(--text-muted); margin-top: 12px; }

/* btn-xl */
.btn-xl {
  padding: 15px 32px !important;
  font-size: 1rem !important;
}

/* ── Free card ─────────────────────────────────── */
.free-card {
  max-width: 480px;
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
}
.free-card-header  { margin-bottom: 14px; }
.free-title        { font-size: 0.8125rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.free-features     { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.free-feature-item { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; color: var(--text-subtle); }
.free-continue-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.free-continue-link:hover { color: var(--text-primary); }

/* ── Section headers ───────────────────────────── */
.section-header-row { text-align: center; }
.section-title-text { font-size: 1.5rem; margin-bottom: 6px; }
.section-sub-text   { font-size: 0.9rem; color: var(--text-muted); }

/* ── Testimonials ──────────────────────────────── */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.testimonial-card { padding: 22px; display: flex; flex-direction: column; gap: 12px; }
.stars { display: flex; gap: 3px; }
.star  { color: var(--accent-gold); font-size: 0.9rem; }
.testimonial-text { font-size: 0.875rem; color: var(--text-subtle); line-height: 1.7; font-style: italic; flex: 1; }
.testimonial-meta { display: flex; align-items: center; gap: 10px; }
.testimonial-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--accent-gold-dim);
  border: 1px solid rgba(201,168,76,0.2);
  color: var(--accent-gold);
  font-size: 0.8rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.testimonial-name { font-size: 0.8125rem; font-weight: 700; color: var(--text-primary); }
.testimonial-role { font-size: 0.75rem; color: var(--text-muted); }

/* ── FAQ ───────────────────────────────────────── */
.faq-list { display: flex; flex-direction: column; gap: 10px; }
.faq-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}
.faq-item:hover,
.faq-item.open { border-color: rgba(201,168,76,0.35); }

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  user-select: none;
}
.faq-chevron { transition: transform 0.25s ease; flex-shrink: 0; }
.faq-answer  { padding: 0 20px 16px; }
.faq-answer p { font-size: 0.875rem; color: var(--text-subtle); line-height: 1.75; margin: 0; }

.faq-expand-enter-active, .faq-expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.faq-expand-enter-from, .faq-expand-leave-to       { opacity: 0; max-height: 0; }
.faq-expand-enter-to, .faq-expand-leave-from       { opacity: 1; max-height: 300px; }

/* ── Bottom CTA ─────────────────────────────────── */
.bottom-cta {
  text-align: center;
  padding: 40px 24px;
  background: var(--bg-surface);
  border: 1.5px solid rgba(201,168,76,0.25);
  border-radius: var(--radius-xl);
}
.bottom-cta-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 8px; }
.bottom-cta-sub   { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 24px; }

/* ── Modal ─────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 20px;
}
.modal-card {
  position: relative;
  background: var(--bg-surface);
  border: 1.5px solid rgba(201,168,76,0.35);
  border-radius: var(--radius-xl);
  padding: 36px 32px;
  max-width: 400px; width: 100%;
  text-align: center;
  box-shadow: 0 0 40px rgba(201,168,76,0.1), var(--shadow-lg);
  overflow: hidden;
}
.modal-glow {
  position: absolute;
  top: -40px; left: 50%;
  transform: translateX(-50%);
  width: 200px; height: 120px;
  background: radial-gradient(ellipse, rgba(201,168,76,0.15), transparent 70%);
  pointer-events: none;
}
.modal-title   { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
.modal-body    { font-size: 0.875rem; color: var(--text-subtle); line-height: 1.7; margin: 0; }
.support-link  {
  display: inline-block;
  margin: 14px 0 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-gold);
  text-decoration: none;
}
.support-link:hover { text-decoration: underline; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; }

/* ── Responsive ─────────────────────────────────── */
@media (max-width: 720px) {
  .testimonials-grid { grid-template-columns: 1fr; }
  .pricing-card      { padding: 24px 20px; }
}
@media (max-width: 480px) {
  .hero-title { font-size: 1.75rem; }
}
</style>
