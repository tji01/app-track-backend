


-- Users (the job seeker — supports multi-user if you ever open it up)
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    website     VARCHAR(255),
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id     INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role_title     VARCHAR(255) NOT NULL,
    job_post_url   VARCHAR(500),
    source         VARCHAR(100),        -- e.g. "LinkedIn", "referral", "company site"
    salary_range   VARCHAR(100),
    current_status VARCHAR(50) NOT NULL DEFAULT 'applied',
        -- 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
    applied_date   DATE NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Stage events — the event log. This is the important design choice:
-- current_status on `applications` is a convenience cache; the real
-- history/source of truth lives here.
CREATE TABLE stage_events (
    id             SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    stage          VARCHAR(50) NOT NULL,
    note           TEXT,                 -- optional: "recruiter call went well"
    occurred_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts (recruiters, interviewers) tied to a company
CREATE TABLE contacts (
    id          SERIAL PRIMARY KEY,
    company_id  INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    role        VARCHAR(100),        -- e.g. "Recruiter", "Hiring Manager"
    email       VARCHAR(255),
    linkedin_url VARCHAR(500),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Freeform notes attached directly to an application
CREATE TABLE notes (
    id             SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    content        TEXT NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_company_id ON applications(company_id);
CREATE INDEX idx_applications_status ON applications(current_status);
CREATE INDEX idx_stage_events_application_id ON stage_events(application_id);
CREATE INDEX idx_companies_user_id ON companies(user_id);
