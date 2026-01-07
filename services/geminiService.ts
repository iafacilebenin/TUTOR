
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ResponseWithGrounding {
  text: string;
  groundingChunks?: any[];
}

export const generateTutorResponse = async (
  prompt: string, 
  systemInstruction: string,
  history: { role: string, parts: any[] }[] = []
): Promise<ResponseWithGrounding> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      tools: [{ googleSearch: {} }],
    },
  });
  
  return {
    text: response.text || '',
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const analyzeImage = async (base64Image: string, prompt: string, systemInstruction: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    },
    config: { systemInstruction }
  });
  return response.text || '';
};

export const editEducationalImage = async (base64Image: string, editPrompt: string): Promise<string | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Image } },
        { text: editPrompt }
      ]
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateEducationalImage = async (visualPrompt: string): Promise<string | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `High quality educational illustration for Benin Republic students: ${visualPrompt}. Vivid colors, clear diagrammatic style.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
