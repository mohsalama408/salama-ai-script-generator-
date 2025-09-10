
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeStyle = async (scripts: string): Promise<string> => {
  const prompt = `حلل الأسلوب، النبرة، الكلمات الرئيسية، والهيكل العام للنصوص التالية. قدم ملخصًا موجزًا في جملتين لتأكيد فهمك للأسلوب. لا تقم بتوليد أي نص جديد. النصوص هي:\n\n---\n${scripts}\n---`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing style:", error);
    throw new Error("Failed to communicate with the AI model for style analysis.");
  }
};

export const generateScript = async (trainingScripts: string, newLesson: string): Promise<string> => {
  const prompt = `
أنت كاتب محتوى متخصص في كتابة النصوص التعليمية. مهمتك هي إنشاء نص جديد بناءً على "الدرس الجديد" المقدم لك. يجب أن يقلد النص الجديد بشكل دقيق الأسلوب، والنبرة، وطريقة التقسيم، والمصطلحات المستخدمة في "نماذج النصوص التدريبية" التالية.

---
**نماذج النصوص التدريبية:**
${trainingScripts}
---
**الدرس الجديد:**
${newLesson}
---

الآن، قم بإنشاء النص الجديد للدرس الجديد بنفس أسلوب النماذج التدريبية.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error("Failed to communicate with the AI model for script generation.");
  }
};
