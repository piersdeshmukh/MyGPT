import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];
const fileToGenerativePart = (path, mimeType) => {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }
const genAi = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_PUBLIC_KEY);
const model = genAi.getGenerativeModel({ 
    model: "gemini-2.0-flash", 
    safetySettings: safetySettings 
});
export default model;
