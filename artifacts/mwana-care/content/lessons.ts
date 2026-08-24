export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: "communication" | "discipline" | "emotions" | "safety" | "development";
  order: number;
  content: {
    text: string;
    audio?: string; // URL to audio file
    video?: string; // URL to video file
    illustration?: string; // URL to image
    signLanguageVideo?: string; // URL to sign language video
  };
  interactiveQuestion?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  activity: {
    title: string;
    description: string;
    timeRequired: number; // in minutes
  };
  formats: {
    standard: boolean;
    lowLiteracy: boolean;
    signbridge: boolean;
  };
}

export const LESSONS: Lesson[] = [
  {
    id: "understanding-child",
    title: "Understanding Your Child",
    description: "Learn how to observe and understand your child's behavior and needs",
    duration: 5,
    category: "development",
    order: 1,
    content: {
      text: "Every child is unique. Understanding your child means observing their behavior, listening to their feelings, and recognizing their needs. When children feel understood, they develop better emotional security and are more likely to cooperate.\n\nKey points:\n• Observe your child's behavior patterns\n• Listen to their feelings without judgment\n• Recognize that behavior communicates needs\n• Respond with empathy and patience",
      illustration: "understanding-child-illustration",
    },
    interactiveQuestion: {
      question: "When your child is crying, what should you do first?",
      options: [
        "Tell them to stop crying",
        "Ask them what's wrong and listen",
        "Ignore them until they stop",
        "Give them a treat to make them stop",
      ],
      correctAnswer: 1,
      explanation: "Asking what's wrong and listening shows your child that their feelings matter. This builds trust and emotional security.",
    },
    activity: {
      title: "Observation Time",
      description: "Spend 10 minutes today observing your child during play. Notice what interests them and how they express emotions.",
      timeRequired: 10,
    },
    formats: {
      standard: true,
      lowLiteracy: true,
      signbridge: true,
    },
  },
  {
    id: "positive-communication",
    title: "Positive Communication",
    description: "Learn effective ways to communicate with your child",
    duration: 4,
    category: "communication",
    order: 2,
    content: {
      text: "Positive communication builds strong relationships between parents and children. It involves active listening, clear expression, and respectful dialogue.\n\nKey points:\n• Get down to your child's eye level when talking\n• Use simple, clear language\n• Listen without interrupting\n• Acknowledge your child's feelings",
      illustration: "communication-illustration",
    },
    interactiveQuestion: {
      question: "What is the best way to get your child's attention?",
      options: [
        "Shout their name from another room",
        "Gently touch their shoulder and make eye contact",
        "Send them a text message",
        "Wait until they come to you",
      ],
      correctAnswer: 1,
      explanation: "Gentle physical contact and eye contact show respect and help your child focus on what you're saying.",
    },
    activity: {
      title: "Eye Contact Practice",
      description: "Today, practice getting down to your child's eye level before speaking to them. Notice how they respond.",
      timeRequired: 5,
    },
    formats: {
      standard: true,
      lowLiteracy: true,
      signbridge: true,
    },
  },
  {
    id: "responding-without-violence",
    title: "Responding Without Violence",
    description: "Learn positive discipline strategies that don't involve physical punishment",
    duration: 5,
    category: "discipline",
    order: 3,
    content: {
      text: "Physical punishment can harm children and damage your relationship. Positive discipline teaches children self-control and responsibility without violence.\n\nKey points:\n• Stay calm when your child misbehaves\n• Focus on teaching, not punishing\n• Use consequences related to the behavior\n• Praise good behavior often",
      illustration: "positive-discipline-illustration",
    },
    interactiveQuestion: {
      question: "Your child breaks a cup accidentally. What is the best response?",
      options: [
        "Shout at them and send them to their room",
        "Hit them so they learn to be careful",
        "Stay calm, help them clean it up, and discuss how to be careful",
        "Ignore it and clean it up yourself",
      ],
      correctAnswer: 2,
      explanation: "Staying calm and involving your child in cleaning up teaches responsibility without fear or shame.",
    },
    activity: {
      title: "Calm Response Challenge",
      description: "Next time your child makes a mistake, practice staying calm and focusing on teaching instead of punishing.",
      timeRequired: 5,
    },
    formats: {
      standard: true,
      lowLiteracy: true,
      signbridge: true,
    },
  },
  {
    id: "setting-boundaries",
    title: "Setting Boundaries",
    description: "Learn how to set clear, appropriate boundaries for your child",
    duration: 5,
    category: "discipline",
    order: 4,
    content: {
      text: "Children need clear boundaries to feel safe and learn appropriate behavior. Boundaries should be consistent, reasonable, and explained clearly.\n\nKey points:\n• Set clear, simple rules\n• Explain why rules exist\n• Be consistent in enforcing boundaries\n• Adjust boundaries as your child grows",
      illustration: "boundaries-illustration",
    },
    interactiveQuestion: {
      question: "What makes a boundary effective?",
      options: [
        "It's strict and never changes",
        "It's clear, explained, and consistently enforced",
        "It's only enforced when you're angry",
        "It's different every time",
      ],
      correctAnswer: 1,
      explanation: "Effective boundaries are clear, explained to the child, and enforced consistently. This helps children understand expectations.",
    },
    activity: {
      title: "Family Rules Discussion",
      description: "Sit with your child and discuss 2-3 important family rules. Explain why each rule matters.",
      timeRequired: 10,
    },
    formats: {
      standard: true,
      lowLiteracy: true,
      signbridge: true,
    },
  },
  {
    id: "encouraging-behavior",
    title: "Encouraging Good Behavior",
    description: "Learn how to reinforce positive behavior in your child",
    duration: 3,
    category: "discipline",
    order: 5,
    content: {
      text: "Positive reinforcement is more effective than punishment. When you notice and praise good behavior, your child is more likely to repeat it.\n\nKey points:\n• Praise specific behaviors, not just general 'good job'\n• Praise immediately after the behavior\n• Use enthusiasm and warmth\n• Focus on effort, not just results",
      illustration: "encouragement-illustration",
    },
    interactiveQuestion: {
      question: "Which is the best way to praise your child?",
      options: [
        "Good job!",
        "You're so smart!",
        "I noticed how you shared your toy with your sister. That was very kind.",
        "Finally, you did it right!",
      ],
      correctAnswer: 2,
      explanation: "Specific praise helps children understand exactly what behavior to repeat. It shows you're paying attention.",
    },
    activity: {
      title: "Specific Praise Practice",
      description: "Today, give your child 3 specific praises for good behavior. Notice how they respond.",
      timeRequired: 5,
    },
    formats: {
      standard: true,
      lowLiteracy: true,
      signbridge: true,
    },
  },
  {
    id: "managing-emotions",
    title: "Managing Emotions",
    description: "Help your child understand and manage their feelings",
    duration: 4,
    category: "emotions",
    order: 6,
    content: {
      text: "Emotional intelligence is a critical life skill. Help your child identify, understand, and manage their emotions in healthy ways.\n\nKey points:\n• Name emotions for your child\n• Validate all feelings, even negative ones\n• Teach healthy ways to express emotions\n• Model emotional regulation yourself",
      illustration: "emotions-illustration",
    },
    interactiveQuestion: {
      question: "Your child is angry. What should you do?",
      options: [
        "Tell them anger is bad",
        "Punish them for being angry",
        "Acknowledge their anger and help them express it safely",
        "Ignore them until they calm down",
      ],
      correctAnswer: 2,
      explanation: "Acknowledging anger and teaching safe expression helps children learn emotional regulation. Anger itself isn't bad - how we express it matters.",
    },
    activity: {
      title: "Emotion Naming",
      description: "When your child shows strong emotions today, help them name what they're feeling. 'You seem frustrated.'",
      timeRequired: 5,
    },
    formats: {
      standard: true,
      lowLiteracy: true,
      signbridge: true,
    },
  },
  {
    id: "child-safety",
    title: "Child Safety",
    description: "Essential safety practices to protect your child",
    duration: 5,
    category: "safety",
    order: 7,
    content: {
      text: "Keeping children safe is every parent's priority. Learn about common risks and how to prevent accidents at home and in your community.\n\nKey points:\n• Child-proof your home for young children\n• Teach children about stranger safety\n• Know basic first aid\n• Supervise children appropriately for their age",
      illustration: "safety-illustration",
    },
    interactiveQuestion: {
      question: "What is the most important safety rule for young children?",
      options: [
        "Never leave them alone near water",
        "Let them play outside alone",
        "Give them a phone for emergencies",
        "Teach them to fight back if someone grabs them",
      ],
      correctAnswer: 0,
      explanation: "Constant supervision near water is critical for young children who can drown quickly and silently.",
    },
    activity: {
      title: "Home Safety Check",
      description: "Walk through your home and identify 3 potential safety hazards. Address them today.",
      timeRequired: 15,
    },
    formats: {
      standard: true,
      lowLiteracy: true,
      signbridge: true,
    },
  },
  {
    id: "building-relationships",
    title: "Building Strong Relationships",
    description: "Strengthen your bond with your child through positive interactions",
    duration: 4,
    category: "development",
    order: 8,
    content: {
      text: "A strong parent-child relationship is the foundation of healthy development. Invest time and attention in building connection and trust.\n\nKey points:\n• Spend dedicated one-on-one time together\n• Show interest in your child's interests\n• Be physically affectionate appropriately\n• Create family traditions and rituals",
      illustration: "relationship-illustration",
    },
    interactiveQuestion: {
      question: "What is the best way to strengthen your relationship with your child?",
      options: [
        "Buy them expensive gifts",
        "Spend 10-15 minutes of focused one-on-one time daily",
        "Let them do whatever they want",
        "Enroll them in many activities",
      ],
      correctAnswer: 1,
      explanation: "Consistent, focused attention is more valuable than gifts or activities. It builds security and connection.",
    },
    activity: {
      title: "Special Time",
      description: "Set aside 15 minutes today for uninterrupted one-on-one time with your child. Let them choose the activity.",
      timeRequired: 15,
    },
    formats: {
      standard: true,
      lowLiteracy: true,
      signbridge: true,
    },
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function getLessonsByCategory(category: Lesson["category"]): Lesson[] {
  return LESSONS.filter((lesson) => lesson.category === category).sort((a, b) => a.order - b.order);
}

export function getNextLesson(currentLessonId: string): Lesson | undefined {
  const currentIndex = LESSONS.findIndex((lesson) => lesson.id === currentLessonId);
  if (currentIndex < 0 || currentIndex >= LESSONS.length - 1) {
    return undefined;
  }
  return LESSONS[currentIndex + 1];
}
