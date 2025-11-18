import GradientWrapper from '@/src/components/GradientWrapper';
import NavLink from '../NavLink';
import HeroImg from '@/public/images/active-requests.png';
import LayoutEffect from '@/src/components/LayoutEffect';
import EnlargeableImage from '../EnlargeableImage';

const Hero = () => (
  <section>
    <div className="custom-screen pt-28 pb-8">
      <LayoutEffect
        className="duration-1000 delay-300"
        isInviewState={{
          trueState: 'opacity-100',
          falseState: 'opacity-0',
        }}
      >
        <div>
          <GradientWrapper
            className="mt-16 sm:mt-28"
            wrapperclassname="max-w-3xl h-[250px] top-12 inset-0 sm:h-[300px] lg:h-[300px]"
          >
            <div className="space-y-5 max-w-3xl mx-auto text-center">
              <h1 className="text-4xl text-white bg-clip-text text-transparent bg-gradient-to-r font-extrabold mx-auto sm:text-5xl">
                Hotel&apos;s AI Voice Agent
              </h1>
              <h2 className="text-4xl text-white bg-clip-text text-transparent bg-gradient-to-r font-extrabold mx-auto sm:text-5xl">
                Available 24/7
              </h2>
              <p className="max-w-xl mx-auto text-gray-200 text-lg">
                Handle phone bookings, guest queries, and in-room service requests with a single
                intelligent voice agent. No hold times, no missed calls, no operational chaos.
              </p>
              <div className="flex justify-center font-medium text-sm py-10">
                <NavLink
                  href="/contact-us"
                  className="flex items-center text-white cta-btn  active:bg-purple-700 "
                >
                  Try the Voice Agent
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </NavLink>
              </div>
            </div>

            <LayoutEffect
              className="duration-1000 delay-300"
              isInviewState={{
                trueState: 'opacity-100',
                falseState: 'opacity-0 translate-y-6',
              }}
            >
              <div className="pt-6">
                <EnlargeableImage
                  alt="active-requests"
                  src={HeroImg}
                  className="rounded-lg border border-0 shadow-lg"
                />
              </div>
            </LayoutEffect>
          </GradientWrapper>
        </div>
      </LayoutEffect>
    </div>
    <hr className="w-[75%] mx-auto border-gray-700 mt-10" />
  </section>
);

export default Hero;
