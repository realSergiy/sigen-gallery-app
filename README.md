# 📷 EXIF Photo Blog

## Features

- Built-in authentication
- Photo upload with EXIF data extraction
- Organize photos by tag
- Infinite scroll
- Light/dark mode
- Automatic Open Graph image generation
- Command palette with photo search
- Experimental support for AI-generated descriptions
- Support for Fujifilm simulations

![OG Image Preview](/readme/og-image-share.png)

## How to

### Make changes to postgres database

1. Connect to a dev pg instance. Can be local or remote, but should be yours only
2. Make all the changes in the dev pg as necessary: add columns, tables etc
3. ensure .env is in the root with POSTGRES_URL connection string pointing to your dev pg instance.
   (You can copy POSTGRES_URL from the .env.development.local)
4. `pnpm pull:db`
5. copy the contents of `./drizzle` to the `src/db/generated` and apply sanity check
6. `./drizzle` folder can be deleted

## Installation

### Setup Authentication

1. Generate an authentication secret and add it to your environment variables:
   - `AUTH_SECRET`
2. Add an admin user to your environment variables:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
3. Redeploy the application.

### Upload Your First Photo 🎉

1. Visit `/admin`
2. Sign in with the credentials supplied in the setup step.
3. Click "Upload Photos"
4. Add an optional title.
5. Click "Create"

## Develop Locally

1. Clone the repository.
2. Run `pnpm install` to install dependencies.
3. Set up the required environment variables in a `.env.local` file.
4. Run `pnpm dev` to start the development server.

## Further Customization

### Experimental AI Text Generation

⚠️ **Read Before Proceeding**

> Usage of this feature may result in fees from OpenAI. When enabling AI text generation, follow all
> recommended mitigations to avoid unexpected charges and attacks. Ensure your OpenAI secret key
> environment variable is not prefixed with `NEXT_PUBLIC`.

1. **Setup OpenAI**
   - Create an [OpenAI](https://openai.com) account and fund it.
   - Generate an API key and store it in the environment variable `OPENAI_SECRET_KEY`.
   - Set up usage limits to avoid unexpected charges (recommended).
2. **Add Rate Limiting (recommended)**
   - Create a rate-limiting mechanism to prevent abuse.
3. **Configure Auto-Generated Fields (optional)**
   - Set which text fields auto-generate when uploading a photo by setting
     `AI_TEXT_AUTO_GENERATED_FIELDS`, e.g., `title, semantic`.
   - Accepted values:
     - `all` (default)
     - `title`
     - `caption`
     - `tags`
     - `semantic`
     - `none`

### Optional Configuration

Modify the application behavior by configuring the following environment variables:

#### Site Meta

- `NEXT_PUBLIC_SITE_TITLE`: Shown in the browser tab.
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Displayed in the navigation, beneath the title.
- `NEXT_PUBLIC_SITE_ABOUT`: Shown in the grid sidebar (supports rich formatting tags like `<b>`,
  `<strong>`, `<i>`, `<em>`, `<u>`, `<br>`).

#### Site Behavior

- `NEXT_PUBLIC_GRID_HOMEPAGE = 1` shows grid layout on the homepage.
- `NEXT_PUBLIC_DEFAULT_THEME = light | dark` sets the preferred initial theme (defaults to `system`
  when not configured).
- `NEXT_PUBLIC_PRO_MODE = 1` enables higher quality image storage (results in increased storage
  usage).
- `NEXT_PUBLIC_MATTE_PHOTOS = 1` constrains the size of each photo and enables a surrounding border.
- `NEXT_PUBLIC_BLUR_DISABLED = 1` prevents image blur data from being stored and displayed.
- `NEXT_PUBLIC_GEO_PRIVACY = 1` disables collection/display of location-based data.
- `NEXT_PUBLIC_HIDE_REPO_LINK = 1` removes the footer link to the repository.
- `NEXT_PUBLIC_ALLOW_PUBLIC_DOWNLOADS = 1` enables public photo downloads for all visitors.
- `NEXT_PUBLIC_PUBLIC_API = 1` enables a public API available at `/api`.
- `NEXT_PUBLIC_IGNORE_PRIORITY_ORDER = 1` prevents the `priority_order` field from affecting photo
  order.
- `NEXT_PUBLIC_HIDE_SOCIAL = 1` removes the social sharing button from the share modal.
- `NEXT_PUBLIC_HIDE_FILM_SIMULATIONS = 1` prevents Fujifilm simulations from showing up in the grid
  sidebar and search results.
- `NEXT_PUBLIC_HIDE_EXIF_DATA = 1` hides EXIF data in photo details and Open Graph images.
- `NEXT_PUBLIC_GRID_ASPECT_RATIO = 1.5` sets the aspect ratio for grid tiles (defaults to `1`;
  setting to `0` removes the constraint).
- `NEXT_PUBLIC_SHOW_LARGE_THUMBNAILS = 1` ensures large thumbnails on photo grid views.
- `NEXT_PUBLIC_OG_TEXT_ALIGNMENT = BOTTOM` keeps Open Graph image text bottom-aligned (default is
  top).

## Alternate Storage Providers

Only one storage adapter—Cloudflare R2 or AWS S3—can be used at a time. Configure the preferred
adapter by setting `NEXT_PUBLIC_STORAGE_PREFERENCE` to "aws-s3" or "cloudflare-r2".

### Cloudflare R2

1. **Setup Bucket**
   - Create an R2 bucket with default settings.
   - Set up CORS under bucket settings:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT"],
         "AllowedOrigins": ["http://localhost:3000", "{YOUR_PRODUCTION_DOMAIN}"]
       }
     ]
     ```
   - Enable public hosting by connecting a custom domain or allowing access from the R2.dev
     subdomain.
   - Store public configuration:
     - `NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET`: Bucket name.
     - `NEXT_PUBLIC_CLOUDFLARE_R2_ACCOUNT_ID`: Account ID.
     - `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN`: Your public domain (without "https://").
2. **Setup Private Credentials**
   - Create an API token with "Object Read & Write" permissions for the bucket.
   - Store credentials (ensure access keys are not prefixed with `NEXT_PUBLIC`):
     - `CLOUDFLARE_R2_ACCESS_KEY`
     - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`

