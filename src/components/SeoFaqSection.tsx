import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, BookOpen, Layers, Zap, CheckCircle2 } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Color Theory & Design Rules',
    question: 'What is the 60-30-10 color rule in UI and Interior Design?',
    answer: 'The 60-30-10 rule is a classic design guideline that ensures visual balance: 60% of the canvas consists of a dominant neutral or primary background color, 30% is a supporting secondary color (used for cards, containers, and typography), and 10% is a vibrant accent color reserved exclusively for interactive elements like CTA buttons, active state badges, and key alerts.',
  },
  {
    category: 'Color Harmonies',
    question: 'How do you create harmonious color schemes (Analogous, Complementary, Triadic)?',
    answer: 'Color harmonies are based on mathematical relationships on the 360° color wheel. Complementary colors sit 180° opposite each other for high energy; Analogous colors sit 30° adjacent for calming gradients; Triadic colors form an equilateral triangle (120° apart) for balanced vibrancy; and Monochromatic palettes use varying lightness/saturation of a single base hue.',
  },
  {
    category: 'Accessibility & WCAG',
    question: 'What are WCAG AA and AAA color contrast requirements for web applications?',
    answer: 'According to Web Content Accessibility Guidelines (WCAG 2.1), standard body text must achieve a minimum contrast ratio of 4.5:1 against its background to pass Level AA, and 7.0:1 to pass Level AAA. Large headings (18pt+ or bold 14pt+) require at least 3.0:1 for AA. PaletteLab calculates real-time relative luminance to ensure strict compliance.',
  },
  {
    category: 'Developer Formats',
    question: 'What is the difference between HEX, RGB, HSL, and CMYK color codes?',
    answer: 'HEX (#RRGGBB) is the hexadecimal shorthand for screen RGB channels (0-255). HSL (Hue 0-360°, Saturation 0-100%, Lightness 0-100%) reflects human perceptual intuition and is ideal for programmatic CSS generation. CMYK (Cyan, Magenta, Yellow, Key/Black) is a subtractive four-color model engineered specifically for physical printing and spot inks.',
  },
  {
    category: 'Export & Workflows',
    question: 'How do I export PaletteLab color schemes into Figma, Tailwind CSS, or Adobe Illustrator?',
    answer: 'PaletteLab provides 1-click developer exports: Copy Tailwind CSS v3/v4 extended theme configs, CSS Custom Properties (:root variables), JSON Design Tokens, or download high-resolution PNG swatch cards and Adobe ASE swatch files compatible with Photoshop and Illustrator.',
  },
];

export const SeoFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="seo-faq-knowledge-base" className="mt-16 pt-12 border-t border-neutral-200/80 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Color Theory & Accessibility Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500">
          Everything you need to know about color harmony, hex conversion, design systems, and WCAG accessibility standards.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isOpen ? 'border-indigo-300 ring-2 ring-indigo-50 shadow-xs' : 'border-neutral-200/90 hover:border-neutral-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    {faq.category}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                    {faq.question}
                  </h3>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : 'text-neutral-500'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
