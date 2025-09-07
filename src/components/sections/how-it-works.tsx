import Image from "next/image";

const stepsData = [
  {
    step: "Step 1",
    title: "Browse Packages",
    description: "Explore our wide range of Diagnostic Packages",
    imageUrl: "https://www.thyrocare.com/_next/image?url=%2Fimages%2Fmicrosite%2FhowItWorks%2Fstep1.png&w=828&q=75",
    altText: "A person browsing diagnostic packages on a laptop screen",
  },
  {
    step: "Step 2",
    title: "Submit your Details",
    description: "Fill out the contact form with your basic information",
    imageUrl: "https://www.thyrocare.com/_next/image?url=%2Fimages%2Fmicrosite%2FhowItWorks%2Fstep2.png&w=828&q=75",
    altText: "A person submitting details on a form on a laptop",
  },
  {
    step: "Step 3",
    title: "Arrange a Callback",
    description: "Rest Assured that our team will contact you for test booking",
    imageUrl: "https://www.thyrocare.com/_next/image?url=%2Fimages%2Fmicrosite%2FhowItWorks%2Fstep3.png&w=828&q=75",
    altText: "A person holding a smartphone to arrange a callback",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="w-full bg-background py-8 px-4 md:py-16 md:px-14">
      <div className="container mx-auto flex flex-col items-center">
        <p className="text-center text-sm font-light text-text-light">
          It’s really easy
        </p>
        <h2 className="pt-2 pb-6 text-center text-[20px] font-semibold text-text-dark sm:text-[28px]">
          Here is how it works...
        </h2>
        <div className="grid w-full max-w-6xl grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
          {stepsData.map((item) => (
            <div key={item.step} className="flex flex-col">
              <div className="relative mb-6 h-auto w-full">
                <Image
                  src={item.imageUrl}
                  alt={item.altText}
                  width={405}
                  height={241}
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium text-text-medium">
                  {item.step}
                </p>
                <h4 className="text-base font-bold text-text-dark">
                  {item.title}
                </h4>
                <p className="text-sm font-light text-text-light">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;