//app.js
"use strict";
 
const express = require("express"),
    CognitoExpress = require("cognito-express"),
	cors = require('cors'),
    port = process.env.PORT || 3001;
 
const app = express(),
    authenticatedRoute = express.Router(); //I prefer creating a separate Router for authenticated requests
 
app.use(cors({origin: 'http://localhost:8080'}));
app.use("/api", authenticatedRoute);
 
//Initializing CognitoExpress constructor
const cognitoExpress = new CognitoExpress({
    region: "ap-northeast-1",
    cognitoUserPoolId: "ap-northeast-1_uEneS3iCd",
    tokenUse: "access", //Possible Values: access | id
    tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
});
 
//Our middleware that authenticates all APIs under our 'authenticatedRoute' Router
authenticatedRoute.use(function(req, res, next) {
    
    //I'm passing in the access token in header under key accessToken
    let accessTokenFromClient = req.headers.accesstoken;
 
    //Fail if token not present in header. 
    if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header");
 
    cognitoExpress.validate(accessTokenFromClient, function(err, response) {
        
        //If API is not authenticated, Return 401 with error message. 
        if (err) return res.status(401).send(err);
        
        //Else API has been authenticated. Proceed.
        res.locals.user = response;
        next();
    });
});
 
 
//Define your routes that need authentication check
authenticatedRoute.get("/myfirstapi", function(req, res, next) {
    res.send(`Hi your API call is authenticated!`);
});
 
app.listen(port, function() {
    console.log(`Live on port: ${port}`);
});