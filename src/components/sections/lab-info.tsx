'use client';

import { MapPin } from 'lucide-react';

const LabInfo = () => {
  return (
    <section className="w-full bg-background px-4">
      <div className="mx-auto w-full md:w-[85%]">
        <div className="relative flex flex-col rounded-md border border-[#D8DDE6] p-3 sm:mt-8 sm:flex-row">
          <h1 className="text-sm font-semibold leading-6 text-[#171717] sm:absolute sm:left-1/2 sm:top-1 sm:-translate-x-1/2 sm:whitespace-nowrap sm:text-center sm:text-xl">
            Thyrocare Aarogyam Center - Bangalore
          </h1>

          <div className="flex flex-1 flex-col gap-1 leading-6 sm:mt-8">
            <div className="hidden w-full items-center gap-4 sm:flex">
              <span className="text-sm font-semibold !leading-6 text-[#525252] sm:text-lg">Address</span>
              <a
                href="https://maps.app.goo.gl/RYDgxsov7yCn9qYB7"
                target="_blank"
                rel="noopener noreferrer"
                className="mr-auto flex items-center gap-2.5 text-sm font-medium text-[#4B73FF] hover:underline sm:text-base"
              >
                <MapPin className="h-[15px] w-[12px]" />
                View Location
              </a>
            </div>
            <p className="text-left text-xs font-medium text-[#546A8D] sm:text-base sm:leading-6">
              484, 10/1, Ground Floor, 10th Cross, Opposite To Manjushree Hotel Ittamadu Main Road, Bangalore -560085,{" "}
              <span className="block sm:inline-block">Pincode - 560085</span>
            </p>
            <div className="sm:hidden">
              <a
                href="https://maps.app.goo.gl/RYDgxsov7yCn9qYB7"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-2.5 text-sm font-medium text-[#4B73FF] hover:underline sm:text-base"
              >
                <MapPin className="h-[15px] w-[12px]" />
                View Location
              </a>
            </div>
          </div>
          
          <div className="my-1 mx-auto h-px w-full bg-[#D9D9D9] sm:mx-4 sm:mt-8 sm:h-20 sm:w-px"></div>

          <div className="flex flex-1 flex-col gap-1 sm:mt-8">
            <div className="hidden w-full items-center gap-2 sm:flex">
              <h2 className="mb-0 text-sm font-semibold !leading-6 text-[#525252] sm:text-lg">Timings</h2>
              <button className="ml-4 rounded bg-[#F16259] px-4 py-1 text-[10px] text-white">
                BOOK NOW
              </button>
            </div>
            <h2 className="text-sm font-semibold !leading-6 text-[#525252] sm:hidden">Timings</h2>
            <p className="text-xs font-normal leading-5 text-[#546A8D] sm:text-base">
              06:00 AM to 10:00 PM (Mon - Sat) Sun 06:00 AM to 01:30 PM
            </p>
            <p className="text-xs font-normal leading-5 text-[#F16259] sm:text-base">
              *These hours may vary from standard business hours.
            </p>
            <div className="mt-2 flex w-full sm:hidden">
              <button className="w-full rounded-md bg-[#F16259] px-6 py-3 text-sm font-semibold text-white">
                BOOK NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LabInfo;