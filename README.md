# REMANA EXPRESS BACKEND

Building a `RE`lationship `MANA`gement API service using [Express](https://expressjs.com/) & [Sequelize](https://sequelize.org/).

# References
The following is a list of resources that were useful during development

* [Sign In with Google](https://www.passportjs.org/tutorials/google/)   
    Demonstrates important concepts in implementing socal login using google.   
    1. Using Federated Credential records
    2. Logic for `Continue with Google` i.e login and signup from same endpoint

    https://github.com/passport/todos-express-google


* [How to create a REST API with Node.js and Express](https://blog.postman.com/how-to-create-a-rest-api-with-node-js-and-express/)  
    Demonstrates important concepts in building REST APIs
    1. Using MVC pattern
    2. Using ORM for database manipulation (Sequelize)
    3. Developing a User Management API (user registration, login, profile management)
    4. Using JWT in authentication
    
    https://github.com/postmanlabs/e-commerce-store-express/tree/master?deviceId=a6832eb5-7a09-4097-8cf0-037183b92b3d

* [Verify the Google ID token on your server side](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token/)   
    This together with knowledge from [Sign In with Google](https://www.passportjs.org/tutorials/google/) lead to the creation of JWT authentication while still using Google for social login. The `Passport` illustration relied on sessions and worked for MVT pattern. However, this backend is needed for a remote Vue JS frontend hence the `Passport` illustration could not be used without modifications

    https://www.youtube.com/watch?v=j_31hJtWjlw (USES DEPRECATED API)
    https://github.com/GoogleChromeLabs/google-sign-in (USES DEPRECATED API)

## NOTE
This project was bootstrapped from https://github.com/passport/todos-express-google. File structure changes were then made referring to https://github.com/postmanlabs/e-commerce-store-express/tree/master?deviceId=a6832eb5-7a09-4097-8cf0-037183b92b3d.  
This note is made available to inform developers looking to know or understand initial decisions and influences during development of the project. This is particularly relevant to developers looking to keep the `philosophy of development`/patterns in the project in addition to best practice or even their own knowledge.
