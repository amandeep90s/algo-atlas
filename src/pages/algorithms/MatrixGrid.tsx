import {
  ArrayViz,
  Callout,
  CodeBlock,
  ComplexityTable,
  C,
  Diagram,
  KeyTakeaways,
  P,
  PageHeader,
  Practice,
  ProsCons,
  Section,
  Strong,
  SubSection,
  Table,
} from "../../components/doc";

export default function MatrixGrid() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="Matrix & Grid Problems"
        description="Model a rectangular grid, traverse it safely, and recognize the graph, search, and dynamic-programming patterns hidden in two-dimensional problems."
        tags={["2D arrays", "Grid graphs", "Matrix transforms", "BFS / DFS"]}
      />

      <Section title="Representing a Grid">
        <P>
          A matrix with <C>rows</C> rows and <C>cols</C> columns is commonly a list of row lists. The cell at
          <C>(r, c)</C> is addressed as <C>grid[r][c]</C>. A flat row-major array stores each row consecutively,
          mapping a cell to <C>r * cols + c</C>; the inverse is <C>r = index // cols</C>, <C>c = index % cols</C>.
        </P>
        <Diagram caption="Row-major indices advance across a row before moving down.">{`
          (0,0)  (0,1)  (0,2)       0   1   2
          (1,0)  (1,1)  (1,2)  ->   3   4   5
          (2,0)  (2,1)  (2,2)       6   7   8
        `}</Diagram>
        <CodeBlock
          title="grid_indexing.py"
          code={`
            rows, cols = 3, 4
            r, c = 2, 1
            flat = r * cols + c
            restored = (flat // cols, flat % cols)
            print(flat, restored)
          `}
          output="9 (2, 1)"
        />
        <Callout type="warning" title="Build independent rows">
          Use <C>[[0] * cols for _ in range(rows)]</C>, not <C>[[0] * cols] * rows</C>. The latter repeats one row
          reference, so writing one cell silently changes every row.
        </Callout>
      </Section>

      <Section title="Directions, Bounds & Traversal">
        <SubSection title="Four- and eight-neighbor movement">
          <P>
            Store direction offsets once, then add an offset to the current coordinate. Four directions allow
            orthogonal movement; eight directions also include diagonals. A candidate is valid exactly when
            <C>0 &lt;= nr &lt; rows</C> and <C>0 &lt;= nc &lt; cols</C>.
          </P>
          <CodeBlock
            title="neighbors.py"
            code={`
              grid = [[1, 2, 3], [4, 5, 6]]
              rows, cols = len(grid), len(grid[0])
              four = [(-1, 0), (1, 0), (0, -1), (0, 1)]
              eight = four + [(-1, -1), (-1, 1), (1, -1), (1, 1)]

              def neighbors(r: int, c: int, directions: list[tuple[int, int]]):
                  for dr, dc in directions:
                      nr, nc = r + dr, c + dc
                      if 0 <= nr < rows and 0 <= nc < cols:
                          yield nr, nc

              print(list(neighbors(0, 0, four)))
              print(list(neighbors(0, 0, eight)))
            `}
            output={`
              [(1, 0), (0, 1)]
              [(1, 0), (0, 1), (1, 1)]
            `}
          />
        </SubSection>
        <SubSection title="Common traversal orders">
          <P>
            Row-major and column-major scans are nested loops with different loop order. Main diagonals satisfy
            <C>r == c</C>; anti-diagonals satisfy <C>r + c == n - 1</C> for a square matrix. Spiral traversal
            shrinks four boundaries after each edge. Zigzag traversal reverses every other row (or diagonal),
            depending on the problem's definition.
          </P>          <CodeBlock
            title="basic_orders.py"
            code={`
              matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
              n = len(matrix)
              rows = [value for row in matrix for value in row]
              columns = [matrix[r][c] for c in range(n) for r in range(n)]
              diagonal = [matrix[i][i] for i in range(n)]
              anti_diagonal = [matrix[i][n - 1 - i] for i in range(n)]
              zigzag = [value for r, row in enumerate(matrix)
                        for value in (row if r % 2 == 0 else reversed(row))]
              print(rows, columns, diagonal, anti_diagonal, zigzag)
            `}
            output="[1, 2, 3, 4, 5, 6, 7, 8, 9] [1, 4, 7, 2, 5, 8, 3, 6, 9] [1, 5, 9] [3, 5, 7] [1, 2, 3, 6, 5, 4, 7, 8, 9]"
          />
          <ArrayViz
            values={["→", "→", "→", "↓", "←", "←", "↓", "→", "→"]}
            highlight={[0, 1, 2, 3, 4, 5, 6, 7, 8]}
            showIndices={false}
            caption="A clockwise spiral follows the perimeter, then repeats on the remaining rectangle."
          />
          <CodeBlock
            title="spiral_order.py"
            code={`
              def spiral(matrix: list[list[int]]) -> list[int]:
                  if not matrix or not matrix[0]:
                      return []
                  top, bottom = 0, len(matrix) - 1
                  left, right = 0, len(matrix[0]) - 1
                  result = []
                  while top <= bottom and left <= right:
                      result.extend(matrix[top][left:right + 1])
                      top += 1
                      for r in range(top, bottom + 1):
                          result.append(matrix[r][right])
                      right -= 1
                      if top <= bottom:
                          result.extend(reversed(matrix[bottom][left:right + 1]))
                          bottom -= 1
                      if left <= right:
                          for r in range(bottom, top - 1, -1):
                              result.append(matrix[r][left])
                          left += 1
                  return result

              print(spiral([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
            `}
            output="[1, 2, 3, 6, 9, 8, 7, 4, 5]"
          />
        </SubSection>
      </Section>

      <Section title="Matrix Transformations">
        <SubSection title="Transpose and rotate">
          <P>
            Transposing swaps rows and columns, so <C>result[c][r] = matrix[r][c]</C>. For a square matrix, a
            clockwise 90° rotation is transpose followed by reversing each row; the reverse order rotates the other
            way. The in-place method requires a square matrix and uses <C>O(1)</C> extra space.
          </P>
          <CodeBlock
            title="rotate_in_place.py"
            code={`
              def rotate_clockwise(matrix: list[list[int]]) -> None:
                  n = len(matrix)
                  for r in range(n):
                      for c in range(r + 1, n):
                          matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
                  for row in matrix:
                      row.reverse()

              grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
              rotate_clockwise(grid)
              print(grid)
            `}
            output="[[7, 4, 1], [8, 5, 2], [9, 6, 3]]"
          />
        </SubSection>
        <SubSection title="Set Matrix Zeroes in constant space">
          <P>
            If any cell is zero, clear its entire row and column. Use the first row and first column as marker arrays,
            while remembering separately whether either was originally zero. Mark first, then clear the interior, and
            finally clear the saved borders.
          </P>
          <CodeBlock
            title="set_zeroes.py"
            code={`
              def set_zeroes(matrix: list[list[int]]) -> None:
                  rows, cols = len(matrix), len(matrix[0])
                  first_row = any(matrix[0][c] == 0 for c in range(cols))
                  first_col = any(matrix[r][0] == 0 for r in range(rows))
                  for r in range(1, rows):
                      for c in range(1, cols):
                          if matrix[r][c] == 0:
                              matrix[r][0] = matrix[0][c] = 0
                  for r in range(1, rows):
                      for c in range(1, cols):
                          if matrix[r][0] == 0 or matrix[0][c] == 0:
                              matrix[r][c] = 0
                  if first_row:
                      matrix[0] = [0] * cols
                  if first_col:
                      for r in range(rows):
                          matrix[r][0] = 0

              data = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
              set_zeroes(data)
              print(data)
            `}
            output="[[1, 0, 1], [0, 0, 0], [1, 0, 1]]"
          />
        </SubSection>
      </Section>

      <Section title="Searching a Sorted Matrix">
        <P>
          Two different ordering guarantees lead to two different searches. If each row and column is increasing,
          start at the top-right: a value that is too large eliminates its column; one that is too small eliminates
          its row. If the entire matrix is globally sorted in row-major order, binary-search the virtual flat array.
        </P>
        <CodeBlock
          title="matrix_search.py"
          code={`
            def staircase(matrix: list[list[int]], target: int) -> bool:
                if not matrix or not matrix[0]:
                    return False
                r, c = 0, len(matrix[0]) - 1
                while r < len(matrix) and c >= 0:
                    value = matrix[r][c]
                    if value == target:
                        return True
                    if value > target:
                        c -= 1
                    else:
                        r += 1
                return False

            def flat_binary_search(matrix: list[list[int]], target: int) -> bool:
                if not matrix or not matrix[0]:
                    return False
                rows, cols = len(matrix), len(matrix[0])
                lo, hi = 0, rows * cols
                while lo < hi:
                    mid = (lo + hi) // 2
                    value = matrix[mid // cols][mid % cols]
                    if value < target:
                        lo = mid + 1
                    else:
                        hi = mid
                return lo < rows * cols and matrix[lo // cols][lo % cols] == target

            grid = [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
            print(staircase(grid, 6), flat_binary_search([[1, 3, 5], [7, 9, 11]], 9))
          `}
          output="True True"
        />
        <Callout type="note">
          The staircase method needs independently sorted rows and columns, but not row-to-row separation. Flat binary
          search needs the stronger guarantee that each row's first value exceeds the previous row's last value.
        </Callout>
      </Section>

      <Section title="Grid DFS and BFS">
        <P>
          Treat each traversable cell as a graph vertex connected to its allowed neighbors. DFS is natural for
          connected components and flood fill; BFS explores in layers and gives shortest paths in an unweighted grid.
          Mark a cell visited when it is <Strong>added</Strong> to the worklist, not when later removed, to avoid
          duplicate enqueues.
        </P>
        <SubSection title="Islands, area, and flood fill">
          <CodeBlock
            title="islands_and_fill.py"
            code={`
              def count_islands(grid: list[list[str]]) -> int:
                  if not grid or not grid[0]:
                      return 0
                  rows, cols = len(grid), len(grid[0])
                  directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
                  count = 0
                  for r in range(rows):
                      for c in range(cols):
                          if grid[r][c] != "1":
                              continue
                          count += 1
                          stack = [(r, c)]
                          grid[r][c] = "0"
                          while stack:
                              cr, cc = stack.pop()
                              for dr, dc in directions:
                                  nr, nc = cr + dr, cc + dc
                                  if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                                      grid[nr][nc] = "0"
                                      stack.append((nr, nc))
                  return count

              land = [list("110"), list("010"), list("001")]
              print(count_islands(land))
            `}
            output="2"
          />
          <P>
            The same component walk can accumulate its size for maximum area, or assign a replacement color for flood
            fill. In-place marking saves a separate visited grid but mutates the input; preserve or copy it if callers
            need the original.
          </P>          <CodeBlock
            title="classic_grid_dfs_bfs.py"
            code={`
              from collections import deque

              def max_area(grid: list[list[int]]) -> int:
                  rows, cols = len(grid), len(grid[0])
                  best = 0
                  for r in range(rows):
                      for c in range(cols):
                          if grid[r][c] == 0:
                              continue
                          area, stack = 0, [(r, c)]
                          grid[r][c] = 0
                          while stack:
                              cr, cc = stack.pop()
                              area += 1
                              for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                                  nr, nc = cr + dr, cc + dc
                                  if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                                      grid[nr][nc] = 0
                                      stack.append((nr, nc))
                          best = max(best, area)
                  return best

              def flood_fill(image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
                  old = image[sr][sc]
                  if old == color:
                      return image
                  stack = [(sr, sc)]
                  image[sr][sc] = color
                  while stack:
                      r, c = stack.pop()
                      for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                          nr, nc = r + dr, c + dc
                          if (0 <= nr < len(image) and 0 <= nc < len(image[0])
                                  and image[nr][nc] == old):
                              image[nr][nc] = color
                              stack.append((nr, nc))
                  return image

              def capture_surrounded(board: list[list[str]]) -> None:
                  rows, cols = len(board), len(board[0])
                  stack = []
                  for r in range(rows):
                      for c in (0, cols - 1):
                          if board[r][c] == "O":
                              board[r][c] = "#"
                              stack.append((r, c))
                  for c in range(cols):
                      for r in (0, rows - 1):
                          if board[r][c] == "O":
                              board[r][c] = "#"
                              stack.append((r, c))
                  while stack:
                      r, c = stack.pop()
                      for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                          nr, nc = r + dr, c + dc
                          if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == "O":
                              board[nr][nc] = "#"
                              stack.append((nr, nc))
                  for r in range(rows):
                      for c in range(cols):
                          if board[r][c] == "O":
                              board[r][c] = "X"
                          elif board[r][c] == "#":
                              board[r][c] = "O"

              def oranges_minutes(grid: list[list[int]]) -> int:
                  rows, cols = len(grid), len(grid[0])
                  queue = deque((r, c) for r in range(rows) for c in range(cols)
                                if grid[r][c] == 2)
                  fresh = sum(value == 1 for row in grid for value in row)
                  minutes = 0
                  while queue and fresh:
                      for _ in range(len(queue)):
                          r, c = queue.popleft()
                          for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                              nr, nc = r + dr, c + dc
                              if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                                  grid[nr][nc] = 2
                                  fresh -= 1
                                  queue.append((nr, nc))
                      minutes += 1
                  return minutes if fresh == 0 else -1

              def shortest_binary_path(grid: list[list[int]]) -> int:
                  rows, cols = len(grid), len(grid[0])
                  if grid[0][0] or grid[-1][-1]:
                      return -1
                  queue = deque([(0, 0, 1)])
                  seen = {(0, 0)}
                  while queue:
                      r, c, distance = queue.popleft()
                      if (r, c) == (rows - 1, cols - 1):
                          return distance
                      for dr in (-1, 0, 1):
                          for dc in (-1, 0, 1):
                              nr, nc = r + dr, c + dc
                              if ((dr or dc) and 0 <= nr < rows and 0 <= nc < cols
                                      and not grid[nr][nc] and (nr, nc) not in seen):
                                  seen.add((nr, nc))
                                  queue.append((nr, nc, distance + 1))
                  return -1

              land = [[1, 1, 0], [0, 1, 0], [1, 0, 1]]
              oranges = [[2, 1, 1], [1, 1, 0], [0, 1, 1]]
              print(max_area(land), oranges_minutes(oranges))
              print(shortest_binary_path([[0, 1], [1, 0]]))
            `}
            output={`
              3 4
              2
            `}
          />
          <P>
            In <C>capture_surrounded</C>, border DFS marks safe open cells with a temporary marker; all remaining
            open cells are enclosed and can be flipped. The last BFS uses eight directions, as required by the
            binary-matrix shortest-path variant.
          </P>
        </SubSection>
        <SubSection title="Surrounded regions and border DFS">
          <P>
            For surrounded regions, begin DFS/BFS from every border-connected open cell and mark it safe. Flip only the
            unmarked open cells afterward. This is more reliable than trying to decide during a local traversal whether
            a region touches the border.
          </P>
        </SubSection>
        <SubSection title="Multi-source BFS and shortest paths">
          <P>
            Put every initial source in one queue at distance zero. A single BFS then computes the nearest-source
            distance or spreads simultaneous waves. Rotting oranges uses elapsed minutes by layers; the 01 Matrix
            computes distance to a zero; shortest path in a binary matrix uses BFS when every move has equal cost.
          </P>
          <CodeBlock
            title="multi_source_distance.py"
            code={`
              from collections import deque

              def distance_to_zero(grid: list[list[int]]) -> list[list[int]]:
                  rows, cols = len(grid), len(grid[0])
                  dist = [[-1] * cols for _ in range(rows)]
                  queue = deque()
                  for r in range(rows):
                      for c in range(cols):
                          if grid[r][c] == 0:
                              dist[r][c] = 0
                              queue.append((r, c))
                  for_r = [(-1, 0), (1, 0), (0, -1), (0, 1)]
                  while queue:
                      r, c = queue.popleft()
                      for dr, dc in for_r:
                          nr, nc = r + dr, c + dc
                          if 0 <= nr < rows and 0 <= nc < cols and dist[nr][nc] == -1:
                              dist[nr][nc] = dist[r][c] + 1
                              queue.append((nr, nc))
                  return dist

              print(distance_to_zero([[0, 1, 1], [1, 1, 1], [1, 1, 0]]))
            `}
            output={`
              [[0, 1, 2], [1, 2, 1], [2, 1, 0]]
            `}
          />
        </SubSection>
      </Section>

      <Section title="Grid Dynamic Programming & Game of Life">
        <P>
          When movement is constrained to right and down, process cells in topological order. Unique paths uses
          <C>ways[r][c] = ways[r - 1][c] + ways[r][c - 1]</C>; minimum path sum replaces addition of counts with
          addition of the current cell's cost and the smaller predecessor. A one-row array reduces space to
          <C>O(cols)</C>.
        </P>
        <CodeBlock
          title="grid_dp.py"
          code={`
            def min_path_sum(grid: list[list[int]]) -> int:
                dp = [float("inf")] * len(grid[0])
                for r, row in enumerate(grid):
                    for c, value in enumerate(row):
                        if r == 0 and c == 0:
                            dp[c] = value
                        else:
                            above = dp[c]
                            left = dp[c - 1] if c > 0 else float("inf")
                            dp[c] = value + min(above, left)
                return int(dp[-1])

            print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
          `}
          output="7"
        />
        <SubSection title="In-place Game of Life">
          <P>
            Each cell depends on the eight neighbors' original state. Encode both old and next state in one integer:
            <C>0</C> dead-to-dead, <C>1</C> live-to-live, <C>2</C> live-to-dead, <C>3</C> dead-to-live. Count
            neighbors with the low bit (<C>state &amp; 1</C>), then shift right once to commit the next generation.
          </P>
          <CodeBlock
            title="game_of_life.py"
            code={`
              def life(board: list[list[int]]) -> None:
                  rows, cols = len(board), len(board[0])
                  for r in range(rows):
                      for c in range(cols):
                          live = 0
                          for dr in (-1, 0, 1):
                              for dc in (-1, 0, 1):
                                  nr, nc = r + dr, c + dc
                                  if (dr or dc) and 0 <= nr < rows and 0 <= nc < cols:
                                      live += board[nr][nc] & 1
                          if live == 3 or (board[r][c] & 1 and live == 2):
                              board[r][c] |= 2
                  for r in range(rows):
                      for c in range(cols):
                          board[r][c] >>= 1

              cells = [[0, 1, 0], [0, 0, 1], [1, 1, 1]]
              life(cells)
              print(cells)
            `}
            output="[[0, 0, 0], [1, 0, 1], [0, 1, 1]]"
          />
        </SubSection>
      </Section>

      <Section title="Matrix Algorithms & Prefix Sums">
        <SubSection title="Multiplication and fast matrix power">
          <P>
            Matrix multiplication combines every row of the left matrix with every column of the right. For square
            matrices, exponentiation by squaring computes <C>Aⁿ</C> in <C>O(log n)</C> matrix multiplications rather
            than <C>O(n)</C>; for ordinary dense matrices, each multiplication is <C>O(n³)</C>.
          </P>
          <CodeBlock
            title="fast_matrix_power.py"
            code={`
              def multiply(a: list[list[int]], b: list[list[int]]) -> list[list[int]]:
                  n = len(a)
                  return [[sum(a[i][k] * b[k][j] for k in range(n))
                           for j in range(n)] for i in range(n)]

              def power(matrix: list[list[int]], exponent: int) -> list[list[int]]:
                  n = len(matrix)
                  result = [[int(i == j) for j in range(n)] for i in range(n)]
                  base = matrix
                  while exponent:
                      if exponent & 1:
                          result = multiply(result, base)
                      base = multiply(base, base)
                      exponent >>= 1
                  return result

              print(power([[1, 1], [1, 0]], 5))
            `}
            output="[[8, 5], [5, 3]]"
          />
        </SubSection>
        <SubSection title="2D prefix sums">
          <P>
            Precompute <C>prefix[r + 1][c + 1]</C> as the sum of the rectangle from the origin through
            <C>(r, c)</C>. Inclusion-exclusion answers any inclusive rectangle query in <C>O(1)</C> after
            <C>O(rows * cols)</C> preprocessing.
          </P>
          <CodeBlock
            title="prefix_sum_2d.py"
            code={`
              def prefix_sums(grid: list[list[int]]) -> list[list[int]]:
                  rows, cols = len(grid), len(grid[0])
                  prefix = [[0] * (cols + 1) for _ in range(rows + 1)]
                  for r in range(rows):
                      for c in range(cols):
                          prefix[r + 1][c + 1] = (grid[r][c] + prefix[r][c + 1]
                                                   + prefix[r + 1][c] - prefix[r][c])
                  return prefix

              def rectangle_sum(prefix: list[list[int]], r1: int, c1: int,
                                r2: int, c2: int) -> int:
                  return (prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1]
                          - prefix[r2 + 1][c1] + prefix[r1][c1])

              sums = prefix_sums([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
              print(rectangle_sum(sums, 1, 1, 2, 2))
            `}
            output="28"
          />
        </SubSection>
      </Section>

      <Section title="Complexity, Use & Pitfalls">
        <ComplexityTable
          rows={[
            { operation: "Single cell access / update", time: "O(1)", space: "O(1)" },
            { operation: "Full traversal / flood fill", time: "O(rows × cols)", space: "O(rows × cols)", note: "Worst-case worklist or visited storage" },
            { operation: "Staircase search", time: "O(rows + cols)", space: "O(1)" },
            { operation: "Flat binary search", time: "O(log(rows × cols))", space: "O(1)" },
            { operation: "Transpose / rotate square matrix", time: "O(n²)", space: "O(1)", note: "In-place version" },
            { operation: "Set zeroes", time: "O(rows × cols)", space: "O(1)", note: "Marker rows and columns" },
            { operation: "2D prefix preprocessing / query", time: "O(rows × cols) / O(1)", space: "O(rows × cols)" },
            { operation: "Dense matrix power", time: "O(n³ log exponent)", space: "O(n²)" },
          ]}
        />
        <Table
          headers={["Pattern", "Use it when", "Watch for"]}
          rows={[
            ["DFS / flood fill", "Reachability, components, recoloring", "Recursion depth; mark before pushing"],
            ["BFS", "Shortest path with equal edge costs", "Use a deque and visit at enqueue time"],
            ["Multi-source BFS", "Nearest source or simultaneous spread", "Initialize all sources at distance zero"],
            ["Grid DP", "Monotone moves with optimal/counting substructure", "Define the state and boundary values"],
            ["Prefix sums", "Many static rectangle-sum queries", "Use half-open padded coordinates consistently"],
          ]}
        />
        <ProsCons
          pros={["Natural model for spatial, board, image, and table problems", "Local moves map cleanly to graph edges", "Many operations admit simple O(rows × cols) scans"]}
          cons={["Bounds and row/column conventions are easy to mix up", "Recursive DFS can overflow on large grids", "In-place algorithms can destroy input needed later"]}
        />
        <Callout type="warning" title="Frequent grid bugs">
          Decide whether diagonal neighbors count; handle empty and ragged input if allowed; mark visited before
          enqueuing; do not mutate cells that still encode original values; and verify whether coordinates are
          inclusive or half-open.
        </Callout>
      </Section>

      <Section title="Practice Problems">
        <Practice
          problems={[
            { name: "Spiral Matrix", difficulty: "Medium", hint: "Shrink top, bottom, left, and right boundaries carefully" },
            { name: "Rotate Image", difficulty: "Medium", hint: "Transpose then reverse each row" },
            { name: "Set Matrix Zeroes", difficulty: "Medium", hint: "Use the first row and column as markers" },
            { name: "Number of Islands", difficulty: "Medium", hint: "Flood-fill each unvisited land component" },
            { name: "Rotting Oranges", difficulty: "Medium", hint: "Multi-source BFS, level by level" },
            { name: "Shortest Path in Binary Matrix", difficulty: "Medium", hint: "BFS with the permitted neighborhood" },
            { name: "Maximal Square", difficulty: "Medium", hint: "DP state ending at a cell" },
            { name: "Game of Life", difficulty: "Medium", hint: "Encode old and new states in separate bits" },
          ]}
        />
      </Section>

      <KeyTakeaways
        items={[
          <>Represent flat cells with <C>r * cols + c</C>; check both row and column bounds on every move.</>,
          <>Choose DFS for components, BFS for unweighted shortest paths, and multi-source BFS for spreading waves.</>,
          <>A square matrix rotates clockwise by transpose followed by row reversal.</>,
          <>Sorted-matrix guarantees determine whether staircase or flattened binary search applies.</>,
          <>Use in-place marking and prefix/DP techniques only after checking mutation and boundary requirements.</>,
        ]}
      />
    </article>
  );
}