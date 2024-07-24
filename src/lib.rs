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
    let mut lines = csv_data.lines().collect::<Vec<_>>();

    // Check if there is any data
    if lines.is_empty() {
        return String::new(); // Return empty string if no data
    }

    // Extract the header row
    let header = lines.remove(0);

    // Convert remaining lines to records (data rows)
    let mut records: Vec<Vec<String>> = lines
        .iter()
        .map(|&line| line.split(',').map(String::from).collect())
        .collect();

    // Ensure column_index is within bounds
    if column_index >= records.get(0).unwrap_or(&vec![]).len() {
        return String::new(); // Return empty string if column_index is out of bounds
    }

    // Sort the data rows
    records.sort_by(|a, b| {
        let cmp = a.get(column_index)
            .unwrap_or(&String::new())
            .cmp(&b.get(column_index).unwrap_or(&String::new()));
        if sort_order == "desc" {
            cmp.reverse()
        } else {
            cmp
        }
    });

    // Combine header with sorted data
    let sorted_csv = records
        .iter()
        .map(|row| row.join(","))
        .collect::<Vec<_>>()
        .join("\n");

    format!("{}\n{}", header, sorted_csv)
}
