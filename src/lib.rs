use wasm_bindgen::prelude::*;
use csv::ReaderBuilder;

#[wasm_bindgen]
pub fn filter_csv(csv_data: &str, query: &str) -> String {
    let mut result = String::new();
    let query_lower = query.to_lowercase();
    
    let mut rdr = ReaderBuilder::new().from_reader(csv_data.as_bytes());
    for record in rdr.records() {
        let record = record.unwrap(); // Handle errors as needed
        if record.iter().any(|field| field.to_lowercase().contains(&query_lower)) {
            result.push_str(&record.iter().collect::<Vec<_>>().join(","));
            result.push('\n');
        }
    }
    
    result  
}