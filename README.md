# How to run

## 1. Install modules
```
npm install
```

## 2. Install Local Database
```
sls dynamodb install
```

## 3. Start the server side (Serverless + Lambda)

```
npm run serverstart
```

Local default server: localhost:3000 

Local default dynamoDB: localhost:8000

## 4. Start the client side (React + Redux) 

```
npm run start
```

Local default client: localhost:1234

## 5. Populate the DB

POST your JSON file to {{server_url}}/add-ingredients

OR

POST an empty object to {{server_url}}/add-ingredients would auto-parse all the ingredients from ./database.json

## 6. Search Ingredient DB web-app

Go to http://localhost:1234 to use the client side application.
