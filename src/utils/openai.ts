import { Configuration, OpenAIApi } from 'openai';

const API_KEY = process.env.OPENAI_API_KEY; 

class GPTClient {

    public async askGPT(messages: any) {
        const url = 'https://api.openai.com/v1/chat/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        };
        const body = JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages,
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message;
        } catch (error) {
            console.error('Error communicating with GPT API:', error);
            throw error;
        }
    }
}

export default GPTClient;
