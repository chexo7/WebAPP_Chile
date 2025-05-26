# Next.js Financial Dashboard

This is a Next.js project for a financial dashboard application.

## Prerequisites

* Node.js (v18 or later recommended)
* npm or yarn

## Getting Started

1.  **Clone the repository (if applicable) or download the source code.**

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Firebase:**
    *   Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    *   In your Firebase project, go to **Project settings** > **Your apps**.
    *   Register a new web app and copy the Firebase configuration object.
    *   Create a file named `.env.local` in the root of the project.
    *   Add your Firebase configuration values to `.env.local`, prefixing each key with `NEXT_PUBLIC_`. For example:

        ```
        NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        NEXT_PUBLIC_FIREBASE_DATABASE_URL="YOUR_DATABASE_URL"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
        NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
        ```

4.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

*   `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
*   `src/components/`: Contains reusable React components.
*   `src/utils/`: Contains utility functions, including Firebase initialization (`src/utils/firebase.ts`).
*   `public/`: Contains static assets.
*   `.env.local`: Stores Firebase configuration and other environment variables (ignored by Git).

## Key Technologies

*   [Next.js](https://nextjs.org/) - React framework for server-side rendering and static site generation.
*   [Firebase](https://firebase.google.com/) - Platform for backend services (Authentication, Database).
*   [TypeScript](https://www.typescriptlang.org/) - Superset of JavaScript for static typing.
*   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.

## Learn More

To learn more about the technologies used, refer to their respective documentation:

*   [Next.js Documentation](https://nextjs.org/docs)
*   [Firebase Documentation](https://firebase.google.com/docs)
*   [TypeScript Documentation](https://www.typescriptlang.org/docs/)
*   [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
