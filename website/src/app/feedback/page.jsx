import FeedbackPage from './FeedbackPage';

export default function Page({ searchParams }) {
  const hotel = typeof searchParams?.h === 'string' ? searchParams.h : '';

  return <FeedbackPage hotel={hotel} />;
}
