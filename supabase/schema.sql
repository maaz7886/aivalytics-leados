-- ==========================================
-- Aivalytics LeadOS CRM: Supabase Schema DDL
-- Execute this SQL script in Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT DEFAULT 'Bengaluru',
    state TEXT DEFAULT 'Karnataka',
    country TEXT DEFAULT 'India',
    
    -- Acquisition & Meta Ads
    source TEXT DEFAULT 'Meta Lead Ads',
    meta_campaign TEXT,
    meta_ad_set TEXT,
    meta_ad TEXT,
    campaign_id TEXT,
    date_captured TIMESTAMPTZ DEFAULT NOW(),
    
    -- Program
    program_id TEXT DEFAULT 'ai-pm',
    program_name TEXT DEFAULT 'AI-Native Project Management',
    
    -- Professional Profile
    professional_status TEXT DEFAULT 'Working Professional',
    "current_role" TEXT DEFAULT 'Project Manager',
    current_company TEXT DEFAULT 'Tech Organization',
    industry TEXT DEFAULT 'Technology',
    years_of_experience INT DEFAULT 5,
    current_responsibilities TEXT,
    current_skill_set JSONB DEFAULT '[]'::jsonb,
    current_ai_usage_level TEXT DEFAULT 'Intermediate',
    
    -- Career Goals
    primary_goal TEXT DEFAULT 'Upskill in Current Role',
    desired_role TEXT,
    expected_timeline TEXT DEFAULT '3-6 months',
    main_challenge TEXT,
    why_now TEXT,
    expected_outcome TEXT,
    comments TEXT,
    investment TEXT,
    education TEXT,
    priority TEXT DEFAULT 'P2',
    qualification_status TEXT,
    objection TEXT,
    preferred_batch TEXT,
    preferred_contact_time TEXT,
    payment_link TEXT,
    ai_recommendation TEXT,
    
    -- Sales & CRM Stages
    assigned_salesperson TEXT DEFAULT 'Alex Rivera',
    crm_stage TEXT DEFAULT 'Lead',
    lead_temperature TEXT DEFAULT 'Hot',
    last_contacted TEXT DEFAULT 'Not Contacted',
    next_follow_up TEXT,
    number_of_calls INT DEFAULT 0,
    number_of_follow_ups INT DEFAULT 0,
    payment_status TEXT DEFAULT 'Unpaid',
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    enrollment_status TEXT DEFAULT 'Not Enrolled',
    
    -- AI Scoring & Analysis
    fit_score INT DEFAULT 85,
    intent_score INT DEFAULT 75,
    lead_score INT DEFAULT 0,
    lead_health_score INT DEFAULT 0,
    ai_summary TEXT,
    next_best_action TEXT,
    conversion_probability INT DEFAULT 0,
    temperature TEXT DEFAULT 'Cold',
    fit_score_breakdown JSONB DEFAULT '[]'::jsonb,
    intent_score_breakdown JSONB DEFAULT '[]'::jsonb,
    likely_desired_outcome TEXT,
    recommended_positioning TEXT,
    recommended_opening TEXT,
    discovery_questions JSONB DEFAULT '[]'::jsonb,
    
    -- Call Notes History
    call_notes_history JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    structure JSONB DEFAULT '[]'::jsonb,
    eligibility TEXT,
    placement_support TEXT,
    outcomes JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    batch_timing TEXT,
    faqs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    lead_name TEXT,
    type TEXT NOT NULL,
    due_date TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Pending',
    description TEXT,
    assigned_to TEXT DEFAULT 'Alex Rivera',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Seed Initial Program Dataset
