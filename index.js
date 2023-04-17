const express = require('express')
var morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())  // Allow requests from all origins
app.use(express.json())
// app.use(morgan('tiny', {skip: function(req, res) { console.log(req); return false} }))
app.use(morgan('tiny', {skip: function(req, res) { return req.method === 'POST'} }))

morgan.token('post', function(req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post',
             {skip: function(req, res) { return req.method !== 'POST'}}
             ))

let phonebook = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

/// Middleware to intercept requests
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

app.use(requestLogger)


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    let now = new Date();
    console.log(now)
    console.log(now.toUTCString())

    response.send(`<div>Phonebook has information for ${phonebook.length} people</div>
                <div>${now.toUTCString()}</div>`)
})


app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = phonebook.find(note => note.id === id)
    if (note) {
        response.json(note)
    } else {
        //\note Response statusMessage is not working
        response.statusMessage = "Note ${id} does not exist";
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(note => note.id !== id)

    response.status(204).end()
})

const generateId = () => {
    // our app won't have more than a handful of people, so 1 mil should be enough range
    return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    console.log(typeof body)

    let name = body.name
    if (!name) {
        console.log(name)
        return response.status(400).json({
            error: 'missing name'
        })
    }

    const number = body.number
    if (!number) {
        return response.status(400).json({
            error: 'missing number'
        })
    }

    const entry = {
        name: name,
        number: number,
        id: generateId(),
    }

    if(phonebook.filter(p => p.name === name).length > 0) {
        return response.status(400).json({
            error: `${name} already exists`
        })

    }

    phonebook = phonebook.concat(entry)

    response.json(phonebook)
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
