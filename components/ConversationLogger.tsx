export interface ConversationEntry {
  id: string;
  timestamp: number;
  speaker: "assistant" | "patient";
  text: string;
  type: "question" | "answer";
}

export interface ExtractedFacts {
  people: string[];
  places: string[];
  activities: string[];
  dates: string[];
  numbers: string[];
  keyPhrases: string[];
}

export class ConversationLogger {
  private conversation: ConversationEntry[] = [];

  addEntry(speaker: "assistant" | "patient", text: string, type: "question" | "answer"): void {
    const entry: ConversationEntry = {
      id: `entry-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      speaker,
      text,
      type,
    };
    this.conversation.push(entry);
  }

  getConversation(): ConversationEntry[] {
    return [...this.conversation];
  }

  getFullText(): string {
    return this.conversation.map((entry) => entry.text).join(" ");
  }

  extractKeyFacts(): ExtractedFacts {
    const fullText = this.getFullText().toLowerCase();
    const facts: ExtractedFacts = {
      people: [],
      places: [],
      activities: [],
      dates: [],
      numbers: [],
      keyPhrases: [],
    };

    // Extract people (common patterns: "my [person]", "with [person]", "I live with [person]")
    const peoplePatterns = [
      /(?:my|with|live with|brother|sister|mother|father|son|daughter|wife|husband|friend)\s+([A-Z][a-z]+)/gi,
      /(?:I|we)\s+(?:live|stay)\s+with\s+([A-Z][a-z]+)/gi,
    ];
    peoplePatterns.forEach((pattern) => {
      const matches = fullText.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const person = match.split(/\s+/).pop();
          if (person && !facts.people.includes(person)) {
            facts.people.push(person);
          }
        });
      }
    });

    // Extract places (cities, locations)
    const placePatterns = [
      /(?:in|from|to|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
      /(?:city|town|place)\s+(?:of|is)\s+([A-Z][a-z]+)/gi,
    ];
    placePatterns.forEach((pattern) => {
      const matches = fullText.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const place = match.replace(/^(?:in|from|to|at|city|town|place|of|is)\s+/i, "").trim();
          if (place && place.length > 2 && !facts.places.includes(place)) {
            facts.places.push(place);
          }
        });
      }
    });

    // Extract activities (verbs and action phrases)
    const activityKeywords = [
      "walk", "read", "cook", "watch", "play", "work", "exercise", "garden",
      "shop", "visit", "travel", "swim", "dance", "sing", "paint", "write",
    ];
    activityKeywords.forEach((keyword) => {
      if (fullText.includes(keyword) && !facts.activities.includes(keyword)) {
        facts.activities.push(keyword);
      }
    });

    // Extract dates and time references
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
      /(?:today|yesterday|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
      /(?:january|february|march|april|may|june|july|august|september|october|november|december)/gi,
    ];
    datePatterns.forEach((pattern) => {
      const matches = fullText.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!facts.dates.includes(match)) {
            facts.dates.push(match);
          }
        });
      }
    });

    // Extract numbers
    const numberMatches = fullText.match(/\d+/g);
    if (numberMatches) {
      facts.numbers = [...new Set(numberMatches)];
    }

    // Extract key phrases (sentences with important keywords)
    const sentences = this.getFullText().split(/[.!?]+/).filter((s) => s.trim().length > 10);
    const importantKeywords = ["live", "work", "family", "remember", "forget", "daily", "routine"];
    sentences.forEach((sentence) => {
      const lowerSentence = sentence.toLowerCase();
      if (importantKeywords.some((keyword) => lowerSentence.includes(keyword))) {
        const trimmed = sentence.trim().substring(0, 100);
        if (trimmed && !facts.keyPhrases.includes(trimmed)) {
          facts.keyPhrases.push(trimmed);
        }
      }
    });

    return facts;
  }

  getPatientAnswers(): ConversationEntry[] {
    return this.conversation.filter((entry) => entry.speaker === "patient" && entry.type === "answer");
  }

  getAssistantQuestions(): ConversationEntry[] {
    return this.conversation.filter((entry) => entry.speaker === "assistant" && entry.type === "question");
  }

  clear(): void {
    this.conversation = [];
  }

  getWordCount(): number {
    return this.getFullText().split(/\s+/).filter((word) => word.length > 0).length;
  }
}

