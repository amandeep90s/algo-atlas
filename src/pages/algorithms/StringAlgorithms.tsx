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
  Section,
  Strong,
  SubSection,
  Table,
} from "../../components/doc";

export default function StringAlgorithms() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="String Algorithms"
        description="Search patterns, compare substrings, and discover repeated structure efficiently. Start with a clear baseline, then choose a matcher that fits the text size and workload."
        tags={["Pattern matching", "Hashing", "Prefix function", "Suffix arrays"]}
      />

      <Section title="Naive Pattern Matching">
        <P>Try aligning the pattern at every possible text position and compare characters until a mismatch. It is simple, allocation-free, and often adequate for short inputs.</P>
        <CodeBlock code={`
          def find_all_naive(text: str, pattern: str) -> list[int]:
              if not pattern:
                  return list(range(len(text) + 1))
              matches = []
              for start in range(len(text) - len(pattern) + 1):
                  if text[start:start + len(pattern)] == pattern:
                      matches.append(start)
              return matches
        `} />
        <ComplexityTable rows={[
          { operation: <C>Naive search</C>, time: "O(nm)", space: "O(1)", note: "n text length, m pattern length" },
        ]} />
        <P>Languages may optimize substring comparison internally, but the worst-case repeated work is still proportional to the number of alignments times the pattern length.</P>
      </Section>

      <Section title="KMP: Prefix Function and LPS Array">
        <P>Knuth–Morris–Pratt avoids rechecking text characters. The <Strong>LPS</Strong> value at pattern index <C>i</C> is the length of the longest proper prefix of <C>pattern[:i + 1]</C> that is also a suffix. On mismatch, shift the pattern using that prefix-suffix overlap.</P>
        <ArrayViz values={["A", "B", "A", "B", "A", "C"]} highlight={[2, 3, 4]} pointers={{ 4: "LPS = 3" }} caption="For ABABAC, the prefix ABA is also the suffix ABA of ABABA; KMP falls back to length 3 instead of restarting." />
        <CodeBlock title="KMP prefix function and search" code={`
          def prefix_function(pattern: str) -> list[int]:
              lps = [0] * len(pattern)
              length = 0
              i = 1
              while i < len(pattern):
                  if pattern[i] == pattern[length]:
                      length += 1
                      lps[i] = length
                      i += 1
                  elif length:
                      length = lps[length - 1]
                  else:
                      lps[i] = 0
                      i += 1
              return lps

          def kmp_search(text: str, pattern: str) -> list[int]:
              if not pattern:
                  return list(range(len(text) + 1))
              lps = prefix_function(pattern)
              matches = []
              i = j = 0
              while i < len(text):
                  if text[i] == pattern[j]:
                      i += 1
                      j += 1
                      if j == len(pattern):
                          matches.append(i - j)
                          j = lps[j - 1]
                  elif j:
                      j = lps[j - 1]
                  else:
                      i += 1
              return matches
        `} />
        <P>Why <C>O(n + m)</C>? Both pointers move forward; when the pattern pointer falls back, it follows precomputed LPS links, and each link decreases the matched prefix length. No text character is moved backward or compared an unbounded number of times.</P>
        <ComplexityTable rows={[
          { operation: <C>Build LPS</C>, time: "O(m)", space: "O(m)" },
          { operation: <C>KMP search</C>, time: "O(n + m)", space: "O(m)" },
        ]} />
      </Section>

      <Section title="Rabin–Karp Rolling Hash">
        <P>Hash the pattern and each text window. Sliding by one character updates the hash in constant arithmetic time: remove the outgoing character’s weighted contribution, multiply by the base, and add the incoming character.</P>
        <CodeBlock title="Rabin–Karp with modular rolling hash" code={`
          def rabin_karp(text: str, pattern: str) -> list[int]:
              n, m = len(text), len(pattern)
              if m == 0:
                  return list(range(n + 1))
              if m > n:
                  return []

              base = 256
              mod = 1_000_000_007
              highest = pow(base, m - 1, mod)
              pattern_hash = window_hash = 0
              for i in range(m):
                  pattern_hash = (pattern_hash * base + ord(pattern[i])) % mod
                  window_hash = (window_hash * base + ord(text[i])) % mod

              matches = []
              for start in range(n - m + 1):
                  if window_hash == pattern_hash and text[start:start + m] == pattern:
                      matches.append(start)  # verify: hashes can collide
                  if start < n - m:
                      outgoing = ord(text[start]) * highest
                      window_hash = (window_hash - outgoing) % mod
                      window_hash = (window_hash * base + ord(text[start + m])) % mod
              return matches
        `} />
        <Callout type="warning" title="A hash match is only a candidate">
          Modular hashes can collide. Verify equal windows when correctness must be deterministic, or use a second independent modulus to make accidental collisions much less likely. Hashing is probabilistic unless equality is checked.
        </Callout>
        <P>Rabin–Karp is handy for many patterns of equal length or plagiarism-like multi-window comparisons. With direct verification, adversarial collisions can degrade its worst case.</P>
      </Section>

      <Section title="Z-Algorithm and Boyer–Moore">
        <SubSection title="Z array">
          <P><C>Z[i]</C> is the length of the longest substring starting at <C>i</C> that matches a prefix of the whole string. Maintain the rightmost known matching window <C>[left, right]</C>; each position is extended at most once beyond the boundary.</P>
          <CodeBlock title="Z function and pattern search" code={`
            def z_function(text: str) -> list[int]:
                n = len(text)
                z = [0] * n
                left = right = 0
                for i in range(1, n):
                    if i <= right:
                        z[i] = min(right - i + 1, z[i - left])
                    while i + z[i] < n and text[z[i]] == text[i + z[i]]:
                        z[i] += 1
                    if i + z[i] - 1 > right:
                        left, right = i, i + z[i] - 1
                return z

            def z_search(text: str, pattern: str) -> list[int]:
                if not pattern:
                    return list(range(len(text) + 1))
                combined = pattern + "{" + text
                z = z_function(combined)
                return [i - len(pattern) - 1 for i in range(len(pattern) + 1, len(combined))
                        if z[i] >= len(pattern)]
          `} />
          <P>Choose a separator that cannot occur in either input (or use an explicit sentinel outside the alphabet).</P>
        </SubSection>
        <Diagram caption="The Z-box reuses a prefix match while it remains inside the known right boundary.">{`
          prefix:  a b a b a c
          text:    a b a b a b a b ...
                   [---------]
                   L         R
        `}</Diagram>
        <SubSection title="Boyer–Moore intuition">
          <P>Boyer–Moore compares from the pattern’s right edge. On mismatch, the bad-character rule skips until the mismatching text character aligns with its rightmost occurrence in the pattern; the good-suffix rule reuses a suffix that already matched. It is often very fast in practice on natural text, although careful variants are needed for a strict linear worst-case guarantee.</P>
        </SubSection>
      </Section>

      <Section title="Longest Palindromic Substring">
        <SubSection title="Expand around center">
          <P>Every palindrome has a center at a character (odd length) or between characters (even length). Expand both possibilities at every center.</P>
          <CodeBlock code={`
            def longest_palindrome_center(text: str) -> str:
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
        </SubSection>
        <SubSection title="Manacher’s algorithm">
          <P>Manacher’s algorithm reuses the reflected radius inside the current rightmost palindrome, extending only when necessary. It finds all palindrome radii in linear time. Insert separators between characters (and sentinels at the ends) to treat odd/even palindromes uniformly.</P>
          <CodeBlock title="Manacher with transformed string" code={`
            def longest_palindrome_manacher(text: str) -> str:
                transformed = "^#" + "#".join(text) + "#$"
                radius = [0] * len(transformed)
                center = right = 0
                for i in range(1, len(transformed) - 1):
                    mirror = 2 * center - i
                    if i < right:
                        radius[i] = min(right - i, radius[mirror])
                    while transformed[i + radius[i] + 1] == transformed[i - radius[i] - 1]:
                        radius[i] += 1
                    if i + radius[i] > right:
                        center, right = i, i + radius[i]
                best_center = max(range(len(radius)), key=radius.__getitem__)
                length = radius[best_center]
                start = (best_center - length) // 2
                return text[start:start + length]
          `} />
          <ComplexityTable rows={[
            { operation: <C>Center expansion</C>, time: "O(n²)", space: "O(1)" },
            { operation: <C>Manacher</C>, time: "O(n)", space: "O(n)" },
          ]} />
        </SubSection>
      </Section>

      <Section title="String Hashing and Repeated Substrings">
        <SubSection title="Prefix hashes for substring comparisons">
          <P>With a polynomial rolling hash, a substring hash can be extracted from two prefix hashes in constant time. The formula assumes arithmetic modulo a prime and a consistent character encoding.</P>
          <CodeBlock code={`
            class StringHash:
                def __init__(self, text: str, base: int = 911382323, mod: int = 1_000_000_007):
                    self.mod = mod
                    self.base = base % mod
                    self.prefix = [0]
                    self.power = [1]
                    for char in text:
                        self.prefix.append((self.prefix[-1] * self.base + ord(char)) % mod)
                        self.power.append(self.power[-1] * self.base % mod)

                def substring_hash(self, left: int, right: int) -> int:
                    """Hash text[left:right], with a half-open range."""
                    return (self.prefix[right] - self.prefix[left] * self.power[right - left]) % self.mod
          `} />
          <P>For a stronger collision bound, compare a pair of hashes using different primes, and directly compare candidate substrings when exact equality is required.</P>
        </SubSection>
        <SubSection title="Longest repeated substring idea">
          <P>For a fixed length <C>L</C>, hash every length-<C>L</C> window and detect duplicates. Then binary search the length: if some repeated substring exists at length <C>L</C>, one exists at every smaller length. A suffix array offers a deterministic route by taking the maximum adjacent LCP.</P>
          <CodeBlock code={`
            def longest_repeated_length(text: str) -> int:
                n = len(text)
                base, mod = 256, 1_000_000_007

                def repeated(length: int) -> bool:
                    if length == 0:
                        return True
                    power = pow(base, length, mod)
                    value = 0
                    seen: set[int] = set()
                    for i, char in enumerate(text):
                        value = (value * base + ord(char)) % mod
                        if i >= length:
                            value = (value - ord(text[i - length]) * power) % mod
                        if i + 1 >= length:
                            if value in seen:
                                return True  # probabilistic unless windows are verified
                            seen.add(value)
                    return False

                low, high = 0, n
                while low < high:
                    mid = (low + high + 1) // 2
                    if repeated(mid):
                        low = mid
                    else:
                        high = mid - 1
                return low
          `} />
          <Callout type="note">A production implementation should store a representative start index per hash and verify the actual window, handling collisions rather than treating them as true duplicates.</Callout>
        </SubSection>
      </Section>

      <Section title="Suffix Arrays, LCP, and Aho–Corasick">
        <SubSection title="Suffix array by rank doubling">
          <P>A suffix array is the starting indices of all suffixes in lexicographic order. Rank doubling sorts suffixes by pairs of ranks for the first <C>k</C> and next <C>k</C> characters, doubling <C>k</C> each round. This simple version is <C>O(n log² n)</C> because each round uses comparison sorting.</P>
          <CodeBlock code={`
            def suffix_array(text: str) -> list[int]:
                n = len(text)
                order = list(range(n))
                rank = [ord(char) for char in text]
                step = 1
                while step < n:
                    order.sort(key=lambda i: (rank[i], rank[i + step] if i + step < n else -1))
                    new_rank = [0] * n
                    for pos in range(1, n):
                        previous, current = order[pos - 1], order[pos]
                        previous_key = (rank[previous], rank[previous + step] if previous + step < n else -1)
                        current_key = (rank[current], rank[current + step] if current + step < n else -1)
                        new_rank[current] = new_rank[previous] + (previous_key != current_key)
                    rank = new_rank
                    step *= 2
                return order

            def lcp_array(text: str, order: list[int]) -> list[int]:
                n = len(text)
                position = [0] * n
                for rank, start in enumerate(order):
                    position[start] = rank
                lcp = [0] * n
                matched = 0
                for start in range(n):
                    rank = position[start]
                    if rank == 0:
                        continue
                    other = order[rank - 1]
                    while start + matched < n and other + matched < n and text[start + matched] == text[other + matched]:
                        matched += 1
                    lcp[rank] = matched
                    matched = max(0, matched - 1)
                return lcp
          `} />
          <P>The LCP array stores the longest common prefix between neighboring suffixes in sorted order. The maximum LCP is the longest repeated substring length.</P>
        </SubSection>
        <SubSection title="Aho–Corasick multi-pattern search">
          <P>Build a trie of all patterns, add failure links that point to the longest suffix which is also a trie prefix, and scan the text once. Each state can report all patterns ending there (including inherited outputs). It is a multi-pattern generalization of KMP, typically <C>O(total pattern length + text length + matches)</C>.</P>
        </SubSection>
        <SubSection title="Edit distance">
          <P>Levenshtein edit distance (insert, delete, replace) is a two-sequence dynamic program. See the <Strong>Dynamic Programming</Strong> page for the recurrence, table, and space-optimized Python implementation.</P>
        </SubSection>
      </Section>

      <Section title="Comparison and Complexity">
        <Table headers={["Algorithm", "Time", "Space", "Good fit"]} rows={[
          [<Strong>Naive</Strong>, "O(nm)", "O(1)", "Short patterns; simplest baseline"],
          [<Strong>KMP</Strong>, "O(n + m)", "O(m)", "One exact pattern, deterministic bound"],
          [<Strong>Rabin–Karp</Strong>, "Expected O(n + m)", "O(1)", "Rolling windows or many same-length patterns"],
          [<Strong>Z algorithm</Strong>, "O(n + m)", "O(n + m)", "Prefix matches and one-pattern search"],
          [<Strong>Boyer–Moore</Strong>, "Often sublinear average", "O(m + alphabet)", "Long patterns over natural-language text"],
          [<Strong>Manacher</Strong>, "O(n)", "O(n)", "Longest palindromic substring"],
          [<Strong>Suffix array</Strong>, "O(n log² n) here", "O(n)", "Many suffix / substring queries"],
          [<Strong>Aho–Corasick</Strong>, "O(text + patterns + matches)", "O(total patterns)", "Search many patterns together"],
        ]} />
        <ComplexityTable rows={[
          { operation: <C>Prefix function / Z</C>, time: "O(n)", space: "O(n)" },
          { operation: <C>Suffix array rank doubling</C>, time: "O(n log² n)", space: "O(n)" },
          { operation: <C>LCP array (Kasai)</C>, time: "O(n)", space: "O(n)" },
        ]} />
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Find the Index of the First Occurrence", difficulty: "Easy", hint: "Implement naive search, then KMP" },
          { name: "Repeated Substring Pattern", difficulty: "Easy", hint: "Use prefix-function structure" },
          { name: "Longest Palindromic Substring", difficulty: "Medium", hint: "Expand from odd and even centers" },
          { name: "Longest Duplicate Substring", difficulty: "Hard", hint: "Binary search length with rolling hash" },
          { name: "Shortest Palindrome", difficulty: "Hard", hint: "Use the prefix function on text + sentinel + reverse" },
          { name: "Longest Common Subsequence", difficulty: "Medium", hint: "Two-sequence DP; see DP page" },
          { name: "Multi-Search", difficulty: "Hard", hint: "Build Aho–Corasick failure links" },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>Naive matching is an excellent baseline; KMP guarantees <C>O(n + m)</C> by reusing prefix-suffix overlap.</>,
        <>Rabin–Karp updates a rolling hash quickly but must account for collisions.</>,
        <>The Z array measures prefix matches at every position; Manacher reuses palindrome radii.</>,
        <>Prefix hashes answer substring-hash queries in constant time after linear preprocessing.</>,
        <>Suffix arrays and Aho–Corasick pay off when many substring or pattern queries share the same text.</>,
      ]} />
    </article>
  );
}