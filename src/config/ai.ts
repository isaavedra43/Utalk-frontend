// Configuración para integración con IA (ChatGPT)
export const AI_CONFIG = {
  // URL de la API de OpenAI
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  
  // Modelo a usar (gpt-4, gpt-3.5-turbo, etc.)
  MODEL: 'gpt-4',
  
  // Configuración por defecto
  DEFAULT_CONFIG: {
    max_tokens: 2000,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  },
  
  // Prompts del sistema
  SYSTEM_PROMPTS: {
    MONITORING_ANALYSIS: `Eres un experto en análisis de sistemas y debugging de aplicaciones web. 
    Tu trabajo es analizar datos de monitoreo y proporcionar:
    
    1. **RESUMEN EJECUTIVO**: Un párrafo que resuma el estado general del sistema
    2. **PROBLEMAS CRÍTICOS**: Lista de los 3-5 problemas más importantes que necesitan atención inmediata
    3. **RECOMENDACIONES**: Acciones específicas para resolver los problemas identificados
    4. **INSIGHTS DE RENDIMIENTO**: Análisis del rendimiento y optimizaciones sugeridas
    5. **PATRONES DE ERRORES**: Patrones identificados en los errores y cómo solucionarlos
    
    Responde en español y sé específico y accionable en tus recomendaciones.`,
    
    ERROR_ANALYSIS: `Eres un experto en debugging de aplicaciones web. Analiza los errores proporcionados y:
    
    1. Identifica la causa raíz de cada error
    2. Proporciona soluciones específicas
    3. Sugiere medidas preventivas
    4. Prioriza los errores por criticidad
    
    Responde en español con recomendaciones técnicas específicas.`,
    
    PERFORMANCE_ANALYSIS: `Eres un experto en optimización de rendimiento web. Analiza las métricas proporcionadas y:
    
    1. Identifica cuellos de botella de rendimiento
    2. Sugiere optimizaciones específicas
    3. Proporciona métricas objetivo
    4. Recomienda herramientas de monitoreo adicionales
    
    Responde en español con recomendaciones técnicas específicas.`
  }
};

// Función para obtener la API key
export const getOpenAIAPIKey = (): string => {
  // Prioridad: variable de entorno > localStorage > prompt al usuario
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  const localKey = localStorage.getItem('openai_api_key');
  
  if (envKey) return envKey;
  if (localKey) return localKey;
  
  // Si no hay API key, pedirla al usuario
  const userKey = prompt(
    'Para usar el análisis con IA, necesitas una API key de OpenAI.\n\n' +
    '1. Ve a https://platform.openai.com/api-keys\n' +
    '2. Crea una nueva API key\n' +
    '3. Pégala aquí\n\n' +
    'API Key:'
  );
  
  if (userKey && userKey.trim()) {
    localStorage.setItem('openai_api_key', userKey.trim());
    return userKey.trim();
  }
  
  throw new Error('API key de OpenAI requerida para el análisis con IA');
};

// Función para hacer llamadas a la API de OpenAI
export const callOpenAI = async (
  prompt: string,
  systemPrompt: string = AI_CONFIG.SYSTEM_PROMPTS.MONITORING_ANALYSIS,
  options: Partial<typeof AI_CONFIG.DEFAULT_CONFIG> = {}
) => {
  const apiKey = getOpenAIAPIKey();
  
  const response = await fetch(AI_CONFIG.OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: AI_CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      ...AI_CONFIG.DEFAULT_CONFIG,
      ...options
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Error en la API de OpenAI: ${response.status} ${response.statusText}\n` +
      `Detalles: ${errorData.error?.message || 'Error desconocido'}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Función para validar la API key
export const validateAPIKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(AI_CONFIG.OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
    });
    
    return response.ok;
  } catch {
    return false;
  }
};

// Función para limpiar la API key
export const clearAPIKey = (): void => {
  localStorage.removeItem('openai_api_key');
};

// Función para configurar la API key
export const setAPIKey = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
};
