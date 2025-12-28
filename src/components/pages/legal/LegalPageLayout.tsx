'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

type Section = {
  title: string;
  content: string | string[];
};

type LegalPageLayoutProps = {
  badge?: string;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  sections: Section[];
};

export function LegalPageLayout({
  badge = 'Legal',
  title,
  subtitle,
  lastUpdated,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            {lastUpdated && (
              <span className="text-xs text-foreground/60">
                Last updated: <span className="font-semibold text-foreground/80">{lastUpdated}</span>
              </span>
            )}
          </div>

          <div className="mt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {badge}
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              {title}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-foreground/70 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid gap-6">
          {sections.map((s) => (
            <section
              key={s.title}
              className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{s.title}</h2>
              {typeof s.content === 'string' ? (
                <p className="mt-3 text-sm sm:text-base text-foreground/70 leading-relaxed">
                  {s.content}
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm sm:text-base text-foreground/70 leading-relaxed">
                  {s.content.map((line, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-foreground">Need help?</h3>
            <p className="mt-2 text-sm sm:text-base text-foreground/70">
              If you have questions about these policies, please reach out to our support team.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
              >
                Contact Support
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-border bg-surface text-foreground font-semibold hover:bg-muted/30 transition"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


