use chrono;
use url;
use serde;
enum MovieRating
{
    G,
    PG,
    PG13,
    R,
    NC17,
    NA
}
struct Person
{
    first: String,
    middle: Option<String>,
    last: Option<String>,
}
struct Movie
{
    title: String,
    released: Option<chrono::NaiveDateTime>,
    rated: Option<MovieRating>,
    runtime: Option<chrono::NaiveTime>,
    genre: Option<Vec<String>>,
    director: Option<Vec<Person>>,
    writer: Option<Vec<Person>>,
    actor: Option<Vec<Person>>,
    plot: Option<String>,
    language: Option<Vec<String>>,
    country: Option<Vec<String>>,
    poster: Option<url::Url>
}

impl Movie
{
    
    fn new(title: String, released: Option<chrono::NaiveDateTime>, rated: Option<MovieRating>, runtime: Option<chrono::NaiveTime>, genre: Option<Vec<String>>, director: Option<Vec<Person>>, writer: Option<Vec<Person>>, actor: Option<Vec<Person>>, plot: Option<String>, language: Option<Vec<String>>, country: Option<Vec<String>>, poster: Option<url::Url>) -> Movie
        {
            Movie
            {
                title,
                released,
                rated,
                runtime,
                genre,
                director,
                writer,
                actor,
                plot,
                language,
                country,
                poster,
            }
        }
        fn edit(&self)
    {

    }
}
fn main() 
{

}