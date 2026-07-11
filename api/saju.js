module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });
    return;
  }

  const { yearPillar, monthPillar, dayPillar, hourPillar, dominant, weakest } = req.body || {};

  if (!yearPillar || !monthPillar || !dayPillar || !dominant || !weakest) {
    res.status(400).json({ error: 'Missing saju data' });
    return;
  }

  const prompt = `너는 따뜻하고 친근한 말투의 사주 챗봇이야. 아래 사주 정보를 참고해서 한국어로 2~4문장짜리 자연스러운 해석을 작성해줘. 마지막 문장은 부족한 오행을 보완하면 좋다는 팁으로 마무리해줘. 과도하게 단정적인 예언이나 불안을 조성하는 표현은 피하고, 재미로 보는 콘텐츠라는 가벼운 톤을 유지해줘. 결과는 해석 텍스트만 반환하고 다른 부연설명은 하지 마.

년주: ${yearPillar}
월주: ${monthPillar}
일주: ${dayPillar}
시주: ${hourPillar || '모름'}
가장 강한 오행: ${dominant}
가장 약한 오행: ${weakest}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(502).json({ error: 'OpenAI request failed', detail });
      return;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      res.status(502).json({ error: 'Empty response from model' });
      return;
    }

    res.status(200).json({ analysis: text });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
};