INSERT INTO public.programs (id, name, duration, price, eligibility, placement_support, batch_timing, outcomes, projects)
VALUES
(
    'ai-pm',
    'AI-Native Project Management',
    '3 Months',
    49999.00,
    '3+ years experience in PM, Operations, Tech, or Business Delivery',
    'Resume positioning for AI-PM roles, 1-on-1 career coaching, top company referrals',
    'Saturdays & Sundays (10:00 AM - 1:00 PM IST)',
    '["Build multi-agent workflow systems that automate 50% of routine PM tasks", "Engineer custom AI SOPs for engineering teams"]'::jsonb,
    '["Autonomous Sprint Status & Risk Auditor Agent", "AI-Powered PRD & User Story Generator Workflow"]'::jsonb
),
(
    'ai-gtm',
    'AI-Native GTM & Growth',
    '3 Months',
    54999.00,
    'Marketing Leads, Growth Managers, Founders, Product Marketers',
    'GTM Portfolio build, growth advisory network, career referral network',
    'Saturdays & Sundays (2:00 PM - 5:00 PM IST)',
    '["Scale qualified lead volume 3x while cutting manual research time by 70%"]'::jsonb,
    '["Autonomous Outbound Lead Enrichment & Prospecting Agent"]'::jsonb
),
(
    'ai-fellowship',
    'AI Leadership Fellowship',
    '4 Months',
    99999.00,
    'Founders, Directors, VP/CXOs, Management Consultants (10+ yrs exp)',
    'Executive network access, investor demo day, corporate transformation board referrals',
    'Alternate Weekends & Mastermind Dinners',
    '["Launch AI business unit or consulting offering with validated architecture"]'::jsonb,
    '["Full Enterprise AI Audit & Agent Deployment Architecture"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    name = EXCLUDED.name;

-- 6. Seed Initial Demo Lead Dataset
INSERT INTO public.leads (
    id, full_name, phone, email, city, source, program_id, program_name,
    professional_status, current_role, current_company, years_of_experience,
    current_ai_usage_level, primary_goal, crm_stage, fit_score, intent_score
)
VALUES
(
    'lead-rahul-001',
    'Rahul Sharma',
    '+91 98765 43210',
    'rahul.sharma@techcorp.io',
    'Bengaluru',
    'Meta Lead Ads',
    'ai-pm',
    'AI-Native Project Management',
    'Working Professional',
    'Project Manager',
    'TechCorp Solutions',
    10,
    'Intermediate',
    'Upskill + Switch Company',
    'Qualified',
    92,
    68
),
(
    'lead-priya-002',
    'Priya Sundaram',
    '+91 91234 56789',
    'priya.s@gtmscale.com',
    'Mumbai',
    'Meta Lead Ads',
    'ai-gtm',
    'AI-Native GTM',
    'Working Professional',
    'Growth Marketing Lead',
    'GTM Scale Studio',
    7,
    'Intermediate',
    'Learn Automation',
    'Interested',
    88,
    74
),
(
    'lead-vikram-003',
    'Vikram Mehta',
    '+91 99887 76655',
    'vikram@mehtaconsulting.com',
    'Delhi NCR',
    'Meta Lead Ads',
    'ai-fellowship',
    'AI Fellowship',
    'Founder',
    'Managing Director',
    'Mehta Consulting Group',
    14,
    'Beginner',
    'Start a Business',
    'Details sent',
    96,
    91
)
ON CONFLICT (id) DO NOTHING;

-- 7. Enable Row Level Security (RLS) & Public Policies for App Integration
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on leads" ON public.leads FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on programs" ON public.programs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on programs" ON public.programs FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on tasks" ON public.tasks FOR UPDATE USING (true);
- -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 - -   P H A S E   1 :   N O R M A L I Z E D   S U P P O R T I N G   T A B L E S  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
  
 - -   U s e r s   /   P r o f i l e s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . p r o f i l e s   (  
         i d   U U I D   R E F E R E N C E S   a u t h . u s e r s ( i d )   P R I M A R Y   K E Y ,  
         e m a i l   T E X T   U N I Q U E   N O T   N U L L ,  
         f u l l _ n a m e   T E X T   N O T   N U L L ,  
         r o l e   T E X T   D E F A U L T   ' S a l e s p e r s o n ' ,   - -   A d m i n ,   M a n a g e r ,   S a l e s p e r s o n  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( ) ,  
         u p d a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . p r o f i l e s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   I m p o r t   B a t c h e s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . i m p o r t _ b a t c h e s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         f i l e n a m e   T E X T   N O T   N U L L ,  
         s o u r c e   T E X T ,  
         u p l o a d e d _ b y   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         t o t a l _ r o w s   I N T   D E F A U L T   0 ,  
         i m p o r t e d _ r o w s   I N T   D E F A U L T   0 ,  
         u p d a t e d _ r o w s   I N T   D E F A U L T   0 ,  
         d u p l i c a t e s   I N T   D E F A U L T   0 ,  
         f a i l e d _ r o w s   I N T   D E F A U L T   0 ,  
         s k i p p e d _ r o w s   I N T   D E F A U L T   0 ,  
         e r r o r s   J S O N B   D E F A U L T   ' [ ] ' : : j s o n b ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . i m p o r t _ b a t c h e s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   L e a d   A c t i v i t i e s   ( U n i v e r s a l   T i m e l i n e )  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . l e a d _ a c t i v i t i e s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         a c t i v i t y _ t y p e   T E X T   N O T   N U L L ,   - -   ' s t a g e _ c h a n g e ' ,   ' c a l l ' ,   ' w h a t s a p p ' ,   ' n o t e ' ,   ' a i _ e v a l ' ,   ' p a y m e n t '  
         d e s c r i p t i o n   T E X T ,  
         c r e a t e d _ b y   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         m e t a d a t a   J S O N B   D E F A U L T   ' { } ' : : j s o n b ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . l e a d _ a c t i v i t i e s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   L e a d   S t a g e   H i s t o r y  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . l e a d _ s t a g e _ h i s t o r y   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         p r e v i o u s _ s t a g e   T E X T ,  
         n e w _ s t a g e   T E X T   N O T   N U L L ,  
         r e a s o n   T E X T ,  
         c h a n g e d _ b y   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . l e a d _ s t a g e _ h i s t o r y   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   C a l l s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . c a l l s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         o u t c o m e   T E X T   N O T   N U L L ,  
         d u r a t i o n _ s e c o n d s   I N T ,  
         r e c o r d i n g _ u r l   T E X T ,  
         s a l e s p e r s o n _ i d   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . c a l l s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   N o t e s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . n o t e s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         c o n t e n t   T E X T   N O T   N U L L ,  
         a u t h o r _ i d   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( ) ,  
         u p d a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . n o t e s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   F o l l o w   U p s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . f o l l o w _ u p s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         s c h e d u l e d _ d a t e   T I M E S T A M P T Z   N O T   N U L L ,  
         c o m p l e t e d _ d a t e   T I M E S T A M P T Z ,  
         s t a t u s   T E X T   D E F A U L T   ' P e n d i n g ' ,   - -   ' P e n d i n g ' ,   ' C o m p l e t e d ' ,   ' C a n c e l l e d '  
         a s s i g n e d _ t o   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . f o l l o w _ u p s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   O b j e c t i o n s   M a s t e r   L i s t  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . o b j e c t i o n s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         c a t e g o r y   T E X T   N O T   N U L L ,  
         n a m e   T E X T   N O T   N U L L ,  
         d e f a u l t _ h a n d l i n g _ s c r i p t   T E X T ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . o b j e c t i o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   L e a d   O b j e c t i o n s   ( J u n c t i o n )  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . l e a d _ o b j e c t i o n s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         o b j e c t i o n _ i d   T E X T   R E F E R E N C E S   p u b l i c . o b j e c t i o n s ( i d ) ,  
         o b j e c t i o n _ t e x t   T E X T ,  
         h a n d l e d   B O O L E A N   D E F A U L T   F A L S E ,  
         l o g g e d _ b y   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . l e a d _ o b j e c t i o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   A I   E v a l u a t i o n s   &   D e c i s i o n s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . a i _ e v a l u a t i o n s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         e v a l u a t i o n _ t y p e   T E X T   N O T   N U L L ,   - -   ' q u a l i f i c a t i o n ' ,   ' t e m p e r a t u r e ' ,   ' n e x t _ b e s t _ a c t i o n '  
         r e s u l t   T E X T   N O T   N U L L ,  
         s c o r e   I N T ,  
         c o n f i d e n c e   N U M E R I C ( 4 ,   2 ) ,  
         r e a s o n i n g   T E X T ,  
         m o d e l _ v e r s i o n   T E X T ,  
         u s e r _ a c t i o n   T E X T   D E F A U L T   ' P e n d i n g ' ,   - -   ' A c c e p t e d ' ,   ' O v e r r i d d e n ' ,   ' D i s m i s s e d '  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . a i _ e v a l u a t i o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   M e s s a g e s   ( W h a t s A p p / E m a i l )  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . m e s s a g e s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         c h a n n e l   T E X T   N O T   N U L L ,   - -   ' W h a t s A p p ' ,   ' E m a i l '  
         d i r e c t i o n   T E X T   N O T   N U L L ,   - -   ' I n b o u n d ' ,   ' O u t b o u n d '  
         c o n t e n t   T E X T ,  
         s t a t u s   T E X T   D E F A U L T   ' S e n t ' ,  
         s e n t _ b y   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . m e s s a g e s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   P a y m e n t s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . p a y m e n t s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         a m o u n t   N U M E R I C ( 1 0 ,   2 )   N O T   N U L L ,  
         d i s c o u n t   N U M E R I C ( 1 0 ,   2 )   D E F A U L T   0 ,  
         p a y m e n t _ m e t h o d   T E X T ,  
         t r a n s a c t i o n _ i d   T E X T ,  
         s t a t u s   T E X T   D E F A U L T   ' P e n d i n g ' ,   - -   ' P e n d i n g ' ,   ' P a i d ' ,   ' F a i l e d ' ,   ' R e f u n d e d '  
         p a y m e n t _ l i n k   T E X T ,  
         p a y m e n t _ d a t e   T I M E S T A M P T Z ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . p a y m e n t s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   E n r o l l m e n t s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . e n r o l l m e n t s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         l e a d _ i d   T E X T   R E F E R E N C E S   p u b l i c . l e a d s ( i d )   O N   D E L E T E   C A S C A D E ,  
         p r o g r a m _ i d   T E X T   R E F E R E N C E S   p u b l i c . p r o g r a m s ( i d ) ,  
         b a t c h   T E X T ,  
         a m o u n t _ p a i d   N U M E R I C ( 1 0 ,   2 ) ,  
         e n r o l l m e n t _ d a t e   T I M E S T A M P T Z   D E F A U L T   N O W ( ) ,  
         s a l e s p e r s o n _ i d   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         l e a d _ s o u r c e   T E X T ,  
         c a m p a i g n   T E X T ,  
         d a y s _ t o _ c o n v e r t   I N T ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . e n r o l l m e n t s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   A u d i t   L o g s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . a u d i t _ l o g s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         t a b l e _ n a m e   T E X T   N O T   N U L L ,  
         r e c o r d _ i d   T E X T   N O T   N U L L ,  
         a c t i o n   T E X T   N O T   N U L L ,   - -   ' I N S E R T ' ,   ' U P D A T E ' ,   ' D E L E T E '  
         o l d _ v a l u e   J S O N B ,  
         n e w _ v a l u e   J S O N B ,  
         c h a n g e d _ b y   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d ) ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . a u d i t _ l o g s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   N o t i f i c a t i o n s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . n o t i f i c a t i o n s   (  
         i d   T E X T   P R I M A R Y   K E Y ,  
         u s e r _ i d   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d )   O N   D E L E T E   C A S C A D E ,  
         t i t l e   T E X T   N O T   N U L L ,  
         c o n t e n t   T E X T ,  
         r e a d   B O O L E A N   D E F A U L T   F A L S E ,  
         a c t i o n _ u r l   T E X T ,  
         c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
 A L T E R   T A B L E   p u b l i c . n o t i f i c a t i o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   P u b l i c   R L S   a c c e s s   f o r   d e v  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   p r o f i l e s "   O N   p u b l i c . p r o f i l e s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   i m p o r t _ b a t c h e s "   O N   p u b l i c . i m p o r t _ b a t c h e s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   l e a d _ a c t i v i t i e s "   O N   p u b l i c . l e a d _ a c t i v i t i e s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   l e a d _ s t a g e _ h i s t o r y "   O N   p u b l i c . l e a d _ s t a g e _ h i s t o r y   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   c a l l s "   O N   p u b l i c . c a l l s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   n o t e s "   O N   p u b l i c . n o t e s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   f o l l o w _ u p s "   O N   p u b l i c . f o l l o w _ u p s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   o b j e c t i o n s "   O N   p u b l i c . o b j e c t i o n s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   l e a d _ o b j e c t i o n s "   O N   p u b l i c . l e a d _ o b j e c t i o n s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   a i _ e v a l u a t i o n s "   O N   p u b l i c . a i _ e v a l u a t i o n s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   m e s s a g e s "   O N   p u b l i c . m e s s a g e s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   p a y m e n t s "   O N   p u b l i c . p a y m e n t s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   e n r o l l m e n t s "   O N   p u b l i c . e n r o l l m e n t s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   a u d i t _ l o g s "   O N   p u b l i c . a u d i t _ l o g s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   a l l   a c c e s s   o n   n o t i f i c a t i o n s "   O N   p u b l i c . n o t i f i c a t i o n s   F O R   A L L   U S I N G   ( t r u e )   W I T H   C H E C K   ( t r u e ) ;  
 