# Messages Interface - Visual Reference Guide

## Overall Layout

### Desktop View (1024px+)
```
┌────────────────────────────────────────────────────────────┐
│  🏠 Prolinq  🔔  👤  ☰                                    │ Header (TopNav)
├──────────────┬─────────────────────────────────────────────┤
│ M  [🔍 Search]  ← User Name    [📎 📞 ⋮]                 │
│ e  Conversations  🟢 Online                                │
│ s  ─────────────────────────────────────────────────────  │ Chat Area Header
│ s                │   ┌─────────────────────────────┐      │
│ a  🟢 John   [3] │   │                             │      │
│ g  hey boss     │   │  [Date Separator]           │      │
│ e  Today 09:05  │   │                             │      │
│ s  ────────────  │   │  🟢 John  09:05            │      │
│    🔵 Sarah     │   │  wassup boss                │      │
│ L  sup!         │   │                             │      │
│ i  08:30        │   │                    You 09:06│      │
│ s  ────────────  │   │                  pppp ✓✓ 09:06   │      │
│ t  ⚪ Mike      │   │                             │      │
│    cool stuff   │   │                   Other 09:07│      │
│    Yesterday    │   │                  all good  │      │
│    07:44        │   │                             │      │
│                 │   │                             │      │
│                 │   │ [📎] [😊] [Type a msg...] │      │
│                 │   │                             │      │
└─────────────────┴──────────────────────────────────────────┘
     300px            Chat Area (Flex)
```

### Tablet View (768px-1023px)
```
┌────────────────────────────────────────────────────────────┐
│  🏠 Prolinq  🔔  👤  ☰                                    │ Header
├────────────────────────────────────────────────────────────┤
│ ← User Name    [📎 📞 ⋮]                                  │ Chat Header (Back Button Visible)
│                                                            │
│ [Date Separator]                                          │
│                                                            │
│ 🟢 John  09:05                                             │
│ wassup boss                                                │
│                                                            │
│                                      You 09:06            │
│                                    pppp ✓✓ 09:06          │
│                                                            │
│                                   Other 09:07             │
│                                    all good               │
│                                                            │
│ [📎] [😊] [Type a message...] [Send]                     │
│                                                            │
│ Sidebar hidden (Click ← to toggle)                        │
└────────────────────────────────────────────────────────────┘
```

### Mobile View (<768px)
```
┌──────────────────────────────────────┐
│  🏠 Prolinq  🔔  👤  ☰              │ Header
├──────────────────────────────────────┤
│ ← User Name           [📎 📞 ⋮]      │ Chat Header
│                                       │
│ [Date]                                │
│                                       │
│ 🟢 John  09:05                        │
│ wassup boss                           │
│                                       │
│                  You 09:06            │
│                pppp ✓✓               │
│                                       │
│ [📎] [😊] [Type...] [Send]           │
│                                       │
│ (Swipe left for sidebar)              │
└──────────────────────────────────────┘
```

---

## Sidebar - Detailed View

### Header Section
```
┌─────────────────────────────────┐
│ Messages              [⋮]       │  Title + Menu
├─────────────────────────────────┤
│  🔍 Search conversations...     │  Search Input
└─────────────────────────────────┘
```

### Conversation Item - Unread
```
┌─────────────────────────────────┐
│  ┌───┐  John Doe      [3]       │  Avatar  Name  Badge
│  │ 🟢 │  hey boss     Today     │  Status  Message Timestamp
│  └───┘  09:05                   │
└─────────────────────────────────┘
```

### Conversation Item - Read
```
┌─────────────────────────────────┐
│  ┌───┐  Jane Smith   Today      │
│  │ 🟢 │  sounds good   10:30    │
│  └───┘                          │
└─────────────────────────────────┘
```

### Active Conversation
```
┌─────────────────────────────────┐
│████ Robert Adams   09:05    [1] │  Blue highlight (active)
│ 🟢 │  one more thing             │
│ ├────────────────────────────────┤
│                                  │
└─────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────┐
│                                 │
│             📬                  │
│                                 │
│      No conversations yet       │
│                                 │
└─────────────────────────────────┘
```

---

## Chat Area - Detailed View

### Chat Header
```
┌────────────────────────────────────────────────────┐
│ ←  ┌──┐  John Doe            [📎] [📞] [⋮]        │
│    │🟢 │  🟢 Online                                │
│    └──┘                                            │
└────────────────────────────────────────────────────┘
Back Btn Avatar Status              Action Buttons
(Mobile)
```

### Message - Received
```
  ┌───────────────────────────┐
  │ 🟢 John    09:05         │  Avatar  Name  Time
  ├───────────────────────────┤
  │  Hey, how are you?        │  Light gray bubble
  │                           │  Dark text
  └───────────────────────────┘
       Left-aligned
```

