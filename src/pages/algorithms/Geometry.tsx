import {
  Callout,
  CodeBlock,
  ComplexityTable,
  C,
  KeyTakeaways,
  List,
  P,
  PageHeader,
  Practice,
  Section,
  Strong,
  SubSection,
} from "../../components/doc";

export default function Geometry() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="Computational Geometry"
        description="Represent points precisely, reduce geometric decisions to orientation and distance, and build robust algorithms for segments, polygons, hulls, and spatial data."
        tags={["Vectors", "Intersection", "Convex hull", "Polygons", "Precision"]}
      />

      <Section title="Points, vectors, and geometric primitives">
        <P>
          A point is a location; a vector is a displacement. In code, points are often pairs of numbers, a small
          dataclass, or complex numbers when rotations are central. Tuples are lightweight and easy to sort; a
          dataclass can make larger programs clearer.
        </P>
        <CodeBlock
          title="point_representations.py"
          code={`
            from dataclasses import dataclass

            Point = tuple[int, int]

            @dataclass(frozen=True)
            class XY:
                x: float
                y: float

            a: Point = (2, 3)
            b: Point = (7, 5)
            displacement = (b[0] - a[0], b[1] - a[1])
            z = complex(2, 3)
            rotated_90_degrees = z * 1j
            print(displacement, rotated_90_degrees)
          `}
          output="(5, 2) (-3+2j)"
        />
        <SubSection title="Dot and cross products">
          <P>
            The dot product <C>a · b = ax bx + ay by</C> measures alignment: it is positive for an acute angle,
            zero for perpendicular vectors, and negative for an obtuse angle. The 2D cross product
            <C>a × b = ax by − ay bx</C> is the signed area of the parallelogram and tells which side of a directed
            line a point lies on.
          </P>
          <CodeBlock
            title="vector_products.py"
            code={`
              def dot(a: tuple[int, int], b: tuple[int, int]) -> int:
                  return a[0] * b[0] + a[1] * b[1]

              def cross(a: tuple[int, int], b: tuple[int, int]) -> int:
                  return a[0] * b[1] - a[1] * b[0]

              u, v = (3, 1), (1, 3)
              print(dot(u, v), cross(u, v))
            `}
            output="6 8"
          />
        </SubSection>
        <SubSection title="Orientation and numeric precision">
          <P>
            For points p, q, r, take the cross product of q−p and r−p. A positive sign means counterclockwise (CCW),
            negative means clockwise (CW), and zero means collinear. This one predicate powers hull construction,
            segment tests, and polygon logic.
          </P>
          <CodeBlock
            title="orientation.py"
            code={`
              def orientation(p, q, r) -> int:
                  value = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
                  return (value > 0) - (value < 0)

              points = ((0, 0), (4, 0), (2, 3))
              print(orientation(*points), orientation((0, 0), (2, 2), (4, 4)))
            `}
            output="1 0"
          />
          <Callout type="warning" title="Floating-point equality is fragile">
            Prefer integer or scaled-integer coordinates when the input allows it: cross products then remain exact.
            With floats, a fixed epsilon is not universally correct because error scales with coordinate magnitude;
            use a tolerance suited to the problem's bounds and compare approximate values consistently. Avoid
            unnecessary square roots by comparing squared distances.
          </Callout>
        </SubSection>
      </Section>

      <Section title="Distance and segment intersection">
        <SubSection title="Distance metrics">
          <List
            items={[
              <><Strong>Euclidean:</Strong> √((x₁−x₂)² + (y₁−y₂)²), the straight-line distance.</>,
              <><Strong>Manhattan:</Strong> |x₁−x₂| + |y₁−y₂|, distance along axis-aligned paths.</>,
              <><Strong>Chebyshev:</Strong> max(|x₁−x₂|, |y₁−y₂|), the minimum number of king moves on a grid.</>,
            ]}
          />
          <CodeBlock
            title="distance_metrics.py"
            code={`
              from math import hypot

              def distances(a, b):
                  dx, dy = abs(a[0] - b[0]), abs(a[1] - b[1])
                  return hypot(dx, dy), dx + dy, max(dx, dy)

              print(distances((0, 0), (3, 4)))
            `}
            output="(5.0, 7, 4)"
          />
        </SubSection>
        <SubSection title="Segments, including collinear overlap">
          <P>
            Two closed segments intersect if their endpoints straddle each other's supporting lines, or if a collinear
            endpoint lies within the other segment's bounding box. The explicit on-segment checks are essential for
            touching endpoints and overlapping collinear segments.
          </P>
          <CodeBlock
            title="segment_intersection.py"
            code={`
              def orient(a, b, c):
                  value = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
                  return (value > 0) - (value < 0)

              def on_segment(a, b, p):
                  return (min(a[0], b[0]) <= p[0] <= max(a[0], b[0])
                          and min(a[1], b[1]) <= p[1] <= max(a[1], b[1]))

              def segments_intersect(a, b, c, d):
                  o1, o2 = orient(a, b, c), orient(a, b, d)
                  o3, o4 = orient(c, d, a), orient(c, d, b)
                  if o1 != o2 and o3 != o4:
                      return True
                  return ((o1 == 0 and on_segment(a, b, c))
                          or (o2 == 0 and on_segment(a, b, d))
                          or (o3 == 0 and on_segment(c, d, a))
                          or (o4 == 0 and on_segment(c, d, b)))

              print(segments_intersect((0, 0), (4, 4), (0, 4), (4, 0)))
              print(segments_intersect((0, 0), (5, 0), (3, 0), (8, 0)))
            `}
            output={`
              True
              True
            `}
          />
        </SubSection>
      </Section>

      <Section title="Polygons: containment, area, and perimeter">
        <SubSection title="Point in polygon">
          <P>
            Ray casting counts how many times a ray from the query point crosses polygon edges: odd means inside.
            Carefully use a half-open vertical interval so a vertex shared by two edges is not counted twice; detect
            boundary membership separately. The winding-number rule instead accumulates signed upward and downward
            crossings, and supports nonzero-winding conventions for self-intersecting paths.
          </P>
          <CodeBlock
            title="point_in_polygon.py"
            code={`
              def cross(a, b, c):
                  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

              def on_segment(a, b, p):
                  return (cross(a, b, p) == 0
                          and min(a[0], b[0]) <= p[0] <= max(a[0], b[0])
                          and min(a[1], b[1]) <= p[1] <= max(a[1], b[1]))

              def point_in_polygon(point, polygon):
                  x, y = point
                  inside = False
                  for i, a in enumerate(polygon):
                      b = polygon[(i + 1) % len(polygon)]
                      if on_segment(a, b, point):
                          return "boundary"
                      if (a[1] > y) != (b[1] > y):
                          crossing_x = a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])
                          if x < crossing_x:
                              inside = not inside
                  return "inside" if inside else "outside"

              square = [(0, 0), (4, 0), (4, 4), (0, 4)]
              print(point_in_polygon((2, 2), square), point_in_polygon((4, 1), square))
            `}
            output="inside boundary"
          />
          <Callout type="note" title="Polygon assumptions">
            The example assumes a simple polygon with at least three vertices and integer coordinates. It reports the
            boundary distinctly; some APIs define boundary points as inside. Choose that convention explicitly.
          </Callout>
        </SubSection>
        <SubSection title="Shoelace area and perimeter">
          <P>
            The shoelace sum gives twice the signed polygon area; absolute value handles either vertex orientation.
            The same edge loop computes perimeter by adding Euclidean edge lengths. Area is exact for integer
            coordinates until the final division.
          </P>
          <CodeBlock
            title="polygon_measurements.py"
            code={`
              from math import hypot

              def polygon_measurements(points):
                  twice_area = 0
                  perimeter = 0.0
                  for i, point in enumerate(points):
                      nxt = points[(i + 1) % len(points)]
                      twice_area += point[0] * nxt[1] - point[1] * nxt[0]
                      perimeter += hypot(nxt[0] - point[0], nxt[1] - point[1])
                  return abs(twice_area) / 2, perimeter

              print(polygon_measurements([(0, 0), (4, 0), (4, 3), (0, 3)]))
            `}
            output="(12.0, 14.0)"
          />
        </SubSection>
      </Section>

      <Section title="Convex hulls">
        <P>
          The convex hull is the smallest convex polygon containing all input points. Andrew's monotone chain sorts
          points lexicographically, builds lower and upper chains, and removes clockwise turns (and collinear
          interior points) in linear time after sorting.
        </P>
        <CodeBlock
          title="andrew_monotone_chain.py"
          code={`
            def convex_hull(points: list[tuple[int, int]]) -> list[tuple[int, int]]:
                points = sorted(set(points))
                if len(points) <= 1:
                    return points

                def cross(o, a, b):
                    return ((a[0] - o[0]) * (b[1] - o[1])
                            - (a[1] - o[1]) * (b[0] - o[0]))

                lower = []
                for point in points:
                    while len(lower) >= 2 and cross(lower[-2], lower[-1], point) <= 0:
                        lower.pop()
                    lower.append(point)

                upper = []
                for point in reversed(points):
                    while len(upper) >= 2 and cross(upper[-2], upper[-1], point) <= 0:
                        upper.pop()
                    upper.append(point)
                return lower[:-1] + upper[:-1]

            sample = [(0, 0), (2, 0), (2, 2), (0, 2), (1, 1), (0, 0)]
            print(convex_hull(sample))
          `}
          output="[(0, 0), (2, 0), (2, 2), (0, 2)]"
        />
        <SubSection title="Other hull approaches">
          <P>
            <Strong>Graham scan</Strong> sorts points by polar angle around a pivot and scans for counterclockwise
            turns; it also takes O(n log n). <Strong>Jarvis march</Strong> (gift wrapping) repeatedly selects the
            next outermost turn, taking O(nh) for n points and h hull vertices, so it can be attractive when the hull
            is small.
          </P>
          <Callout type="warning" title="Collinear policy changes the hull">
            The code drops points lying strictly inside a hull edge. For a fully collinear input it returns the two
            endpoints. If a problem requires every boundary point, change the turn condition and deduplicate output
            carefully.
          </Callout>
        </SubSection>
      </Section>

      <Section title="Closest pair, sweeps, and rotating calipers">
        <SubSection title="Closest pair of points">
          <P>
            A brute-force scan is O(n²). Divide and conquer sorts points by x, recursively finds the best distance,
            then checks a y-ordered strip around the split; geometric packing limits each point to a constant number
            of relevant neighbors, yielding O(n log n). See the Divide &amp; Conquer page for the full algorithm and
            implementation. Use squared distances internally to avoid square roots.
          </P>
        </SubSection>
        <SubSection title="Line sweep">
          <P>
            A line sweep sorts geometric events by x-coordinate and maintains the active objects in an ordered status
            structure. For segment intersections, endpoint events add/remove segments; the status order is their
            vertical order at the current sweep position. Neighbor checks can find the first intersection in
            O(n log n), with extensions reporting k intersections in O((n + k) log n). Degenerate cases (shared
            endpoints, vertical segments, and simultaneous events) need explicit tie rules.
          </P>
        </SubSection>
        <SubSection title="Rotating calipers">
          <P>
            After computing a convex hull, rotating calipers advances a pair of antipodal vertices as a supporting
            line rotates around the hull. It computes the polygon diameter (farthest pair) in O(h) after the hull is
            known, instead of comparing all O(h²) vertex pairs. The same idea supports width and other antipodal-pair
            queries.
          </P>
        </SubSection>
      </Section>

      <Section title="Circles, lattice geometry, and point collections">
        <SubSection title="Circle basics and Pick's theorem">
          <P>
            For center (cx, cy) and radius r, a point is inside/on the circle when its squared center distance is at
            most r². The line-circle equation follows by substituting a line parameterization into the circle equation.
            For a simple lattice polygon, Pick's theorem says A = I + B/2 − 1, where I is the number of interior
            lattice points and B is the number on the boundary.
          </P>
          <CodeBlock
            title="circle_test_and_pick.py"
            code={`
              from math import gcd

              def in_or_on_circle(point, center, radius):
                  dx, dy = point[0] - center[0], point[1] - center[1]
                  return dx * dx + dy * dy <= radius * radius

              def boundary_lattice_points(polygon):
                  total = 0
                  for i, point in enumerate(polygon):
                      nxt = polygon[(i + 1) % len(polygon)]
                      total += gcd(abs(nxt[0] - point[0]), abs(nxt[1] - point[1]))
                  return total

              rectangle = [(0, 0), (4, 0), (4, 3), (0, 3)]
              area = 12
              boundary = boundary_lattice_points(rectangle)
              interior = area - boundary / 2 + 1
              print(in_or_on_circle((3, 4), (0, 0), 5), boundary, int(interior))
            `}
            output="True 14 6"
          />
        </SubSection>
        <SubSection title="K closest points to the origin">
          <P>
            A size-k max-heap of negative squared distances retains the closest k points in O(n log k) time and O(k)
            extra space. The Python implementation uses a min-heap over negated distances; it never computes roots.
          </P>
          <CodeBlock
            title="k_closest_points.py"
            code={`
              import heapq

              def k_closest(points, k):
                  if not 0 <= k <= len(points):
                      raise ValueError("k must be between zero and the number of points")
                  heap = []
                  for x, y in points:
                      distance_squared = x * x + y * y
                      item = (-distance_squared, x, y)
                      if len(heap) < k:
                          heapq.heappush(heap, item)
                      elif k and item > heap[0]:
                          heapq.heapreplace(heap, item)
                  return [(x, y) for _, x, y in heap]

              print(sorted(k_closest([(1, 3), (-2, 2), (5, 8), (0, 1)], 2)))
            `}
            output="[(-2, 2), (0, 1)]"
          />
        </SubSection>
        <SubSection title="Maximum points on one line">
          <P>
            For each anchor point, normalize every other point's slope as an integer pair using gcd, sign-normalize
            the direction, and count equal slopes. Handle duplicate points separately. This O(n²) approach avoids
            division and floating-point slope comparisons.
          </P>
          <CodeBlock
            title="max_points_on_line.py"
            code={`
              from collections import defaultdict
              from math import gcd

              def max_points(points):
                  best = 0
                  for i, (x1, y1) in enumerate(points):
                      slopes = defaultdict(int)
                      duplicates = 1
                      local_best = 0
                      for x2, y2 in points[i + 1:]:
                          dx, dy = x2 - x1, y2 - y1
                          if dx == 0 and dy == 0:
                              duplicates += 1
                              continue
                          divisor = gcd(abs(dx), abs(dy))
                          dx, dy = dx // divisor, dy // divisor
                          if dx < 0 or (dx == 0 and dy < 0):
                              dx, dy = -dx, -dy
                          slopes[(dx, dy)] += 1
                          local_best = max(local_best, slopes[(dx, dy)])
                      best = max(best, duplicates + local_best)
                  return best if len(points) < 2 else max(best, 1)

              print(max_points([(1, 1), (2, 2), (3, 3), (0, 2)]))
            `}
            output="3"
          />
        </SubSection>
        <SubSection title="Rectangle overlap and area">
          <P>
            For axis-aligned rectangles represented as (x1, y1, x2, y2), intersecting width and height are the
            positive parts of the minimum right/top minus maximum left/bottom. Edge-only contact has zero area.
          </P>
          <CodeBlock
            title="rectangle_intersection_area.py"
            code={`
              def overlap_area(a, b):
                  width = max(0, min(a[2], b[2]) - max(a[0], b[0]))
                  height = max(0, min(a[3], b[3]) - max(a[1], b[1]))
                  return width * height

              first = (0, 0, 4, 3)
              second = (2, 1, 5, 5)
              print(overlap_area(first, second))
            `}
            output="4"
          />
        </SubSection>
      </Section>

      <Section title="Complexities and common pitfalls">
        <ComplexityTable
          rows={[
            { operation: "Orientation / dot / cross", time: "O(1)", space: "O(1)" },
            { operation: "Segment intersection", time: "O(1)", space: "O(1)" },
            { operation: "Point in polygon", time: "O(n)", space: "O(1)", note: "Simple polygon with n edges." },
            { operation: "Shoelace area / perimeter", time: "O(n)", space: "O(1)" },
            { operation: "Andrew convex hull", time: "O(n log n)", space: "O(n)" },
            { operation: "Closest pair (divide and conquer)", time: "O(n log n)", space: "O(n)" },
            { operation: "K closest points with heap", time: "O(n log k)", space: "O(k)" },
            { operation: "Maximum collinear points", time: "O(n²)", space: "O(n)" },
            { operation: "Rotating calipers after hull", time: "O(h)", space: "O(1) extra" },
            { operation: "Rectangle overlap area", time: "O(1)", space: "O(1)" },
          ]}
        />
        <List
          items={[
            <>Decide whether touching endpoints or polygon boundaries count as intersection/inside.</>,
            <>Treat collinear and duplicate points explicitly; generic orientation logic alone is not enough.</>,
            <>Use squared distances for comparisons and integer cross products where bounds permit.</>,
            <>Sort and deduplicate before hull construction, and document whether collinear boundary points remain.</>,
            <>Handle vertical segments, shared sweep events, empty sets, and degenerate polygons deliberately.</>,
          ]}
        />
        <Callout type="warning" title="Geometry bugs hide at boundaries">
          Most failures come from a sign error, inconsistent strict versus non-strict comparisons, or an unstated
          degeneracy policy—not from the broad algorithm. Test equal points, horizontal and vertical edges,
          collinear overlaps, boundary points, and very large coordinates.
        </Callout>
      </Section>

      <Section title="Practice and takeaways">
        <Practice
          problems={[
            { name: "Valid Square", difficulty: "Medium", hint: "Compare all six pairwise squared distances." },
            { name: "Erect the Fence", difficulty: "Hard", hint: "Build a hull, then decide how collinear boundary points should be retained." },
            { name: "Min Cost to Connect All Points", difficulty: "Medium", hint: "Use Manhattan distance with Prim or Kruskal." },
            { name: "Max Points on a Line", difficulty: "Hard", hint: "Normalize integer slope pairs and count duplicates per anchor." },
            { name: "Rectangle Area", difficulty: "Medium", hint: "Add individual areas and subtract the positive intersection area." },
            { name: "Closest Pair of Points", difficulty: "Hard", hint: "Divide by x, then process a narrow strip in y-order." },
          ]}
        />
        <KeyTakeaways
          items={[
            "Dot and cross products turn geometric relationships into arithmetic; orientation is the key three-point predicate.",
            "Include collinear on-segment cases in intersection tests and define boundary semantics explicitly.",
            "Use integer arithmetic and squared distances whenever possible to avoid precision errors and unnecessary roots.",
            "Andrew's monotone chain builds a convex hull in O(n log n); rotating calipers answers diameter queries in linear hull time.",
            "Divide-and-conquer, sweeps, and heaps scale geometric queries beyond pairwise brute force.",
          ]}
        />
      </Section>
    </article>
  );
}