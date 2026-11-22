# TODO SEO: mobile performance of the map view

Status as of 16.11.2026

## Implementation status

- [x] Independent map start data (`gebiete` and `fortschritt`) are loaded in
      parallel.
- [x] Initial target lists are not loaded twice for quests with a quest giver;
      complete objectives come from `daten-*.js` on selection.
- [x] Descriptions in the initial data are limited to the visible preview;
      complete texts follow on selection.
- [x] Map image provided with fixed 4:3 dimensions, asynchronous decoding and
      high load priority.
- [x] Removed the unnecessary repeated CSS request after loading `stand.js`.
- [x] Combined ResizeObserver and resize events for map layout and markers.
- [x] Performed a local browser check of the map view with direct area
      selection, map image, markers and terrain toggle.
- [x] Landscape previews of the hashless overview are loaded only in or near
      the viewport; in the local mobile test 8 of 66 images were initially
      loaded, 12 after scrolling.

## Starting point

PageSpeed Insights, mobile, report of 16.11.2026:

| Metric | Result | Assessment |
| --- | ---: | --- |
| Performance | **40/100** | critical |
| Accessibility | **96/100** | good |
| Best Practices | **100/100** | good |
| SEO | **100/100** | good |
| First Contentful Paint | **2,6 s** | too slow |
| Largest Contentful Paint | **16,6 s** | very critical |
| Total Blocking Time | **1.330 ms** | critical |
| Speed Index | **6,6 s** | too slow |
| Cumulative Layout Shift | **0** | good |

Further notes from the report:

- main thread work: about **3,1 s**
- JavaScript execution time: about **2,0 s**
- unused JavaScript: estimated **99 KiB**
- JavaScript compression: estimated **11 KiB**
- forced dynamic reflow by GTM: **68 ms**
- possible image compression for individual landscape images: about **7,5 KiB**
  and **5,6 KiB**

PageSpeed continued to show as the result:

```text
https://llb.sirhexalot.de/en/map/
```

Although `https://sirhexalot.de/` stood in the input field. That must be
clarified first. Start page and map view must not be confused with one measurement value.

## Goal

The map view should become visible and usable on mobile devices before
all unnecessary JavaScript, filter, marker and progress data are
loaded and processed.

### Target values

#### First improvement stage

- LCP below **4 seconds**
- TBT below **600 ms**
- FCP below **2 seconds**
- Speed Index below **4 seconds**
- PageSpeed performance at least **70**

#### Second improvement stage

- LCP below **2,5 seconds**
- TBT below **300 ms**
- PageSpeed performance at least **85**

CLS stays at **0**.

## Work packages

### 1. Clarify test address and measurement basis

- [ ] Check why `sirhexalot.de/` ends up at `/en/map/` or `/en/map/` in the
      PageSpeed result.
- [ ] Check redirects and canonical of the start page.
- [ ] Fix three separate test targets:
  - [ ] `/`
  - [ ] `/de/karte/`
  - [ ] `/en/map/`
- [ ] Create a separate mobile PageSpeed report for each page.
- [ ] Perform at least three measurements per URL under identical conditions.
- [ ] Document median values, do not use only a single value.
- [ ] Perform a before/after comparison with the same URL and the same
      settings.

**Acceptance:** It is unambiguously documented which URL is responsible for which measurement value.

### 2. Identify the LCP element

Do not guess, but determine in the Lighthouse report and in the Chrome trace:

- [ ] Which element is the LCP element?
- [ ] Is it the map area, a map image, a hero image, a heading or an element
      created only by JavaScript?
- [ ] Split the load time into server response, resource wait time, download,
      rendering delay and JavaScript delay.
- [ ] Check whether the LCP element is created only after the map or app
      start.
- [ ] Record the concrete request and the concrete DOM node in the TODO
      result.

**Acceptance:** For the LCP element there is a concrete load path and a
measured cause of the delay.

### 3. Show critical initial content before JavaScript

- [ ] Provide heading, page title and basic map shell directly in the HTML.
- [ ] Ensure a sensible visible initial state without a complete app start.
- [ ] Prepare map frame and page layout with fixed dimensions.
- [ ] Show no empty white area during map initialisation.
- [ ] Load unnecessary filters, markers, progress data and detail areas only
      after the first visible content.
- [ ] Check whether the map start is currently blocked by large data
      JavaScript files.

**Acceptance:** The user sees heading,
map frame and a sensible basic view within the first seconds.

### 4. Optimise LCP image and map image

- [ ] Identify the actual LCP image in the trace.
- [ ] Remove `loading="lazy"` for this image.
- [ ] Use `fetchpriority="high"` only for the actual LCP image.
- [ ] If required, use `<link rel="preload">` in a targeted way.
- [ ] Provide responsive image sources with matching mobile dimensions.
- [ ] Check WebP size and compression for the mobile display.
- [ ] Always state image dimensions explicitly.
- [ ] Keep lazy loading for landscape tiles that are not visible.
- [ ] Check the landscape images named by PageSpeed and compress them further
      only with an actual benefit.
