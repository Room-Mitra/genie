import GradientWrapper from '@/src/components/GradientWrapper';
import HeroImg from '@/public/images/active-requests.png';
import LayoutEffect from '@/src/components/LayoutEffect';
import EnlargeableImage from '../EnlargeableImage';
import { TryVoiceAgent } from '../TryVoiceAgent/entry';

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
          <GradientWrapper className="mt-16 sm:mt-28" wrapperclassname="max-w-3xl top-12 inset-0">
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

              {/* CTA block: Request callback OR try web agent */}
              <div className="mt-12 space-y-4">

                <div className="font-bold tracking-[0.25rem] text-gray-200">
                  EXPERIENCE THE VOICE AGENT IN TWO WAYS
                </div>
                

                {/* Callback widget */}
                <div data-roommitra-callback-anchor className="w-full max-w-xl mx-auto" />

                {/* OR separator */}
                <div className="flex items-center justify-center gap-3 text-sm font-semibold tracking-[0.15em] uppercase text-gray-300">
                  <span className="h-px w-25 bg-gray-300 mx-3" />
                  <span>or</span>
                  <span className="h-px w-25 bg-gray-300 mx-3 " />
                </div>

                {/* Try voice agent button */}
                <div className="flex justify-center">
                  <TryVoiceAgent />
                </div>
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
                  loading={'lazy'}
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
