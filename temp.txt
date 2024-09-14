# API Documentation

This document provides details about the routes available in the Chatbot API.

## Routes

### 1. GET /ask

Retrieves an answer for a specific question.

Query Parameters:

- `question` (required): The question to ask, as a string.

Responses:

- 200 OK: Returns the matching question, answer, category, tags, and related questions.
- 404 Not Found: If no matching question is found.

### 2. GET /search

Searches for questions containing a specific term.

Query Parameters:

- `query` (required): The search term, as a string.

Responses:

- 200 OK: Returns an array of matching questions, including their answers, categories, tags, and related questions.
- 404 Not Found: If no matching questions are found.

### 3. GET /questions

Retrieves a list of questions, with optional filtering and limiting.

Query Parameters:

- `limit` (optional): The maximum number of questions to return, as a positive integer.
- `tags` (optional): A comma-separated list of tags to filter by.
- `category` (optional): A category to filter by, as a string.

Responses:

- 200 OK: Returns an array of questions, including their IDs, questions, categories, and tags.
- 400 Bad Request: If an invalid limit parameter is provided.

### 4. GET /categories

Retrieves a list of all unique categories.

Responses:

- 200 OK: Returns an array of unique category names.

### 5. GET /tags

Retrieves a list of all unique tags.

Responses:

- 200 OK: Returns an array of unique tag names.

## Security Features

- The API uses Helmet for setting various HTTP headers for security.
- CORS is enabled for all routes.
- XSS protection is implemented to sanitize user input.
- Rate limiting is applied, restricting each IP to 100 requests per 8 minutes.
- Request body size is limited to 10KB.
