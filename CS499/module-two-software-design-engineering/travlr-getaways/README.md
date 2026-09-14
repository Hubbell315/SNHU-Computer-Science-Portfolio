# Travlr Getaways - Full Stack Travel Management Application

## Overview

Travlr Getaways is a full-stack travel management application with a customer-facing website and an Angular administrative dashboard for managing travel packages.

The application connects an Angular frontend to an Express.js REST API backed by MongoDB. It supports complete trip management functionality and includes JWT-based authentication, Passport.js credential validation, protected API routes, and authenticated administrative controls.

## Tech Stack

### Frontend
- Angular
- TypeScript
- JavaScript
- HTML
- CSS
- Bootstrap

### Backend
- Node.js
- Express.js
- RESTful APIs

### Database
- MongoDB
- Mongoose

### Authentication and Security
- Passport.js
- JSON Web Tokens (JWT)
- Password hashing and salting
- Angular HTTP Interceptors
- Protected API routes

## Features

### Customer Website

- View available travel packages
- Display dynamic trip information
- Retrieve trip data from the backend REST API
- Display trip information stored in MongoDB

### Administrative Dashboard

- User login and logout
- JWT-based authentication
- View available trips
- Add new trips
- Edit existing trips
- Delete trips
- Manage trip information using Angular forms
- Conditionally display administrative controls based on authentication status
- Store authentication tokens in browser storage
- Automatically attach JWT credentials to secured API requests with an Angular HTTP interceptor

## Authentication and Security

Travlr Getaways uses Passport.js and JSON Web Tokens to authenticate users and secure administrative API operations.

Users authenticate through the Angular administrative application using their registered credentials. After a successful login, the Express backend generates a JWT and returns it to the Angular client.

The Angular application stores the token in browser local storage and uses an HTTP interceptor to automatically attach it to authenticated API requests.

```text
Authorization: Bearer <JWT>
```

Protected backend routes verify the JWT before allowing secured operations.

The Angular interface also checks authentication status before displaying controls such as **Add Trip** and **Edit Trip**.

User passwords are not stored as plaintext. Authentication data is stored using password hashes and salts, which are used to validate submitted credentials.

## Application Architecture

Travlr Getaways uses a client-server architecture that separates presentation, application logic, API communication, authentication, and persistent data storage.

### Angular Frontend

The administrative interface is built with Angular and TypeScript.

Angular components provide the interface for viewing and managing travel packages, while Angular services communicate with the backend REST API.

Authentication state is handled through a dedicated authentication service and browser storage.

### Express Backend

The backend is built with Node.js and Express.js.

Express routes expose RESTful API endpoints used by the frontend to retrieve and modify trip data.

Authentication controllers handle registration and login, while middleware verifies JWTs before allowing access to protected API operations.

### MongoDB Database

MongoDB provides persistent storage for trip and user information.

Mongoose defines application schemas and models and provides communication between the Express backend and MongoDB.

### Authentication Flow

```text
User Login
    |
    v
Angular Login Component
    |
    v
Authentication Service
    |
    v
Express /api/login
    |
    v
Passport Credential Validation
    |
    v
JWT Generated
    |
    v
Token Returned to Angular
    |
    v
Browser Local Storage
    |
    v
HTTP Interceptor
    |
    v
Authorization: Bearer <JWT>
    |
    v
Protected Express API Route
```

## REST API

The application uses RESTful API endpoints for communication between the client and backend.

### Trip Endpoints

#### Retrieve All Trips

```http
GET /api/trips
```

Returns all available travel packages.

#### Retrieve a Single Trip

```http
GET /api/trips/:tripCode
```

Returns a specific trip using its unique trip code.

#### Create a Trip

```http
POST /api/trips
```

Creates a new travel package.

#### Update a Trip

```http
PUT /api/trips/:tripCode
```

Updates an existing travel package using its trip code.

#### Delete a Trip

```http
DELETE /api/trips/:tripCode
```

Deletes an existing travel package.

### Authentication Endpoints

#### Register User

```http
POST /api/register
```

Creates a new user account and generates authentication credentials.

#### Login

```http
POST /api/login
```

