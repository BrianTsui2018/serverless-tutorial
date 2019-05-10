// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');

const INGREDIENT_TABLE = process.env.INGREDIENT_TABLE;
//const dynamoDb = new AWS.DynamoDB.DocumentClient();
const IS_OFFLINE = process.env.IS_OFFLINE;

const debugLog = function (str, data) {
    console.log('\n\n--------------------- Debug log : ' + str);
    console.log(data);
    console.log('------------------------\n');
}

let dynamoDb;
if (IS_OFFLINE === 'true') {
    dynamoDb = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    })
} else {
    dynamoDb = new AWS.DynamoDB.DocumentClient();
};

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
    res.send('Hello World!')
})

// Get ingredient endpoint
app.get('/ingredient/:key', function (req, res) {
    const params = {
        TableName: INGREDIENT_TABLE,
        Key: {
            key: req.params.key,
        },
    }

    dynamoDb.get(params, (error, result) => {
        debugLog('result', result);
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get ingredient' });
        }
        if (result.Item) {
            const { key, text, tags } = result.Item;
            res.json({ key, text, tags });
        } else {
            res.status(404).json({ error: "ingredient not found" });
        }
    });
})

// Create ingredient endpoint
app.post('/ingredient', function (req, res) {

    const { key, text, tags } = req.body;
    if (typeof key !== 'string') {
        return res.status(400).json({ error: '"key" must be a string' });
    } else if (typeof text !== 'string') {
        return res.status(400).json({ error: '"text" must be a string' });
    }

    const params = {
        TableName: INGREDIENT_TABLE,
        Item: {
            key: key,
            text: text,
            tags: tags
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            return res.status(400).json({ error: 'Could not create ingredient' });
        }
        res.json({ key, text, tags });
        return res.status(201).send();
    });
})

// Delete ingredient endpoint
app.delete('/ingredient/:key', function (req, res) {
    const params = {
        TableName: INGREDIENT_TABLE,
        Key: {
            key: req.params.key,
        },
    }
    dynamoDb.delete(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get ingredient' });
        }
        res.status(204).send();
    });
})

module.exports.handler = serverless(app);