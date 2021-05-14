# IMDB-Clone
A Movie Portal like IMDB using the <a href="http://www.omdbapi.com/"> Open Movie Database API</a>

<p><b>Link to website hosted</b> https://imdb-clone-web.herokuapp.com/</p>

<p><b>Features:</b>
<ul>Lists some of the movies returned by the above API</ul>
<ul>Allows users to search a movie by name and shows the filtered results</ul>
<ul>Allows users to mark a movie as their favourite and is shown under favourite lists</ul>
<ul>Adding a movie to favourite lists, users can give some comments and rating which appears under the favourite lists</ul></p>
<ul>Allows users to remove a movie from their favourites and remove comments which appears under the favourite lists</ul>

<p><b>Instructions after downloading this repo:</b>
<ul>Obtain a OMDb API key by registering with your mail id in <a href="http://www.omdbapi.com/">OMDb website</a></ul>
<ul>Place .env file in imdb dir with required URLs and API keys</ul>
<ul><ul>MONGO_CONNECTION_STRING="Your cluster string"</ul></ul>
<ul><ul>SECRET_NUMBER= 2</ul></ul>
<ul><ul>PORT=3000</ul></ul>
<ul><ul>API_KEY = "Your API key"</ul></ul>
<ul><ul>SECRET = ""</ul></ul>
<ul>Install npm followed by nodemon using command line/terminal</ul>

```bash
cd imdb
npm install
node app.js
```
