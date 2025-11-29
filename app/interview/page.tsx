"use client";

import { useRouter } from 'next/navigation';
import { InterviewCall } from '@/components/InterviewCall';
import { ConversationLogger } from '@/components/ConversationLogger';
import { AutoTestGenerator } from '@/components/AutoTestGenerator';

export default function Interview() {
  const router = useRouter();

  const handleCallEnd = (logger: ConversationLogger) => {
    // Generate test questions from conversation
    const questions = AutoTestGenerator.generateQuestions(logger, 5);

    // Store data in sessionStorage to pass to test page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'interviewData',
        JSON.stringify({
          conversation: logger.getConversation(),
          questions,
          extractedFacts: logger.extractKeyFacts(),
        })
      );

      // Navigate to test page (Next.js client navigation)
      router.replace('/test');
    }
  };

  return (
    <div className="w-full">
      <InterviewCall onCallEnd={handleCallEnd} />
    </div>
  );
}

