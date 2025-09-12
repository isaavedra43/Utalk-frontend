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

// Función para hacer llamadas a la API de OpenAI usando XMLHttpRequest
export const callOpenAI = async (
  prompt: string,
  systemPrompt: string = AI_CONFIG.SYSTEM_PROMPTS.MONITORING_ANALYSIS,
  options: Partial<typeof AI_CONFIG.DEFAULT_CONFIG> = {}
) => {
  return new Promise((resolve, reject) => {
    try {
      const apiKey = getOpenAIAPIKey();
      
      if (!apiKey) {
        reject(new Error('API key de OpenAI no configurada'));
        return;
      }

      console.log('🔑 API Key obtenida:', apiKey.substring(0, 10) + '...');
      console.log('📝 Enviando prompt a OpenAI...');

      const requestBody = {
        model: 'gpt-4o-mini',
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
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.3
      };

      console.log('📦 Request body preparado:', {
        model: requestBody.model,
        messagesCount: requestBody.messages.length,
        maxTokens: requestBody.max_tokens
      });

      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', AI_CONFIG.OPENAI_API_URL, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          console.log('📡 Respuesta recibida:', xhr.status, xhr.statusText);
          
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log('✅ Datos recibidos de OpenAI:', data);
              
              if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                reject(new Error('Respuesta inválida de OpenAI'));
                return;
              }
              
              resolve(data.choices[0].message.content);
            } catch (parseError) {
              console.error('❌ Error parseando respuesta:', parseError);
              reject(new Error('Error parseando respuesta de OpenAI'));
            }
          } else {
            console.error('❌ Error en respuesta:', xhr.responseText);
            reject(new Error(`Error en la API de OpenAI: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };
      
      xhr.onerror = function() {
        console.error('❌ Error de red en XMLHttpRequest');
        reject(new Error('Error de red al conectar con OpenAI'));
      };
      
      xhr.send(JSON.stringify(requestBody));
      
    } catch (error) {
      console.error('❌ Error en callOpenAI:', error);
      reject(error);
    }
  });
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
