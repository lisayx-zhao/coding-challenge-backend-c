const suggestions = require('./src/suggestions.js');

const express = require('express');
const parse = require('csv-parse/lib/sync');
const http = require('http');
const fs = require('fs');
const port = process.env.PORT || 2345;

const app = express();

// load file on server start to only load once
const data = fs.readFileSync('./data/cities_canada-usa.tsv');
const cities = parse(data, {
  columns: true,
  delimiter: '\t',
  escape: '\\',
  quote: null
});

// parse and trim alt_name
cities.forEach((city) => {
  const altNames = city.alt_name.split(",").map((name) => {
    return name.trim();
  })
  city.alt_name = altNames;
})

app.get('/suggestions', (req, res) => {
  if (req.query.q == null) res.status(404).send();
  else {
    const suggestionList = suggestions.getSuggestions(req.query, cities);
    const suggestionsString = JSON.stringify({suggestions: suggestionList});

    suggestionList.length
      ? res.status(200).send(suggestionsString)
      : res.status(404).send(suggestionsString);
  }
});

app.listen(port, function() {
  console.log('Server running at http://127.0.0.1:%d/suggestions', port);
});

module.exports = app;
