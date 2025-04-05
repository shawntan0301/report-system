# Ceus Capital Report Handling System

A full-stack Report Handling System built with Next.js App Router route handlers, Prisma, and Clerk. This system allows users to submit reports (e.g., for abuse, spam, or inappropriate content) and provides both admin and user dashboards for viewing, filtering, and resolving reports. It leverages Neon (PostgreSQL) for the database and Shadcn/ui for a modern, Tailwind CSS–based UI.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#database)
- [Deployment](#deployment)

## Features

- **Report Submission:**  
  Users can submit reports by selecting a report type, providing a target ID, and entering a reason and optional description.
- **Admin Dashboard:**  
  Admin users have access to a dashboard that lists all submitted reports. The dashboard supports filtering by report type and resolution status (resolved/unresolved).

- **Report Detail View:**  
  Clickable button to navigate to a detailed view of the report presented in a table format.

- **Report Resolution:**  
  Admin users can resolve reports from the detailed view, with visual status indicators (green for resolved, red for unresolved) and toast notifications confirming actions.

- **Authentication:**  
  User authentication is handled by Clerk, ensuring secure access for both regular users and administrators.

- **Real-Time Notifications:**  
  Toast notifications provides feedback for actions like report submission and resolution.

## Tech Stack

**Frontend:**

- Next.js (App Router)
- React, TypeScript
- Tanstack Query
- Tailwind CSS
- Shadcn (UI components)

For the frontend, I used Next.js App Router with TypeScript because I'm very familiar with TypeScript, which helps me catch errors early and build robust, scalable applications with excellent server/client rendering and dynamic routing capabilities. For data fetching, I used Tanstack Query due to its powerful caching, automatic refetching, and easy management of loading and error states. For styling, I relied on Tailwind CSS along with shadcn/ui, which provides a set of pre-built, customizable UI components that allow me to rapidly build a consistent and modern interface.

**Backend:**

- Next.js Route Handlers (RESTful API endpoints)
- Clerk (Authentication)

For the backend, I used Next.js route handlers to build custom RESTful API endpoints that integrate seamlessly with the Next.js App Router. By leveraging Prisma, I can automatically infer types from my database schema, ensuring consistent data types between the server and client. Additionally, Clerk handles authentication, securing the application while keeping the integration straightforward.

**Database:**

- Prisma (ORM)
- Neon (PostgreSQL hosted on Neon)

For the database, I used Prisma as the ORM to interact with my PostgreSQL database. Prisma automatically generates TypeScript types based on my schema, significantly reduces runtime errors by catching potential issues during development. I host my PostgreSQL database on Neon so that the database can grow with the application while remaining reliable and performant in production. Together, Prisma and Neon.

## Deployment

This project is deployed by Vercel
