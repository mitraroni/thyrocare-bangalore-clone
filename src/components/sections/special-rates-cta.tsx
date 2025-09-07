import React from 'react';

const SpecialRatesCta = () => {
  return (
    <section aria-labelledby="special-rates-heading" className="w-full bg-secondary">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-10 text-center md:flex-row md:px-14 md:text-left">
        <div>
          <h2 id="special-rates-heading" className="text-3xl font-bold text-secondary-foreground">
            Unlock Special Rates
          </h2>
          <p className="mt-2 text-base text-secondary-foreground">
            Get a Health Checkup along with FREE Home Sample Collection
          </p>
        </div>
        <button className="flex-shrink-0 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm transition-all hover:bg-secondary-red hover:shadow-md">
          BOOK NOW
        </button>
      </div>
    </section>
  );
};

export default SpecialRatesCta;