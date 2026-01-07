
export enum EducationLevel {
  PRIMARY = 'Primaire',
  MIDDLE = 'Collège (BEPC)',
  HIGH = 'Lycée (BAC)'
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  imageUrl?: string;
  isImageGeneration?: boolean;
  groundingSources?: { title: string; uri: string }[];
}

export interface UserSession {
  level: EducationLevel;
  subject: string;
  name: string;
}
