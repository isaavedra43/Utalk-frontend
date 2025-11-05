// Motor de evaluación de fórmulas para custom fields

export class FormulaEngine {
  /**
   * Evaluar una fórmula con contexto de datos
   */
  static evaluate(formula: string, context: { [key: string]: any }): any {
    try {
      // Reemplazar referencias a campos con sus valores
      let processedFormula = formula;
      
      // Buscar referencias a campos (ej: {field_name})
      const fieldRegex = /\{([a-zA-Z0-9_]+)\}/g;
      processedFormula = processedFormula.replace(fieldRegex, (match, fieldName) => {
        const value = context[fieldName];
        return value !== undefined ? JSON.stringify(value) : 'null';
      });
      
      // Reemplazar funciones personalizadas
      processedFormula = this.replaceFunctions(processedFormula, context);
      
      // Evaluar la fórmula de forma segura
      const result = this.safeEval(processedFormula);
      
      return result;
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return null;
    }
  }

  /**
   * Reemplazar funciones personalizadas
   */
  private static replaceFunctions(formula: string, context: { [key: string]: any }): string {
    let result = formula;

    // SUM(field1, field2, ...)
    result = result.replace(/SUM\((.*?)\)/g, (match, args) => {
      const values = args.split(',').map((arg: string) => {
        const trimmed = arg.trim();
        const value = context[trimmed.replace(/[{}]/g, '')] || 0;
        return typeof value === 'number' ? value : 0;
      });
      return values.reduce((a: number, b: number) => a + b, 0).toString();
    });

    // AVG(field1, field2, ...)
    result = result.replace(/AVG\((.*?)\)/g, (match, args) => {
      const values = args.split(',').map((arg: string) => {
        const trimmed = arg.trim();
        const value = context[trimmed.replace(/[{}]/g, '')] || 0;
        return typeof value === 'number' ? value : 0;
      });
      const sum = values.reduce((a: number, b: number) => a + b, 0);
      return values.length > 0 ? (sum / values.length).toString() : '0';
    });

    // COUNT(field1, field2, ...)
    result = result.replace(/COUNT\((.*?)\)/g, (match, args) => {
      const values = args.split(',').filter((arg: string) => {
        const trimmed = arg.trim();
        const value = context[trimmed.replace(/[{}]/g, '')];
        return value !== null && value !== undefined && value !== '';
      });
      return values.length.toString();
    });

    // MIN(field1, field2, ...)
    result = result.replace(/MIN\((.*?)\)/g, (match, args) => {
      const values = args.split(',').map((arg: string) => {
        const trimmed = arg.trim();
        const value = context[trimmed.replace(/[{}]/g, '')] || 0;
        return typeof value === 'number' ? value : 0;
      });
      return Math.min(...values).toString();
    });

    // MAX(field1, field2, ...)
    result = result.replace(/MAX\((.*?)\)/g, (match, args) => {
      const values = args.split(',').map((arg: string) => {
        const trimmed = arg.trim();
        const value = context[trimmed.replace(/[{}]/g, '')] || 0;
        return typeof value === 'number' ? value : 0;
      });
      return Math.max(...values).toString();
    });

    // IF(condition, valueIfTrue, valueIfFalse)
    result = result.replace(/IF\((.*?),(.*?),(.*?)\)/g, (match, condition, trueValue, falseValue) => {
      try {
        const condResult = this.safeEval(this.replaceFunctions(condition.trim(), context));
        return condResult ? trueValue.trim() : falseValue.trim();
      } catch {
        return falseValue.trim();
      }
    });

    // NOW() - Fecha actual
    result = result.replace(/NOW\(\)/g, () => Date.now().toString());

    // DATEDIFF(date1, date2, unit)
    result = result.replace(/DATEDIFF\((.*?),(.*?),(.*?)\)/g, (match, date1, date2, unit) => {
      try {
        const d1 = new Date(this.safeEval(date1.trim()));
        const d2 = new Date(this.safeEval(date2.trim()));
        const diff = d2.getTime() - d1.getTime();
        
        const unitStr = unit.trim().replace(/['"]/g, '');
        switch (unitStr) {
          case 'days':
            return (diff / (1000 * 60 * 60 * 24)).toString();
          case 'hours':
            return (diff / (1000 * 60 * 60)).toString();
          case 'minutes':
            return (diff / (1000 * 60)).toString();
          default:
            return diff.toString();
        }
      } catch {
        return '0';
      }
    });

    // CONCAT(str1, str2, ...)
    result = result.replace(/CONCAT\((.*?)\)/g, (match, args) => {
      const values = args.split(',').map((arg: string) => {
        const trimmed = arg.trim();
        const value = context[trimmed.replace(/[{}]/g, '')] || '';
        return value.toString();
      });
      return `"${values.join('')}"`;
    });

    return result;
  }

  /**
   * Evaluación segura de expresiones
   */
  private static safeEval(expression: string): any {
    try {
      // Lista blanca de operadores permitidos
      const allowedPattern = /^[\d\s+\-*/(). <>=!&|"']+$/;
      
      if (!allowedPattern.test(expression)) {
        throw new Error('Expresión contiene caracteres no permitidos');
      }
      
      // Evaluar usando Function constructor (más seguro que eval)
      const func = new Function('return ' + expression);
      return func();
    } catch (error) {
      console.error('Error in safe eval:', error);
      throw error;
    }
  }

  /**
   * Validar sintaxis de fórmula
   */
  static validate(formula: string): {
    valid: boolean;
    error?: string;
  } {
    try {
      // Verificar paréntesis balanceados
      const openCount = (formula.match(/\(/g) || []).length;
      const closeCount = (formula.match(/\)/g) || []).length;
      
      if (openCount !== closeCount) {
        return {
          valid: false,
          error: 'Paréntesis no balanceados'
        };
      }

      // Verificar funciones válidas
      const functionPattern = /([A-Z]+)\(/g;
      const functions = [...formula.matchAll(functionPattern)].map(m => m[1]);
      const validFunctions = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'IF', 'NOW', 'DATEDIFF', 'CONCAT', 'UPPER', 'LOWER'];
      
      for (const func of functions) {
        if (!validFunctions.includes(func)) {
          return {
            valid: false,
            error: `Función no válida: ${func}`
          };
        }
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Error de sintaxis'
      };
    }
  }

  /**
   * Obtener lista de campos referenciados en la fórmula
   */
  static getReferencedFields(formula: string): string[] {
    const fieldRegex = /\{([a-zA-Z0-9_]+)\}/g;
    const matches = [...formula.matchAll(fieldRegex)];
    return matches.map(m => m[1]);
  }

  /**
   * Obtener ayuda de funciones disponibles
   */
  static getFunctionsHelp(): {
    [funcName: string]: {
      syntax: string;
      description: string;
      example: string;
    };
  } {
    return {
      SUM: {
        syntax: 'SUM(number1, number2, ...)',
        description: 'Suma de valores numéricos',
        example: 'SUM({budget}, {expenses})'
      },
      AVG: {
        syntax: 'AVG(number1, number2, ...)',
        description: 'Promedio de valores numéricos',
        example: 'AVG({hours_week1}, {hours_week2})'
      },
      COUNT: {
        syntax: 'COUNT(value1, value2, ...)',
        description: 'Cuenta valores no vacíos',
        example: 'COUNT({task1}, {task2}, {task3})'
      },
      MIN: {
        syntax: 'MIN(number1, number2, ...)',
        description: 'Valor mínimo',
        example: 'MIN({estimate1}, {estimate2})'
      },
      MAX: {
        syntax: 'MAX(number1, number2, ...)',
        description: 'Valor máximo',
        example: 'MAX({cost1}, {cost2})'
      },
      IF: {
        syntax: 'IF(condition, valueIfTrue, valueIfFalse)',
        description: 'Condicional',
        example: 'IF({progress} >= 100, "Completado", "En progreso")'
      },
      NOW: {
        syntax: 'NOW()',
        description: 'Fecha y hora actual (timestamp)',
        example: 'NOW()'
      },
      DATEDIFF: {
        syntax: 'DATEDIFF(date1, date2, unit)',
        description: 'Diferencia entre fechas',
        example: 'DATEDIFF({start_date}, {end_date}, "days")'
      },
      CONCAT: {
        syntax: 'CONCAT(string1, string2, ...)',
        description: 'Concatenar textos',
        example: 'CONCAT({first_name}, " ", {last_name})'
      },
    };
  }
}

