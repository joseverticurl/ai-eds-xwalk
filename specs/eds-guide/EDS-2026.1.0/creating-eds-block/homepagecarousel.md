# Component: homepagecarousel

## Summary
The **homepagecarousel** is a hero carousel component for the homepage that showcases featured stories, campaigns, or brand highlights using slides with image/video backgrounds and text content.  
Slides automatically transition with a configurable timer and display brand icons that act as both navigation and progress indicators.

The component is built for **AEM Edge Delivery Services (EDS)** and authored using the **Universal Editor**.

---

# User Story

**As a** website visitor  
**I want** to see rotating featured content on the homepage  
**So that** I can quickly discover brand stories, campaigns, and highlights.

---

# Key Features

- Multiple carousel slides
- Image or video background support
- Auto slide transition with configurable duration
- Brand icons used as navigation and progress indicators
- Gradient/Aura background effect
- Multi-line paragraph text
- Automatic paragraph alignment pattern
- Responsive layout for desktop and mobile

---

# User Experience

## Desktop

Layout:

Left Column  
Static headline message.

Right Column  
Carousel slides.

Example headline:  
"We refresh the world to make a difference"

Carousel slides contain:

- Media background (image or video)
- Optional category tag
- Paragraph text
- CTA button
- Brand icon navigation
- Gradient/aura visual effect

Behavior:

- Slides automatically rotate.
- Each slide has a corresponding brand icon.
- Active icon displays a progress animation.
- When the timer completes, the next slide appears.
- Users can click an icon to navigate to a slide.
- Manual navigation resets the timer.

---

## Mobile

Mobile layout changes:

- Left headline section is hidden.
- Carousel becomes full width.
- Brand icons appear horizontally above the carousel.

Layout:

Brand Icons (Horizontal Row)  
Carousel Slide

Carousel behavior remains the same.

---

# Text Content Behavior

Slides support multiple paragraphs entered by authors.

Each paragraph renders as a separate `<p>` tag.

Example:
| Paragraph | Alignment |
| --------- | --------- |
| 1         | Left      |
| 2         | Right     |
| 3         | Center    |
| 4         | Left      |
| 5         | Right     |
| 6         | Center    |

<p class="align-left">Paragraph 1</p>
<p class="align-right">Paragraph 2</p>
<p class="align-center">Paragraph 3</p>
<p class="align-left">Paragraph 4</p>

Gradient / Aura Effect

Slides include a soft gradient aura effect behind the carousel content.

Purpose:

Highlight featured content

Improve visual contrast

Enhance brand presentation

The aura can be enabled or configured at the component level.

Media Support

Slides support:

Image

Background hero image

Video

Muted autoplay

Loop playback

Responsive scaling

Authoring Fields (Universal Editor)

| Field              | Type           | Description                              |
| ------------------ | -------------- | ---------------------------------------- |
| sectionHeadline    | Text           | Desktop headline in left column          |
| transitionDuration | Number         | Slide duration in seconds (e.g., 3 or 5) |
| autoplay           | Boolean        | Enable/disable automatic rotation        |
| loopSlides         | Boolean        | Carousel loops after last slide          |
| enableAuraEffect   | Boolean        | Enable gradient aura background          |
| auraGradient       | Gradient/Color | Aura styling configuration               |

Slide Fields (Repeatable)
| Field           | Type            | Description                           |
| --------------- | --------------- | ------------------------------------- |
| mediaType       | Select          | Image or Video                        |
| image           | Asset           | Background image                      |
| video           | Asset           | Background video                      |
| categoryTag     | Text            | Optional tag (example: News)          |
| paragraphs      | Paragraph field | Multiple text lines rendered as `<p>` |
| ctaLabel        | Text            | CTA button label                      |
| ctaLink         | URL             | CTA link                              |
| brandIcon       | Asset           | Icon representing the slide           |
| overlayGradient | Gradient        | Optional text readability overlay     |

Accessibility

All images and icons require alt text

Videos must support muted autoplay

CTA buttons must be keyboard accessible

Text must meet WCAG contrast requirements

Acceptance Criteria

Authors can add multiple slides.

Slides support image or video backgrounds.

Carousel transition timing is configurable.

Each slide includes a brand icon indicator.

Active icon shows a progress animation.

Carousel automatically transitions between slides.

Users can navigate slides using brand icons.

Desktop displays headline + carousel layout.

Mobile hides the headline section.

Authors can add multiple paragraphs per slide.

Paragraph alignment follows the automatic pattern (Left → Right → Center).

Carousel loops continuously when enabled.