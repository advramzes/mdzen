# MDZen — Markdown Viewer

## Проект
Легкий, современный просмотрщик Markdown файлов.
Только VIEWER — никакого редактирования.

## Стек
- React Native + Expo SDK 52+ (TypeScript)
- expo-router для навигации
- react-native-markdown-display для рендеринга
- AsyncStorage для настроек и recent files
- EAS Build для APK

## Архитектура
app/
  (tabs)/
    _layout.tsx        # Tab layout
    index.tsx          # Files tab (recent + open)
    viewer.tsx         # MD viewer
    settings.tsx       # Settings
  _layout.tsx          # Root layout + ThemeProvider
  +not-found.tsx

components/
  MarkdownRenderer.tsx
  FileCard.tsx
  ThemeProvider.tsx
  TOCSheet.tsx
  SearchBar.tsx

constants/
  themes.ts
  config.ts

hooks/
  useTheme.ts
  useRecentFiles.ts
  useMarkdown.ts

## Темы
3 темы: Emerald Green (default), Amber Sepia, Dark Mode.
Все цвета через ThemeContext — НИКАКИХ хардкод цветов.

## Правила
- TypeScript strict mode
- Функциональные компоненты + hooks
- НЕ использовать WebView для MD
- НЕ добавлять редактирование
- НЕ добавлять облачный sync / авторизацию
- Expo Router file-based routing
- Минимум зависимостей

## Context7
Перед использованием ЛЮБОГО пакета — запроси актуальную
документацию через Context7 MCP. Особенно для:
- expo-router (tabs, navigation)
- react-native-markdown-display
- expo-document-picker
- @react-native-async-storage/async-storage

## UI/UX Стандарты
- Accessibility: контраст 4.5:1, alt-text, keyboard nav
- Touch targets: минимум 44x44pt
- Анимации: 150-300ms, ease-out
- Spacing: 8dp rhythm (8/16/24/32/48)
- Иконки: только vector (Lucide), НИКАКИХ эмодзи как иконок
- Dark mode: primary text >=4.5:1 контраст в обеих темах
- Safe area: respect notch, gesture bar, status bar
- Haptic: light на навигации, medium на действиях

## Obsidian Knowledge Vault
Хранилище знаний проекта: F:\MDZen-Vault\

### При старте сессии
Прочитай 00-home\index.md и текущие-приоритеты.md.
Если задача касается модуля — прочитай заметку из knowledge\.

### При завершении (пользователь: "сохрани сессию")
1. Создай заметку в sessions\ с датой
2. Обнови текущие-приоритеты.md
3. Если принято решение — создай в knowledge\decisions\
4. Если баг — создай в knowledge\debugging\
5. Обнови index.md если новые заметки

## Команды
npm start                                    # dev server
npm run web                                  # web preview
npx eas build -p android --profile preview   # APK
npx expo export -p web                       # web build
