#[tokio::main]
async fn search(title: String, year: Option<i32>) -> String{
    let api_key = "&apikey=f95d2eac";
    let mut request_body = format!("https://www.omdbapi.com/?t={}]", title);

    if year.is_some() {
        let request_year = format!("&y={}", year.unwrap().to_string());
        request_body += &request_year;
    }
    
    request_body += api_key;

    let response = reqwest::get(request_body)
        .await
        .unwrap()
        .text()
        .await;
    return response.unwrap();
} 

//test function
fn main() {
    println!("Raw HTTP response:");
    println!("{}\n", search("superbad".to_string(), None));


}