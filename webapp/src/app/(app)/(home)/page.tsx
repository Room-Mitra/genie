"use client";

// import { PaymentsOverview } from "@/components/Charts/payments-overview";
// import { UsedDevices } from "@/components/Charts/used-devices";
// import { WeeksProfit } from "@/components/Charts/weeks-profit";
// import { TopChannels } from "@/components/Tables/top-channels";
// import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
// import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
// import { Suspense, useLayoutEffect } from "react";
// import { ChatsCard } from "./_components/chats-card";
// import { OverviewCardsGroup } from "./_components/overview-cards";
// import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
// import { RegionLabels } from "./_components/region-labels";
import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default function Home({ searchParams }: PropsType) {
  // const { selected_time_frame } = await searchParams;
  // const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  const router = useRouter();

  useLayoutEffect(() => {
    router.push("/requests/active");
  }, []);

  // return (
  //   <>
  //     <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
  //       <PaymentsOverview
  //         className="col-span-12 xl:col-span-7"
  //         key={extractTimeFrame("payments_overview")}
  //         timeFrame={extractTimeFrame("payments_overview")?.split(":")[1]}
  //       />

  //       <WeeksProfit
  //         key={extractTimeFrame("weeks_profit")}
  //         timeFrame={extractTimeFrame("weeks_profit")?.split(":")[1]}
  //         className="col-span-12 xl:col-span-5"
  //       />
  //     </div>
  //     <div className="mt-4 md:mt-6 2xl:mt-9">
  //       <Suspense fallback={<OverviewCardsSkeleton />}>
  //         <OverviewCardsGroup />
  //       </Suspense>
  //     </div>

  //     <div className="mt-4 md:mt-6 2xl:mt-9">
  //       <UsedDevices
  //         className="col-span-12 xl:col-span-5"
  //         key={extractTimeFrame("used_devices")}
  //         timeFrame={extractTimeFrame("used_devices")?.split(":")[1]}
  //       />
  //     </div>

  //     <div className="mt-4 md:mt-6 2xl:mt-9">
  //       <RegionLabels />
  //     </div>

  //     <div className="mt-4 md:mt-6 2xl:mt-9">
  //       <div className="col-span-12 grid xl:col-span-8">
  //         <Suspense fallback={<TopChannelsSkeleton />}>
  //           <TopChannels />
  //         </Suspense>
  //       </div>
  //     </div>
  //     <div className="mt-4 md:mt-6 2xl:mt-9">
  //       <Suspense fallback={null}>
  //         <ChatsCard />
  //       </Suspense>
  //     </div>
  //   </>
  // );

  return <></>;
}
