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
  Strong,
  SubSection,
} from "../../components/doc";

export default function Stacks() {
  return (
    <article>
      <PageHeader eyebrow="Linear Data Structures" title="Stacks" description="A stack stores items in last-in, first-out order. Its small interface makes it a powerful tool for parsing, traversal, backtracking and managing nested work." tags={["LIFO", "Push / pop", "Monotonic stack", "Call stack"]} />

      <Section title="The LIFO Idea">
        <P>A <Strong>stack</Strong> restricts access to one end, called the <Strong>top</Strong>. The last item pushed is the first one popped (LIFO). Think of a pile of plates: adding and removing from the top is easy, but reaching the bottom means moving everything above it.</P>
        <Diagram caption="Push 4, then 7; 7 is at the top and will be removed first.">{`
             TOP
              ↓
          ┌───────┐
          │   7   │  ← pop() returns 7
          ├───────┤
          │   4   │
          ├───────┤
          │   2   │  bottom
          └───────┘
        `}</Diagram>
        <P>Stacks appear in undo systems, expression evaluators, depth-first search, and the runtime call stack. In Python, a <C>list</C> is the usual stack because <C>append</C> and end-<C>pop</C> are amortized <C>O(1)</C>.</P>
      </Section>

      <Section title="The Stack ADT">
        <P>An abstract data type describes behavior rather than storage. A stack typically supports <C>push(x)</C>, <C>pop()</C>, <C>peek()</C> (or top), <C>is_empty()</C>, and <C>size()</C>. An empty pop/peek should have a documented policy: raise an error, return a sentinel, or use an optional result.</P>
        <CodeBlock title="list-backed stack" code={`
          class Stack:
              def __init__(self):
                  self._items: list[int] = []

              def push(self, item: int) -> None:
                  self._items.append(item)

              def pop(self) -> int:
                  if self.is_empty():
                      raise IndexError("pop from empty stack")
                  return self._items.pop()

              def peek(self) -> int:
                  if self.is_empty():
                      raise IndexError("peek from empty stack")
                  return self._items[-1]

              def is_empty(self) -> bool:
                  return not self._items

              def size(self) -> int:
                  return len(self._items)

          stack = Stack()
          stack.push(3)
          stack.push(8)
          print(stack.peek(), stack.pop(), stack.size())
        `} output="8 8 1" />
        <SubSection title="Linked-list implementation">
          <P>A singly linked stack adds and removes at the head. It avoids array resizing and supports constant-time operations, but each node costs extra memory for a link and has poorer cache locality.</P>
          <CodeBlock title="linked_stack.py" code={`
            from dataclasses import dataclass

            @dataclass
            class Node:
                value: int
                next: "Node | None" = None

            class LinkedStack:
                def __init__(self):
                    self._top: Node | None = None
                    self._size = 0

                def push(self, value: int) -> None:
                    self._top = Node(value, self._top)
                    self._size += 1

                def pop(self) -> int:
                    if self._top is None:
                        raise IndexError("pop from empty stack")
                    value = self._top.value
                    self._top = self._top.next
                    self._size -= 1
                    return value

                def peek(self) -> int:
                    if self._top is None:
                        raise IndexError("peek from empty stack")
                    return self._top.value

                def is_empty(self) -> bool:
                    return self._top is None

                def size(self) -> int:
                    return self._size
          `} />
        </SubSection>
      </Section>

      <Section title="Classic Stack Applications">
        <SubSection title="Balanced parentheses">
          <P>Push each opening bracket. Every closing bracket must match the current top; at the end, the stack must be empty. This generalizes to validating nested tags and delimiters.</P>
          <CodeBlock code={`
            def valid_parentheses(text: str) -> bool:
                pairs = {")": "(", "]": "[", "}": "{"}
                stack: list[str] = []
                for char in text:
                    if char in "([{":
                        stack.append(char)
                    elif char in pairs:
                        if not stack or stack.pop() != pairs[char]:
                            return False
                return not stack

            print(valid_parentheses("{[()]()}"))
            print(valid_parentheses("([)]"))
          `} output={`True
False`} />
        </SubSection>
        <SubSection title="Reverse a string">
          <P>Push characters and pop them into a result, or use <C>text[::-1]</C> in ordinary Python. The explicit stack illustrates last-in, first-out order.</P>
          <CodeBlock code={`
            def reverse_text(text: str) -> str:
                stack = list(text)
                result = []
                while stack:
                    result.append(stack.pop())
                return "".join(result)
          `} />
        </SubSection>
        <SubSection title="Evaluate postfix (RPN)">
          <P>In reverse Polish notation, operators follow their operands. Pop the right operand first, then the left, so subtraction and division keep their order.</P>
          <CodeBlock code={`
            def eval_rpn(tokens: list[str]) -> int:
                stack: list[int] = []
                for token in tokens:
                    if token in {"+", "-", "*", "/"}:
                        right, left = stack.pop(), stack.pop()
                        if token == "+":
                            stack.append(left + right)
                        elif token == "-":
                            stack.append(left - right)
                        elif token == "*":
                            stack.append(left * right)
                        else:
                            stack.append(int(left / right))
                    else:
                        stack.append(int(token))
                if len(stack) != 1:
                    raise ValueError("malformed expression")
                return stack[0]

            print(eval_rpn(["4", "13", "5", "/", "+"]))
          `} output="6" />
        </SubSection>
        <SubSection title="Infix to postfix: shunting-yard">
          <P>Operators are held on a stack until their precedence allows them to be emitted. Parentheses delimit operator groups. This compact version handles integer operands and binary operators.</P>
          <CodeBlock code={`
            def to_postfix(tokens: list[str]) -> list[str]:
                precedence = {"+": 1, "-": 1, "*": 2, "/": 2, "^": 3}
                output: list[str] = []
                operators: list[str] = []
                for token in tokens:
                    if token.isalnum():
                        output.append(token)
                    elif token == "(":
                        operators.append(token)
                    elif token == ")":
                        while operators and operators[-1] != "(":
                            output.append(operators.pop())
                        if not operators:
                            raise ValueError("mismatched parentheses")
                        operators.pop()
                    else:
                        while (operators and operators[-1] != "(" and
                               (precedence[operators[-1]] > precedence[token] or
                                (precedence[operators[-1]] == precedence[token] and token != "^"))):
                            output.append(operators.pop())
                        operators.append(token)
                while operators:
                    if operators[-1] == "(":
                        raise ValueError("mismatched parentheses")
                    output.append(operators.pop())
                return output
          `} />
        </SubSection>
      </Section>

      <Section title="Stack Patterns and Uses">
        <SubSection title="Min stack">
          <P>Maintain a second stack of minimums. Push a value there when it is no larger than the current minimum; when it leaves the main stack, remove its matching minimum. Then <C>get_min</C> is <C>O(1)</C>.</P>
          <CodeBlock code={`
            class MinStack:
                def __init__(self):
                    self.values: list[int] = []
                    self.minimums: list[int] = []

                def push(self, value: int) -> None:
                    self.values.append(value)
                    if not self.minimums or value <= self.minimums[-1]:
                        self.minimums.append(value)

                def pop(self) -> int:
                    if not self.values:
                        raise IndexError("pop from empty stack")
                    value = self.values.pop()
                    if value == self.minimums[-1]:
                        self.minimums.pop()
                    return value

                def get_min(self) -> int:
                    if not self.minimums:
                        raise IndexError("minimum of empty stack")
                    return self.minimums[-1]
          `} />
        </SubSection>
        <SubSection title="Monotonic stack">
          <P>A <Strong>monotonic stack</Strong> keeps values (or indices) in increasing or decreasing order. When a new item breaks the invariant, pop entries whose answer has just been found. Each item is pushed and popped at most once.</P>
          <CodeBlock title="next greater element and daily temperatures" code={`
            def next_greater(nums: list[int]) -> list[int]:
                answer = [-1] * len(nums)
                stack: list[int] = []  # indices with decreasing values
                for i, value in enumerate(nums):
                    while stack and nums[stack[-1]] < value:
                        answer[stack.pop()] = value
                    stack.append(i)
                return answer

            def daily_temperatures(temps: list[int]) -> list[int]:
                wait = [0] * len(temps)
                stack: list[int] = []
                for day, temperature in enumerate(temps):
                    while stack and temps[stack[-1]] < temperature:
                        previous = stack.pop()
                        wait[previous] = day - previous
                    stack.append(day)
                return wait
          `} />
        </SubSection>
        <SubSection title="Largest rectangle in a histogram">
          <P>Maintain increasing bar heights. When a shorter bar arrives, each popped bar's maximal rectangle ends just before the current index; its left boundary is the new stack top.</P>
          <CodeBlock code={`
            def largest_rectangle(heights: list[int]) -> int:
                stack: list[int] = []
                best = 0
                for i in range(len(heights) + 1):
                    current = heights[i] if i < len(heights) else 0
                    while stack and heights[stack[-1]] > current:
                        height = heights[stack.pop()]
                        left = stack[-1] + 1 if stack else 0
                        best = max(best, height * (i - left))
                    stack.append(i)
                return best
          `} />
        </SubSection>
        <List items={[<>The <Strong>function call stack</Strong> stores active frames, local variables, and return locations; deep recursion can exceed its limit.</>, <>For <Strong>undo/redo</Strong>, one stack stores prior states and another stores states that can be redone.</>, <>Browser navigation can keep a back stack and a forward stack; visiting a new page usually clears forward history.</>]} />
      </Section>

      <Section title="Complexity and Pitfalls">
        <ComplexityTable rows={[
          { operation: <C>push(x)</C>, time: "O(1)", note: "Amortized for a Python list" },
          { operation: <C>pop()</C>, time: "O(1)", note: "At the top/end" },
          { operation: <C>peek(), size(), is_empty()</C>, time: "O(1)" },
          { operation: <C>parenthesis validation</C>, time: "O(n)", space: "O(n)" },
          { operation: <C>monotonic-stack scan</C>, time: "O(n)", space: "O(n)", note: "Each index pushed/popped once" },
        ]} />
        <Callout type="warning" title="Popping an empty stack">Calling <C>list.pop()</C> on an empty list raises <C>IndexError</C>. Check the stack first or deliberately let the error communicate invalid input. Also ensure every parser validates malformed expressions instead of trusting that operands are available.</Callout>
        <ProsCons pros={["Simple, compact interface", "Constant-time top operations", "Natural fit for nested or reversible work"]} cons={["Only the top is directly accessible", "Unbounded growth can consume memory", "Recursive algorithms may exhaust the call stack"]} />
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Valid Parentheses", difficulty: "Easy", hint: "Match each closer with the top opener." },
          { name: "Min Stack", difficulty: "Medium", hint: "Track a second stack of minima." },
          { name: "Evaluate Reverse Polish Notation", difficulty: "Medium", hint: "Pop right operand, then left." },
          { name: "Daily Temperatures", difficulty: "Medium", hint: "Use a decreasing stack of indices." },
          { name: "Next Greater Element", difficulty: "Medium", hint: "Resolve pending indices when a larger value arrives." },
          { name: "Largest Rectangle in Histogram", difficulty: "Hard", hint: "A popped bar gets its widest span at the first shorter bar." },
        ]} />
      </Section>
      <KeyTakeaways items={[
        <>A stack is a LIFO structure with <C>push</C>, <C>pop</C>, and <C>peek</C> at one end.</>,
        <>Python lists provide efficient stack operations when using their right-hand end.</>,
        <>Monotonic stacks turn many repeated scans into a single <C>O(n)</C> pass.</>,
        <>Always define behavior for empty pops and validate expression input.</>,
      ]} />
    </article>
  );
}