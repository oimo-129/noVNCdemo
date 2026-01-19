# Vue CLI Learning Progress

This file tracks the learning progress for the Vue CLI tutorial.

## Completed Topics

### Phase 1: Basics (100% Complete)
- **Environment Setup**: Installed Node.js and globally installed `@vue/cli`.
- **Project Creation**: Successfully created a new Vue 3 project using `vue create`.
- **Core Commands**: Mastered `npm run serve` for development and understood its function.
- **Project Structure**: Learned the roles of `src/`, `public/`, `package.json`, and other key files.
- **Hot Module Replacement (HMR)**: Experienced modifying a component and seeing the browser update instantly without a full reload.

### Phase 2: Advancing (In Progress)

- **Vue Router (Completed)**
    - **Core Concepts**: Understood its role, the difference between `<router-link>` and `<a>`, and how it prevents full-page reloads.
    - **Navigation Guards**: Mastered `router.beforeEach` to implement route-based authentication for login control.
    - **Lazy Loading**: Understood and implemented lazy loading with `() => import()` for performance optimization.

- **State Management with Pinia (Started)**
    - **Understood the "Why"**: Grasped the concept of a central store to avoid "prop drilling".
    - **Setup**: Successfully installed Pinia and registered it in `main.js`.

### Core Concepts Understood
- **Vue CLI's Role**: Understood that it's a full toolchain for development, building, and testing, not just a scaffolder.
- **Webpack Abstraction**: Learned that Vue CLI hides Webpack configuration for simplicity but allows customization via `vue.config.js`.
- **Modules**: Differentiated between CommonJS (`require`) and ES Modules (`import`/`export`), and understood dynamic `import()` for lazy loading.
- **Single Page Application (SPA)**: Grasped the concept of a single HTML file with dynamically swapped components.
- **Virtual DOM vs. Real DOM**: Understood the VDOM's role as a performance optimization layer.

## Next Steps

- **Create the first Pinia store**:
    - Create a new file at `src/store/auth.js`.
    - Define state, actions, and getters for managing user authentication.
    - Refactor the login logic in `LoginView.vue` to use the new auth store.
    - Update the navigation guard in `router/index.js` to use the auth store instead of `localStorage`.
