const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const { buildSchema } = require('graphql');
const cors = require("cors");
require('dotenv').config();


// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));



// Определение схемы GraphQL
const schema = buildSchema(`
  type Trailer {
    id: ID!
    name: String!
    trailerId: String!
  }

  input CreateTrailerInput {
    name: String!
    trailerId: String!
  }

  type Query {
    getTrailer(id: ID!): Trailer
    getTrailers: [Trailer]
  }

  type Mutation {
    createTrailer(input: CreateTrailerInput): Trailer
    deleteTrailer(id: ID!): Boolean
  }
`);

// Модель трейлера MongoDB
const Trailer = mongoose.model('Trailer', {
    name: String,
    trailerId: String
});

// Резолверы GraphQL
const root = {
    getTrailer: async ({ id }) => {
        try {
            const trailer = await Trailer.findById(id);
            return trailer;
        } catch (error) {
            throw new Error('Failed to fetch trailer');
        }
    },
    getTrailers: async () => {
        try {
            const trailers = await Trailer.find();
            return trailers;
        } catch (error) {
            throw new Error('Failed to fetch trailers');
        }
    },
    createTrailer: async ({ input }) => {
        try {
            const { name, trailerId } = input;
            const trailer = new Trailer({ name, trailerId });
            await trailer.save();
            return trailer;
        } catch (error) {
            throw new Error('Failed to create trailer');
        }
    },
    deleteTrailer: async ({ id }) => {
        try {
            await Trailer.findByIdAndRemove(id);
            return true;
        } catch (error) {
            throw new Error('Failed to delete trailer');
        }
    },
};

// Создание сервера Express
const app = express();

app.use(cors());

// Маршрут GraphQL
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

// Запуск сервера
app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
