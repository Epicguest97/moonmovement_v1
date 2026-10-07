# MoonMovement

MoonMovement is a platform I built to make it easier to discover and connect with startups and founders across India.

The idea came from noticing that most startup conversations and resources are concentrated around a few cities like Bengaluru, Mumbai, and Delhi. There are founders, students, and early-stage startups doing interesting work in smaller cities and districts, but they are much harder to discover.

I wanted to build a platform that combined community discussions with structured information about the Indian startup ecosystem.

## What I built

The initial version of MoonMovement focused on three things:

- **Community:** Users can create posts, participate in discussions, and reply through threaded comments, similar to Reddit.
- **Startup discovery:** Startups and founders can have profiles, with information organized by location so users can explore the ecosystem beyond the major startup hubs.
- **Ecosystem information:** Startup news, announcements, regional rankings, and other information are organized in one place.

I also worked on features such as full-text search, user authentication, voting, tags, anonymous posting, and district-level startup discovery.

## Technical implementation

The backend was built using **Node.js and Express.js**, with **PostgreSQL** as the primary database and **Prisma** for database access.

I designed the API around the main entities in the platform — users, startups, posts, comments, votes, tags, and locations — and used JWT-based authentication for user sessions.

For infrastructure, I deployed the backend using **AWS EC2** and used **Amazon RDS** for PostgreSQL. I also worked with Nginx, Cloudflare, SSL certificates, and PM2 while setting up the deployment.

## What I learned

MoonMovement was one of my first projects where I had to think beyond just writing application code.

Building it made me think about things like database relationships, API design, authentication, deployment, search, moderation, and what happens when a system has to support many different types of users and interactions.

More importantly, it changed how I think about technology projects. A technically interesting feature is not necessarily useful unless it solves a real problem for the people using it.

I started MoonMovement as a project to connect India's startup ecosystem, but it became a much broader lesson in building technology around the realities of the users and the system it operates in.