Authenticates an existing user and returns a JSON Web Token.

## Data Models

### Trip

Trip records contain information including:

- Trip code
- Name
- Length
- Start date
- Resort
- Price per person
- Image
- Description

### User

User records contain authentication information including:

- Name
- Email address
- Password hash
- Password salt

Password validation is performed using the stored hash and salt rather than storing plaintext passwords.

## Angular Authentication

The Angular administrative application contains several components and services responsible for authentication.

### Authentication Service

The authentication service handles:

- Login requests
- Registration requests
- JWT storage
- JWT retrieval
- Logout functionality
- Authentication status checks
- Current user information

### Browser Storage

Authentication tokens are stored in browser local storage using:

```text
travlr-token
```

The authentication service retrieves this token when authenticated API requests are made.

### HTTP Interceptor

An Angular HTTP interceptor centralizes JWT handling for secured API requests.

When a user is authenticated, the interceptor retrieves the JWT and adds an Authorization header to outgoing requests.

```text
Authorization: Bearer <token>
```

This prevents authentication logic from needing to be duplicated across individual API calls.

### Authentication-Aware Interface

The navigation and administrative interface change depending on authentication status.

Logged-out users are shown a login option.

Authenticated users are shown a logout option and gain access to administrative controls such as:

- Add Trip
- Edit Trip

## Testing

The application was tested throughout development using browser testing, Postman, and MongoDB Compass.

Testing included:

- REST API endpoint testing
- Trip creation
- Trip retrieval
- Trip updates
- Trip deletion
- User registration
- User login
- JWT generation
- JWT verification
- Valid authenticated API requests
- Invalid or missing JWT requests
- Angular authentication behavior
- Conditional administrative controls
- JWT interceptor functionality
- MongoDB data verification

CRUD functionality was verified by creating, retrieving, updating, and deleting trip records.

Authentication was verified by registering and logging in users, generating JWTs, and confirming that protected API operations accepted valid tokens and rejected invalid authentication.

The Angular JWT interceptor was also verified by successfully editing trip information through the administrative interface while authenticated.

## Project Structure

```text
travlr-getaways/
│
├── app_admin/
│   └── src/
│       └── app/
│           ├── login/
│           ├── models/
│           ├── navbar/
│           ├── services/
│           ├── trip-card/
│           ├── trip-listing/
│           └── utils/
│
├── app_api/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   └── routes/
│
├── app.js
├── package.json
└── README.md
```

### `app_admin/`

Contains the Angular administrative application.

### `app_admin/src/app/services/`

Contains Angular services responsible for trip data and authentication.

### `app_admin/src/app/utils/`

Contains the JWT HTTP interceptor used to attach authentication tokens to secured API requests.

### `app_api/`

Contains the Express REST API.

### `app_api/config/`

Contains Passport.js authentication configuration.

### `app_api/controllers/`

Contains backend controller logic, including authentication functionality.

### `app_api/models/`

Contains Mongoose models for trip and user data.

### `app_api/routes/`

Contains Express API route definitions and JWT authorization middleware.

## Running the Application

The application requires MongoDB, the Express backend, and the Angular administrative application to be running.

### 1. Clone the Repository

```bash
git clone https://github.com/Hubbell315/travlr-getaways.git
cd travlr-getaways
```

### 2. Install Backend Dependencies

From the project root:

```bash
npm install
```

### 3. Install Angular Dependencies

Navigate to the Angular application:

```bash
cd app_admin
npm install
```

Then return to the project root if needed:

