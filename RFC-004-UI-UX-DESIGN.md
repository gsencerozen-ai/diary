# RFC-004: UI/UX Tasarımı ve Komponent Yapısı

## Durum
Önerilen

## Özet
Günlük uygulamasının samimi ve sıcak görünümü, animasyonları ve komponent mimarisi.

## Motivasyon
- Kullanıcıların rahat ve huzurlu bir ortamda yazı yazması
- Sıcak ve davetkar bir atmosfer oluşturma
- Modern ve responsive tasarım
- Smooth ve purposeful animasyonlar

## Tasarım Sistemi

### Renk Paleti (Sıcak Tonlar)

```typescript
// app/globals.css - Tailwind custom colors
:root {
  /* Warm Base Colors */
  --warm-50: #fef8f3;
  --warm-100: #fef0e6;
  --warm-200: #fcd9bd;
  --warm-300: #fab794;
  --warm-400: #f7936c;
  --warm-500: #f47943;
  --warm-600: #e05d28;
  --warm-700: #b54920;
  --warm-800: #8a381a;
  --warm-900: #5f2813;
  
  /* Cream/Beige (Backgrounds) */
  --cream-50: #faf8f5;
  --cream-100: #f5f0eb;
  --cream-200: #ebe2d7;
  --cream-300: #d9ccbb;
  
  /* Terracotta (Accents) */
  --terracotta-400: #d97757;
  --terracotta-500: #c65d3b;
  --terracotta-600: #b34d2b;
  
  /* Soft Brown (Text) */
  --brown-700: #6b4423;
  --brown-800: #4a2f18;
  --brown-900: #2d1e0f;
  
  /* Success/Error */
  --success: #7fb069;
  --error: #d64545;
}
```

### Typography

