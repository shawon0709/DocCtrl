import axios from 'axios';

interface WordEditorResponse {
  success: boolean;
  error?: string;
}

export default class WordEditorService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  public async performFindAndReplace(filePath: string, replacements: Record<string, string>): Promise<WordEditorResponse> {
    try {
      const response = await axios.post(this.apiUrl, { filePath, replacements });
      return response.data;
    } catch (error: any) {
      console.error('Error:', error.response?.data);
      return { success: false, error: 'An error occurred while performing the operation.' };
    }
  }
}
