'use client';


import MeetingTypeList from '@/components/MeetingTypeList';
import { useGetCalls } from '@/hooks/useGetCalls';

const Home = () => {
  const { upcomingCalls } = useGetCalls();

  const upcomingCall =
    upcomingCalls?.length! > 0
      ? upcomingCalls
          ?.map((call) => call?.state?.startsAt?.getTime()!)
          .sort((a: number, b: number) => a - b)[0]
      : null;

  const upcomingDate = upcomingCall && new Date(upcomingCall as number);

  const time =
    upcomingDate &&
    upcomingDate.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const date =
    upcomingDate &&
    new Intl.DateTimeFormat('en-PK', { dateStyle: 'full' })?.format(
      upcomingDate,
    );

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 md:p-7 lg:p-11">
          <h2 className="glassmorphism max-w-[273px] rounded py-2 text-center text-base font-normal">
            {time && date ? 'Upcoming meeting on' : 'No upcoming meetings'}
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold md:text-4xl lg:text-7xl">
              {time === null ? 'Scheduled a meeting' : time}
            </h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">
              {date === null ? 'Or create an instant one' : date}
            </p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;