```typescript
// Font pairings
- Headings: 'Crimson Pro' (serif, warm)
- Body: 'Inter' (sans-serif, okunabilir)
- Diary Content: 'Merriweather' (serif, yazı için optimal)
```

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-crimson)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        diary: ['var(--font-merriweather)', 'serif'],
      },
      colors: {
        warm: {
          50: 'var(--warm-50)',
          100: 'var(--warm-100)',
          // ... diğerleri
        },
        cream: {
          50: 'var(--cream-50)',
          // ...
        },
        terracotta: {
          400: 'var(--terracotta-400)',
          // ...
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
};
```

## Layout Yapısı

### Ana Layout (Protected)

```
┌─────────────────────────────────────────────────────┐
│ Header (Navbar)                                     │
│ - Logo / Başlık                                     │
│ - Kullanıcı Profil (Avatar + Çıkış)                │
└─────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────┐
│              │                                      │
│   Sidebar    │     Main Content Area               │
│              │                                      │
│ - Yeni Yazı  │     ┌────────────────────────┐      │
│ - Yazılar:   │     │                        │      │
│   • 30 Kas   │     │   Diary Editor         │      │
│   • 29 Kas   │     │   veya                 │      │
│   • 28 Kas   │     │   Entry View (locked)  │      │
│   ...        │     │                        │      │
│              │     └────────────────────────┘      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

**Responsive Behavior**:
- Desktop (>1024px): Sidebar visible
- Tablet/Mobile (<1024px): Sidebar hamburger menu

## Komponent Hiyerarşisi

### 1. Layout Components

#### Header Component
```typescript
// components/layout/header.tsx
interface HeaderProps {
  user: User;
  onSignOut: () => void;
}

Features:
- Logo/Title: "Günlüğüm" 
- User avatar (first letter of email)
- Dropdown menu:
  - Profil
  - Çıkış Yap
- Subtle shadow
- Sticky positioning
```

#### Sidebar Component
```typescript
// components/layout/sidebar.tsx
interface SidebarProps {
  entries: DiaryEntryListItem[];
  currentEntryId?: string;
  onNewEntry: () => void;
  onSelectEntry: (id: string) => void;
}

Features:
- "Yeni Günlük" button (prominent)
- Entry list (scrollable)
- Each entry card:
  - Date/time title
  - Preview text
  - Word count badge
- Highlight selected entry
- Empty state: "Henüz günlük yazısı yok"
```

### 2. Diary Components

#### DiaryEditor Component
```typescript
// components/diary/editor.tsx
interface DiaryEditorProps {
  onSave: (content: string) => Promise<void>;
  initialDate: Date;
}

Features:
- Title: Auto-generated date (read-only)
- Textarea: Autosize, minimum height
- Character/word counter (live)
- "Kaydet" button:
  - Bottom-right, fixed position
  - Loading state during save
  - Success animation on save
- Unsaved changes warning
- Focus on mount
```

#### DiaryEntryView Component
```typescript
// components/diary/entry-view.tsx
interface DiaryEntryViewProps {
  entry: DiaryEntry;
}

Features:
- Title (date/time)
- Content (read-only, formatted)
- Metadata:
  - Word count
  - Character count
  - Saved date
- Lock icon indicator
- No edit button (immutable)
- Optional: Share/Export button (future)
```

#### EntryCard Component
```typescript
// components/diary/entry-card.tsx
interface EntryCardProps {
  entry: DiaryEntryListItem;
  isSelected?: boolean;
  onClick: () => void;
}

Features:
- Clickable card
- Date title
- Preview text (faded)
- Word count badge
- Hover effect
- Selected state (background change)
```

### 3. Auth Components

#### LoginForm Component
```typescript
// components/auth/login-form.tsx

Features:
- Email input (shadcn Input)
- Password input (shadcn Input, type="password")
- Submit button (shadcn Button)
- Link to register
- Error display (shadcn Alert/Toast)
- Loading state
```

#### RegisterForm Component
```typescript
// components/auth/register-form.tsx

Similar to LoginForm + password confirmation
```

### 4. shadcn/ui Components

Install edilecek componentler:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add card
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add dialog
```

Custom theme override (warm colors):
```typescript
// components/ui/button.tsx variants
{
  variant: 'default',
  className: 'bg-terracotta-500 hover:bg-terracotta-600 text-white'
}
```

## Framer Motion Animasyonları

### Page Transitions
```typescript
// components/layout/page-transition.tsx
import { motion } from 'framer-motion';

export const PageTransition: React.FC = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);
```

### Entry Card Hover
```typescript
<motion.div
  whileHover={{ scale: 1.02, x: 5 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  {/* Card content */}
</motion.div>
```

### Save Button Success
```typescript
const [saved, setSaved] = useState(false);

<motion.button
  animate={saved ? { scale: [1, 1.1, 1] } : {}}
  transition={{ duration: 0.3 }}
>
  {saved ? '✓ Kaydedildi' : 'Kaydet'}
</motion.button>
```

### Sidebar Slide In (Mobile)
```typescript
<motion.aside
  initial={{ x: -300 }}
  animate={{ x: 0 }}
  exit={{ x: -300 }}
  transition={{ type: "spring", damping: 20 }}
>
  {/* Sidebar content */}
</motion.aside>
```

### Entry List Stagger
```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {entries.map(entry => (
    <motion.div
      key={entry.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
    >
      <EntryCard entry={entry} />
    </motion.div>
  ))}
</motion.div>
```

## Responsive Design Breakpoints

```typescript
// Tailwind breakpoints
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
```

**Layout Changes**:
- `< lg`: Sidebar hidden, hamburger menu
- `>= lg`: Sidebar always visible
- Diary editor: Full width on mobile

## Accessibility (a11y)

- Semantic HTML (nav, main, aside, article)
- ARIA labels
- Keyboard navigation (Tab, Enter, Esc)
- Focus indicators
- Color contrast WCAG AA compliance
- Screen reader friendly

## Loading States

### Skeleton Loaders
```typescript
// components/ui/entry-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export const EntrySkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);
```

### States:
- Initial auth check: Full screen spinner
- Loading entries: Sidebar skeletons
- Saving entry: Button loading spinner

## Error States

### Empty States
```typescript
// components/diary/empty-state.tsx
- Icon (illustrated diary)
- Message: "Henüz günlük yazmadınız"
- CTA: "İlk Günlüğünüzü Yazın" button
```

### Error Boundaries
- Network errors
- Auth errors
- Firestore errors
- Generic fallback

## Bağımlılıklar

```json
{
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.400.0",        // Icons
  "clsx": "^2.1.0",                  // Classname utility
  "tailwind-merge": "^2.3.0",        // Merge tailwind classes
  "react-textarea-autosize": "^8.5.0" // Auto-resizing textarea
}
```

### Fonts
```typescript
// app/layout.tsx
import { Crimson_Pro, Inter, Merriweather } from 'next/font/google';

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
});
```

## Performance Optimizations

1. **Images**: Next.js Image component (logo, avatar)
2. **Code splitting**: Dynamic imports for heavy components
3. **Lazy loading**: Entry list virtualization (react-window - opsiyonel)
4. **Memoization**: React.memo for cards
5. **Debounce**: Character count calculations

## Theme Toggle (Future)
- Light/Dark mode toggle
- Warm light vs warm dark palettes

## İleri Adımlar
- [ ] shadcn/ui setup
- [ ] Color palette implementation
- [ ] Typography setup (Google Fonts)
- [ ] Layout components
- [ ] Diary components
- [ ] Auth components
- [ ] Framer Motion animations
- [ ] Responsive testing
- [ ] Accessibility audit
- [ ] Performance testing

## Mockups & Design Assets
- Figma dosyaları (opsiyonel)
- Component Storybook (gelecekte)
