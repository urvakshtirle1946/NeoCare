import { ExtractedFacts, ConversationLogger } from "./ConversationLogger";

export interface TestQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  type: "memory" | "comprehension" | "recall";
  keywords: string[];
}

export class AutoTestGenerator {
  static generateQuestions(logger: ConversationLogger, maxQuestions: number = 5): TestQuestion[] {
    const facts = logger.extractKeyFacts();
    const questions: TestQuestion[] = [];
    const conversation = logger.getConversation();
    const patientAnswers = logger.getPatientAnswers();

    // Generate questions based on extracted facts
    let questionCount = 0;

    // Question 1: Who do you live with? (if people mentioned)
    if (facts.people.length > 0 && questionCount < maxQuestions) {
      const person = facts.people[0];
      questions.push({
        id: `q-${questionCount++}`,
        question: "Who did you mention you live with?",
        correctAnswer: person,
        type: "memory",
        keywords: [person.toLowerCase(), "live", "with"],
      });
    }

    // Question 2: Which city/place? (if places mentioned)
    if (facts.places.length > 0 && questionCount < maxQuestions) {
      const place = facts.places[0];
      questions.push({
        id: `q-${questionCount++}`,
        question: "Which city or place did you mention?",
        correctAnswer: place,
        type: "memory",
        keywords: [place.toLowerCase(), "city", "place"],
      });
    }

    // Question 3: What activity? (if activities mentioned)
    if (facts.activities.length > 0 && questionCount < maxQuestions) {
      const activity = facts.activities[0];
      questions.push({
        id: `q-${questionCount++}`,
        question: "What activity did you mention you enjoy?",
        correctAnswer: activity,
        type: "recall",
        keywords: [activity.toLowerCase(), "activity", "enjoy"],
      });
    }

    // Question 4: Extract from a specific answer
    if (patientAnswers.length > 0 && questionCount < maxQuestions) {
      const answer = patientAnswers[0];
      const words = answer.text.split(/\s+/);
      if (words.length > 3) {
        // Create a question about something mentioned in the first answer
        const keyWord = words.find((w) => w.length > 4 && !["the", "that", "this", "with", "from"].includes(w.toLowerCase()));
        if (keyWord) {
          questions.push({
            id: `q-${questionCount++}`,
            question: `What did you say about "${keyWord}"?`,
            correctAnswer: answer.text.substring(0, 50),
            type: "comprehension",
            keywords: [keyWord.toLowerCase()],
          });
        }
      }
    }

    // Question 5: Number recall (if numbers mentioned)
    if (facts.numbers.length > 0 && questionCount < maxQuestions) {
      const number = facts.numbers[0];
      questions.push({
        id: `q-${questionCount++}`,
        question: "What number did you mention earlier?",
        correctAnswer: number,
        type: "memory",
        keywords: [number, "number"],
      });
    }

    // If we still need more questions, generate generic ones based on conversation
    if (questions.length < maxQuestions && conversation.length > 2) {
      const recentAnswer = patientAnswers[patientAnswers.length - 1];
      if (recentAnswer) {
        const sentences = recentAnswer.text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
        if (sentences.length > 0 && questionCount < maxQuestions) {
          const sentence = sentences[0].trim();
          questions.push({
            id: `q-${questionCount++}`,
            question: "Can you recall what you said about your daily routine?",
            correctAnswer: sentence.substring(0, 100),
            type: "recall",
            keywords: ["daily", "routine", "said"],
          });
        }
      }
    }

    return questions.slice(0, maxQuestions);
  }

  static validateAnswer(userAnswer: string, question: TestQuestion): {
    isCorrect: boolean;
    score: number;
    matchedKeywords: number;
  } {
    const userLower = userAnswer.toLowerCase().trim();
    const correctLower = question.correctAnswer.toLowerCase().trim();
    let matchedKeywords = 0;

    // Check keyword matches
    question.keywords.forEach((keyword) => {
      if (userLower.includes(keyword.toLowerCase())) {
        matchedKeywords++;
      }
    });

    // Exact match
    if (userLower === correctLower) {
      return { isCorrect: true, score: 100, matchedKeywords };
    }

    // Partial match (contains correct answer)
    if (userLower.includes(correctLower) || correctLower.includes(userLower)) {
      return { isCorrect: true, score: 80, matchedKeywords };
    }

    // Keyword-based scoring
    const keywordScore = (matchedKeywords / question.keywords.length) * 60;
    const similarityScore = this.calculateSimilarity(userLower, correctLower) * 40;
    const totalScore = keywordScore + similarityScore;

    return {
      isCorrect: totalScore >= 50,
      score: Math.min(100, Math.max(0, totalScore)),
      matchedKeywords,
    };
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const allWords = new Set([...words1, ...words2]);
    let matches = 0;

    words1.forEach((word) => {
      if (words2.some((w) => w.includes(word) || word.includes(w))) {
        matches++;
      }
    });

    return matches / Math.max(words1.length, words2.length, 1);
  }
}

