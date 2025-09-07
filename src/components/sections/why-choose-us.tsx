import React from 'react';
import { ShieldCheck, ClipboardClock, BadgeCheck } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary md:h-14 md:w-14" />,
    title: "Quality and Trust assured",
    description: "Up to 95% samples processed in NABL-accredited labs",
  },
  {
    icon: <ClipboardClock className="h-8 w-8 text-primary md:h-14 md:w-14" />,
    title: "On-time Mantra",
    description: "*Reports in 6 hrs after samples reach the lab",
  },
  {
    icon: <BadgeCheck className="h-8 w-8 text-primary md:h-14 md:w-14" />,
    title: "Trusted by doctors",
    description: "9 out of 10 doctors trust that Thyrocare reports are accurate and reliable*",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="w-full bg-background p-4 flex flex-col gap-6 md:py-8 md:px-[72px]">
      <h2 className="text-[20px] font-semibold text-[#40464D] sm:text-[28px]">
        Why Choose Us
      </h2>
      <div className="flex flex-row items-stretch justify-between gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="w-[120px] flex-1 rounded-lg border bg-card p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.07)] md:w-auto"
          >
            <div className="flex h-full flex-col items-center gap-2 md:flex-row md:items-start md:gap-4">
              <div className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-lg bg-muted md:h-[110px] md:w-[110px]">
                {feature.icon}
              </div>
              <div className="flex flex-col text-center md:text-left">
                <p className="text-base font-medium leading-tight text-[#171717]">
                  {feature.title}
                </p>
                <p className="mt-1 hidden text-xs font-light text-[#40464D] md:block">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;