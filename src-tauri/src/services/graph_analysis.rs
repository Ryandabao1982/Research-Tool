use rusqlite::Connection;
use crate::services::cards::Card;
use rand::seq::SliceRandom;

pub struct Insight {
    pub title: String,
    pub description: String,
    pub card_a_id: String,
    pub card_b_id: String,
}

pub fn find_connections(conn: &Connection) -> Option<Insight> {
    // 1. Fetch random pair of cards (MVP heuristic: Serendipity)
    let mut stmt = conn.prepare("SELECT id, content FROM cards ORDER BY RANDOM() LIMIT 2").ok()?;
    
    let card_iter = stmt.query_map([], |row| {
        Ok(Card {
            id: row.get(0)?,
            type_id: "note".to_string(), // dummy
            content: row.get(1)?,
            metadata: "".to_string(),
            role_context: "all".to_string(),
            created_at: "".to_string(),
        })
    }).ok()?;

    let cards: Vec<Card> = card_iter.filter_map(Result::ok).collect();

    if cards.len() < 2 {
        return None;
    }

    let card_a = &cards[0];
    let card_b = &cards[1];

    // MVP Heuristic: Just return them as a "Potential Connection"
    // In a real/deeper implementation, we check for cosine similarity or shared tags
    Some(Insight {
        title: "Link Suggested".to_string(),
        description: format!("Have you considered how '{}' relates to '{}'?", 
            truncate(&card_a.content, 20), 
            truncate(&card_b.content, 20)
        ),
        card_a_id: card_a.id.clone(),
        card_b_id: card_b.id.clone(),
    })
}

fn truncate(s: &str, max_chars: usize) -> String {
    match s.char_indices().nth(max_chars) {
        None => s.to_string(),
        Some((idx, _)) => format!("{}...", &s[..idx]),
    }
}
