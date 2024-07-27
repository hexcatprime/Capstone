# Cat-aloguer
The DVD/Blu-Ray Cataloguer aims to solve the inevitable issue that comes with owning a large physical media collection, keeping track of everything.

Our product aims to solve this by allowing users to create, manage and sort through a database of all of their content, with complete user control of their data.

---

The user is able to either read metadata from a media file/files in a directory or search for a film by entering the title and year of release. An API request is made to OMDb to pull all the relevant film data, which is then converted from JSON and appended to the end of the CSV file.

The user is also able to filter and sort through the entries of the database file to find content by combining different search criteria.

The user may also import and export their database file as either a JSON file or CSV

Should the data for an entry be incorrect, the user may select an entry and edit its contents.

OMDb: The Open Movie Database hosts data for most films that exist on IDMB (Internet Move Database) and provide a free web API to developers.