- [ ] Check whether several map images are loaded unnecessarily at the start.

**Acceptance:** The LCP image is loaded early, without the remaining map images blocking
the critical path.

### 5. Reduce JavaScript of the first page build

Check the map application and data initialisation in particular:

- [ ] Determine which JavaScript files are loaded before the first paint.
- [ ] Identify large data blocks that are not needed for the first view.
- [ ] Load map, marker, resource occurrence, progress and filter data on
      demand.
- [ ] Reload areas that are not visible only when opened.
- [ ] Limit initial sorting and filtering to the visible data.
- [ ] Reduce repeated DOM queries and complete list recalculations.
- [ ] Split long synchronous tasks in the main thread.
- [ ] Run unnecessary processing with `requestIdleCallback` or a comparable
      later point in time.
- [ ] Check whether individual functions run several times on the map start.
- [ ] Remove unused JavaScript code from the initial load path.
- [ ] Check compression and minification of the delivered JavaScript files.

**Acceptance:** No unnecessary initialisation step blocks the main thread;
TBT drops measurably.

### 6. Eliminate forced layout recalculations

PageSpeed reports dynamic reflows, among others originating from GTM.

- [ ] Record all forced reflow callers in the Chrome trace.
- [ ] Separate reading and writing of layout properties:
  - [ ] `offsetWidth`
  - [ ] `offsetHeight`
  - [ ] `getBoundingClientRect()`
  - [ ] `scrollWidth`
  - [ ] `scrollHeight`
- [ ] Do not measure map and legend layout synchronously several times.
- [ ] Provide known sizes via CSS variables or fixed layout values.
- [ ] Bundle DOM changes.
- [ ] Keep GTM but measure its influence on the first build.
- [ ] Check whether GTM can be loaded after the first visible content without
      losing the desired tracking.

**Acceptance:** The forced reflow note is clearly reduced; map changes
and filter changes remain functional.

### 7. Split data and map initialisation

- [ ] Check whether the complete quest stock is loaded when a map is called.
- [ ] Check whether all area maps are loaded although only one is visible.
- [ ] Check whether markers can be computed only after the map is visible.
- [ ] Initialise map image, markers and legend in separate steps.
- [ ] Render the visible map frame first.
- [ ] Then load visible markers.
- [ ] Then load optional information:
  - [ ] resource occurrences
  - [ ] quest givers
  - [ ] progress
  - [ ] additional filter data
- [ ] Retain direct map links, area choice and stored filters.

**Acceptance:** The map is visible early; optional content appears
downstream without blocking the first display.

### 8. SEO and function protection

The SEO basics are already successful and must not be worsened:

- [ ] SEO score stays at least **100** or unchanged stable.
- [ ] Canonical stays correct.
- [ ] Hreflang stays correct for DE/EN/FR.
- [ ] Heading and essential text remain reachable without JavaScript.
- [ ] Map and catalogue links remain crawlable.
- [ ] Hide no important information exclusively in reloaded JavaScript.
- [ ] Create no new soft 404.
- [ ] Sitemaps and `robots.txt` stay correct.
- [ ] Do not remove GTM and GoatCounter without being asked.
- [ ] Send no character progress or Companion data to server or analytics.

### 9. Test matrix

#### URLs

- [ ] `/`
- [ ] `/de/karte/`
- [ ] `/en/map/`
- [ ] `/fr/carte/`

#### Devices

- [ ] Mobile
- [ ] Desktop

#### States

- [ ] without character progress
- [ ] with synthetic character progress
- [ ] direct area selection
- [ ] map change
- [ ] open filter
- [ ] switch on resource occurrences
- [ ] show and hide quest givers
- [ ] open detail view
- [ ] back navigation

#### Technical checks

- [ ] Python test suite
- [ ] SEO tests
- [ ] catalogue check
- [ ] browser check in DE/EN/FR
- [ ] three PageSpeed measurements per target URL

## Order

1. [ ] Clarify test address and real LCP page
2. [ ] Create Chrome trace and identify the LCP element
3. [ ] Optimise initial content and LCP image
4. [ ] Split JavaScript initialisation
5. [ ] Reduce forced reflows
6. [ ] Reload optional map data
7. [ ] Check SEO and functions
8. [ ] Measure PageSpeed again and document results

## Scope

This TODO covers the technical load and render performance of the
map view. The SEO basics themselves are already present and are
not newly conceived:

- SEO metadata
- canonical and hreflang
- sitemaps
- `robots.txt`
- stable entity URLs
- multilingual page texts

These components are only checked as regression protection.
