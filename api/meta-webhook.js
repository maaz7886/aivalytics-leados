// api/meta-webhook.js
// Vercel Serverless Function for Meta Lead Ads Webhook Ingestion

export default async function handler(req, res) {
  // 1. GET Request: Meta Webhook Verification Challenge
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'aivalytics_leados_token';

    if (mode && token === VERIFY_TOKEN) {
      console.log('META_WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Verification failed. Token mismatch.' });
    }
  }

  // 2. POST Request: Real-Time Lead Event Ingestion from Meta Ads
  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object === 'page') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'leadgen') {
              const leadgenId = change.value?.leadgen_id;
              const formId = change.value?.form_id;
              const pageId = change.value?.page_id;

              console.log(`[Meta Lead Ingested]: LeadGen ID: ${leadgenId}, Form: ${formId}, Page: ${pageId}`);

              // If Meta Access Token is set, fetch full lead field responses from Graph API
              const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
              let leadFields = {};

              if (metaAccessToken && leadgenId) {
                const graphRes = await fetch(
                  `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${metaAccessToken}`
                );
                if (graphRes.ok) {
                  const leadData = await graphRes.json();
                  // Extract field_data array: [{ name: "full_name", values: ["Rahul Sharma"] }, ...]
                  (leadData.field_data || []).forEach((field) => {
                    leadFields[field.name] = field.values?.[0] || '';
                  });
                }
              }

              // Constructed Lead OS Payload
              const newLead = {
                id: `meta-lead-${leadgenId || Date.now()}`,
                fullName: leadFields.full_name || leadFields.name || 'Meta Ad Applicant',
                phone: leadFields.phone_number || leadFields.phone || '+91 98765 00000',
                email: leadFields.email || 'applicant@meta-lead.com',
                city: leadFields.city || 'Bengaluru',
                source: 'Meta Lead Ads Direct Webhook',
                programId: formId?.includes('gtm') ? 'ai-gtm' : formId?.includes('fellowship') ? 'ai-fellowship' : 'ai-pm',
                programName: 'AI-Native Project Management',
                professionalStatus: 'Working Professional',
                currentRole: leadFields.job_title || leadFields.role || 'Project Manager',
                currentCompany: leadFields.company_name || 'Tech Organization',
                yearsOfExperience: parseInt(leadFields.years_of_experience || '5', 10),
                crmStage: 'Lead',
                fitScore: 90,
                dateCaptured: new Date().toISOString()
              };

              console.log('Constructed LeadOS Payload:', newLead);
            }
          }
        }

        return res.status(200).json({ status: 'EVENT_RECEIVED', success: true });
      }

      return res.status(404).json({ error: 'Not a page event' });
    } catch (error) {
      console.error('Error processing Meta lead webhook:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
