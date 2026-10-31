# Legacy Boutique

Your shop website. Visitors see the shop. Only you can log in and edit it.

Everything is plain files (no build step), so it works on Vercel, Netlify or GitHub Pages.
Your shop data and photos are stored in Supabase (free), and the website reads them from there.

## Setup (about 20 minutes, one time)

### 1. Create the free database (Supabase)
1. Go to supabase.com, sign up, and click **New project**. Pick any name and a strong database password (save it). Choose the closest region offered.
2. Open **Authentication > Users > Add user > Create new user**. Enter the email and password you will use to log in to your shop. Tick **Auto Confirm User**.
3. In the Authentication settings, turn **off** "Allow new users to sign up" so nobody else can make an account.
4. Open **SQL Editor > New query**. Open `setup.sql` from this folder, replace both copies of `you@example.com` with the email from step 2, paste it all in, and click **Run**.

### 2. Connect the website to it
1. In Supabase open **Project Settings > API** (or "API Keys").
2. Copy the **Project URL** and the **anon / public key**.
3. Paste them into `config.js` in place of the two `YOUR-...` values. Keep the quotes.
   (The anon key is meant to be public. Never put the `service_role` key anywhere.)

### 3. Put it on GitHub
1. Create a free account at github.com, then **New repository** (name it `legacy-boutique`).
2. Click **uploading an existing file**, drag in everything from this folder (including the `images` folder), and click **Commit changes**.

### 4. Publish it
**Netlify:** app.netlify.com > **Add new site > Import an existing project** > GitHub > pick the repository > **Deploy**. Leave the build command empty and the publish folder as the root.
**Vercel:** vercel.com > sign in with GitHub > **Add New > Project** > pick the repository > **Deploy**. Leave every setting as it is.

### 5. First login
Open your website, scroll to the bottom, click **Owner login**, and sign in. Click **Save changes** once. This copies your current shop into the database. After that, every save shows on the live site straight away.

## Day to day
Scroll to the bottom of the site and click **Owner login**. Edit stock, prices, sizes, colours and photos, then **Save changes**. Click **Sign out** when done, especially on a shared phone.

## Good to know
- If the database is ever unreachable, the site shows the starting copy in `seed-data.json`.
- Supabase free projects pause after a week with no activity. Visitors loading the site normally count as activity, but if the shop goes quiet for a long time, open the site now and then.
- Forgot your password? In Supabase go to Authentication > Users, open your user, and send a password recovery or set a new one.
- Vercel's free Hobby plan is meant for personal, non-commercial use, and a shop is commercial. Netlify's free plan or Cloudflare Pages is the safer free choice. Both work with this same folder.
