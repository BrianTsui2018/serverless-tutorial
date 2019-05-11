// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');
const { debugLog } = require("./debugLog");
const { parseJson } = require("./parseJson");         // test function
const fs = require('fs');
const stringUtils = require('./StringUtils.js');
const INGREDIENT_TABLE = process.env.INGREDIENT_TABLE;
//const dynamoDb = new AWS.DynamoDB.DocumentClient();
const IS_OFFLINE = process.env.IS_OFFLINE;

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

// Parse JSON db
app.post('/add-ingredients', function (req, res) {
    console.log('----------------- start parsing json DB --------------------');
    let data = req.body;                        // This is an object of objects
    console.log(Object.keys(data).length);
    if (Object.keys(data).length === 0) {       // If the request was empty (did not provide json data)
        console.log('\n-------------- reading from local JSON file ----------------\n');
        let rawdata = fs.readFileSync('database.json');
        let local_data = JSON.parse(rawdata);
        data = local_data;                      // Then parsing local JSON file instead
    }

    // payload building
    let dataKey = Object.keys(data);
    dataKey.forEach(function (k) {
        const params = {
            TableName: INGREDIENT_TABLE,
            Item: {
                key: k,
                text: data[k].text,
                tags: data[k].tags
            },
        };
        console.log(params);

        dynamoDb.put(params, (error) => {
            if (error) {
                console.log(error);
                return res.status(400).json({ error: 'Could not create ingredient' });
            }
        });
    });
    console.log('----------------- end parsing and uploading --------------------');
    return res.status(201).send();
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

// Fuzzy-search endpoint
app.get('/fuzzy-search/:key', function (req, res) {
    console.log('\n---------------------- Fuzzy Search -------------------\n');
    //let rawStr = String.prototype.bind("./StringUtils.js");
    let rawStr = req.params.key;
    const params = {
        TableName: INGREDIENT_TABLE,
        Key: {
            key: rawStr.toHashKey(),
        },
    }
    //console.log(params);

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