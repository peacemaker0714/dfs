module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: 'Supabase is not configured' });
    return;
  }

  const {
    birthDate, birthTime, timeUnknown, gender,
    yearPillar, monthPillar, dayPillar, hourPillar,
    dominant, weakest, analysisText,
    mainNumbers, bonusNumber
  } = req.body || {};

  if (!birthDate || !yearPillar || !monthPillar || !dayPillar
    || !Array.isArray(mainNumbers) || mainNumbers.length !== 6 || bonusNumber == null) {
    res.status(400).json({ error: 'Missing or invalid draw data' });
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/saju_draws`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify([{
        birth_date: birthDate,
        birth_time: timeUnknown ? null : birthTime,
        time_unknown: !!timeUnknown,
        gender: gender || null,
        year_pillar: yearPillar,
        month_pillar: monthPillar,
        day_pillar: dayPillar,
        hour_pillar: hourPillar || null,
        dominant_element: dominant,
        weak_element: weakest,
        analysis_text: analysisText || null,
        main_numbers: mainNumbers,
        bonus_number: bonusNumber
      }])
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(502).json({ error: 'Supabase insert failed', detail });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
};
