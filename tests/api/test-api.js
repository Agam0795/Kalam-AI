// Quick test of the humanize API endpoint
import fetch from 'node-fetch';

async function testHumanizeAPI() {
  try {
    console.log('Testing humanize-text API...');
    
    const response = await fetch('http://localhost:3000/api/humanize-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'This is a test text that needs to be humanized.',
        tone: 'conversational',
        audience: 'general'
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testHumanizeAPI();
