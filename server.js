// Import express package
const express = require('express');
const PORT = 3001;
const fs = require('fs');
//Require the JSON file and assign it to a variable called `db`
const db = require('./db/db.json');
// Helper method for generating unique ids
const uuid = require('./helpers/uuid');

// Initialize our app variable by setting it to the value of express()
const app = express();

app.use(express.static('public'));

//Handle Data Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add a static route for index.html
app.get('/notes', (req, res) => {
  res.sendFile(__dirname + '/public/notes.html');
});



// res.json() allows us to return JSON instead of a buffer, string, or static file
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      // Convert string into JSON object
      const parsedNotes = JSON.parse(data);
      res.json(parsedNotes);
    }
  })
});

// DELETE request for a single review
app.delete('/api/notes/:note_id', (req, res) => {
  let parsedNotes = '';
  if (req.body && req.params.note_id) {

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);

      } else {
        // Convert string into JSON object

        parsedNotes = JSON.parse(data);
        console.info(`${req.method} request received to delete a note`);
        const noteId = req.params.note_id;
        for (let i = 0; i < parsedNotes.length; i++) {
          const currentNote = parsedNotes[i];

          if (currentNote.note_id === noteId) {
            parsedNotes.splice(i, 1);
            res.json(parsedNotes);

            // Write updated notes back to the file
            fs.writeFile(
              './db/db.json',
              JSON.stringify(parsedNotes, null, 4),
              (writeErr) =>
                writeErr
                  ? console.error(writeErr)
                  : console.info('Successfully updated notes!')
            );
            return;
          }
        }
        res.json('Note ID not found');

      }
    })

  }
});


// POST request to add a note
app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      text,
      title,
      note_id: uuid(),
    };

    // Obtain existing reviews
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        const parsedNotes = JSON.parse(data);

        // Add a new note
        parsedNotes.push(newNote);

        // Write updated notes back to the file
        fs.writeFile(
          './db/db.json',
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully updated notes!')
        );
      }
    });

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.json(response);
  } else {
    res.json('Error in posting note');
  }
});

// GET request for a single review
app.get('/api/notes/:note_id', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      // Convert string into JSON object
      const parsedNotes = JSON.parse(data);
            const noteId = req.params.note_id;
      for (let i = 0; i < parsedNotes.length; i++) {
        const currentNoteId = parsedNotes[i];
        if (currentNoteId.note_id === noteId) {
          res.json(currentNoteId);
          return;
        }
      }
      res.json('Note ID not found');

    }
  })
});


app.get('*', (req, res) => {
  // `res.sendFile` is Express' way of sending a file
  // `__dirname` is a variable that always returns the directory that your server is running in
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
