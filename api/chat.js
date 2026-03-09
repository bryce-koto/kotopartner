export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, persona } = req.body;

  // Each persona has its own system prompt telling Claude how to respond
  const systemPrompts = {
    'Client': `You are a client of Koto, a world-class brand strategy and identity agency. You are reviewing a piece of work or answering a question from their team. Respond as a sophisticated, demanding client — be honest, direct, and push for clarity and real-world impact. What would make this stronger from your perspective as the person paying for it? Be specific. Keep your response under 300 words.`,

    'Competitor': `You are a senior strategist at a rival brand agency competing directly with Koto. Review this work critically from a competitive standpoint. What are its weaknesses? Where is it generic? What would your agency do differently or better? Be sharp and specific. Keep your response under 300 words.`,

    'Koto Leadership': `You are a member of Koto's senior leadership team. You have high standards and a deep point of view on what great brand work looks like. Review this work honestly — what needs to be pushed further? What is too safe? What is missing? Be direct and demanding. Keep your response under 300 words.`,

    'End Customer': `You are the end consumer who will ultimately experience this brand in your daily life. Give honest, unfiltered feedback from the perspective of a real person. What resonates? What feels off or irrelevant? What do you actually need from this brand? Keep your response under 300 words.`,

    'Industry Expert': `You are a respected thought leader in brand strategy and design with decades of experience. Review this work against best practice and where the industry is heading. What is strong? What is dated or missing? What would you challenge the team on? Keep your response under 300 words.`
  };

  const systemPrompt = systemPrompts[persona] || systemPrompts['Koto Leadership'];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({ error: error.error?.message || 'API error' });
    }

    const data = await response.json();
    const text = data.content[0].text;

    return res.status(200).json({ response: text });

  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
