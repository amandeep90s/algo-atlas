import {
  ArrayViz,
  Callout,
  CodeBlock,
  ComplexityTable,
  C,
  Diagram,
  KeyTakeaways,
  List,
  P,
  PageHeader,
  Practice,
  ProsCons,
  Section,
  Steps,
  Strong,
  SubSection,
  Table,
} from "../../components/doc";

export default function Backtracking() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="Backtracking"
        description="Explore a decision tree one choice at a time. Backtracking builds candidates incrementally, abandons impossible paths early, and undoes each choice before trying another."
        tags={["Recursion", "Search", "Pruning", "Constraint satisfaction"]}
      />

      <Section title="The Choose–Explore–Un-choose Pattern">
        <P>
          Backtracking is a depth-first search over a <Strong>state-space tree</Strong>. Each node represents a partial answer; each edge is a decision. The recursive call explores a choice, then restores the state so sibling choices start cleanly.
        </P>
        <Diagram caption="Every branch extends a partial solution; invalid prefixes can stop before reaching a leaf.">{`
                    []
                  /    \\
              choose 1  choose 2
               /            \\
             [1]             [2]
            /   \\             \\
        choose 2 choose 3     choose 3
           /       \\           \\
        [1,2]      [1,3]       [2,3]
          |           |           |
       record       record      record

        partial state -> recurse -> undo state
`}</Diagram>
        <Steps
          steps={[
            { title: "Choose", body: <>Add one candidate to the current state (or mark a resource as used).</> },
            { title: "Explore", body: <>Recurse with the updated state and remaining choices.</> },
            { title: "Un-choose", body: <>Undo exactly the mutation you made, restoring the caller's state.</> },
          ]}
        />
        <CodeBlock
          title="Universal template"
          code={`
            def search(state, choices):
                if is_complete(state):
                    answer.append(state.copy())
                    return

                for choice in choices(state):
                    if not is_valid(choice, state):
                        continue
                    state.append(choice)       # choose
                    search(state, choices)     # explore
                    state.pop()                # un-choose
          `}
        />
        <Callout type="insight" title="State must be reversible">
          <P>Before recursing, identify every piece of mutable state that changes. Undo all of it on return, or use immutable values and pass a new state.</P>
        </Callout>
      </Section>

      <Section title="Subsets and Duplicate Choices">
        <SubSection title="Include / exclude recursion">
          <P>For each element, make a binary decision: include it or skip it. The tree has at most <C>2ⁿ</C> leaves.</P>
          <CodeBlock
            title="Subsets by include / exclude"
            code={`
              def subsets(nums: list[int]) -> list[list[int]]:
                  result: list[list[int]] = []
                  path: list[int] = []

                  def visit(i: int) -> None:
                      if i == len(nums):
                          result.append(path.copy())
                          return
                      path.append(nums[i])
                      visit(i + 1)
                      path.pop()
                      visit(i + 1)

                  visit(0)
                  return result
            `}
          />
        </SubSection>
        <SubSection title="Loop-based subsets and Subsets II">
          <P>A loop chooses the next element and naturally emits every prefix. For duplicates, sort first and skip equal values at the same recursion depth.</P>
          <CodeBlock
            title="Subsets with duplicates"
            code={`
              def subsets_with_dup(nums: list[int]) -> list[list[int]]:
                  nums.sort()
                  result: list[list[int]] = []
                  path: list[int] = []

                  def visit(start: int) -> None:
                      result.append(path.copy())
                      for i in range(start, len(nums)):
                          if i > start and nums[i] == nums[i - 1]:
                              continue
                          path.append(nums[i])
                          visit(i + 1)
                          path.pop()

                  visit(0)
                  return result
            `}
          />
          <Callout type="warning">The condition is <C>i &gt; start</C>, not <C>i &gt; 0</C>: identical values may be selected at different depths, but not as duplicate sibling branches.</Callout>
        </SubSection>
        <ArrayViz values={[1, 2, 2]} highlight={[1, 2]} caption="Sorting places duplicates next to each other so sibling duplicates can be skipped." />
      </Section>

      <Section title="Permutations, Combinations, and Sums">
        <SubSection title="Permutations: swapping or used-array">
          <P>Permutations care about order. A swap-in-place solution fixes one position at a time; a used-array solution appends any unused item.</P>
          <CodeBlock
            title="Swap-based permutations"
            code={`
              def permutations(nums: list[int]) -> list[list[int]]:
                  result: list[list[int]] = []

                  def visit(start: int) -> None:
                      if start == len(nums):
                          result.append(nums.copy())
                          return
                      for i in range(start, len(nums)):
                          nums[start], nums[i] = nums[i], nums[start]
                          visit(start + 1)
                          nums[start], nums[i] = nums[i], nums[start]

                  visit(0)
                  return result
            `}
          />
          <CodeBlock
            title="Used-array permutations and Permutations II"
            code={`
              def unique_permutations(nums: list[int]) -> list[list[int]]:
                  nums.sort()
                  result: list[list[int]] = []
                  path: list[int] = []
                  used = [False] * len(nums)

                  def visit() -> None:
                      if len(path) == len(nums):
                          result.append(path.copy())
                          return
                      for i, value in enumerate(nums):
                          if used[i]:
                              continue
                          if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                              continue
                          used[i] = True
                          path.append(value)
                          visit()
                          path.pop()
                          used[i] = False

                  visit()
                  return result
            `}
          />
          <P>The duplicate rule forces equal values to be chosen in their sorted order within each permutation, avoiding equivalent branches.</P>
        </SubSection>
        <SubSection title="Combinations and Combination Sum">
          <P>Combinations choose indices in increasing order, so each set appears once. Reuse the same index for unlimited reuse; advance past it for single-use choices.</P>
          <CodeBlock
            title="Combination Sum I and II"
            code={`
              def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
                  result: list[list[int]] = []
                  path: list[int] = []
                  candidates.sort()

                  def visit(start: int, remaining: int) -> None:
                      if remaining == 0:
                          result.append(path.copy())
                          return
                      for i in range(start, len(candidates)):
                          value = candidates[i]
                          if value > remaining:
                              break
                          path.append(value)
                          visit(i, remaining - value)  # reuse allowed
                          path.pop()

                  visit(0, target)
                  return result

              def combination_sum_once(nums: list[int], target: int) -> list[list[int]]:
                  nums.sort()
                  result: list[list[int]] = []
                  path: list[int] = []

                  def visit(start: int, remaining: int) -> None:
                      if remaining == 0:
                          result.append(path.copy())
                          return
                      for i in range(start, len(nums)):
                          if i > start and nums[i] == nums[i - 1]:
                              continue
                          if nums[i] > remaining:
                              break
                          path.append(nums[i])
                          visit(i + 1, remaining - nums[i])
                          path.pop()

                  visit(0, target)
                  return result
            `}
          />
        </SubSection>
        <SubSection title="Phone digits and balanced parentheses">
          <CodeBlock
            title="Letter combinations and Generate Parentheses"
            code={`
              def letter_combinations(digits: str) -> list[str]:
                  if not digits:
                      return []
                  keypad = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
                  result: list[str] = []
                  path: list[str] = []

                  def visit(i: int) -> None:
                      if i == len(digits):
                          result.append("".join(path))
                          return
                      for letter in keypad[int(digits[i])]:
                          path.append(letter)
                          visit(i + 1)
                          path.pop()

                  visit(0)
                  return result

              def generate_parentheses(n: int) -> list[str]:
                  result: list[str] = []
                  path: list[str] = []

                  def visit(opened: int, closed: int) -> None:
                      if len(path) == 2 * n:
                          result.append("".join(path))
                          return
                      if opened < n:
                          path.append("(")
                          visit(opened + 1, closed)
                          path.pop()
                      if closed < opened:
                          path.append(")")
                          visit(opened, closed + 1)
                          path.pop()

                  visit(0, 0)
                  return result
            `}
          />
        </SubSection>
      </Section>

      <Section title="Strings and Grid Search">
        <SubSection title="Palindrome partitioning">
          <P>Precompute or test whether each substring is a palindrome; recurse only on palindromic prefixes.</P>
          <CodeBlock code={`
            def palindrome_partitions(text: str) -> list[list[str]]:
                result: list[list[str]] = []
                path: list[str] = []

                def is_palindrome(left: int, right: int) -> bool:
                    return text[left:right + 1] == text[left:right + 1][::-1]

                def visit(start: int) -> None:
                    if start == len(text):
                        result.append(path.copy())
                        return
                    for end in range(start, len(text)):
                        if is_palindrome(start, end):
                            path.append(text[start:end + 1])
                            visit(end + 1)
                            path.pop()

                visit(0)
                return result
          `} />
        </SubSection>
        <SubSection title="Word Search">
          <P>From each cell, match the next character and search four neighbors. Mark the current cell in-place, then restore it after exploring.</P>
          <CodeBlock code={`
            def word_exists(board: list[list[str]], word: str) -> bool:
                rows, cols = len(board), len(board[0])

                def visit(r: int, c: int, i: int) -> bool:
                    if i == len(word):
                        return True
                    if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[i]:
                        return False
                    saved = board[r][c]
                    board[r][c] = "#"
                    found = any(visit(r + dr, c + dc, i + 1)
                                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
                    board[r][c] = saved
                    return found

                return any(visit(r, c, 0) for r in range(rows) for c in range(cols))
          `} />
        </SubSection>
      </Section>

      <Section title="Constraint Puzzles: N-Queens and Sudoku">
        <SubSection title="N-Queens with column and diagonal sets">
          <P>Place one queen per row. A square is safe when its column, <C>row - col</C> diagonal, and <C>row + col</C> diagonal are all unused.</P>
          <CodeBlock code={`
            def solve_n_queens(n: int) -> list[list[str]]:
                board = [["."] * n for _ in range(n)]
                cols: set[int] = set()
                down: set[int] = set()  # row - col
                up: set[int] = set()    # row + col
                result: list[list[str]] = []

                def visit(row: int) -> None:
                    if row == n:
                        result.append(["".join(line) for line in board])
                        return
                    for col in range(n):
                        if col in cols or row - col in down or row + col in up:
                            continue
                        cols.add(col); down.add(row - col); up.add(row + col)
                        board[row][col] = "Q"
                        visit(row + 1)
                        board[row][col] = "."
                        cols.remove(col); down.remove(row - col); up.remove(row + col)

                visit(0)
                return result
          `} />
        </SubSection>
        <SubSection title="Sudoku solver">
          <P>Track candidates with row, column, and box sets. Choose the empty square with the fewest candidates (MRV heuristic), recurse, then revert.</P>
          <CodeBlock code={`
            def solve_sudoku(board: list[list[str]]) -> bool:
                rows = [set() for _ in range(9)]
                cols = [set() for _ in range(9)]
                boxes = [set() for _ in range(9)]
                empty = []
                for r in range(9):
                    for c in range(9):
                        value = board[r][c]
                        if value == ".":
                            empty.append((r, c))
                        else:
                            b = (r // 3) * 3 + c // 3
                            rows[r].add(value); cols[c].add(value); boxes[b].add(value)

                def visit() -> bool:
                    if not empty:
                        return True
                    best = min(range(len(empty)), key=lambda k: len(set("123456789") - rows[empty[k][0]] - cols[empty[k][1]] - boxes[(empty[k][0] // 3) * 3 + empty[k][1] // 3]))
                    empty[best], empty[-1] = empty[-1], empty[best]
                    r, c = empty.pop()
                    b = (r // 3) * 3 + c // 3
                    for value in set("123456789") - rows[r] - cols[c] - boxes[b]:
                        board[r][c] = value
                        rows[r].add(value); cols[c].add(value); boxes[b].add(value)
                        if visit():
                            return True
                        rows[r].remove(value); cols[c].remove(value); boxes[b].remove(value)
                        board[r][c] = "."
                    empty.append((r, c))
                    empty[best], empty[-1] = empty[-1], empty[best]
                    return False

                return visit()
          `} />
          <Callout type="note">The solver mutates the supplied board. A successful call leaves the solved board in place; a failed call restores all attempted cells.</Callout>
        </SubSection>
      </Section>

      <Section title="Pruning and Complexity">
        <List items={[
          <>Reject a partial state immediately when it violates a constraint.</>,
          <>Sort candidates so a monotone bound lets you <C>break</C> when later choices cannot work.</>,
          <>Use the most-constrained variable first (MRV) and order promising choices early.</>,
          <>Memoize repeated states when different paths can reach the same state; then the search may become dynamic programming.</>,
          <>Use bitmasks for compact set membership in small constraint domains.</>,
        ]} />
        <ComplexityTable rows={[
          { operation: <C>Subsets</C>, time: "O(n · 2ⁿ)", space: "O(n)", note: "Output contains 2ⁿ subsets" },
          { operation: <C>Permutations</C>, time: "O(n · n!)", space: "O(n)", note: "n! outputs, each length n" },
          { operation: <C>N-Queens</C>, time: "O(n!)", space: "O(n²)", note: "Pruning reduces practical search" },
          { operation: <C>Word Search</C>, time: "O(RC · 4ᴸ)", space: "O(L)", note: "L = word length; no cell reuse" },
          { operation: <C>Sudoku</C>, time: "O(9ᵉ)", space: "O(e)", note: "e empty cells; upper bound only" },
        ]} />
        <Callout type="warning">Exponential bounds are worst-case. Strong pruning can make structured instances fast, but does not change the general worst-case growth.</Callout>
      </Section>

      <Section title="Backtracking vs Brute Force vs Dynamic Programming">
        <Table headers={["Approach", "How it explores", "When it helps"]} rows={[
          [<Strong>Brute force</Strong>, "Enumerate candidates, often without early checks", "Tiny input or a simple correctness baseline"],
          [<Strong>Backtracking</Strong>, "Build partial candidates and prune invalid prefixes", "Constraint search, enumeration, finding feasible solutions"],
          [<Strong>Dynamic programming</Strong>, "Cache or combine answers to overlapping states", "Repeated subproblems and optimal/counting objectives"],
        ]} />
        <ProsCons pros={["Natural for generating combinations and arrangements", "Constraints can prune large parts of the tree", "Produces one solution early when search order is favorable"]} cons={["Worst-case exponential time", "Mutable state is easy to restore incorrectly", "Repeated subproblems waste work unless memoized"]} />
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Subsets", difficulty: "Medium", hint: "Try include/exclude and loop-recursion forms" },
          { name: "Permutations II", difficulty: "Medium", hint: "Sort, then skip used equal siblings" },
          { name: "Combination Sum", difficulty: "Medium", hint: "Reuse index when selecting a value" },
          { name: "Generate Parentheses", difficulty: "Medium", hint: "Never let closes exceed opens" },
          { name: "Palindrome Partitioning", difficulty: "Medium", hint: "Choose every palindromic prefix" },
          { name: "N-Queens", difficulty: "Hard", hint: "Represent attacked columns and diagonals as sets" },
          { name: "Sudoku Solver", difficulty: "Hard", hint: "Pick the cell with the fewest candidates" },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>Structure recursive search as choose, explore, and un-choose.</>,
        <>Prune invalid prefixes as early as possible; sorted inputs often enable stronger bounds.</>,
        <>Sort and skip duplicate siblings for unique subsets, combinations, and permutations.</>,
        <>Use sets for fast constraint checks and always restore shared state after recursion.</>,
        <>Expect <C>O(2ⁿ)</C> subset search or <C>O(n!)</C> permutation search when the output itself is that large.</>,
      ]} />
    </article>
  );
}