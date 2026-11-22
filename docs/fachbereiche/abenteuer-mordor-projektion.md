# Approximate area points on the Mordor drawing

The drawing 268453620 has only pixel boundaries, no geographic projection.
Four same-world links connect geographic frame centres with pixel
positions: Ödland, Nord-Ithilien, Gorgoroth and Morgultal.

`mordor_projection()` scales X and Y linearly. Mean deviation in the verified
client: 24,2 pixels; maximum: 47,7 pixels at 1024 × 768.
These are approximate area centres, not exact quest positions.

The fallback applies to Mordor only: at least four same-world anchors,
positive axis factors, mean error ≤ 40 and maximum error ≤ 80 pixels.
Explicit game map links take precedence.

Additional points: Udûn, Dor Amarth, Lhingris, Agarnaith and Talath Úrui.
`positions.derived` marks them; hover and accessible name state the
approximate area centre in DE/EN/FR. The overlapping Gorgoroth cluster point
is dropped; its entries remain reachable in the area list.

No projection for historical variants, unnamed maps or other game regions
(Draugardh: region 6). Nargroth's own frame lies off the landscape and would
land outside the image; no invented pin. Existing direct links and other
cluster points remain.

Check: `python3 -m unittest tests.test_abenteuer_projektion`; browser check
of the five new points with selection/preview in DE/EN/FR and mobile overflow.
