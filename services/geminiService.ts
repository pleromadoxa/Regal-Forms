import { GoogleGenAI, Type } from "@google/genai";
import { FormField, GeneratedForm } from "../types";

const apiKey = process.env.API_KEY || '';

export const generateFormSchema = async (topic: string): Promise<GeneratedForm> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate a structured form schema for a form about: "${topic}".
  The form should be professional and include diverse field types where appropriate (text, email, select, checkbox, etc).
  Keep the number of fields between 5 and 10.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy title for the form" },
            description: { type: Type.STRING, description: "A short description of the form's purpose" },
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio']
                  },
                  placeholder: { type: Type.STRING },
                  required: { type: Type.BOOLEAN },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Options for select, checkbox, or radio types"
                  }
                },
                required: ["id", "label", "type", "required"]
              }
            }
          },
          required: ["title", "description", "fields"]
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No content generated");
    }
    
    return JSON.parse(text) as GeneratedForm;
  } catch (error) {
    console.error("Error generating form:", error);
    throw error;
  }
};