import type { CompilerResult } from '../types';

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = 'bcd1e55751msh07c2d2af7536ad7p1e0372jsn3eba2d19abac'; // You'll need to get this from RapidAPI

export class CompilerService {
  private static instance: CompilerService;
  
  private constructor() {}
  
  public static getInstance(): CompilerService {
    if (!CompilerService.instance) {
      CompilerService.instance = new CompilerService();
    }
    return CompilerService.instance;
  }

  async executeCode(code: string, languageId: number, input: string = ''): Promise<CompilerResult> {
    try {
      // Submit code for execution
      const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: code,
          stdin: input,
        }),
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit code');
      }

      const result = await submitResponse.json();

      return {
        output: result.stdout || '',
        error: result.stderr || result.compile_output || '',
        executionTime: result.time || 0,
      };
    } catch (error) {
      // Fallback for demo purposes when API is not available
      return this.simulateExecution(code, languageId);
    }
  }

  private simulateExecution(code: string, _languageId: number): CompilerResult {
    // Simple simulation for demo purposes
    const timestamp = new Date().toLocaleTimeString();
    
    if (code.toLowerCase().includes('error') || code.includes('throw')) {
      return {
        output: '',
        error: 'Simulated compilation error: Check your code syntax',
        executionTime: 0.05,
      };
    }

    return {
      output: `[${timestamp}] Code executed successfully!\nOutput: Hello, World!\n(This is a simulation - connect to Judge0 API for real execution)`,
      error: '',
      executionTime: 0.123,
    };
  }
}