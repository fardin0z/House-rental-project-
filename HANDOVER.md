# ToletZoo — Handover

- **Live site:** https://toletzoo.com
- **Admin panel:** https://toletzoo.com/admin
- **Source code:** GitHub repo (you have access)

---

## Your accounts

All accounts are in your name. You have full ownership.

- **Vercel** — hosts the website
- **Supabase** — database, login, file storage
- **Namecheap** — domain
- **Mapbox** — maps
- **AamarPay** — payments (sandbox for now, switch to live when your merchant is approved)
- **Zoho Mail** — `hi@toletzoo.com`
- **Google Search Console** — SEO

Login details for each are saved in the document I shared with you separately.

---

## Admin panel

Sign in with your admin email at https://toletzoo.com/login. You land on `/admin`.

**Sections:**
- **Dashboard** — total users, listings, revenue, pending items
- **Users** — search, change role, suspend, delete, add new user
- **NID Verification** — approve or reject ID submissions
- **Listings** — approve, reject, archive, or delete property ads
- **Payments** — see all transactions, export to CSV
- **Moving Requests** — manage moving service requests, add internal notes

**To make someone an admin:** open the user in `/admin/users`, click their role pill, choose Admin. They sign out and back in. That's it.

**All delete buttons** show a confirmation dialog with what will happen — no accidental deletes.

---

## Email

Your professional email is **`hi@toletzoo.com`**, hosted on Zoho Mail (free).

- Webmail: https://mail.zoho.eu
- Mobile app: Zoho Mail (App Store / Play Store)

You can add more aliases or new users anytime from https://mailadmin.zoho.eu.

---

## SEO

Already set up:
- Sitemap at https://toletzoo.com/sitemap.xml (auto-updates every hour with new listings)
- robots.txt blocks `/admin` and other private pages
- Each property page has proper title, description, and OpenGraph image
- Search Console is verified and the sitemap is submitted

Google may take 1–2 weeks to start indexing pages. You can see indexing status anytime at https://search.google.com/search-console.

---

## Switching AamarPay to live

When your live merchant is approved, send me the new credentials and I'll update Vercel and redeploy. The site will start accepting real payments. The webhook URL stays the same: `https://toletzoo.com/api/aamarpay/webhook`.

---

## Support

**30 days of free bug fixes** after handover. Just message me on Fiverr or WhatsApp.

What's covered:
- Bugs in the features we agreed on

Not covered (quoted separately):
- New features
- Design changes
- Anything outside the original scope

After 30 days: $10/hour or monthly retainer.

---

## For future developers (if you hire someone)

The README in the GitHub repo has the technical details — env vars, how to run locally, database migrations. Just point them at the GitHub repo and they'll figure it out.

Tech stack: Next.js + Supabase + Mapbox + AamarPay, hosted on Vercel.

---

That's it. Welcome to your platform — enjoy it.