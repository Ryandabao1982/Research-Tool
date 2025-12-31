#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bundle_notes_content() {
        let notes = vec![
            ("1", "Title 1", "Content 1"),
            ("2", "Title 2", "Content 2"),
        ];
        
        // This function doesn't exist yet, so this test will fail to compile,
        // which effectively serves as our "Red" phase in a compiled language 
        // (or we can define the stub and make the assertion fail).
        // Let's define the stub in the main part of the file to allow compilation 
        // but make the logic fail.
        let result = bundle_notes_content(notes);
        
        assert!(result.contains("Title 1"));
        assert!(result.contains("Content 1"));
        assert!(result.contains("Title 2"));
        assert!(result.contains("Content 2"));
        assert!(result.contains("---")); // Separator
    }
}

pub fn bundle_notes_content(notes: Vec<(&str, &str, &str)>) -> String {
    notes.into_iter()
        .map(|(_id, title, content)| format!("Title: {}\nContent: {}\n", title, content))
        .collect::<Vec<String>>()
        .join("\n---\n\n")
}
