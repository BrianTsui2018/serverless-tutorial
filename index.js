// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');

const USERS_TABLE = process.env.USERS_TABLE;
//const dynamoDb = new AWS.DynamoDB.DocumentClient();
const IS_OFFLINE = process.env.IS_OFFLINE;

const debugLog = function (name, data) {
    console.log('\n\n--------------------- Debug log : ' + name);
    console.log(data);
    console.log('------------------------\n');
}

let dynamoDb;
if (IS_OFFLINE === 'true') {
    dynamoDb = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    })
    //console.log(dynamoDb);
} else {
    dynamoDb = new AWS.DynamoDB.DocumentClient();
};

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
    res.send('Hello World!')
})

// Get User endpoint
app.get('/users/:key', function (req, res) {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            key: req.params.key,
        },
    }

    dynamoDb.get(params, (error, result) => {
        debugLog('result', result);
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get user' });
        }
        if (result.Item) {
            // const { key, text, tags } = result.Item;
            // res.json({ key, text, tags });
            const { key, text } = result.Item;
            res.json({ key, text });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
})

// Create User endpoint
app.post('/users', function (req, res) {

    //const { key, text, tags } = req.body;
    const { key, text } = req.body;
    if (typeof key !== 'string') {
        return res.status(400).json({ error: '"key" must be a string' });
    } else if (typeof text !== 'string') {
        return res.status(400).json({ error: '"text" must be a string' });
    }

    const params = {
        TableName: USERS_TABLE,
        Item: {
            key: key,
            text: text,
            //tags: tags
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            return res.status(400).json({ error: 'Could not create user' });
        }
        //res.json({ key, text, tags });
        res.json({ key, text });
    });
})

// Delete User endpoint
app.delete('/users/:key', function (req, res) {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            key: req.params.key,
        },
    }
    dynamoDb.delete(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get user' });
        }
        res.status(204).send();
    });
})

module.exports.handler = serverless(app);