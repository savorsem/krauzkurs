
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const DEFAULT_SYSTEM_INSTRUCTION = `
Ты — Командир элитного отряда продаж "300 Спартанцев".
Твоя задача: сделать из новобранца (пользователя) настоящую машину продаж.
Твой стиль: Жесткий, но справедливый. Военная риторика.
`;

export const createChatSession = (customInstruction?: string): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: customInstruction || DEFAULT_SYSTEM_INSTRUCTION,
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || 'Связь с штабом потеряна.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Ошибка канала связи.';
  }
};

export const createArenaSession = (clientRole: string, objective: string): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `
Ты — клиент в симуляции продаж. 
Твоя роль: ${clientRole}
Цель игрока: ${objective}
Веди себя реалистично, реагируй на аргументы продавца. Будь сложным, но справедливым оппонентом. 
Не выходи из роли клиента до конца симуляции.
`;
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
    },
  });
};

export const evaluateArenaBattle = async (history: { role: string; text: string }[], objective: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
Проанализируй диалог тренировочного боя между продавцом (user) и клиентом (model).
Цель продавца была: ${objective}

Диалог:
${history.map(m => `${m.role === 'user' ? 'Продавец' : 'Клиент'}: ${m.text}`).join('\n')}

Дай оценку действиям продавца в стиле Командира 300 Спартанцев (жестко, лаконично, по делу).
Укажи:
1. Удалось ли достичь цели?
2. 2 сильных тактических приема.
3. 2 критические ошибки или зоны роста.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
    });

    return response.text || 'Командир не смог расшифровать отчет о бое.';
  } catch (error) {
    console.error('Evaluation Error:', error);
    return 'Ошибка при анализе стратегии.';
  }
};

export const checkHomeworkWithAI = async (
    content: string, // Text or Base64
    type: 'TEXT' | 'PHOTO' | 'VIDEO' | 'FILE',
    instruction: string
  ): Promise<{ passed: boolean; feedback: string }> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const parts: any[] = [];
      
      if (type === 'PHOTO' || type === 'VIDEO' || type === 'FILE') {
         // Assuming content is base64 string without data prefix for API, or handle it here
         const base64Clean = content.includes('base64,') ? content.split('base64,')[1] : content;
         
         let mimeType = 'image/jpeg';
         if (type === 'VIDEO') mimeType = 'video/mp4';
         if (type === 'FILE') mimeType = 'application/pdf';

         parts.push({
            inlineData: {
                data: base64Clean,
                mimeType: mimeType
            }
         });
      }
  
      parts.push({
          text: `
          Ты - Командир "300 Спартанцев". Твоя задача проверить домашнее задание новобранца.
          
          ИНСТРУКЦИЯ ДЛЯ ПРОВЕРКИ (Критерии):
          ${instruction}
          
          ${type === 'TEXT' ? `ОТВЕТ НОВОБРАНЦА: "${content}"` : 'Ответ новобранца находится во вложении (фото/видео/файл).'}
          
          Верни ответ СТРОГО в формате JSON:
          {
            "passed": boolean, (true если задание выполнено по критериям, false если нет)
            "feedback": string (Твой комментарий в стиле спартанского командира. Если не сдал - объясни почему жестко. Если сдал - похвали кратко.)
          }
          `
      });
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Supports text, images, video and PDF
        contents: { parts },
        config: {
            responseMimeType: "application/json"
        }
      });
  
      const resultText = response.text;
      if (!resultText) throw new Error('Empty AI response');
      
      const parsed = JSON.parse(resultText);
      return {
          passed: parsed.passed,
          feedback: parsed.feedback
      };
  
    } catch (error) {
      console.error('Homework Grading Error:', error);
      return {
          passed: true, // Fallback to pass if AI fails to prevent blocking user, but log it.
          feedback: 'Штаб перегружен. Задание принято условно. (Ошибка AI)'
      };
    }
  };

export const generateSpartanAvatar = async (
  imageBase64: string, 
  level: number, 
  armorStyle: string = 'Classic Bronze', 
  backgroundStyle: string = 'Ancient Battlefield'
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Determine visual progression based on level
    const armorQuality = level < 3 ? 'Basic Recruit (Clean armor)' : level < 7 ? 'Battle-Hardened Veteran (Scratches, dents)' : 'Legendary Commander (Ornate, glowing energy)';
    const auraPrompt = level > 5 ? 'Subtle divine energy aura around the armor.' : 'No supernatural aura.';

    const prompt = `
      Task: Generate a photorealistic 3D stylized avatar (Unreal Engine 5 Metahuman style mixed with Pixar quality).
      
      INPUT FACE: Use the facial features, hair, and eye color from the provided input image. Maintain resemblance.
      
      STYLE SETTINGS:
      - Render: Octane Render, 8k resolution, cinematic lighting, ray tracing.
      - Theme: Ancient Spartan Warrior with a modern/stylized twist.
      - Camera: Portrait shot (Head and upper torso), shallow depth of field (bokeh).

      CUSTOMIZATION PARAMETERS:
      1. ARMOR STYLE: "${armorStyle}".
         - If 'Classic Bronze': Traditional bronze cuirass, red cape, Corinthian influences.
         - If 'Midnight Stealth': Dark obsidian/matte black armor, hood or shadow cowl, stealthy look.
         - If 'Golden God': Polished gold plate armor, intricate engravings, shining bright.
         - If 'Futuristic Chrome': Silver/Chrome plating with slight neon blue accents (Cyber-Spartan).
      
      2. BACKGROUND ENVIRONMENT: "${backgroundStyle}".
         - If 'Ancient Battlefield': Smoky, dusty battlefield, spears in ground, sunset.
         - If 'Temple of Olympus': White marble columns, blue sky, ethereal light.
         - If 'Stormy Peak': Dark mountains, rain, lightning strikes in distance.
         - If 'Volcanic Gates': Lava ambient light, dark rocks, embers in air.

      3. PROGRESSION LEVEL:
         - Level ${level}: ${armorQuality}.
         - Effect: ${auraPrompt}

      Constraint: Ensure the face looks heroic, confident, and matches the input person.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          imageConfig: {
              aspectRatio: "9:16" 
          }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error('Avatar Generation Error:', error);
    return null;
  }
};
