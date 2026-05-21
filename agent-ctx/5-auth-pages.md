# Task 5 - AuthPages Component

## Summary
Created `/home/z/my-project/src/components/mealicious/AuthPages.tsx` with two exported client components: `LoginPage` and `RegisterPage`.

## LoginPage Features
- Centered card on emerald-50 gradient background
- MEALICIOUS logo with Leaf icon
- "Welcome Back" heading + "Sign in to your account" subtitle
- Email input with Mail icon prefix
- Password input with Lock icon prefix + show/hide toggle (Eye/EyeOff)
- "Remember Me" checkbox + "Forgot Password?" link (shows toast)
- Full-width emerald "Sign In" button with loading spinner
- "Or continue with" divider
- Google & Facebook social login buttons (UI only, show toast on click)
- "Don't have an account? Register" link → navigates to register page
- Calls `login()` from store on submit, shows success toast

## RegisterPage Features
- Same centered card layout on gradient background
- MEALICIOUS logo with Leaf icon
- "Create Account" heading + "Join the Mealicious family" subtitle
- Full Name input with User icon prefix
- Email input with Mail icon prefix
- Phone input with Phone icon prefix + "+91" prefix
- Password input with show/hide toggle + 5-bar strength indicator (Very Weak → Very Strong, color-coded)
- Confirm Password input with show/hide toggle + real-time mismatch warning
- "I agree to Terms & Conditions" checkbox (links to terms page)
- Full-width emerald "Create Account" button with loading spinner
- "Or continue with" divider + social buttons
- "Already have an account? Sign In" link → navigates to login page
- Full validation (empty fields, password match, strength, terms)
- Calls `register()` from store on submit, shows success toast

## Technical Details
- Uses shadcn/ui: Card, Button, Input, Label, Checkbox, Separator
- Uses lucide-react: Leaf, Eye, EyeOff, Mail, Lock, User, Phone
- Uses framer-motion for card entrance animation (spring physics)
- Uses sonner for toast notifications
- Uses useAppStore for auth and navigation
- Lint: clean, no errors
