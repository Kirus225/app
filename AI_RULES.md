# AI Development Rules - Manhwa Tipo

## Tech Stack
- **React 19**: Core UI library for building the plugin interface.
- **TypeScript**: For type-safe development and robust code.
- **Vite**: Fast build tool and development server.
- **Tailwind CSS**: Primary framework for styling and layout.
- **Shadcn/UI**: Accessible UI components (Radix UI based) for consistent design.
- **Lucide React**: Standard icon library for the application.
- **React Router**: For navigation and page management.

## Development Guidelines
- **Styling**: Use Tailwind CSS classes for all styling. Avoid raw CSS strings or inline styles unless calculating dynamic values (e.g., balloon dimensions).
- **Components**: 
  - Create small, focused components in `src/components/`.
  - Use Shadcn/UI components for common elements like Buttons, Inputs, and Dialogs.
  - Keep components under 100 lines of code where possible.
- **Icons**: Always use `lucide-react` for UI icons.
- **File Structure**:
  - Pages go in `src/pages/`.
  - Reusable components go in `src/components/`.
  - Main routing logic stays in `src/App.tsx`.
- **Theme**: Adhere to the Photoshop-inspired dark theme (Background: `#323232`, Panels: `#3E3E3E`, Highlight: `#2680EB`).
- **State Management**: Use React hooks (`useState`, `useMemo`, `useCallback`) for local and shared state.