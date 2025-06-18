/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                            STYLING SYSTEM USAGE GUIDE                               ║
 * ║                                                                                      ║
 * ║ Guide for using the standardized NativeWind styling system.                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

## 📖 **Usage Guide**

### **🚀 Quick Start**

```tsx
import { getThemedStyles } from '../styling';
import { useDarkMode } from '../hooks/commonHooks';

const MyComponent = () => {
  const { isDarkMode } = useDarkMode();
  const styles = getThemedStyles(isDarkMode);
  
  return (
    <View className={styles.layout.container}>
      <Text className={styles.text.heading1}>Hello World</Text>
      <TouchableOpacity className={styles.button.primary(false)}>
        <Text className="font-bold text-lg text-white">Click Me</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### **🎨 Available Style Categories**

#### **Layout Styles**
- `styles.layout.container` - Main app container
- `styles.layout.screenContainer` - Full screen with padding and centering
- `styles.layout.contentWrapper` - Content wrapper with max width
- `styles.layout.formContainer` - Form container with spacing

#### **Text Styles**
- `styles.text.heading1` - Large page titles
- `styles.text.heading2` - Section headers
- `styles.text.heading3` - Subsection headers
- `styles.text.body` - Regular body text
- `styles.text.bodyCenter` - Centered body text with margin
- `styles.text.small` - Small text
- `styles.text.caption` - Very small text (legal, captions)
- `styles.text.link` - Clickable link text
- `styles.text.backButton` - Back button text

#### **Input Styles**
- `styles.input.textInput` - Standard text input
- `styles.input.textInputCenter` - Centered text input (for codes)
- `styles.input.searchInput` - Search input field

#### **Button Styles**
- `styles.button.primary(isDisabled)` - Primary action button
- `styles.button.primaryVerify(isDisabled)` - Primary button with less margin
- `styles.button.secondary` - Secondary button
- `styles.button.fab` - Floating action button

#### **Card Styles**
- `styles.card.card` - Standard card
- `styles.card.cardLarge` - Large card with more padding
- `styles.card.cardCompact` - Compact card
- `styles.card.listItem` - List item card

#### **Utility Styles**
- `styles.utility.border` - Themed border
- `styles.utility.success` - Success text color
- `styles.utility.warning` - Warning text color

### **🔧 Direct Style Access**

You can also import individual style objects:

```tsx
import { textStyles, buttonStyles, layoutStyles } from '../styling';

// Use individual styles
const containerClass = layoutStyles.container.get(isDarkMode);
const headingClass = textStyles.heading1.get(isDarkMode);
```

### **🎯 Best Practices**

1. **Always use `getThemedStyles(isDarkMode)`** for consistency
2. **Group related styles** together in components
3. **Use semantic names** - prefer `heading1` over `text-4xl`
4. **Extend the system** when you need new patterns
5. **Keep spacing consistent** using the predefined margin/padding

### **🔄 Extending the System**

To add new styles, edit `/app/styling/nativewind.ts`:

```typescript
// Add new button variant
export const buttonStyles = {
  // ...existing styles
  danger: {
    light: 'w-full py-4 rounded-lg items-center bg-red-600',
    dark: 'w-full py-4 rounded-lg items-center bg-red-500',
    get: (isDarkMode: boolean) => isDarkMode ? buttonStyles.danger.dark : buttonStyles.danger.light
  },
};

// Update getThemedStyles function
export const getThemedStyles = (isDarkMode: boolean) => ({
  // ...existing
  button: {
    // ...existing
    danger: buttonStyles.danger.get(isDarkMode),
  },
});
```

### **📱 Migration from Old Styles**

**Before:**
```tsx
className={`text-4xl font-extrabold mb-4 text-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
```

**After:**
```tsx
className={styles.text.heading1}
```

This system provides:
- ✅ **Consistency** - All components use the same styling patterns
- ✅ **Maintainability** - Changes in one place affect the whole app
- ✅ **Type Safety** - TypeScript support for all styles
- ✅ **Theme Support** - Automatic dark/light mode handling
- ✅ **Performance** - No runtime style calculations
