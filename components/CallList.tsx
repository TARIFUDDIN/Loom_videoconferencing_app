'use client';

import { Call, CallRecording } from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCalls } from '@/hooks/useGetCalls';
import { useToast } from './ui/use-toast';
import Loader from './Loader';
import MeetingCard from './MeetingCard';

const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) => {
 const router = useRouter();
 const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls();
 const [recordings, setRecordings] = useState<CallRecording[]>([]);
 const { toast } = useToast();

 const handleRecordingClick = (recording: CallRecording) => {
   if (!recording.url) {
     toast({ 
       title: 'Recording unavailable',
       description: 'The recording URL is invalid or expired'
     });
     return;
   }
   try {
     new URL(recording.url);
     router.push(recording.url);
   } catch {
     toast({ title: 'Invalid recording URL' });
   }
 };

 const getCalls = () => {
   switch (type) {
     case 'ended':
       return endedCalls;
     case 'recordings':
       return recordings;
     case 'upcoming':
       return upcomingCalls;
     default:
       return [];
   }
 };

 const getNoCallsMessage = () => {
   switch (type) {
     case 'ended':
       return 'No Previous Calls';
     case 'upcoming':
       return 'No Upcoming Calls';
     case 'recordings':
       return 'No Recordings';
     default:
       return '';
   }
 };

 useEffect(() => {
   const fetchRecordings = async () => {
     try {
       const callData = await Promise.all(
         callRecordings?.map((meeting) => meeting.queryRecordings()) ?? [],
       );

       const recordings = callData
         .filter((call) => call.recordings.length > 0)
         .flatMap((call) => call.recordings)
         .filter(recording => recording.url);

       setRecordings(recordings);
     } catch (error) {
       toast({ 
         title: 'Error loading recordings',
         description: 'Please try again later'
       });
     }
   };

   if (type === 'recordings') {
     fetchRecordings();
   }
 }, [type, callRecordings, toast]);

 if (isLoading) return <Loader />;

 const calls = getCalls();
 const noCallsMessage = getNoCallsMessage();

 return (
   <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
     {calls && calls.length > 0 ? (
       calls.map((meeting: Call | CallRecording, index) => (
         <MeetingCard
           key={type === 'recordings' ? (meeting as CallRecording).url : (meeting as Call).id || index}
           icon={
             type === 'ended'
               ? '/icons/previous.svg'
               : type === 'upcoming'
                 ? '/icons/upcoming.svg'
                 : '/icons/recordings.svg'
           }
           title={
             (meeting as Call).state?.custom?.description ||
             (meeting as CallRecording).filename?.substring(0, 20) ||
             'Personal Meeting'
           }
           date={
             (meeting as Call).state?.startsAt?.toLocaleString() ||
             (meeting as CallRecording).start_time?.toLocaleString()
           }
           isPreviousMeeting={type === 'ended'}
           link={
             type === 'recordings'
               ? (meeting as CallRecording).url
               : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
           }
           buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
           buttonText={type === 'recordings' ? 'Play' : 'Start'}
           handleClick={
             type === 'recordings'
               ? () => handleRecordingClick(meeting as CallRecording)
               : () => router.push(`/meeting/${(meeting as Call).id}`)
           }
         />
       ))
     ) : (
       <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
     )}
   </div>
 );
};

export default CallList;