const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGoogleAPI() {
  try {
    console.log('Testing Google API connection...');
    
    const apiKey = 'AIzaSyDYUoXyUudCCiY_UtzLID9ME_9BGRiBQ7o';
    if (!apiKey) {
      throw new Error('No API key found');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('Generating test content...');
    const result = await model.generateContent('Say hello in a friendly way.');
    const response = result.response;
    const text = response.text();
    
    console.log('Success! Response:', text);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testGoogleAPI();