```bash
cd ..
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and configure the JWT secret required by the backend.

```text
JWT_SECRET=<your-secret-key>
```

Do not commit the `.env` file or secret values to source control.

### 5. Start MongoDB

Make sure your MongoDB service is running before starting the backend.

### 6. Start the Express Backend

From the project root:

```bash
npm start
```

### 7. Start the Angular Application

Open another terminal and navigate to:

```bash
cd app_admin
```

Then start Angular:

```bash
ng serve
```

The administrative application can then be accessed at:

```text
http://localhost:4200
```

## Key Technical Concepts Demonstrated

- Full-stack JavaScript/TypeScript development
- Angular component-based frontend development
- RESTful API design
- Client-server architecture
- MongoDB data persistence
- Mongoose schema and model design
- CRUD operations
- User authentication
- Password hashing and salting
- JSON Web Token authentication
- Bearer token authorization
- Protected Express API routes
- Passport.js authentication
- Angular dependency injection
- Angular services
- Angular HTTP interceptors
- Browser-based token storage
- Authentication-aware UI rendering
- API testing with Postman

## Course Reflection

### Architecture

During this course, I used multiple types of frontend development. The customer-facing portion of Travlr Getaways used Express to serve HTML templates, along with JavaScript to provide functionality in the browser. This approach separated the website into multiple pages that were requested from the server. The administrative side was developed as an Angular single-page application. Instead of loading a new page after every action, the single-page application dynamically updated the interface using Angular components, services, and routing. Express HTML was useful for building the traditional customer-facing website, while the Angular SPA provided a more responsive and interactive experience for administrators managing trip information.

On the backend, I used MongoDB because the application's trip and user information could be represented naturally as document-based data. MongoDB stores information in a flexible format that works well with JavaScript objects and JSON data. Mongoose also allowed me to define schemas and models while keeping the flexibility of a NoSQL database. This made MongoDB a practical choice for storing, retrieving, and updating trip records through the Express API.

### Functionality

JSON is a data format used to organize and transfer information, while JavaScript is a programming language used to create application logic and behavior. Although JSON resembles JavaScript object syntax, JSON only represents data and cannot contain functions or execute instructions. In Travlr Getaways, JSON connected the frontend and backend by allowing the Angular application and customer-facing website to send requests to the Express API and receive trip or authentication information in a consistent format. The backend retrieved information from MongoDB and returned it as JSON, which the frontend could then display to the user.

One important part of the development process was refactoring the application so that trip data was no longer hard-coded into individual pages. Instead, trip information was stored in MongoDB, accessed through reusable API endpoints, and retrieved by frontend services. I also separated functionality into reusable Angular components and services, including the trip card, trip listing, trip data service, authentication service, and navigation bar. The JWT interceptor was another impactful improvement because it centralized the process of attaching authentication tokens to secured requests instead of repeating that logic throughout the application. Reusable UI components helped reduce duplicated code, maintain consistent behavior and appearance, and make future changes easier because one component can be updated without rewriting every page that uses it.

### Testing

A method describes the type of action being requested, while an endpoint identifies the location where the action is performed. For example, `GET /api/trips` retrieves all trips, `POST /api/trips` creates a trip, and `PUT /api/trips/:tripCode` updates a specific trip. Testing these endpoints required verifying that each method returned the expected response, status code, and database result. For testing, I used Postman, browser testing, and MongoDB Compass to test requests and confirm that changes were correctly stored in the database.

Security was another added layer to the testing process because protected requests needed a valid JSON Web Token. I tested registration and login, confirmed that the server generated a token for valid credentials, and used the token in the authorization header when accessing secured endpoints. I also tested missing or invalid tokens to confirm that unauthorized requests were rejected. On the Angular side, I verified that the HTTP interceptor attached the token to outgoing requests and that administrative controls were only displayed to authenticated users. This process showed me that testing a secure full-stack application requires checking both the requested functionality and whether access is properly restricted.

### Reflection

This course helped me move closer to my professional goal of becoming a full-time software engineer by giving me experience developing and connecting every major part of a full-stack application. I strengthened my understanding of frontend development, backend APIs, database integration, authentication, and testing. I also gained more experience working with Angular, TypeScript, Express, MongoDB, Mongoose, REST APIs, Passport.js, and JSON Web Tokens.

Personally, the most valuable part of the course was learning how individual technologies work together as one complete application. While working on other personal projects, I have seen the flow of information, but this project used a different stack. I now have a better understanding of how information moves from a database, through an API, and into a frontend interface, as well as how authentication can protect that process in a MEAN stack. Completing Travlr Getaways gave me another substantial project for my portfolio and made me a more marketable candidate for full-stack and backend software engineering positions.

## Author

**Tyler Hubbell**