### AWS S3

1. **Setup Bucket**
   - Create an S3 bucket with "ACLs enabled" and "Block all public access" turned off.
   - Set up CORS under bucket permissions:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT"],
         "AllowedOrigins": ["http://localhost:*", "{YOUR_PRODUCTION_DOMAIN}"],
         "ExposeHeaders": []
       }
     ]
     ```
   - Store public configuration:
     - `NEXT_PUBLIC_AWS_S3_BUCKET`: Bucket name.
     - `NEXT_PUBLIC_AWS_S3_REGION`: Bucket region (e.g., "us-east-1").
2. **Setup Private Credentials**
   - Create an IAM policy with necessary S3 permissions.
   - Create an IAM user and attach the policy.
   - Store credentials (ensure access keys are not prefixed with `NEXT_PUBLIC`):
     - `AWS_S3_ACCESS_KEY`
     - `AWS_S3_SECRET_ACCESS_KEY`

## Alternate Database Providers (Experimental)

Switch to another Postgres-compatible provider by updating `POSTGRES_URL`. To disable SSL (if
required), set `DISABLE_POSTGRES_SSL = 1`.

### Supabase

1. Ensure the connection string is set to "Transaction Mode" via port `6543`.
2. Disable SSL by setting `DISABLE_POSTGRES_SSL = 1`.

## FAQ

#### How Do I Edit Multiple Photos?

> On desktop, select the ••• menu in the top-right corner next to the site title and choose "Select
> Multiple." On mobile, "Select Multiple Photos" can be accessed from the search menu. From there,
> you can perform bulk tag, favorite, and delete actions.

#### Why Don't My Photo Changes Show Up Immediately?

> The application statically optimizes core views to minimize load times. Consequently, when photos
> are added, edited, or removed, it might take several minutes for those changes to propagate. If
> changes aren't appearing, navigate to `/admin/configuration` and click "Clear Cache."

#### Why Don't My Older Photos Look Right?

> To bring older photos up to date with new features (like additional EXIF fields or blur data
> improvements), click the 'sync' button next to a photo or use the outdated photo page
> (`/admin/outdated`) for batch updates.

#### Why Don’t My Open Graph Images Load When I Share a Link?

> Some services require near-instant responses when displaying link previews. To improve
> responsiveness, consider rendering pages and image assets ahead of time by enabling static
> optimization with `NEXT_PUBLIC_STATICALLY_OPTIMIZE_PAGES = 1` and
> `NEXT_PUBLIC_STATICALLY_OPTIMIZE_OG_IMAGES = 1`. Note that this will increase platform usage.

#### Why Do Vertical Images Take Up So Much Space?

> By default, all photos are shown full-width. Enable matting to showcase horizontal and vertical
> photos at similar scales by setting `NEXT_PUBLIC_MATTE_PHOTOS = 1`.

#### Why Are My Grid Thumbnails So Small?

> Thumbnail grid density is dependent on aspect ratio configuration. Override this by setting
> `NEXT_PUBLIC_SHOW_LARGE_THUMBNAILS = 1`.

#### How Secure Are Photos Marked “Hidden”?

> While hidden paths require authentication, raw links to individual photo assets remain publicly
> accessible. Use with caution.

#### My Images or Content Have Fallen Out of Sync. What Do I Do?

> Navigate to `/admin/configuration` and click "Clear Cache."

#### I'm Seeing Server-Side Runtime Errors After Updating. What Do I Do?

> Navigate to `/admin/configuration` and click "Clear Cache." If issues persist, seek assistance.

#### Why Are My Thumbnails Square?

> The default grid aspect ratio is `1`. Adjust it by setting `NEXT_PUBLIC_GRID_ASPECT_RATIO` to your
> preferred value or `0` to remove the constraint.

#### Why Aren't Fujifilm Simulations Importing with EXIF Data?

> Fujifilm simulation data may be stripped by intermediaries. Ensure you're importing the original
> file as stored by the camera. You can also manually select the simulation when editing a photo.

#### Why Do My Images Appear Flipped or Rotated Incorrectly?

> Only EXIF orientations 1, 3, 6, and 8 are supported. Orientations 2, 4, 5, and 7 (which involve
> mirroring) are not supported.

#### Why Does My Image Placeholder Blur Vary Between Photos?

> Blur data is now generated consistently on the server. To update blur data for a photo, edit the
> photo, make no changes, and choose "Update."

#### Why Are Large, Multi-Photo Uploads Not Finishing?

> The default timeout for processing multiple uploads is 60 seconds. Extend this by setting
> `maxDuration = 300` in `src/app/admin/uploads/page.tsx`.

#### I've Added My OpenAI Key but It's Not Working. Why Am I Seeing Connection Errors?

> You may need to pre-purchase credits before accessing the OpenAI API.

#### Can This Application Run in a Docker Image?

> Refer to relevant documentation or community resources for guidance on Docker support.
