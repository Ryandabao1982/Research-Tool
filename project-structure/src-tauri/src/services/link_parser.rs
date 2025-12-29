use regex::Regex;

pub struct LinkParser {
    wikilink_regex: Regex,
    block_ref_regex: Regex,
}

impl LinkParser {
    pub fn new() -> Self {
        Self {
            wikilink_regex: Regex::new(r"\[\[([^\]]+)\]\]").unwrap(),
            block_ref_regex: Regex::new(r"\(\(([^\)]+)\)\)").unwrap(),
        }
    }

    pub fn extract_wikilinks(&self, content: &str) -> Vec<String> {
        self.wikilink_regex
            .captures_iter(content)
            .map(|cap| cap[1].to_string())
            .collect()
    }

    pub fn extract_block_refs(&self, content: &str) -> Vec<String> {
        self.block_ref_regex
            .captures_iter(content)
            .map(|cap| cap[1].to_string())
            .collect()
    }

    pub fn create_wikilink(&self, title: &str) -> String {
        format!("[[{}]]", title)
    }

    pub fn create_block_ref(&self, note_id: &str, block_id: &str) -> String {
        format!("[[{}]](({}))", note_id, block_id)
    }

    pub fn parse_link_text(&self, link: &str) -> (String, Option<String>) {
        if let Some(caps) = self.block_ref_regex.captures(link) {
            let note_id = link.replace(&caps[0], "").replace("[[", "").replace("]]", "");
            let block_id = Some(caps[1].to_string());
            (note_id, block_id)
        } else {
            let note_id = link.replace("[[", "").replace("]]", "");
            (note_id, None)
        }
    }

    pub fn is_wikilink(&self, text: &str) -> bool {
        self.wikilink_regex.is_match(text)
    }

    pub fn sanitize_link_title(&self, title: &str) -> String {
        title.trim()
            .replace(|c: char| !c.is_alphanumeric() && c != ' ' && c != '-' && c != '_', "")
            .to_lowercase()
            .replace(" ", "-")
    }
}

impl Default for LinkParser {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_wikilinks() {
        let parser = LinkParser::new();
        let content = "This is a [[note]] and another [[link to note]]";
        let links = parser.extract_wikilinks(content);
        assert_eq!(links, vec!["note", "link to note"]);
    }

    #[test]
    fn test_create_wikilink() {
        let parser = LinkParser::new();
        let link = parser.create_wikilink("My Note");
        assert_eq!(link, "[[My Note]]");
    }

    #[test]
    fn test_parse_link_text() {
        let parser = LinkParser::new();
        
        let (note_id, block_id) = parser.parse_link_text("[[Note]]");
        assert_eq!(note_id, "Note");
        assert_eq!(block_id, None);

        let (note_id, block_id) = parser.parse_link_text("[[Note]]((block))");
        assert_eq!(note_id, "Note");
        assert_eq!(block_id, Some("block".to_string()));
    }

    #[test]
    fn test_sanitize_link_title() {
        let parser = LinkParser::new();
        let sanitized = parser.sanitize_link_title("  Hello World!  ");
        assert_eq!(sanitized, "hello-world");
    }
}
