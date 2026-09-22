# CS 499 | Computer Science Capstone

This repository section documents the continued development and enhancement of **Travlr Getaways**, a full-stack travel management application originally developed during CS 465: Full Stack Development at Southern New Hampshire University.

For my computer science capstone, I selected Travlr Getaways as the primary artifact and iteratively enhanced the application across software engineering, algorithms and data structures, and database design. The goal of the capstone is not simply to reproduce the original project, but to demonstrate how I approach an existing codebase, identify weaknesses, evaluate engineering trade-offs, and improve the system over multiple development iterations.

## Project Overview

Travlr Getaways is a full-stack web application that provides a customer-facing travel website and an Angular-based administrative interface for managing trip data.

The application uses:

- **Angular and TypeScript** for the administrative client
- **Node.js and Express** for the REST API and server
- **MongoDB and Mongoose** for data persistence
- **JWT authentication** for protected administrative functionality
- **RESTful API design** for communication between the client and backend

The original version of this application is also available in my [CS 465 Full Stack Development portfolio](../CS465).

## Capstone Enhancements

### Software Design and Engineering

The first enhancement focused on improving the application's structure, reliability, validation, configuration, and security.

Key improvements included:

- Improved server and database configuration
- Environment-based configuration using `dotenv`
- More restrictive CORS configuration
- Improved MongoDB connection handling
- Stronger validation and normalization of trip data
- Unique and consistently formatted trip codes
- Improved HTTP responses and database error handling
- Strengthened user registration and login validation
- Corrected JWT authentication handling
- Protected administrative create, update, and delete operations

This stage focused on making the existing application more maintainable and better suited for continued development.

### Algorithms and Data Structures

The second enhancement introduced search, filtering, and custom sorting functionality to the trip management interface.

Rather than relying entirely on built-in sorting behavior, I implemented a **custom merge sort algorithm** operating on the Angular `Trip[]` collection.

The enhancement includes:

- Resort-based trip searching and filtering
- A custom merge sort implementation
- Price sorting in ascending and descending order
- Duration sorting in ascending and descending order
- Numeric parsing of price and duration values
- Comparator-based sorting logic
- Preservation of the original filtered collection so multiple sorting operations can be performed without additional API requests
- Improved loading, empty-result, and error states within the Angular interface

Merge sort was selected because it provides predictable **O(n log n)** time complexity. The implementation requires **O(n)** auxiliary space during merging, representing a deliberate trade-off between memory usage, predictable performance, and implementation complexity.

The API first reduces the collection according to the user's search criteria, after which the custom sorting algorithm operates on the resulting set of matching trips.

## Engineering Approach

A major focus of this capstone is demonstrating the ability to work with an existing system rather than developing an isolated example from scratch.

Each enhancement required evaluating the current architecture, identifying limitations, and making changes while preserving existing functionality. This included considering:

- Application architecture and maintainability
- Client/server responsibilities
- API design
- Data validation
- Authentication and authorization
- Algorithm selection and complexity
- Data structures and state management
- Error handling
- Scalability and future system requirements

The project demonstrates an iterative software engineering process in which each version builds upon lessons and design decisions from the previous implementation.

## Current Artifact

The current enhanced version of Travlr Getaways is located here:

[**Travlr Getaways — Algorithms and Data Structures Enhancement**](./module-three-algorithms-data-structures/travlr-getaways)

## Enhancement History

Development is preserved through separate Git branches so that each major stage of the capstone can be reviewed independently.

- **`cs499-enhancements`** — Software Design and Engineering enhancement
- **`cs499-milestone-three`** — Algorithms and Data Structures enhancement

Additional enhancements will be incorporated as the capstone progresses.

## About Me

I am completing a **Bachelor of Science in Computer Science with a concentration in Software Engineering** at Southern New Hampshire University.

My work focuses on full-stack software engineering, backend systems, APIs, databases, cloud infrastructure, automation, and applied artificial intelligence.

For additional projects and professional work, visit:

- [tylerhubbell.com](https://tylerhubbell.com/)
- [GitHub Profile](https://github.com/Hubbell315)
