# Zuppgate — organisation dashboard & mobile API

> ## This database is shared with Zuppdate
>
> Zuppgate and Zuppdate (a separate product, separate repo) run on **one
> database**. Customer identity is shared: a visitor's `guest` row points at a
> Zuppdate `users` row via `guest.user_id`, so one login covers both products.
>
> **The schema is owned by Zuppdate's `prisma/schema.prisma`, not by this repo.**
> `db/schema.ts` here is a query contract only. Four rules follow from that:
>
> 1. **Never run `drizzle-kit push` or `drizzle-kit generate`.** `db/schema.ts`
>    knows 21 of the database's 79 tables and declares 8 of this product's 25
>    real foreign keys, so a push offers to drop Zuppdate entirely and silently
>    deletes 17 constraints. See the comment in `drizzle.config.ts`.
>    `drizzle-kit studio` is read-only and safe.
> 2. To change this product's schema, edit the `ZUPPGATE` section of Zuppdate's
>    `prisma/schema.prisma`, run `prisma migrate dev` there, then mirror the
>    change in `db/schema.ts`.
> 3. The broadcast-notification table is **`app_notifications`**, not
>    `notifications` — that name collided with Zuppdate's social feed. The
>    exported Drizzle identifier is still `notifications`, so queries are
>    unchanged. See the comment in `db/schema.ts`.
> 4. `db/index.ts` pins every connection to `SET time_zone = '+00:00'`. Every
>    table here uses MySQL `TIMESTAMP`, which converts on read, so without this
>    a developer machine in a non-UTC zone reads every timestamp hours off and
>    invitations expire at the wrong moment. Do not remove it.
>
> Mobile API responses are **additive only** — the guest and security Expo apps
> live outside this repo and are built against the existing shapes. Never
> rename, retype or remove a key; in particular `guest.id` must stay Zuppgate's
> uuid and never become `users.id`.
>
> Full write-up, including production import and deployment: **`SHARED-DATABASE.md`
> in the zuppdate repo**.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
