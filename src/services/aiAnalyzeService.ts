import { environment } from '@/config/environment';

class AiAnalyzeService {
    private apiUrl = environment.apiUrl;

    /**
     * Analyze attendee profile using AI
     * TODO: Update endpoint once API is available
     */
    // expected data format
    //     {
    //   "name": "Elon Musk",
    //   "linkedinUrl": "https://www.linkedin.com/in/elonmusk/",
    //   "company": "Tesla, Inc.",
    //   "designation": "CEO",
    //   "email": ""
    // }
    async aiAnalizeProfile(data: Partial<any>): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/profile/enrich`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Anonymous': 'true'
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('AI analysis failed');
            }

            return await response.json();
        } catch (error) {
            console.error('AI analysis error:', error);
            throw error;
        }
    }
}

export const aiAnalyzeService = new AiAnalyzeService();