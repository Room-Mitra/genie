import LayoutEffect from '@/src/components/LayoutEffect';
import SectionWrapper from '@/src/components/SectionWrapper';
import {
  BellAlertIcon,
  ChartBarIcon,
  ClockIcon,
  LinkSlashIcon,
  PhoneIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const Features = () => {
  const featuresList = [
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: 'Stop missing phone calls and bookings',
      desc: 'Hotels lose bookings because calls go unanswered during peak hours or staff shortages.',
    },
    {
      icon: <LinkSlashIcon className="h-6 w-6" />,
      title: 'Reduce dependency on WhatsApp and fragmented workflows',
      desc: 'Front desk teams juggle calls, WhatsApp messages, guest DMs, and manual logs.',
    },
    {
      icon: <UsersIcon className="h-6 w-6" />,
      title: 'Short-staffed teams can run efficiently',
      desc: 'Even with limited manpower, the AI agent handles repetitive queries, routing, and request logging.',
    },
    {
      icon: <BellAlertIcon className="h-6 w-6" />,
      title: 'Centralized request tracking reduces delays and guest complaints',
      desc: 'All housekeeping, F&B, and maintenance requests are tracked automatically with timestamps and assignment.',
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: '24/7 consistent guest experience',
      desc: 'Unlike humans, AI doesn’t have shift changes, fatigue, or off days. Guests get the same helpful, accurate response at any hour.',
    },
    {
      icon: <ChartBarIcon className="h-6 w-6" />,
      title: 'Analytics that make your operations smarter',
      desc: 'Hotels lack insights into peak call hours, request bottlenecks, staff performance, common guest issues, and SLA adherence.',
    },
  ];

  return (
    <SectionWrapper id="why">
      <div className="custom-screen text-gray-300">
        <LayoutEffect
          className="duration-1000 delay-300"
          isInviewState={{
            trueState: 'opacity-100',
            falseState: 'opacity-0 translate-y-6',
          }}
        >
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl">
              Why Hotels Need This Now
            </h2>
            <p className="mt-3 text-md">Hospitality Is Changing. Your Operations Should Too.</p>
          </div>
        </LayoutEffect>
        <LayoutEffect
          className="duration-1000 delay-500"
          isInviewState={{
            trueState: 'opacity-100',
            falseState: 'opacity-0',
          }}
        >
          <div className="relative mt-12">
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuresList.map((item, idx) => (
                <li
                  key={idx}
                  className="space-y-3 p-4 rounded-xl border border-gray-800"
                  style={{
                    background:
                      'radial-gradient(157.73% 157.73% at 50% -29.9%, rgba(203, 213, 225, 0.16) 0%, rgba(203, 213, 225, 0) 100%)',
                  }}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg text-gray-50">
                    {item.icon}
                  </div>
                  <h3 className="text-lg text-gray-50 font-semibold">{item.title}</h3>
                  <p className="text-sm">{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </LayoutEffect>
      </div>
    </SectionWrapper>
  );
};

export default Features;
