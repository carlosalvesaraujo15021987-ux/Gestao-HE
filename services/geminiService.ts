
import { GoogleGenAI } from "@google/genai";

// O API_KEY é obtido exclusivamente do ambiente
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getAIAnalysis = async (data: any[]) => {
  const summary = data.map(d => ({
    filial: d.filial,
    he: d.he50 + d.he100,
    faltas: d.faltas,
    nome: d.nome
  }));

  const prompt = `Analise os seguintes dados logísticos de horas extras e faltas:
  ${JSON.stringify(summary.slice(0, 50))}
  
  Por favor, forneça:
  1. Um resumo executivo dos principais pontos de atenção.
  2. Identificação de padrões anômalos.
  3. Sugestões práticas para otimização da escala.
  
  Responda de forma profissional e direta em Português do Brasil.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Desculpe, não foi possível gerar a análise no momento.";
  }
};

export const editLogisticsImage = async (base64ImageData: string, prompt: string) => {
  try {
    // Para edição, precisamos remover o prefixo data:image/...;base64,
    const cleanBase64 = base64ImageData.split(',')[1] || base64ImageData;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // O modelo retorna partes, precisamos iterar para achar a imagem gerada
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
  return null;
};
