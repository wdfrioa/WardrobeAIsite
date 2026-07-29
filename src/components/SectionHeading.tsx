"use client";

import ScrollReveal from "./ScrollReveal";

interface Props {
  badge?: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ badge, title, subtitle }: Props) {
  return (
    <div className="text-center mb-16 sm:mb-20">
      {badge && (
        <ScrollReveal>
          <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium text-clay-dark mb-6">
            <span className="w-1.5 h-1.5 bg-clay rounded-full" />
            {badge}
          </span>
        </ScrollReveal>
      )}
      <ScrollReveal delay={0.1}>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-ink tracking-tight leading-tight">
          {title}
        </h2>
      </ScrollReveal>
      {subtitle && (
        <ScrollReveal delay={0.2}>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}
