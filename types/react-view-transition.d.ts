import 'react';

declare module 'react' {
  // React canary-компонент View Transitions. Next.js підкладає canary-React
  // (де він є) коли увімкнено experimental.viewTransition, але стабільний
  // @types/react ще не містить декларації.
  export const ViewTransition: React.ComponentType<{
    children?: React.ReactNode;
    name?: string;
    enter?: string | Record<string, string>;
    exit?: string | Record<string, string>;
    share?: string;
    update?: string;
    default?: string;
  }>;
}
