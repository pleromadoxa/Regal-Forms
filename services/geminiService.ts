
import { GoogleGenAI, Type } from "@google/genai";
import { FormField, GeneratedForm } from "../types";

const apiKey = process.env.API_KEY || '';

const getAI = () => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFormSchema = async (topic: string): Promise<GeneratedForm> => {
  const ai = getAI();

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
                  productImage: { type: Type.STRING, description: "URL for product image" },
                  productDescription: { type: Type.STRING, description: "Short description of the product" },
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

export const generateOptionsForField = async (label: string): Promise<string[]> => {
    const ai = getAI();
    const prompt = `Generate a list of 5-8 relevant options for a form dropdown/radio field labeled: "${label}". Return only the JSON array of strings.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Error generating options:", error);
        return ["Option 1", "Option 2", "Option 3"];
    }
};

export const optimizeFieldLabel = async (currentLabel: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Rewrite this form field label to be more professional, clear, and concise: "${currentLabel}". Return only the text of the new label.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text?.trim() || currentLabel;
    } catch (error) {
        console.error("Error optimizing label:", error);
        return currentLabel;
    }
};
