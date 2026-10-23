import {
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

export default function DynamicProgramming() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="Dynamic Programming"
        description="Turn repeated choices into a small set of reusable states. Dynamic programming (DP) stores answers to overlapping subproblems and combines them to solve larger problems efficiently."
        tags={["Memoization", "Tabulation", "Optimization", "State design"]}
      />

      <Section title="Why Dynamic Programming Works">
        <P>
          DP is useful when a problem has <Strong>overlapping subproblems</Strong> (the same smaller question appears repeatedly) and <Strong>optimal substructure</Strong> (an optimal answer can be assembled from optimal answers to smaller states). Counting and feasibility problems often share the same recurrence idea.
        </P>
        <Diagram caption="Naive recursion recomputes the highlighted state; DP computes it once and reuses it.">{`
                   fib(5)
                 /        \\
             fib(4)       fib(3)  <- repeated
            /     \\      /    \\
        fib(3)   fib(2) fib(2) fib(1)
          ...      ...    ...

        memo: fib(3) -> 2       reuse instead of recurse again
`}</Diagram>
        <Callout type="insight" title="A DP state is a complete subproblem description">
          If two recursive calls have the same state but could produce different answers, the state is missing information. Include every variable that affects future choices.
        </Callout>
        <SubSection title="Fibonacci: top-down, bottom-up, and optimized">
          <CodeBlock title="Three equivalent formulations" code={`
            from functools import lru_cache

            @lru_cache(maxsize=None)
            def fib_memo(n: int) -> int:
                if n < 2:
                    return n
                return fib_memo(n - 1) + fib_memo(n - 2)

            def fib_table(n: int) -> int:
                if n < 2:
                    return n
                dp = [0] * (n + 1)
                dp[1] = 1
                for i in range(2, n + 1):
                    dp[i] = dp[i - 1] + dp[i - 2]
                return dp[n]

            def fib_optimized(n: int) -> int:
                previous, current = 0, 1
                for _ in range(n):
                    previous, current = current, previous + current
                return previous
          `} />
          <P>Memoization follows the natural recurrence and evaluates only reached states; tabulation makes the evaluation order explicit. When each state needs only a fixed number of previous values, discard the rest of the table.</P>
        </SubSection>
      </Section>

      <Section title="A Five-Step DP Framework">
        <Steps steps={[
          { title: "Define the state", body: <>What does <C>dp[i]</C>, <C>dp[i][j]</C>, or <C>dp[mask]</C> mean? State it in one sentence.</> },
          { title: "Write the transition", body: <>List the choices that lead into the state and combine their predecessor values.</> },
          { title: "Set base cases", body: <>Solve the smallest/empty states directly; make impossible states explicit.</> },
          { title: "Choose an evaluation order", body: <>Ensure every dependency is already known (recursion or a topological loop order).</> },
          { title: "Extract the answer", body: <>It may be the final cell, a minimum over states, or a count accumulated in a different state.</> },
        ]} />
        <Callout type="warning">Write down what each cell means before coding. A common error is to use a recurrence for a different state definition than the one the table actually stores.</Callout>
      </Section>

      <Section title="1D DP Patterns">
        <SubSection title="Climbing Stairs and House Robber">
          <P>In stairs, ways to reach step <C>i</C> come from steps <C>i - 1</C> and <C>i - 2</C>. In house robber, either skip the current house or take it and skip its neighbor.</P>
          <CodeBlock code={`
            def climb_stairs(n: int) -> int:
                a, b = 1, 1
                for _ in range(n):
                    a, b = b, a + b
                return a

            def house_robber(nums: list[int]) -> int:
                two_back = one_back = 0
                for money in nums:
                    two_back, one_back = one_back, max(one_back, two_back + money)
                return one_back
          `} />
        </SubSection>
        <SubSection title="Coin Change: minimum coins and number of ways">
          <P>For minimum coins, consider taking each coin last. To count combinations (not orderings), make coin the outer loop.</P>
          <CodeBlock code={`
            def min_coins(coins: list[int], amount: int) -> int:
                dp = [amount + 1] * (amount + 1)
                dp[0] = 0
                for total in range(1, amount + 1):
                    for coin in coins:
                        if coin <= total:
                            dp[total] = min(dp[total], dp[total - coin] + 1)
                return -1 if dp[amount] == amount + 1 else dp[amount]

            def coin_change_ways(coins: list[int], amount: int) -> int:
                ways = [0] * (amount + 1)
                ways[0] = 1
                for coin in coins:
                    for total in range(coin, amount + 1):
                        ways[total] += ways[total - coin]
                return ways[amount]
          `} />
          <Callout type="note">Loop order determines what is counted: coin-outer counts unordered combinations; amount-outer often counts ordered sequences.</Callout>
        </SubSection>
        <SubSection title="Decode Ways and Longest Increasing Subsequence">
          <CodeBlock title="Decode Ways" code={`
            def decode_ways(text: str) -> int:
                if not text or text[0] == "0":
                    return 0
                two_back, one_back = 1, 1
                for i in range(1, len(text)):
                    current = 0
                    if text[i] != "0":
                        current += one_back
                    pair = int(text[i - 1:i + 1])
                    if 10 <= pair <= 26:
                        current += two_back
                    two_back, one_back = one_back, current
                return one_back
          `} />
          <CodeBlock title="LIS: quadratic DP and patience sorting" code={`
            from bisect import bisect_left

            def lis_quadratic(nums: list[int]) -> int:
                dp = [1] * len(nums)
                for i in range(len(nums)):
                    for j in range(i):
                        if nums[j] < nums[i]:
                            dp[i] = max(dp[i], dp[j] + 1)
                return max(dp, default=0)

            def lis_length(nums: list[int]) -> int:
                tails: list[int] = []
                for value in nums:
                    i = bisect_left(tails, value)
                    if i == len(tails):
                        tails.append(value)
                    else:
                        tails[i] = value
                return len(tails)
          `} />
          <P>The <C>tails</C> array stores the smallest possible tail for each subsequence length; it is not necessarily an actual subsequence. Use <C>bisect_right</C> instead for a non-decreasing subsequence.</P>
        </SubSection>
      </Section>

      <Section title="Grid and Two-Sequence DP">
        <SubSection title="Grid paths and minimum path sum">
          <P>For right/down movement, a cell depends on its top and left neighbors. A one-row table updates left to right.</P>
          <CodeBlock code={`
            def unique_paths(rows: int, cols: int) -> int:
                dp = [1] * cols
                for _ in range(1, rows):
                    for c in range(1, cols):
                        dp[c] += dp[c - 1]
                return dp[-1]

            def min_path_sum(grid: list[list[int]]) -> int:
                rows, cols = len(grid), len(grid[0])
                dp = [float("inf")] * cols
                dp[0] = 0
                for r in range(rows):
                    for c in range(cols):
                        if c == 0:
                            dp[c] += grid[r][c]
                        else:
                            dp[c] = min(dp[c], dp[c - 1]) + grid[r][c]
                return int(dp[-1])
          `} />
        </SubSection>
        <SubSection title="Longest Common Subsequence">
          <P>Let <C>dp[i][j]</C> be the LCS length of the first <C>i</C> and <C>j</C> characters. Matching characters extend the diagonal; otherwise drop one character.</P>
          <Diagram caption="For text1 = abcde and text2 = ace, each cell combines its top, left, or diagonal predecessor.">{`
                    ""   a   c   e
               +-----------------
           ""  |  0   0   0   0
            a  |  0   1   1   1
            b  |  0   1   1   1
            c  |  0   1   2   2
            d  |  0   1   2   2
            e  |  0   1   2   3  <- LCS length
`}</Diagram>
          <CodeBlock code={`
            def lcs(a: str, b: str) -> int:
                dp = [0] * (len(b) + 1)
                for char_a in a:
                    diagonal = 0
                    for j, char_b in enumerate(b, start=1):
                        above = dp[j]
                        if char_a == char_b:
                            dp[j] = diagonal + 1
                        else:
                            dp[j] = max(dp[j], dp[j - 1])
                        diagonal = above
                return dp[-1]
          `} />
        </SubSection>
        <SubSection title="Edit Distance">
          <P>At each character pair, either match at no cost or use insert, delete, or replace (each cost one). The base row and column are the cost of converting to/from the empty string.</P>
          <CodeBlock code={`
            def edit_distance(a: str, b: str) -> int:
                dp = list(range(len(b) + 1))
                for i, x in enumerate(a, start=1):
                    current = [i] + [0] * len(b)
                    for j, y in enumerate(b, start=1):
                        if x == y:
                            current[j] = dp[j - 1]
                        else:
                            current[j] = 1 + min(dp[j], current[j - 1], dp[j - 1])
                    dp = current
                return dp[-1]
          `} />
        </SubSection>
      </Section>

      <Section title="Knapsack and Subset DP">
        <SubSection title="0/1 Knapsack: 2D and 1D">
          <P>Each item can be used at most once. In the one-dimensional version, iterate capacities downward so the current item cannot feed itself.</P>
          <CodeBlock code={`
            def knapsack_01(weights: list[int], values: list[int], capacity: int) -> int:
                n = len(weights)
                dp = [[0] * (capacity + 1) for _ in range(n + 1)]
                for i in range(1, n + 1):
                    weight, value = weights[i - 1], values[i - 1]
                    for cap in range(capacity + 1):
                        dp[i][cap] = dp[i - 1][cap]
                        if weight <= cap:
                            dp[i][cap] = max(dp[i][cap], dp[i - 1][cap - weight] + value)
                return dp[n][capacity]

            def knapsack_01_optimized(weights: list[int], values: list[int], capacity: int) -> int:
                dp = [0] * (capacity + 1)
                for weight, value in zip(weights, values):
                    for cap in range(capacity, weight - 1, -1):
                        dp[cap] = max(dp[cap], dp[cap - weight] + value)
                return dp[capacity]
          `} />
        </SubSection>
        <SubSection title="Unbounded Knapsack and Equal Partition">
          <P>For unbounded reuse, iterate capacity upward so a just-updated state can reuse the current item. Equal partition asks whether a subset sums to half the total.</P>
          <CodeBlock code={`
            def unbounded_knapsack(weights: list[int], values: list[int], capacity: int) -> int:
                dp = [0] * (capacity + 1)
                for weight, value in zip(weights, values):
                    for cap in range(weight, capacity + 1):
                        dp[cap] = max(dp[cap], dp[cap - weight] + value)
                return dp[capacity]

            def can_partition(nums: list[int]) -> bool:
                total = sum(nums)
                if total % 2:
                    return False
                target = total // 2
                possible = [False] * (target + 1)
                possible[0] = True
                for value in nums:
                    for subtotal in range(target, value - 1, -1):
                        possible[subtotal] |= possible[subtotal - value]
                return possible[target]
          `} />
          <Callout type="warning">Reversing or not reversing the capacity loop changes the mathematical problem: 0/1 items must not be reused; unbounded items may be.</Callout>
        </SubSection>
      </Section>

      <Section title="Interval DP, Strings, and State Machines">
        <SubSection title="Interval DP: Burst Balloons and Palindromic Subsequence">
          <P>Interval states represent a substring or range. For Burst Balloons, choose the <Strong>last</Strong> balloon in an interval so the remaining left and right ranges are independent.</P>
          <CodeBlock title="Burst Balloons" code={`
            def max_coins(nums: list[int]) -> int:
                values = [1] + nums + [1]
                n = len(nums)
                dp = [[0] * (n + 2) for _ in range(n + 2)]
                for length in range(1, n + 1):
                    for left in range(1, n - length + 2):
                        right = left + length - 1
                        for last in range(left, right + 1):
                            coins = values[left - 1] * values[last] * values[right + 1]
                            dp[left][right] = max(dp[left][right], dp[left][last - 1] + coins + dp[last + 1][right])
                return dp[1][n]

            def longest_palindromic_subsequence(text: str) -> int:
                n = len(text)
                dp = [[0] * n for _ in range(n)]
                for left in range(n - 1, -1, -1):
                    dp[left][left] = 1
                    for right in range(left + 1, n):
                        if text[left] == text[right]:
                            dp[left][right] = 2 + dp[left + 1][right - 1]
                        else:
                            dp[left][right] = max(dp[left + 1][right], dp[left][right - 1])
                return dp[0][n - 1] if n else 0
          `} />
        </SubSection>
        <SubSection title="Word Break and Longest Palindromic Substring">
          <CodeBlock code={`
            def word_break(text: str, words: set[str]) -> bool:
                dp = [False] * (len(text) + 1)
                dp[0] = True
                for end in range(1, len(text) + 1):
                    dp[end] = any(dp[start] and text[start:end] in words
                                  for start in range(end))
                return dp[-1]

            def longest_palindrome(text: str) -> str:
                best_left = best_right = 0

                def expand(left: int, right: int) -> None:
                    nonlocal best_left, best_right
                    while left >= 0 and right < len(text) and text[left] == text[right]:
                        if right - left > best_right - best_left:
                            best_left, best_right = left, right
                        left -= 1
                        right += 1

                for center in range(len(text)):
                    expand(center, center)
                    expand(center, center + 1)
                return text[best_left:best_right + 1] if text else ""
          `} />
          <P>Word Break stores whether each prefix is segmentable. The longest-palindrome center expansion is a useful alternative to a full interval table when only one longest substring is needed.</P>
        </SubSection>
        <SubSection title="State machine DP: stock with cooldown">
          <P>Track whether you end a day holding, just sold, or resting. Buying can follow rest only; after selling, the next day is a cooldown.</P>
          <CodeBlock code={`
            def max_profit_cooldown(prices: list[int]) -> int:
                hold = float("-inf")
                sold = float("-inf")
                rest = 0
                for price in prices:
                    old_hold, old_sold, old_rest = hold, sold, rest
                    hold = max(old_hold, old_rest - price)
                    sold = old_hold + price
                    rest = max(old_rest, old_sold)
                return int(max(sold, rest))
          `} />
        </SubSection>
      </Section>

      <Section title="Bitmask DP, Trees, and Reconstruction">
        <SubSection title="Bitmask DP: Traveling Salesperson">
          <P>When there are few vertices, a bitmask represents the visited set. <C>dp[mask][u]</C> is the shortest route starting at city 0, visiting exactly <C>mask</C>, and ending at <C>u</C>.</P>
          <CodeBlock code={`
            def tsp(distance: list[list[int]]) -> int:
                n = len(distance)
                full = (1 << n) - 1
                dp = [[float("inf")] * n for _ in range(1 << n)]
                dp[1][0] = 0
                for mask in range(1 << n):
                    if not (mask & 1):
                        continue
                    for last in range(n):
                        if dp[mask][last] == float("inf"):
                            continue
                        for nxt in range(n):
                            if mask & (1 << nxt):
                                continue
                            new_mask = mask | (1 << nxt)
                            dp[new_mask][nxt] = min(dp[new_mask][nxt], dp[mask][last] + distance[last][nxt])
                return int(min(dp[full][last] + distance[last][0] for last in range(n)))
          `} />
        </SubSection>
        <SubSection title="Tree DP: House Robber III">
          <P>Return two values per node: best if the node is skipped, and best if it is taken. A taken node forces both children to be skipped.</P>
          <CodeBlock code={`
            class TreeNode:
                def __init__(self, val: int = 0, left=None, right=None):
                    self.val = val
                    self.left = left
                    self.right = right

            def rob_tree(root: TreeNode | None) -> int:
                def visit(node: TreeNode | None) -> tuple[int, int]:
                    if node is None:
                        return 0, 0
                    left_skip, left_take = visit(node.left)
                    right_skip, right_take = visit(node.right)
                    skip = max(left_skip, left_take) + max(right_skip, right_take)
                    take = node.val + left_skip + right_skip
                    return skip, take

                return max(visit(root))
          `} />
        </SubSection>
        <SubSection title="Reconstructing an actual solution">
          <P>Store a predecessor/choice while filling the table, or walk backward through the finished table and infer which transition was taken. Preserve enough information to break ties consistently.</P>
          <CodeBlock code={`
            def reconstruct_lcs(a: str, b: str) -> str:
                dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
                for i in range(1, len(a) + 1):
                    for j in range(1, len(b) + 1):
                        if a[i - 1] == b[j - 1]:
                            dp[i][j] = dp[i - 1][j - 1] + 1
                        else:
                            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                i, j = len(a), len(b)
                answer: list[str] = []
                while i and j:
                    if a[i - 1] == b[j - 1]:
                        answer.append(a[i - 1]); i -= 1; j -= 1
                    elif dp[i - 1][j] >= dp[i][j - 1]:
                        i -= 1
                    else:
                        j -= 1
                return "".join(reversed(answer))
          `} />
        </SubSection>
      </Section>

      <Section title="Recognize the Pattern, Avoid the Pitfalls">
        <Table headers={["Clue / pattern", "Typical state", "Example"]} rows={[
          ["One index; local choices", <C>dp[i]</C>, "Stairs, robber, coin change"],
          ["Grid movement", <C>dp[r][c]</C>, "Unique paths, minimum path sum"],
          ["Two sequences", <C>dp[i][j]</C>, "LCS, edit distance"],
          ["Choose items under capacity", <C>dp[item][capacity]</C>, "Knapsack, subset sum"],
          ["Best answer within a range", <C>dp[left][right]</C>, "Burst Balloons, palindromes"],
          ["A few modes with transitions", <C>dp[day][state]</C>, "Stock trading, cooldown"],
          ["Small set of visited nodes", <C>dp[mask][last]</C>, "TSP / Hamiltonian path"],
          ["Parent/child dependencies", <C>dp[node][choice]</C>, "Tree robber, tree matching"],
        ]} />
        <List items={[
          <>Off-by-one indexing: define whether indices refer to characters or prefix lengths.</>,
          <>Wrong update order in a compressed table: make sure the old layer is not overwritten too early.</>,
          <>Impossible states need a safe sentinel such as infinity; avoid adding to an invalid sentinel carelessly.</>,
          <>Do not compress a table until its dependency directions are understood.</>,
          <>Distinguish combinations from permutations, and subsequences from substrings.</>,
          <>Memoization keys must include every state variable; mutable list arguments are not hashable.</>,
        ]} />
        <ComplexityTable rows={[
          { operation: <C>1D DP</C>, time: "O(n)", space: "O(n) or O(1)" },
          { operation: <C>Two-sequence DP</C>, time: "O(nm)", space: "O(nm) or O(min(n,m))" },
          { operation: <C>0/1 Knapsack</C>, time: "O(nW)", space: "O(W)" },
          { operation: <C>Interval DP</C>, time: "O(n³)", space: "O(n²)", note: "Often try every split point" },
          { operation: <C>TSP bitmask DP</C>, time: "O(n² · 2ⁿ)", space: "O(n · 2ⁿ)", note: "Practical only for small n" },
        ]} />
        <ProsCons pros={["Reuses repeated work instead of exploring an exponential recursion tree", "Makes optimality/counting recurrences precise", "Tables can often be compressed to reduce memory"]} cons={["State design and transition derivation can be subtle", "Tables may consume substantial memory", "A wrong iteration order can silently change the problem"]} />
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Climbing Stairs", difficulty: "Easy", hint: "Two previous states are sufficient" },
          { name: "House Robber", difficulty: "Medium", hint: "Take this index or skip it" },
          { name: "Coin Change", difficulty: "Medium", hint: "Minimum-count state by amount" },
          { name: "Longest Increasing Subsequence", difficulty: "Medium", hint: "Compare O(n²) states with tails" },
          { name: "Longest Common Subsequence", difficulty: "Medium", hint: "Prefix lengths make base cases simple" },
          { name: "Partition Equal Subset Sum", difficulty: "Medium", hint: "0/1 subset-sum with descending totals" },
          { name: "Burst Balloons", difficulty: "Hard", hint: "Choose the last item in an interval" },
          { name: "Traveling Salesperson", difficulty: "Hard", hint: "Visited-set mask plus endpoint" },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>Look for overlapping subproblems and optimal substructure before writing a recurrence.</>,
        <>Define the state, transition, base cases, evaluation order, and answer explicitly.</>,
        <>Memoization is recursive caching; tabulation is an explicit dependency order.</>,
        <>Use descending capacity for 0/1 knapsack and ascending capacity for unbounded reuse.</>,
        <>Store choices or walk the table backward when the problem asks for an actual solution.</>,
      ]} />
    </article>
  );
}