### Message - Sent
```
                   ┌─────────────────────┐
                   │ Great! See you then │  White text
                   │     ✓✓ 10:05        │  Blue bubble
                   └─────────────────────┘  Status icon
                         Right-aligned
                         with avatar on right
```

### Date Separator
```
           ──────────────────────────────
                    Today
           ──────────────────────────────
```

### Typing Indicator
```
  ┌──────────────┐
  │ 🟢 Jane      │
  │  ● ● ●      │  Animated bouncing dots
  └──────────────┘
```

### Input Area
```
┌──────────────────────────────────────────┐
│ [📎] [😊] [Type a message...]  [Send ↑] │
│     X characters                         │
└──────────────────────────────────────────┘
  |    |     |__________________|  |_____|
  |    |           |                |
 Attach Emoji    Input            Send Button
 Button   Button  Field           (Blue when active)
```

---

## Color Reference

### Message Bubbles
```
SENT MESSAGE (You)
┌──────────────────────┐
│  Your message text   │  Background: #3b82f6 (Blue)
│  ✓✓ 10:05           │  Text: #ffffff (White)
└──────────────────────┘  Alignment: Right
   Rounded all sides
   Square top-right

RECEIVED MESSAGE (Other)
┌──────────────────────┐
│  Their message text  │  Background: #f3f4f6 (Gray)
│  10:04              │  Text: #374151 (Dark)
└──────────────────────┘  Alignment: Left
   Rounded all sides
   Square top-left
```

### Status Indicators
```
🟢 Online     #10b981 (Green)   → Green dot on avatar
⚪ Offline    #6b7280 (Gray)    → Gray dot on avatar
🔴 Badge      #ef4444 (Red)     → Unread message count
```

### Text Colors
```
User Names       #1f2937  (Very Dark)    14px, 600 weight
Message Text     #374151  (Dark)         14px, 400 weight
Timestamps       #9ca3af  (Light)        11px, 400 weight
Date Separators  #6b7280  (Medium)       12px, 500 weight
```

### Backgrounds
```
Sidebar          #f8f9fa  (Very Light Gray)
Chat Area        #ffffff  (White)
Message Area     #f9fafb  (Very Light Gray)
Hover State      #f9fafb  (Light Gray)
Active State     #eff6ff  (Very Light Blue)
Input Focus      3px ring #3b82f6 (Blue)
```

---

## Interactive States

### Button States
```
ENABLED (Idle)
┌─────────────┐
│  Send  ↑   │  Blue text, gray background
└─────────────┘

ENABLED (Hover)
┌─────────────┐
│  Send  ↑   │  Blue background, light blue
└─────────────┘

DISABLED (No message)
┌─────────────┐
│  Send  ↑   │  Gray text, 50% opacity
└─────────────┘
```

### Input States
```
NORMAL
┌──────────────────────────────┐
│ Type a message...            │  Light gray background
└──────────────────────────────┘

FOCUSED
┌──────────────────────────────┐
│ Type a message...            │  White background
└──────────────────────────────┘  Blue ring (3px)

WITH TEXT
┌──────────────────────────────┐
│ Hello there!                 │  White background
└──────────────────────────────┘  Send button turns blue
```

### Conversation Item States
```
NORMAL
┌─────────────────────────────┐
│ John Doe                    │  
│ hey boss                    │
└─────────────────────────────┘

HOVER
┌─────────────────────────────┐
│ John Doe                    │  Light gray background
│ hey boss                    │
└─────────────────────────────┘

ACTIVE
┌─────────────────────────────┐
│ John Doe                    │  Light blue background
│ hey boss                    │  Bold name
└─────────────────────────────┘
```

---

## Responsive Breakpoints

### Dimensions
```
Mobile:    < 768px   (phones)
Tablet:    768px - 1023px
Desktop:   ≥ 1024px  (wide screens)
```

### Layout Changes
```
MOBILE (<768px)
├─ Sidebar: Hidden (overlay on demand)
├─ Chat: Full width
├─ Back button: Visible
├─ Input: Full width, mobile keyboard optimized
└─ Buttons: Stacked vertically

TABLET (768px-1023px)
├─ Sidebar: Collapsible (hamburger menu)
├─ Chat: Fills remaining space
├─ Back button: Visible
├─ Input: Full width
└─ Buttons: Side by side

DESKTOP (≥1024px)
├─ Sidebar: Fixed 300px, always visible
├─ Chat: Flex-grow fills space
├─ Back button: Hidden
├─ Input: Full width
└─ Buttons: Inline with spacing
```

---

## Animation Details

### Message Slide-In
```
0%     ────────────────────────
        Opacity: 0%
        Transform: translateY(10px)

100%    ────────────────────────
        Opacity: 100%
        Transform: translateY(0)
```

