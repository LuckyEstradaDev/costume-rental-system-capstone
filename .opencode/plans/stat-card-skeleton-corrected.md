# Plan: STATUS CARD SKELETON (corrected)
- When isLoading is true, render the entire card as a single skeleton matching the card's real size (same dimensions as the actual card). 
- The skeleton IS the card itself, not individual elements (icon/title/number/delta).
- Preserve card styling: border, background, padding, height, border-radius to match real card shape.
- Keep aria-busy and layout consistent.

