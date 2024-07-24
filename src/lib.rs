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

#[wasm_bindgen]
pub fn sort_csv(csv_data: &str, column_index: usize, sort_order: &str) -> String {
    let mut records: Vec<Vec<String>> = csv_data
        .lines()
        .map(|line| line.split(',').map(String::from).collect())
        .collect();

    records.sort_by(|a, b| {
        let cmp = a[column_index].cmp(&b[column_index]);
        if sort_order == "desc" {
            cmp.reverse()
        } else {
            cmp
        }
    });

    records.iter()
        .map(|row| row.join(","))
        .collect::<Vec<_>>()
        .join("\n")
}