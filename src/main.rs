use reqwest;

#[tokio::main(flavor = "current_thread")]
async fn query() {
    //let client = reqwest::Client::new();

    let response = reqwest::get("https://www.omdbapi.com/?t=Dune&y=2021&apikey=XXXXXXXX")
        .await
        .unwrap()
        .text()
        .await;
    println!("{:?}", response);
}

fn main() {
    query();
}