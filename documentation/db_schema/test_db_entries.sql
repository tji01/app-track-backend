-- ============================================
-- USERS
-- ============================================
INSERT INTO users (id, email, password_hash, name) VALUES
(1, 'alex@example.com', '$2b$10$examplehashvalue1234567890abcdefghijk', 'Alex Rivera');

-- Reset the sequence so future inserts don't collide with hardcoded IDs
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ============================================
-- COMPANIES
-- ============================================
INSERT INTO companies (id, user_id, name, website, notes) VALUES
(1, 1, 'Acme Corp',        'https://acme.example.com',        'Series B, ~150 employees'),
(2, 1, 'Northwind Systems','https://northwind.example.com',   'Referral from Priya'),
(3, 1, 'Globex Inc',       'https://globex.example.com',      NULL),
(4, 1, 'Initech',          'https://initech.example.com',     'Found via LinkedIn job alert'),
(5, 1, 'Umbrella Digital', 'https://umbrella.example.com',    'Remote-first company');

SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

-- ============================================
-- APPLICATIONS
-- ============================================
INSERT INTO applications (id, user_id, company_id, role_title, job_post_url, source, salary_range, current_status, applied_date) VALUES
(1, 1, 1, 'Frontend Engineer',        'https://acme.example.com/careers/1',     'LinkedIn',    '$85k-$100k', 'interview', '2026-06-01'),
(2, 1, 2, 'Full Stack Developer',     'https://northwind.example.com/jobs/22',  'Referral',    '$95k-$110k', 'screening', '2026-06-10'),
(3, 1, 3, 'Backend Engineer',         'https://globex.example.com/careers/9',   'Company site','$90k-$105k', 'applied',   '2026-06-18'),
(4, 1, 4, 'Software Engineer I',      'https://initech.example.com/jobs/4',     'LinkedIn',    '$80k-$95k',  'rejected',  '2026-05-20'),
(5, 1, 5, 'Junior Full Stack Dev',    'https://umbrella.example.com/careers/2', 'Indeed',      '$75k-$90k',  'offer',     '2026-05-15');

SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications));

-- ============================================
-- STAGE EVENTS (history per application)
-- ============================================
-- App 1: Acme — applied -> screening -> interview
INSERT INTO stage_events (application_id, stage, note, occurred_at) VALUES
(1, 'applied',   NULL,                          '2026-06-01 09:00:00+00'),
(1, 'screening', 'Recruiter call scheduled',    '2026-06-05 14:00:00+00'),
(1, 'interview', 'Technical round with team',   '2026-06-14 16:00:00+00');

-- App 2: Northwind — applied -> screening
INSERT INTO stage_events (application_id, stage, note, occurred_at) VALUES
(2, 'applied',   NULL,                          '2026-06-10 10:00:00+00'),
(2, 'screening', 'Recruiter reached out',       '2026-06-16 11:00:00+00');

-- App 3: Globex — applied only
INSERT INTO stage_events (application_id, stage, note, occurred_at) VALUES
(3, 'applied', NULL, '2026-06-18 08:30:00+00');

-- App 4: Initech — applied -> screening -> rejected
INSERT INTO stage_events (application_id, stage, note, occurred_at) VALUES
(4, 'applied',   NULL,                              '2026-05-20 09:00:00+00'),
(4, 'screening', 'Phone screen completed',          '2026-05-25 13:00:00+00'),
(4, 'rejected',  'Went with a more senior candidate','2026-06-02 17:00:00+00');

-- App 5: Umbrella — full pipeline to offer
INSERT INTO stage_events (application_id, stage, note, occurred_at) VALUES
(5, 'applied',   NULL,                          '2026-05-15 09:00:00+00'),
(5, 'screening', NULL,                          '2026-05-19 10:00:00+00'),
(5, 'interview', 'Two rounds, went well',       '2026-05-28 15:00:00+00'),
(5, 'offer',     'Offer received, negotiating', '2026-06-20 12:00:00+00');

-- ============================================
-- CONTACTS
-- ============================================
INSERT INTO contacts (company_id, name, role, email, linkedin_url) VALUES
(1, 'Jordan Lee',    'Recruiter',       'jordan.lee@acme.example.com',       'https://linkedin.com/in/jordanlee'),
(1, 'Sam Patel',     'Hiring Manager',  'sam.patel@acme.example.com',        NULL),
(2, 'Priya Shah',    'Referral / Eng',  'priya.shah@northwind.example.com',  'https://linkedin.com/in/priyashah'),
(5, 'Morgan Diaz',   'Recruiter',       'morgan.diaz@umbrella.example.com',  'https://linkedin.com/in/morgandiaz');

-- ============================================
-- NOTES
-- ============================================
INSERT INTO notes (application_id, content) VALUES
(1, 'Team seems to use React + GraphQL, brush up on Apollo Client before the interview.'),
(2, 'Priya said the team is growing fast, good culture fit signals.'),
(4, 'Feedback: strong on frontend, wanted more backend depth.'),
(5, 'Offer includes remote stipend — worth asking about equity details.');
