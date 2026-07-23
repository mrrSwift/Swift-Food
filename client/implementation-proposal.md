# Restaurant Glass — Scope and API Proposal

## Confirmed product direction

The product will be a **multi-restaurant online menu platform** with a polished public dining experience and a private owner workspace. The public experience will use an elegant iOS-inspired glassmorphism design: translucent frosted surfaces, restrained blur, layered shadows, high-contrast typography, soft color washes, refined rounded geometry, and motion that remains quick and unobtrusive.

The platform will use the initialized React, Tailwind CSS, Radix UI/shadcn UI, Lucide icon, tRPC, Manus OAuth, database, and storage foundation. No third-party commerce, ordering, payment, review, or external menu API is required for the requested scope. The platform APIs will be application-owned typed endpoints; Manus OAuth and built-in object storage are the only platform integrations needed.

| Area | Included behavior |
|---|---|
| Public storefront | Frosted header, hero banner, horizontal category filter, responsive menu grid, slide-out restaurant menu, item detail sheet, floating Notebook control, and glass footer. |
| Notebook | The word **Notebook** will be used exclusively. Its contents will live only in a browser cookie; the API and database will never receive or persist Notebook data. |
| Owner access | A dedicated owner-login screen will invoke the existing Manus OAuth flow. A successful owner sign-in will return the user to the private dashboard. |
| Owner workspace | Restaurant selection/creation, a hard two-restaurant limit per owner, overview statistics, restaurant settings, category management, and menu-item management. |
| Orders | A clearly labelled dashboard placeholder only. No checkout, payment, fulfillment, or order API will be built. |

## Proposed navigation

Public menus need a stable URL because an owner may manage two restaurants. The proposed route structure is shown below. This keeps public menu routes separate from owner-only routes and makes every restaurant shareable.

| Route | Purpose |
|---|---|
| `/r/:restaurantSlug` | Public restaurant menu storefront. |
| `/owner/login` | Owner sign-in screen that starts Manus OAuth only from an explicit user action. |
| `/owner` | Authenticated owner dashboard and restaurant selector. |
| `/owner/restaurants/:restaurantId/overview` | Selected restaurant overview, including the orders placeholder. |
| `/owner/restaurants/:restaurantId/settings` | Restaurant identity, contact, banner, and hours editing. |
| `/owner/restaurants/:restaurantId/categories` | Category create, edit, delete, and reordering interface. |
| `/owner/restaurants/:restaurantId/menu` | Menu item create, edit, delete, availability, category assignment, and image workflow. |

The root route will provide a graceful entry to the platform. Unless you prefer a separate public directory page, it will redirect to the selected/primary published restaurant menu in the initial release.

## Public storefront behavior

The public screen will place a compact glass header over the visual field, with the hamburger trigger on the left and a centered restaurant mark. The sandwich panel will show a concise restaurant identity block first, category navigation second, and an Owner Login action anchored at the bottom. The hero banner follows the header, then the horizontally scrollable category control and menu card grid.

Every menu card will expose the title, a concise description, price, optional rating, and an **Add to Notebook** action. Clicking the card—without hijacking the add action—will open an accessible Radix-based dialog/sheet with the complete image, title, description, ingredients, rating state, price, availability state, and Notebook action. The menu will clearly represent unavailable items and suppress their add action.

> **Ratings safeguard:** no review, testimonial, rating, or menu content will be fabricated or pre-seeded. A rating is optional owner-provided menu metadata; until a restaurant owner supplies a legitimate value, the interface will show an honest empty state such as “No rating yet.”

The footer will repeat the restaurant identity and provide the configured telephone number, address, hours, and social links. All interactive controls will remain keyboard accessible, with reduced-motion behavior respected.

## Cookie-only Notebook contract

Notebook persistence will be isolated in a small client-side utility. It will read and write a single first-party cookie such as `restaurant_notebook_v1`; it will not call the server, tRPC, or database.

| Cookie attribute | Proposed value |
|---|---|
| Data | Version, restaurant ID, and an array of item ID, quantity, name, price, and image snapshot. |
| Lifetime | 30 days, refreshed when the Notebook changes. |
| Scope | `Path=/`; `SameSite=Lax`; `Secure` in HTTPS environments. |
| Size protection | A bounded item count and compact payload so the browser cookie remains within practical limits. |
| User controls | Add, change quantity, remove, clear, and visible item-count badge. |

The client will safely recover from a malformed or expired cookie by starting with an empty Notebook. The Notebook will never be stored in the database and will not be included in public or owner API payloads.

## Proposed persistent data model

The database is required only for owner-managed restaurant and menu content. It will not contain Notebook contents or orders.

