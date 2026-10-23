import { Callout, C, CodeBlock, ComplexityTable, Diagram, KeyTakeaways, List, P, PageHeader, Practice, Section, Strong, SubSection, Table } from "../../components/doc";

export default function Recursion() {
  return (
    <article>
      <PageHeader eyebrow="Getting Started" title="Recursion" description="Break a problem into smaller versions of itself, understand the call stack, and choose when recursion, memoization, or an explicit stack is the right tool." tags={["Base cases", "Call stack", "Memoization"]} />
      <Section title="What is recursion?"><P>A function is recursive when it solves a problem by calling itself on a smaller or simpler input. A correct recursive design has a <Strong>base case</Strong> that returns directly and a <Strong>recursive case</Strong> that makes progress toward that base case.</P><Callout type="insight">For every recursive call, ask: what input gets smaller, and why must it eventually reach a base case?</Callout></Section>
      <Section title="Call stack and factorial">
        <P>Each function call gets a frame holding its local variables and return point. Frames are pushed as calls descend, then popped in reverse order as values return.</P>
        <Diagram caption="factorial(4) descends to the base case, then unwinds with return values.">{`
          CALLS (push)                  RETURNS (pop)
          factorial(4)                  factorial(1) = 1
            factorial(3)                  factorial(2) = 2 × 1 = 2
              factorial(2)                  factorial(3) = 3 × 2 = 6
                factorial(1)                factorial(4) = 4 × 6 = 24
                  base case
        `}</Diagram>
        <CodeBlock code={`
def factorial(n: int) -> int:
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:                 # base case
        return 1
    return n * factorial(n - 1)  # recursive case

print(factorial(4))
`} output="24" />
        <P>For n ≥ 0, this takes O(n) time and O(n) stack space. Each call waits for the result of a smaller factorial.</P>
      </Section>
      <Section title="Recursion trees and repeated work">
        <P>Naive Fibonacci recursion has two calls for most non-base inputs. The same subproblems are recomputed many times, producing an exponential recursion tree.</P>
        <Diagram caption="fib(5) repeatedly expands shared subproblems such as fib(3) and fib(2).">{`
                         fib(5)
                       /       \\
                   fib(4)       fib(3)
                  /    \\       /   \\
              fib(3) fib(2) fib(2) fib(1)
              /   \\
          fib(2) fib(1)
        `}</Diagram>
        <SubSection title="Memoization removes repeated calls"><CodeBlock code={`
            from functools import lru_cache

            @lru_cache(maxsize=None)
            def fibonacci(n: int) -> int:
                if n < 0:
                    raise ValueError("n must be non-negative")
                if n < 2:
                    return n
                return fibonacci(n - 1) + fibonacci(n - 2)

            print(fibonacci(10))
          `} output="55" /><P>Caching each n once changes time from exponential to O(n), with O(n) cache and call-stack space.</P></SubSection>
      </Section>
      <Section title="Useful recursion patterns">
        <SubSection title="Fast exponentiation"><P>Split the exponent in half: xⁿ = (x^(n/2))², with one extra factor when n is odd. This reduces the number of multiplications to O(log n).</P><CodeBlock code={`
def power(base: int, exponent: int) -> int:
    if exponent < 0:
        raise ValueError("exponent must be non-negative")
    if exponent == 0:
        return 1
    half = power(base, exponent // 2)
    result = half * half
    return result if exponent % 2 == 0 else result * base
`} /></SubSection>
        <SubSection title="Sum digits and reverse a string"><CodeBlock code={`
def sum_digits(number: int) -> int:
    number = abs(number)
    if number < 10:
        return number
    return number % 10 + sum_digits(number // 10)


def reverse_string(text: str) -> str:
    if len(text) < 2:
        return text
    return reverse_string(text[1:]) + text[0]
`} /><Callout type="note">The recursive string version copies slices and concatenated strings. It is useful for illustrating recursion, not for long inputs; use iteration or a list of characters for production.</Callout></SubSection>
        <SubSection title="Palindrome and recursive binary search"><CodeBlock code={`
def is_palindrome(text: str) -> bool:
    def check(left: int, right: int) -> bool:
        if left >= right:
            return True
        return text[left] == text[right] and check(left + 1, right - 1)
    return check(0, len(text) - 1)


def binary_search(values: list[int], target: int) -> int:
    def search(low: int, high: int) -> int:
        if low > high:
            return -1
        middle = (low + high) // 2
        if values[middle] == target:
            return middle
        if values[middle] < target:
            return search(middle + 1, high)
        return search(low, middle - 1)
    return search(0, len(values) - 1)
`} /><P>Both shrink their range on every call. Binary search takes O(log n) time and O(log n) stack space; an iterative version uses O(1) extra space.</P></SubSection>
      </Section>
      <Section title="Backtracking: choices and undo">
        <P>Backtracking explores a decision tree: choose, recurse, then undo the choice so another branch can reuse the partial state. Pruning stops branches that cannot lead to a valid result.</P>
        <SubSection title="Generate all subsets"><CodeBlock code={`
def subsets(values: list[int]) -> list[list[int]]:
    result: list[list[int]] = []
    path: list[int] = []

    def visit(index: int) -> None:
        if index == len(values):
            result.append(path.copy())
            return
        visit(index + 1)          # exclude current value
        path.append(values[index])
        visit(index + 1)          # include current value
        path.pop()                 # undo choice

    visit(0)
    return result
`} /><P>There are 2ⁿ subsets, so producing the full answer already costs Ω(n·2ⁿ) element writes in the usual list representation.</P></SubSection>
        <SubSection title="Tower of Hanoi"><P>Move n disks from source to destination using an auxiliary peg: move n − 1 aside, move the largest, then move n − 1 onto it. The recurrence T(n) = 2T(n − 1) + 1 yields 2ⁿ − 1 moves.</P><CodeBlock code={`
def hanoi(n: int, source: str, auxiliary: str, target: str) -> list[tuple[str, str]]:
    moves: list[tuple[str, str]] = []
    def move(count: int, start: str, spare: str, end: str) -> None:
        if count == 0:
            return
        move(count - 1, start, end, spare)
        moves.append((start, end))
        move(count - 1, spare, start, end)
    move(n, source, auxiliary, target)
    return moves
`} /></SubSection>
      </Section>
      <Section title="Flattening and mutual recursion">
        <SubSection title="Flatten a nested list"><CodeBlock code={`
            from collections.abc import Iterable

            def flatten(items: list[object]) -> list[object]:
                result: list[object] = []
                for item in items:
                    if isinstance(item, list):
                        result.extend(flatten(item))
                    else:
                        result.append(item)
                return result
          `} /><P>This version treats lists as nesting containers and all other objects as values. Define behavior explicitly for tuples, strings, cycles, and other iterables if they are in scope.</P></SubSection>
        <SubSection title="Mutual recursion"><P>Two functions can call one another, such as predicates for even and odd nonnegative numbers. Each transition must reduce the input; otherwise the calls can loop until a recursion error.</P><CodeBlock code={`
def is_even(n: int) -> bool:
    if n == 0:
        return True
    return is_odd(n - 1)


def is_odd(n: int) -> bool:
    if n == 0:
        return False
    return is_even(n - 1)
`} /></SubSection>
      </Section>
      <Section title="Recursion versus iteration">
        <P>Recursion can make trees, divide-and-conquer, and backtracking clearer. Iteration avoids per-call overhead and stack limits for long linear processes. Tail recursion does not solve this in Python: CPython does <Strong>not</Strong> perform tail-call optimization, so a tail-recursive function still consumes frames.</P>
        <Table headers={["Recursive idea", "Iterative replacement"]} rows={[
          ["Linear countdown", "A while loop updating state"], ["Tree / graph DFS", "An explicit stack of pending nodes"], ["Memoized recurrence", "Bottom-up table or rolling variables"],
          ["Backtracking", "A stack of frames including next choice and undo state"],
        ]} />
        <CodeBlock title="Factorial with an explicit loop" code={`
def factorial_iterative(n: int) -> int:
    if n < 0:
        raise ValueError("n must be non-negative")
    result = 1
    for value in range(2, n + 1):
        result *= value
    return result
`} />
        <CodeBlock title="Simulate recursive DFS with an explicit stack" code={`
def preorder_iterative(root: TreeNode | None) -> list[int]:
    if root is None:
        return []
    result: list[int] = []
    stack = [root]
    while stack:
        node = stack.pop()
        result.append(node.value)
        if node.right is not None:
            stack.append(node.right)
        if node.left is not None:
            stack.append(node.left)
    return result
`} />
        <Callout type="tip">Convert recursion by listing exactly what each frame remembers and where execution resumes. Push a frame before descending, then pop it to simulate return.</Callout>
      </Section>
      <Section title="Complexity, limits, and common mistakes">
        <ComplexityTable rows={[
          { operation: <C>factorial(n)</C>, time: "O(n)", space: "O(n)", note: "One frame per level" },
          { operation: <C>naive fibonacci(n)</C>, time: "O(2ⁿ)", space: "O(n)", note: "Exponential calls, linear depth" },
          { operation: <C>memoized fibonacci(n)</C>, time: "O(n)", space: "O(n)", note: "Cache plus stack" },
          { operation: <C>fast power(x, n)</C>, time: "O(log n)", space: "O(log n)", note: "Halves exponent" },
          { operation: <C>all subsets</C>, time: "O(n·2ⁿ)", space: "O(n·2ⁿ)", note: "Including returned output" },
        ]} />
        <List items={[
          <>Missing or incorrect base cases cause nontermination or wrong answers.</>, <>A recursive call that does not move toward a base case eventually raises <C>RecursionError</C>.</>,
          <>Shared mutable state must be restored after a branch; copy paths when saving answers.</>, <>Repeated subproblems may require memoization; account for cache memory and hashable arguments.</>,
          <>Python's default recursion limit is relatively low. Raising it with <C>sys.setrecursionlimit</C> does not remove native-stack or memory risks.</>,
        ]} />
        <Callout type="warning" title="Do not blindly raise the limit">If recursion depth may be proportional to a large input, prefer an iterative implementation. A too-high limit can crash the process instead of producing a clean exception.</Callout>
      </Section>
      <Section title="Practice and takeaways">
        <Practice problems={[
          { name: "Reverse Linked List", difficulty: "Easy", hint: "Express the recursive subproblem or use three pointers." },
          { name: "Pow(x, n)", difficulty: "Medium", hint: "Halve the exponent and handle odd powers." },
          { name: "Subsets", difficulty: "Medium", hint: "Make include/exclude choices and undo state." },
          { name: "Permutations", difficulty: "Medium", hint: "Track used choices at each depth." },
          { name: "Generate Parentheses", difficulty: "Medium", hint: "Prune when closes exceed opens." },
          { name: "Flatten Nested List", difficulty: "Medium", hint: "Define the leaf and container cases." },
        ]} />
        <KeyTakeaways items={[
          <>A base case stops; every recursive transition must make measurable progress.</>, <>Call frames use stack space proportional to maximum depth.</>,
          <>Memoization turns repeated subproblems into cached lookups.</>, <>Backtracking follows choose, explore, undo; prune invalid partial states.</>,
          <>Python has no tail-call optimization; use iteration or an explicit stack for deep work.</>,
        ]} />
      </Section>
    </article>
  );
}