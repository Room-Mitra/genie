import CallbackWidget from '@/src/components/RequestCallback/CallbackWidget';

export default async function WidgetPage({ searchParams }) {
  const sp = await searchParams;
  const hotelId = sp?.hotelId ?? 'UNKNOWN';
  const primary = sp?.primary ?? '';
  const cardBg = sp?.cardBg ?? '';
  const height = sp?.height ?? '';

  console.log('primary h', primary);

  return (
    <div className="flex w-full justify-center p-2 bg-transparent">
      <CallbackWidget hotelId={hotelId} primary={primary} cardBg={cardBg} height={height} />
    </div>
  );
}