### Typing Indicator
```
Dot 1:   ● ○ ○     (Bounces up-down)
Dot 2:   ● ● ○     (Staggered 0.1s)
Dot 3:   ● ● ●     (Staggered 0.2s)

Loop timing: 1.4 seconds
Direction: Y-axis (up/down 10px)
```

### Pulse Animation (Badge)
```
0%     [3] ← Opacity 100%

50%    [3] ← Opacity 70%

100%   [3] ← Opacity 100%

Duration: 2 seconds, infinite
```

---

## Touch-Friendly Sizing

### Minimum Touch Targets
```
44px × 44px minimum for all interactive elements

Buttons:          44px height × 44px width
Avatar Click:     40px + 4px padding = 48px
Message Bubble:   32px min height
Input Field:      44px height
Badges:           24px diameter
```

### Spacing for Fingers
```
Button to Button: 8px gap minimum
List Items:       12px vertical gap
Avatar to Text:   12px horizontal gap
Message Padding:  16px left/right
                  12px top/bottom
```

---

## Accessibility Features

### Focus Indicators
```
┌──────────────────┐
│  Send           │  2px blue outline
│                 │  2px offset from element
└──────────────────┘
    ↑ Keyboard focus visible
```

### High Contrast Mode
```
Text: #1f2937 on white
      (Ratio 21:1 - exceeds WCAG AAA)

Text: #374151 on #f3f4f6
      (Ratio 4.5:1 - meets WCAG AA)

All interactive elements: 3:1 minimum contrast
```

### Screen Reader Announcements
```
"Messages, main navigation"
"3 unread messages from John Doe"
"New message from John: hey boss"
"Type a message button"
"Message sent successfully"
```

---

## Loading States

### Initial Load
```
┌─────────────────────┐
│  ⟳  Loading...      │  Spinning icon
│                     │  "Loading..." text
└─────────────────────┘
```

### Message Load
```
┌─────────────────────┐
│                     │
│  ⟳                 │  Centered spinner
│                     │
└─────────────────────┘
```

### Sending Message
```
Input: [Type...]  [⟳ Sending...]  (Send button disabled)
```

---

## Empty States

### No Conversations
```
┌──────────────────────────────┐
│                              │
│          📬                  │
│                              │
│   No conversations yet       │
│   Start messaging!           │
│                              │
└──────────────────────────────┘
```

### No Messages in Chat
```
┌──────────────────────────────┐
│                              │
│          💬                  │
│                              │
│   No messages yet            │
│   Say hello!                 │
│                              │
└──────────────────────────────┘
```

### No Search Results
```
┌──────────────────────────────┐
│  🔍 Searching for "xyz"      │
│                              │
│         🔎                   │
│                              │
│   No conversations found     │
│   Try a different search     │
│                              │
└──────────────────────────────┘
```

---

## Error States

### Connection Error
```
⚠️  Connection lost
← Retry

Message showing in red (#ef4444)
Retry button to reconnect
```

### Send Failed
```
┌──────────────────────┐
│ Your message        │
│ ✗ Failed - Retry    │
└──────────────────────┘

Red X icon instead of checkmarks
Tap to retry sending
```

### Load Error
```
⚠️  Failed to load messages
← Try Again
```

---

## Message Status Indicators

### Sent (1 check)
```
✓ Message sent to server
  Time shown: 09:05
```

### Delivered (2 checks)
```
✓✓ Message delivered to recipient
   Time shown: 09:05
   Icon color: Blue (#3b82f6)
```

### Read (2 checks, different display)
```
✓✓ Message read by recipient
   Could add different styling in future
   Current: Same as delivered
```

---

## Animations Behavior

### Reduced Motion
```
When user has:
  prefers-reduced-motion: reduce

Then:
  ✗ All animations disabled
  ✗ Transitions removed
  ✓ Instant state changes
  ✓ No bouncing/spinning
  ✓ Better for accessibility
```

---

## Print Style

```
When printing messages:
  ✗ Send button hidden
  ✗ Input area hidden
  ✗ Action buttons hidden
  ✓ Message history visible
  ✓ Timestamps preserved
  ✓ Layout adjusted for page
```

---

## Summary

This visual guide shows:
- ✅ Complete layout structure
- ✅ Desktop, tablet, mobile views
- ✅ All component styling
- ✅ Color palette reference
- ✅ Interactive states
- ✅ Animation details
- ✅ Accessibility features
- ✅ Empty and error states
- ✅ Touch sizing guidelines

For detailed implementation, refer to the code in `Messages.jsx` and `Messages.css`.

---

**Document Version**: 1.0
**Status**: ✅ Complete Reference