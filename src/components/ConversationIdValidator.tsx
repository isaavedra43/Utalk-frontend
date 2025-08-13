import React, { useState } from 'react';
import { 
  isValidConversationId, 
  normalizeConversationId, 
  generateConversationId, 
  extractPhonesFromConversationId,
  sanitizeConversationId,
  logConversationId 
} from '../utils/conversationUtils';

const ConversationIdValidator: React.FC = () => {
  const [testId, setTestId] = useState('conv_+5214773790184_+5214793176502');
  const [phone1, setPhone1] = useState('+5214773790184');
  const [phone2, setPhone2] = useState('+5214793176502');
  const [results, setResults] = useState<Record<string, unknown> | null>(null);

  const testValidation = () => {
    const validationResults = {
      originalId: testId,
      isValid: isValidConversationId(testId),
      normalized: normalizeConversationId(testId),
      sanitized: sanitizeConversationId(testId),
      extractedPhones: extractPhonesFromConversationId(testId)
    };

    setResults(validationResults);
    logConversationId(testId, 'Test Validation');
  };

  const testGeneration = () => {
    const generatedId = generateConversationId(phone1, phone2);
    const validationResults = {
      phone1,
      phone2,
      generatedId,
      isValid: isValidConversationId(generatedId),
      normalized: normalizeConversationId(generatedId),
      sanitized: sanitizeConversationId(generatedId),
      extractedPhones: extractPhonesFromConversationId(generatedId)
    };

    setResults(validationResults);
    logConversationId(generatedId, 'Test Generation');
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Validador de IDs de Conversación</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">ID de Conversación a Validar:</label>
          <input
            type="text"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="conv_+5214773790184_+5214793176502"
          />
          <button
            onClick={testValidation}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Validar ID
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Generar ID de Conversación:</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={phone1}
              onChange={(e) => setPhone1(e.target.value)}
              className="p-2 border rounded"
              placeholder="+5214773790184"
            />
            <input
              type="text"
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              className="p-2 border rounded"
              placeholder="+5214793176502"
            />
          </div>
          <button
            onClick={testGeneration}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Generar ID
          </button>
        </div>

        {results && (
          <div className="mt-4 p-4 bg-white rounded border">
            <h4 className="font-semibold mb-2">Resultados:</h4>
            <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationIdValidator; 