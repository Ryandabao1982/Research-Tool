-- AI Features Schema for KnowledgeBase Pro
-- Version: 002
-- Created: 2025-12-29
-- Adds support for NotebookLM-inspired AI features

-- 8. AI Conversations Table
-- Stores conversation threads for AI chats.
CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    message_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);

-- 9. AI Messages Table
-- Stores individual messages within conversations.
CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    citations TEXT, -- JSON array of citations
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);

-- 10. Generated Content Table
-- Stores AI-generated content like study guides, audio overviews, FAQs.
CREATE TABLE IF NOT EXISTS generated_content (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'audio_overview', 'study_guide', 'faq', 'timeline', 'concept_map', 'video_overview'
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- JSON content
    source_ids TEXT NOT NULL, -- JSON array of source document IDs
    generation_params TEXT, -- JSON parameters used
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(type);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON generated_content(created_at);

-- 11. Concepts Table
-- Stores concepts extracted from documents for knowledge graph.
CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    definition TEXT,
    frequency INTEGER DEFAULT 0,
    importance_score REAL DEFAULT 0,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_concepts_name ON concepts(name);
CREATE INDEX IF NOT EXISTS idx_concepts_importance ON concepts(importance_score DESC);

-- 12. Concept Relationships Table
-- Stores relationships between concepts.
CREATE TABLE IF NOT EXISTS concept_relationships (
    id TEXT PRIMARY KEY,
    source_concept TEXT NOT NULL,
    target_concept TEXT NOT NULL,
    relationship_type TEXT NOT NULL, -- 'defines', 'relates_to', 'contradicts', 'supports'
    strength REAL DEFAULT 0, -- 0-1
    context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_concept) REFERENCES concepts(id) ON DELETE CASCADE,
    FOREIGN KEY (target_concept) REFERENCES concepts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_concept_relationships_source ON concept_relationships(source_concept);
CREATE INDEX IF NOT EXISTS idx_concept_relationships_target ON concept_relationships(target_concept);
CREATE INDEX IF NOT EXISTS idx_concept_relationships_strength ON concept_relationships(strength DESC);
