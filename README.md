# Farm 2 Home 🌾

[Made with MERN](https://img.shields.io/badge/Stack-MERN-green?style=flat)
[AI Powered](https://img.shields.io/badge/AI-Hugging%20Face%20Embeddings-yellow?style=flat)
[Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat&logo=vercel)
[Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)

A full-stack web marketplace that connects farmers directly with buyers — no middlemen, no cold storage delays. Transporters handle deliveries, farmers set their own prices, and buyers get fresh produce at better rates.

Built during a 15-day sprint to learn the MERN stack hands-on. Every feature you see — the AI search, auto-generated delivery trips, role-based portals — was built from scratch.

**Live demo:** [farm2home-six.vercel.app](https://farm2home-six.vercel.app)
**Backend:** [farm2home-ai.onrender.com](https://farm2home-ai.onrender.com)

> 📸 *Add a banner screenshot of the landing/login page here*

---

## What problem does this solve?

Farmers in India typically sell through multiple middlemen before produce reaches the buyer. Each middleman takes a cut, delays delivery, and drives up prices. Farm 2 Home removes that chain entirely — farmers list their products, buyers order directly, and local transporters handle the last-mile delivery.

---

## How it works

There are three types of users on this platform:

- **Farmers** post their products with images, set their price, and see incoming orders from buyers. They know exactly who bought what and where it needs to go.
- **Buyers** browse all available farm products, search using AI (type "protein food" and it'll find eggs and milk even if those words aren't in the title), add to cart, and place orders with cash on delivery.
- **Transporters** see available delivery trips auto-generated from buyer orders. Each trip shows the pickup location (farmer's farm), delivery address (buyer's home), weight, and how much they'll earn. They accept trips and mark them delivered when done.

> 📸 *Add a side-by-side screenshot of all 3 dashboards here (Farmer / Transport / Buyer)*

---

## Features

### Farmer Portal
- Add, edit, and delete product listings with images and videos
- Set price per unit (kg, dozen, litre, etc.) and category
- View all incoming orders from buyers with their contact details
- About page showing farm location and trust info

### Buyer Portal
- Browse all available farm products with images
- AI-powered semantic search — searches by meaning, not just keywords
- Filter by category (vegetables, fruits, grains, dairy, poultry, fishery, etc.) and price range
- Add to cart, update quantities, checkout with cash on delivery
- Order history with live delivery status (placed → confirmed → out for delivery → delivered)
- Click any product image to view it full size

### Transport Portal
- See available delivery trips generated automatically from buyer orders
- Each trip shows: pickup location, delivery address, weight, earnings, farmer contact, buyer contact
- Accept a trip with one click
- Mark trips as delivered — buyer's order status updates automatically
- Licence upload on registration — requires admin approval before accessing dashboard

### Admin Panel
- Built into the website — accessible only to the admin email set in environment variables
- Verify or reject any user (farmer, buyer, transporter) before they can use the platform
- Approve or revoke transport licences with licence image preview
- Manage AI embeddings — trigger embedding generation for new products
- See platform-wide stats: total users, pending approvals, products, orders, trips

> 📸 *Add a screenshot of the Admin Panel here*

---

## AI Semantic Search

This was the most interesting part to build. Instead of matching keywords exactly, each product gets converted into a 384-dimensional vector using a Hugging Face transformer model (`all-MiniLM-L6-v2`) when it's saved. When a buyer searches, the query is also converted to a vector, and MongoDB Atlas Vector Search finds the nearest matches by cosine similarity.

In practice: searching "morning drink" returns milk. Searching "protein food" returns eggs. The text doesn't need to match — the meaning does.

> 📸 *Add a screenshot showing the AI search badge (✦ AI results) with example results*

---

## Auto Trip Generation

When a buyer places an order, the system automatically creates a delivery trip in the transport portal. It pulls the farmer's registered location as the pickup point and the buyer's delivery address as the destination. Payment is calculated based on weight. The transporter just sees a ready-to-accept trip — no manual coordination needed.

---

## Tech Stack

**Frontend**
- React.js + Vite
- Tailwind CSS
- React Router
- Axios

**Backend**
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT authentication
- Multer for file uploads
- bcryptjs for password hashing

**AI / Search**
- Hugging Face Transformers (`@xenova/transformers`) — runs locally on the server
- MongoDB Atlas Vector Search
- `all-MiniLM-L6-v2` model (384 dimensions, cosine similarity)

**Storage & Media**
- Cloudinary — product images and videos, transport licence images
- Auto-compression and CDN delivery

**Deployment**
- Frontend → Vercel (auto-deploys on push to main)
- Backend → Render (auto-deploys on push to main)
- CI/CD via GitHub

---

## Project Structure

```
farm2home/
├── client/                  # React frontend
│   └── src/
│       ├── pages/
│       │   ├── farmer/      # Farmer portal pages
│       │   ├── transport/   # Transport portal pages
│       │   ├── buyer/       # Buyer portal pages
│       │   └── admin/       # Admin dashboard
│       ├── context/         # AuthContext, CartContext
│       ├── hooks/           # useRefreshOnFocus
│       └── utils/           # Axios API instance
│
└── server/                  # Node.js + Express backend
    ├── models/              # Mongoose schemas
    ├── routes/              # API routes
    ├── middleware/          # Auth + role middleware
    ├── config/              # Cloudinary config
    └── utils/               # Embedding generation
```

---

## Getting Started (Local Setup)

**Prerequisites:** Node.js v18+, MongoDB Atlas account, Cloudinary account

### 1. Clone the repo

```bash
git clone https://github.com/KVenkatesh81/Farm2Home.git
cd Farm2Home/farm2home
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=your_admin_email
```

```bash
node index.js
```

### 3. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## How to Use

Register as a farmer, buyer, or transporter. All accounts need admin approval before first login (except the admin email itself).

- **As admin:** Login with the email set in `ADMIN_EMAIL` env variable → you'll land on the Admin Panel → verify users from there.
- **As farmer:** Add products with images → wait for orders to come in.
- **As buyer:** Browse products, use the AI search bar, add to cart, checkout.
- **As transporter:** Upload your licence → wait for admin to verify it → browse available trips and accept them.

---

## Screenshots

> 📸 **Login Page** — *(Add screenshot here)*

> 📸 **Farmer Dashboard — product listings** — *(Add screenshot here)*

> 📸 **Buyer Dashboard — AI search in action** — *(Add screenshot here)*

> 📸 **Transport Dashboard — trip cards with pickup/delivery details** — *(Add screenshot here)*

> 📸 **Admin Panel — pending users list** — *(Add screenshot here)*

> 📸 **Order Success Page** — *(Add screenshot here)*

---

## What I learned building this

Starting from only HTML/CSS/JS knowledge and building a full-stack deployed application with AI features in 15 days was genuinely difficult. A few things that stood out:

- **CORS in GitHub Codespaces is a real headache** — each port gets a different subdomain and the browser treats them as different origins. Learned this the hard way.
- **Vector search setup** — generating embeddings at save time (not at search time) is the right architecture. Trying to generate them inline during route handling caused the model to hang the Express event loop.
- **Role-based systems are more complex than they look** — protecting routes on both frontend and backend, handling token mismatches when switching between accounts, getting middleware order right.

---

## Future Plans

- Razorpay payment integration
- Real-time notifications with Socket.io
- Mobile app (React Native)
- Price suggestion AI for farmers
- Reviews and ratings

---

## Author

**K Venkatesh**
B.Tech Electronics and Communication Engineering — IIT (ISM) Dhanbad

[GitHub](https://github.com/KVenkatesh81) · [LinkedIn](https://www.linkedin.com/in/venkatesh-k-a03b71317/)


---

## Contributing

This project is open to improvements. If you have an idea — whether it's a new feature, a bug fix, or just cleaner code — feel free to fork the repo and raise a pull request. I'll review and merge anything that makes the project better.

If you find a bug or want to suggest something, open an issue and describe what you have in mind. All contributions are welcome.

---

## License

MIT

---

*Made with a lot of debugging and too many CORS errors.*
