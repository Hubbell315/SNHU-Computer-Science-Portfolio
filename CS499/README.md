# CS 499 | Computer Science Capstone

This section presents my enhancements to **Travlr Getaways**, a full-stack travel management application originally developed in CS 465 at Southern New Hampshire University.

I used the application to demonstrate software design and engineering, algorithms and data structures, and databases. Each enhancement addresses findings from my initial code review while preserving the application's existing functionality.

## Project Overview

Travlr Getaways includes a customer-facing travel website and an Angular administrative interface for managing trip packages.

The application uses:

- Angular and TypeScript for the administrative interface
- Node.js and Express for the server and REST API
- MongoDB and Mongoose for persistence and schema validation
- JSON Web Tokens for authenticated administrative operations
- Handlebars for server-rendered pages

[Original CS 465 artifact](../CS465)

## Current Enhanced Artifact

[View the enhanced Travlr Getaways source code](./module-four-databases/travlr-getaways)

The current version incorporates all three capstone enhancements described below.

## Software Design and Engineering

This enhancement improved backend maintainability, data validation, error handling, and authentication.

Key changes include:

- Reusable helpers for constructing validated trip data and handling database errors
- Required-field validation, string length limits, and consistent trip-code formatting
- Validation during updates and responses containing the updated record
- Restricted writable fields rather than accepting the entire request body
- Corrected JWT verification before allowing protected requests to continue
- Authentication requirements for administrative create, update, and delete operations
- Environment-based database configuration and connection lifecycle handling

Public users can browse trips, while administrative write operations require a valid token. I manually verified that an unauthenticated delete request returned HTTP 401 and left the trip data unchanged.

## Algorithms and Data Structures

This enhancement introduced resort filtering and a **custom merge sort** for the Angular `Trip[]` collection.

Users can sort matching trips by price or duration in ascending or descending order. A separate sorting utility contains the recursive merge sort, comparator logic, and parsing of the original display strings. Invalid numeric values are placed at the end, and trip names provide a tie-breaker.

Merge sort provides **O(n log n)** time complexity and uses **O(n)** auxiliary space, where `n` is the number of matching trips being sorted. I selected it for predictable performance and to demonstrate algorithm implementation beyond a built-in sorting function.

Filtering occurs through the API before the returned collection is sorted in Angular. The original matching collection is preserved so users can change sorting options without another API request.

I verified the enhancement by building the Angular application, running the backend with MongoDB, testing resort filtering, and checking price sorting in both directions.

## Databases

This enhancement improved data consistency and enabled numeric filtering within MongoDB.

Key changes include:

- Integer `priceCents` and `durationDays` fields alongside the original display strings
- A normalized `resortSearch` field for resort prefix searches
- Mongoose validation for required fields, numeric values, and string lengths
- A unique trip-code constraint and targeted indexes
- A migration script with a dry-run mode for existing records
- Validated API filters for resort, maximum price, and maximum duration
- Live Angular searching by trip name or resort

During migration, I identified a conflict between an existing nonunique trip-code index and the new unique constraint. I checked for duplicate codes, corrected the index, and reran the migration successfully.

I verified a combined resort, price, and duration query, confirmed that an invalid price returned HTTP 400, and tested live search in the browser. These checks demonstrate behavior with the sample data; they do not establish performance at a larger scale.

## Code Review

[Watch my Milestone One code review of Travlr Getaways](https://youtu.be/FR0y-qIE7ys)

This recording reviews the original application and explains planned enhancements in software design and engineering, algorithms and data structures, and databases.

## Enhancement Narratives

- [Software Design and Engineering narrative](./CS_499_Tyler_Hubbell_Milestone_Two.docx)
- [Algorithms and Data Structures narrative](./CS_499_Tyler_Hubbell_Milestone_3.docx)
- [Databases narrative](./CS_499_Tyler_Hubbell_Milestone_4.docx)

## Engineering Decisions and Learning

The enhancements required decisions about client and server responsibilities, algorithm performance, schema changes, and security.

Filtering in MongoDB reduces the collection returned to the client, while client-side sorting allows users to reorder those results without repeated requests. Numeric database fields support range queries while retaining the existing display format.

The project also reinforced the importance of migrating existing data when changing a schema and reviewing authentication behavior rather than assuming that a working login makes every route secure.

## Enhancement History

Earlier development stages were maintained on these branches:

- [Software Design and Engineering enhancement](https://github.com/Hubbell315/SNHU-Computer-Science-Portfolio/tree/cs499-enhancements/CS499/module-two-software-design-engineering/travlr-getaways)
- [Algorithms and Data Structures enhancement](https://github.com/Hubbell315/SNHU-Computer-Science-Portfolio/tree/cs499-milestone-three/CS499/module-three-algorithms-data-structures/travlr-getaways)
- [Databases enhancement](https://github.com/Hubbell315/SNHU-Computer-Science-Portfolio/tree/cs499-milestone-four/CS499/module-four-databases/travlr-getaways)

The current version on `main` includes the database enhancement and the preceding work.

## About Me

I am completing a **Bachelor of Science in Computer Science with a concentration in Software Engineering** at Southern New Hampshire University.

My interests include full-stack development, backend systems, APIs, databases, cloud infrastructure, automation, and applied artificial intelligence.

- [Professional portfolio](https://tylerhubbell.com/)
- [GitHub profile](https://github.com/Hubbell315)
