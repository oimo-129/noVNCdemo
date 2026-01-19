# Vue CLI Learning Progress

This file tracks the learning progress for the Vue CLI tutorial.

## Completed Topics

### Phase 1: Basics (100% Complete)
- **Environment Setup**: Installed Node.js and globally installed `@vue/cli`.
- **Project Creation**: Successfully created a new Vue 3 project using `vue create`.
- **Core Commands**: Mastered `npm run serve` for development and understood its function.
- **Project Structure**: Learned the roles of `src/`, `public/`, `package.json`, and other key files.
- **Hot Module Replacement (HMR)**: Experienced modifying a component and seeing the browser update instantly without a full reload.

### Phase 2: Advancing (Partial)
- **Plugin System**: Added Vue Router using `vue add router` to enable multi-page navigation.
- **Build & Deployment**: 
    - Learned the difference between the development environment and a production build.
    - Used `npm run build` to generate the production-ready `dist` folder.
    - Installed and used the `serve` package (`serve -s dist`) to locally preview the production build, simulating a real server environment.

### Core Concepts Understood
- **Vue CLI's Role**: Understood that it's a full toolchain for development, building, and testing, not just a scaffolder.
- **Webpack Abstraction**: Learned that Vue CLI hides Webpack configuration for simplicity but allows customization via `vue.config.js`.
- **Modules**: Differentiated between CommonJS (`require`) used in Node-based configurations (`vue.config.js`) and ES Modules (`import`/`export`) used in the application source code (`src/`).
- **Single Page Application (SPA)**: Grasped the concept of a single HTML file with dynamically swapped components.
- **Virtual DOM vs. Real DOM**: Understood the VDOM's role as a performance optimization layer, how diffing works, and that the user ultimately interacts with the Real DOM.
- **Basic Networking**: Learned what a Local Area Network (LAN) is and how to identify devices on the same network via their IP address and subnet mask.

## Next Steps

- Continue with the **Advancing** phase, focusing on:
    - State Management (Vuex/Pinia).
    - Advanced configuration with `vue.config.js`.
    - Using environment variables.