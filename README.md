# 🚀 KK NextJS Boilerplate

Yep another NextJS Boilerplate, Since my adventure to find the best boilerplate for my projects has failed, I decided to create my own. This boilerplate is designed to help me (or your idk) kickstart your Next.js projects with a modern development stack.
## 📦 Features

- **[Next.JS 14+](https://nextjs.org) with Page Router (App-router sucks)**
  - "yes but server compone.. 🤓" stfu
- **Type annotations using JSDoc and JavaScript (TypeScript is overrated)**
- **[Tailwind CSS](https://tailwindcss.com) for styling**
- **[ShadCN UI](https://ui.shadcn.com/) because other UI libraries suck**
- **Prisma for database management**
- **[ESLint](https://eslint.org) and Prettier for code linting and formatting**
- **Using [AirBnB ESLint config](https://www.npmjs.com/package/eslint-config-airbnb) for that extra spice and perfection**
- **Type-safe environment variables with [T3 env](https://env.t3.gg/) `(@t3-oss/env-nextjs)`**
- **Zod for runtime type checking**
- **[NextAuth V4](https://next-auth.js.org/) for authentication using `credentials`**
   - Why V4? Even tho V5 exists its still in beta and is not supposed to be used in production, while other boilerplates use v5 which is a dumb idea, i decided to stick with v4
- **Custom Auth Lib `(src/lib/auth/auth.js)` for handling authentication better because V4 doesn't provide a more beautiful to get user or session, i made a own auth lib which you can get the user, check if its a admin, etc**
- **Sessions Management, this lets your users manage their sessions, logout from all devices, etc**
- **[React Query](https://tanstack.com/query/latest) for data fetching**
- **Modules Aliases to manage paths easily without using `../../../blah.js` because if code not good then is bad**

## ❌ Why not use typescript?
- I m not the type of guy to write types and interfaces and all that stuff, i know typescript is better for type-checking but i prefer to use JSDoc and Zod for runtime type checking, i know its not the best but i prefer it this way its much easier and gets the job done

## 📁 Why use Page Router?
- because app-router its more complicated than it should be. "bu.. but server components" 🤓 stfu dude, cache sucks anyway

"If it's not broken, then why fix it?" — __Moses Hadas__

## 🚀 Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/kkmihai/kk-nextjs-boilerplate.git
   cd kk-nextjs-boilerplate
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

    - Copy `.env.example` to `.env.local` and update the values as needed.

   ```bash
   cp .env.example .env.local
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

   Your application will be running at `http://127.0.0.1:3000`.
   If you are in development use 127.0.0.1 not localhost because it can cause potential DNS resolution issues

## 📖 Documentation

- **[Next.js Documentation](https://nextjs.org/docs)**: Learn more about the core framework.
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)**: Explore the utility-first CSS framework.
- **[Prisma Documentation](https://www.prisma.io/docs)**: Dive into database management and ORM.
- **[ESLint Documentation](https://eslint.org/docs)**: Understand the linting rules and configuration.
- **[Prettier Documentation](https://prettier.io/docs/en/)**: Get details on code formatting.

## ⚙️ Configuration

- **Environment Variables**: Configure your environment settings in `.env.local` or also in `/src/env.mjs` depending if you wanna add env variables.

## 💡 Contributing

I welcome contributions! Please read the [contributing guide](CONTRIBUTING.md) for more details on how to get involved.

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 🙌 Support

For any questions or issues, please open an [issue](https://github.com/kkmihai/kk-nextjs-boilerplate/issues)
