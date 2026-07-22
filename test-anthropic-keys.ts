async function getApiKey(apiKeyId: string, oauthToken: string) {
  try {
    const url = `https://api.anthropic.com/v1/organizations/api_keys/${apiKeyId}`;
    console.log(`Sending GET request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'anthropic-version': '2023-06-01',
        'Authorization': `Bearer ${oauthToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Key Details successfully retrieved:\n', JSON.stringify(data, null, 2));
    return data;
  } catch (error: any) {
    console.error('Failed to retrieve API key details:', error.message);
    throw error;
  }
}

// Run using environment variables or fallbacks
const apiKeyId = process.env.ANTHROPIC_API_KEY_ID || 'apikey_01Rj2N8SVvo6BePZj99NhmiT';
const oauthToken = process.env.ANTHROPIC_OAUTH_TOKEN || 'your-anthropic-oauth-token-here';

getApiKey(apiKeyId, oauthToken).catch(() => {});
