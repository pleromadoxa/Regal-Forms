
import { GoogleGenAI, Type } from "@google/genai";
import { FormField, GeneratedForm } from "../types";

const apiKey = process.env.API_KEY || '';

export const generateFormSchema = async (topic: string): Promise<GeneratedForm> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate a structured form schema for a form about: "${topic}".
  The form should be professional. 
  You can use standard fields (text, email, select, url) and rich fields like 'date', 'quote', 'countdown' (for events), 'product' (for sales), 'rating', 'slider', 'signature', or 'youtube' if relevant to the topic.
  If the topic involves selling items, use the 'product' field type with a price.
  Keep the number of fields between 5 and 10.
  Include helpful helper text for complex fields.`;

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
            submitButtonText: { type: Type.STRING, description: "Text for the submit button, e.g., 'Send Request'" },
            successMessage: { type: Type.STRING, description: "Message to show after submission" },
            slug: { type: Type.STRING, description: "A URL-friendly slug for the form (e.g. customer-feedback-2025)" },
            
            // Settings
            collectEmails: { type: Type.BOOLEAN },
            limitOneResponse: { type: Type.BOOLEAN },
            showProgressBar: { type: Type.BOOLEAN },

            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio', 'phone', 'file', 'image', 'date', 'time', 'html', 'quote', 'youtube', 'countdown', 'url', 'stripe', 'paypal', 'product', 'rating', 'slider', 'signature']
                  },
                  placeholder: { type: Type.STRING },
                  helperText: { type: Type.STRING, description: "Small hint text displayed below the input" },
                  required: { type: Type.BOOLEAN },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Options for select, checkbox, or radio types"
                  },
                  content: { type: Type.STRING, description: "Content for HTML or Quote fields" },
                  videoUrl: { type: Type.STRING, description: "URL for Youtube video if applicable" },
                  targetDate: { type: Type.STRING, description: "ISO Date string for countdown target" },
                  price: { type: Type.NUMBER, description: "Price for product fields" },
                  currency: { type: Type.STRING, description: "Currency code e.g. USD" },
                  min: { type: Type.NUMBER, description: "Min value for slider/rating" },
                  max: { type: Type.NUMBER, description: "Max value for slider/rating" }
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
