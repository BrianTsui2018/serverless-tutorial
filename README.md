# How to run

## 1. Start the server side (Serverless + Lambda)

```
npm run serverstart
```

Local default server: localhost:3000 

Local default dynamoDB: localhost:8000

## 2. Start the client side (React + Redux) 

```
npm run start
```

Local default client: localhost:1234

## 3. Populate the DB

POST your JSON file to {{server_url}}/add-ingredients

OR

POST an empty object to {{server_url}}/add-ingredients would auto-parse all the ingredients from ./database.json

## 4. Search Ingredient DB web-app

Go to http://localhost:1234 to use the client side application.