| Entity | Primary fields | Rules |
|---|---|---|
| `restaurants` | `id`, `ownerId`, `slug`, `name`, `description`, `bannerImageKey`, `bannerImageUrl`, `address`, `phone`, `hours`, `socialLinks`, `isPublished`, timestamps | `slug` is unique; owner linkage is mandatory; creation is limited to two restaurants per owner. |
| `categories` | `id`, `restaurantId`, `name`, `slug`, `sortOrder`, timestamps | Category is scoped to one restaurant and can be reordered. |
| `menuItems` | `id`, `restaurantId`, `categoryId`, `title`, `description`, `ingredients`, `price`, `rating`, `imageKey`, `imageUrl`, `isAvailable`, `sortOrder`, timestamps | Item and assigned category must belong to the same restaurant. Rating remains nullable. |
| Existing `users` | Manus OAuth identity and application role | The authenticated identity determines ownership; the UI alone will never grant owner permissions. |

Restaurant hours and social links will be stored as structured JSON-compatible data, allowing the visual footer and settings form to stay in sync without fragile free-form parsing. Monetary prices will be stored as fixed precision decimal values and formatted for display in the interface.

## Proposed application API

All application data operations will use the project’s typed tRPC API, rather than ad-hoc browser fetch calls. Public read procedures will expose published restaurant content only. Owner procedures will require Manus OAuth and will verify ownership server-side for every restaurant, category, menu item, upload, update, reorder, and deletion operation.

| Procedure group | Procedure | Access | Purpose |
|---|---|---|---|
| `publicRestaurant` | `getBySlug({ slug })` | Public | Fetch restaurant profile, published categories, and available menu items for the storefront. |
| `publicRestaurant` | `getMenuItem({ restaurantSlug, menuItemId })` | Public | Fetch complete menu-item detail for the detail sheet. |
| `auth` | `me()` and `logout()` | Existing platform support | Read Manus OAuth session state and end the session. |
| `ownerRestaurants` | `list()` | Signed-in owner | List only restaurants belonging to the caller. |
| `ownerRestaurants` | `create(input)` | Signed-in owner | Create a restaurant after enforcing the server-side two-restaurant maximum. |
| `ownerRestaurants` | `get({ restaurantId })` | Signed-in owner | Read a restaurant only if it belongs to the caller. |
| `ownerRestaurants` | `update(input)` | Signed-in owner | Edit name, description, banner, address, phone, hours, social links, and publish state. |
| `ownerRestaurants` | `overview({ restaurantId })` | Signed-in owner | Return total items, total categories, availability summary, and the static orders-placeholder data. |
| `ownerCategories` | `list`, `create`, `update`, `remove`, `reorder` | Signed-in owner | Manage categories only inside a caller-owned restaurant. |
| `ownerMenuItems` | `list`, `create`, `update`, `remove` | Signed-in owner | Manage items only inside a caller-owned restaurant, with category ownership validation. |
| `ownerAssets` | `uploadImage(input)` | Signed-in owner | Accept a validated image payload, store it using the built-in object-storage helper, and return its storage key and display URL. |

The API will include structured input validation, ownership checks, and clear error states. The two-restaurant ceiling will be enforced inside the create operation—not merely disabled in the UI—so it cannot be bypassed. No `orders`, `checkout`, `payment`, `Notebook`, or customer-review endpoint will exist in this release.

## Owner login and authorization flow

The existing Manus OAuth integration will be used unchanged for identity verification. The owner login action will call the supplied sign-in helper only on click, preserving the existing one-time OAuth state protection. After the authenticated callback returns to the app, the owner-login page will redirect to `/owner`.

For this platform, any authenticated Manus user may own the restaurants they create; ownership is determined by the authenticated `users.id` relation rather than a manually typed owner credential. Every owner procedure will require authentication and confirm that the requested restaurant belongs to the current user. This enables a private dashboard without creating a separate password system.

## Image handling

Restaurant banners and menu-item images will be uploaded through an authenticated server-side operation and stored in the platform’s managed object storage. The database will retain only the returned storage key and URL, rather than binary file data. Public storefronts will consume the resulting image URL directly.

## Implementation standards

The implementation will use React, Tailwind CSS, the supplied shadcn/Radix components, Lucide icons, and the provided dashboard layout where it benefits the private workspace. Public pages will use a custom storefront shell rather than a generic dashboard. The owner workspace will use a responsive, persistent dashboard navigation. Loading, empty, success, error, accessibility, mobile responsiveness, and reduced-motion states are included in scope. Automated tests will cover the two-restaurant limit, owner-only content access, category and item validation, and cookie-only Notebook logic.

## Approval requested

Please approve the scope and API contract above, or tell me what you would like changed. In particular, please confirm whether `/r/:restaurantSlug` is acceptable for public restaurant menus. Once you reply **“Approved”**, I will start building the frontend and supporting owner APIs.
