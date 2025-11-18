import GradientWrapper from '@/src/components/GradientWrapper';
import LayoutEffect from '@/src/components/LayoutEffect';
import RequestDemoForm from '@/src/components/RequestDemoForm';

export default function Page() {
  return (
    <>
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
              <RequestDemoForm />
            </GradientWrapper>
          </div>
        </LayoutEffect>
      </div>
    </>
  );
}
