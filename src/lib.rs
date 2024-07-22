use wasm_bindgen::prelude::*;
use csv::ReaderBuilder;
use serde::Serialize;
use wasm_bindgen::JsValue;

#[wasm_bindgen]
#[derive(Serialize)]
pub struct CsvRow {
    fields: Vec<String>,
}

#[wasm_bindgen]
pub fn process_csv(csv_data: &str) -> Result<JsValue, JsValue> {
    let mut reader = ReaderBuilder::new()
        .has_headers(false)
        .from_reader(csv_data.as_bytes());
    let mut rows = Vec::new();

    for result in reader.records() {
        let record = result.map_err(|err| err.to_string())?;
        rows.push(CsvRow {
            fields: record.iter().map(|s| s.to_string()).collect(),
        });
    }

    serde_wasm_bindgen::to_value(&rows).map_err(|err| err.to_string().into())
}
