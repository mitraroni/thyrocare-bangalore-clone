import Image from 'next/image';

const HeroBanner = () => {
  const promoText = "ASSURED QUALITY • NEW & TRENDING • BEST PRICES • HASSLE-FREE • CERTIFIED • QUICK";

  return (
    <section className="font-sans bg-[#FFF8F0]">
      <style>
        {`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
          }
        `}
      </style>
      <div className="bg-[#E85A4F] text-white py-3 flex overflow-hidden whitespace-nowrap">
        <div className="flex min-w-full flex-shrink-0 animate-[marquee_40s_linear_infinite]">
          <span className="text-sm font-semibold uppercase tracking-wider px-4 flex-shrink-0">{promoText}</span>
          <span className="text-sm font-semibold uppercase tracking-wider px-4 flex-shrink-0">{promoText}</span>
        </div>
        <div className="flex min-w-full flex-shrink-0 animate-[marquee_40s_linear_infinite]">
          <span className="text-sm font-semibold uppercase tracking-wider px-4 flex-shrink-0">{promoText}</span>
          <span className="text-sm font-semibold uppercase tracking-wider px-4 flex-shrink-0">{promoText}</span>
        </div>
      </div>
      
      <div className="relative">
        {/* The wavy line background pattern is part of the design but the asset is not available. */}
        <div className="container mx-auto flex flex-col md:flex-row items-center py-8 md:py-12 px-5">
          <div className="md:w-1/2 lg:w-2/5 flex flex-col items-center md:items-start text-center md:text-left z-10">
            <p className="text-3xl font-bold text-zinc-900">Up To</p>
            
            <div className="flex items-end -ml-2" style={{ lineHeight: 0.85 }}>
              <span className="font-black text-zinc-900" style={{ fontSize: '180px' }}>40</span>
              <span className="font-bold text-zinc-900 mb-5 ml-2" style={{ fontSize: '60px' }}>% OFF</span>
            </div>

            <div className="-mt-8 space-y-2">
              <p className="font-bold text-zinc-900" style={{ fontSize: '50px' }}>Same</p>
              
              <div className="pl-16">
                <span className="font-bold text-[#E85A4F]" style={{ fontSize: '50px' }}>trust</span>
                <div className="h-1.5 bg-[#E85A4F] w-28"></div>
              </div>
              
              <p className="font-bold text-zinc-900" style={{ fontSize: '50px' }}>Better Prices!</p>
            </div>
            
            <button className="mt-8 bg-[#E85A4F] text-white font-semibold py-3 px-10 rounded-md text-lg hover:bg-[#D04846] transition-colors">
              Book Now
            </button>
          </div>

          <div className="md:w-1/2 lg:w-3/5 flex justify-center md:justify-end mt-10 md:mt-0">
            <Image
              src="https://www.thyrocare.com/_next/image?url=https%3A%2F%2Fweb-assets.thyrocare.com%2Fthyrocare-consumer%2F_next%2Fimages%2Fmicrosite%2FmicrositeBanner0.webp&w=3840&q=75"
              alt="advertisements"
              width={720}
              height={525}
              className="object-contain w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;