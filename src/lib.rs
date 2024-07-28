use wasm_bindgen::prelude::*;
use csv::ReaderBuilder;
use serde_json::Value;
use reqwest;
use web_sys::console;use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Movie {
    pub poster: String,
    pub title: String,
    pub year: String,
    pub released: String,
    pub rated: String,
    pub runtime: String,
    pub ratings: String,
    pub genre: String,
    pub director: String,
    pub writer: String,
    pub actors: String,
    pub plot: String,
    pub language: String,
    pub country: String,
}

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
        let a_val = a.get(column_index).unwrap_or(&String::new()).clone();
        let b_val = b.get(column_index).unwrap_or(&String::new()).clone();
        
        let cmp = match (a_val.parse::<f64>(), b_val.parse::<f64>()) {
            (Ok(a_num), Ok(b_num)) => a_num.partial_cmp(&b_num).unwrap_or(std::cmp::Ordering::Equal),
            _ => a_val.cmp(&b_val),
        };
        
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

#[wasm_bindgen]
pub async fn fetch_movie(title: String, year: Option<i32>) -> Result<JsValue, JsValue> {
    // Construct the API URL with the provided title and year
    let api_key = "f95d2eac";
    let url = format!(
        "https://www.omdbapi.com/?t={}&y={}&apikey={}",
        title,
        year.unwrap_or_default(), // Use default value if year is None
        api_key
    );

    // Perform the API request
    let response = reqwest::get(&url)
        .await
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    let text = response.text().await.map_err(|err| JsValue::from_str(&err.to_string()))?;
    let v: Value = serde_json::from_str(&text).map_err(|err| JsValue::from_str(&err.to_string()))?;

    // Extract movie details
    let movie = Movie {
        poster: v["Poster"].as_str().unwrap_or_default().into(),
        title: v["Title"].as_str().unwrap_or_default().into(),
        year: v["Year"].as_str().unwrap_or_default().into(),
        released: v["Released"].as_str().unwrap_or_default().into(),
        rated: v["Rated"].as_str().unwrap_or_default().into(),
        runtime: v["Runtime"].as_str().unwrap_or_default().into(),
        ratings: v["Ratings"].as_str().unwrap_or_default().into(),
        genre: v["Genre"].as_str().unwrap_or_default().into(),
        director: v["Director"].as_str().unwrap_or_default().into(),
        writer: v["Writer"].as_str().unwrap_or_default().into(),
        actors: v["Actors"].as_str().unwrap_or_default().into(),
        plot: v["Plot"].as_str().unwrap_or_default().into(),
        language: v["Language"].as_str().unwrap_or_default().into(),
        country: v["Country"].as_str().unwrap_or_default().into(),
    };

    // Convert movie to CSV format
    let csv_row = movie_to_csv(&movie);

    // Log CSV row to the console
    console::log_1(&format!("{}", csv_row).into());

    // Return the CSV row as a String
    Ok(JsValue::from_str(&csv_row))
}


// Function to convert Movie to CSV format
fn movie_to_csv(movie: &Movie) -> String {
    format!(
        "\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\"",
        movie.poster,
        movie.title,
        movie.year,
        movie.released,
        movie.rated,
        movie.runtime,
        movie.ratings,
        movie.genre,
        movie.director,
        movie.writer,
        movie.actors,
        movie.plot,
        movie.language,
        movie.country
    )
}
