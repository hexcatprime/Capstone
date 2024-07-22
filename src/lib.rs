use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn filter_csv(csv_data: &str, query: &str) -> String {
    let mut result = String::new();
    let query_lower = query.to_lowercase();
    
    for line in csv_data.lines() {
        if line.to_lowercase().contains(&query_lower) {
            result.push_str(line);
            result.push('\n');
        }
    }
    result
}