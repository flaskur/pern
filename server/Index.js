const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./database');

app.use(cors());
app.use(express.json()); // So I expect a json string from the front end. This invokes all the time and interprets it into a regular json object. Goes from string to JSON, not the other way around. Would it be valid to say JSON.parse(something?)

app.get('/', (request, response) => {
	response.send('hello world');
});

// CRUD ROUTES
app.post('/todos', async (request, response) => {
	console.log(request.body); // Only worked because express.json() middleware.
	const { description } = request.body;
	try {
		await pool.query('insert into todo (description) values ($1);', [ description ]);
	} catch (error) {
		console.log(error.message);
	}
	response.json('POSTI');
});

app.get('/todos', async (request, response) => {
	try {
		const allTodos = await pool.query('select * from todo;');
		console.log(allTodos.rows);
		response.json(allTodos.rows);
		// This response is an array of objects which I can iterate through and access all the elements.
	} catch (error) {
		console.log(error.message);
	}
});

app.get('/todos/:id', async (request, response) => {
	try {
		// I need the particular id from params and do a select query from that.
		console.log(`who request params is ${request.params}`);
		const { id } = request.params;

		// Query for that particular entry.
		const singleTodo = (await pool.query('select * from todo where todo_id = $1;', [ id ])).rows;
		console.log(singleTodo);

		response.json(singleTodo);
	} catch (error) {
		console.log(error.message);
	}
});

app.put('/todos/:id', async (request, response) => {
	console.log('PUT REQUEST INVOKES');
	try {
		// Here I need to update an entry based on some id I'm given.
		const { id } = request.params;
		const { description } = request.body;

		await pool.query('update todo set description = $1 where todo_id = $2', [ description, id ]);
		const updatedTodo = (await pool.query('select * from todo where todo_id = $1;', [ id ])).rows;

		response.json(updatedTodo);
	} catch (error) {
		console.log(error.message);
	}
});

app.delete('/todos/:id', async (request, response) => {
	try {
		// Just delete the entry with this particular id.
		const { id } = request.params;

		const deletedTodo = (await pool.query('select * from todo where todo_id = $1;', [ id ])).rows;
		await pool.query('delete from todo where todo_id = $1;', [ id ]);

		response.json(deletedTodo);
	} catch (error) {
		console.log(error.message);
	}
});

app.listen(3001, () => {
	console.log('listening on 3001');
});
