import {
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
} from "../../components/doc";

export default function Tries() {
  return (
    <article>
      <PageHeader
        eyebrow="Non-Linear Data Structures"
        title="Tries"
        description="A trie stores a set of strings by sharing their prefixes. It turns prefix lookup and dictionary-style operations into walks through characters rather than repeated whole-word comparisons."
        tags={["Prefix tree", "Autocomplete", "Word search", "O(length)"]}
      />

      <Section title="The Prefix-Tree Idea">
        <P>
          A <Strong>trie</Strong> (pronounced “try”) is a rooted tree where edges represent characters. Each path from the
          root spells a prefix, and a node marked <C>is_end</C> identifies a complete stored word. Words with a common
          prefix share the same initial path; the trie does not need to store a separate copy of each prefix.
        </P>
        <Diagram caption="The words to, tea, ten, and in share nodes wherever their prefixes overlap.">{`
                           root
                         /      \\
                       t          i
                       |          |
                       o*         n*
                      /  \\
                    e*     e
                          / \\
                         a*  n*

              * = a word ends at this node
        `}</Diagram>
        <P>
          A trie is especially useful when the query is about a prefix: finding all words starting with <C>te</C> takes
          time proportional to the prefix length plus the output size, not the size of the entire dictionary.
        </P>
      </Section>

      <Section title="TrieNode and Core Operations">
        <P>
          A dictionary of child nodes makes the alphabet flexible. The root represents the empty prefix. Insertion marks
          the terminal node; search must check both that the path exists and that it ends a word. <C>starts_with</C>
          only needs the path.
        </P>
        <CodeBlock title="trie.py" code={`
          class TrieNode:
              def __init__(self) -> None:
                  self.children: dict[str, TrieNode] = {}
                  self.is_end = False

          class Trie:
              def __init__(self) -> None:
                  self.root = TrieNode()

              def _node_for(self, prefix: str) -> TrieNode | None:
                  node = self.root
                  for char in prefix:
                      if char not in node.children:
                          return None
                      node = node.children[char]
                  return node

              def insert(self, word: str) -> None:
                  node = self.root
                  for char in word:
                      node = node.children.setdefault(char, TrieNode())
                  node.is_end = True

              def search(self, word: str) -> bool:
                  node = self._node_for(word)
                  return node is not None and node.is_end

              def starts_with(self, prefix: str) -> bool:
                  return self._node_for(prefix) is not None

              def delete(self, word: str) -> bool:
                  """Remove a word; prune nodes that no longer lead to a word."""
                  def remove(node: TrieNode, index: int) -> tuple[bool, bool]:
                      if index == len(word):
                          if not node.is_end:
                              return False, False
                          node.is_end = False
                          return True, not node.children

                      char = word[index]
                      child = node.children.get(char)
                      if child is None:
                          return False, False
                      deleted, prune_child = remove(child, index + 1)
                      if prune_child:
                          del node.children[char]
                      should_prune = not node.is_end and not node.children
                      return deleted, should_prune

                  deleted, _ = remove(self.root, 0)
                  return deleted

              def count_words_with_prefix(self, prefix: str) -> int:
                  start = self._node_for(prefix)
                  if start is None:
                      return 0
                  def count(node: TrieNode) -> int:
                      return int(node.is_end) + sum(count(child) for child in node.children.values())
                  return count(start)

              def autocomplete(self, prefix: str, limit: int | None = None) -> list[str]:
                  start = self._node_for(prefix)
                  if start is None:
                      return []
                  words: list[str] = []
                  def collect(node: TrieNode, path: str) -> None:
                      if limit is not None and len(words) >= limit:
                          return
                      if node.is_end:
                          words.append(path)
                      for char, child in sorted(node.children.items()):
                          collect(child, path + char)
                          if limit is not None and len(words) >= limit:
                              return
                  collect(start, prefix)
                  return words
        `} />
        <Callout type="warning" title="Empty strings and duplicate inserts">
          This implementation supports the empty string: it marks the root as terminal. Re-inserting a word is
          idempotent, and deletion returns <C>False</C> if that word was not present. Define these edge cases explicitly
          if your application has different semantics.
        </Callout>
      </Section>

      <Section title="Autocomplete and Variants">
        <SubSection title="Autocomplete by depth-first search">
          <P>
            First follow the prefix to its node, then DFS through descendants, collecting words at terminal nodes.
            Sorted child traversal makes the returned suggestions lexicographic. Its cost depends on the visited subtree
            and the number of returned characters; a result limit can stop the search early.
          </P>
        </SubSection>
        <SubSection title="Array-of-26 children">
          <P>
            For lowercase English letters only, replace the child dictionary with a list of 26 optional pointers and
            map a letter to <C>ord(char) - ord('a')</C>. This gives predictable constant-time child lookup, but uses
            more space for sparse nodes and requires validation or normalization of input characters.
          </P>
          <CodeBlock code={`
            class LowercaseNode:
                def __init__(self) -> None:
                    self.children: list[LowercaseNode | None] = [None] * 26
                    self.is_end = False

            index = ord("c") - ord("a")  # 2
          `} />
        </SubSection>
        <SubSection title="Compressed trie / radix tree">
          <P>
            A radix tree compresses chains of single-child nodes into one edge labeled with a string. It reduces node
            and pointer overhead, especially for long sparse keys; insertion and deletion must split or merge edge labels
            at partial-prefix boundaries.
          </P>
        </SubSection>
      </Section>

      <Section title="Classic String Problems">
        <SubSection title="Longest common prefix">
          <P>
            Insert all strings, then follow the only child while the current node is not terminal and has exactly one
            child. Stop at the first branch or complete word. Alternatively, compare characters across the input strings
            directly; that often has lower overhead for a one-off query.
          </P>
        </SubSection>
        <SubSection title="Replace words with dictionary roots">
          <P>
            For each sentence word, walk its characters and return as soon as a terminal node is encountered. Because
            traversal stops at the shortest root, work is bounded by the root length rather than the whole word.
          </P>
        </SubSection>
        <SubSection title="Word Search II: trie plus board backtracking">
          <P>
            Build a trie of target words, then DFS from each board cell. Each step follows only the trie child matching
            the board letter; when a terminal node is reached, record the word. Mark the current cell visited during
            recursion and restore it on return. Removing a found word (or clearing its terminal marker) avoids duplicates;
            prune exhausted trie branches to speed up later searches.
          </P>
          <CodeBlock title="word_search_sketch.py" code={`
            def search_from(r: int, c: int, node: TrieNode, path: str) -> None:
                if not (0 <= r < rows and 0 <= c < cols):
                    return
                char = board[r][c]
                if char == "#" or char not in node.children:
                    return
                child = node.children[char]
                word = path + char
                if child.is_end:
                    found.add(word)
                    child.is_end = False  # emit this word once
                board[r][c] = "#"
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    search_from(r + dr, c + dc, child, word)
                board[r][c] = char
          `} />
          <Callout type="note">
            A board cell cannot be reused within one path. The marker must always be restored, including when code is
            refactored to return early; a separate visited set is an alternative.
          </Callout>
        </SubSection>
      </Section>

      <Section title="Bitwise Trie for Maximum XOR">
        <P>
          A binary trie stores each integer as a fixed-width sequence of bits. To maximize <C>x XOR y</C>, greedily
          choose the opposite bit of <C>x</C> at each level when that branch exists. For non-negative integers up to
          <C>W</C> bits, building the trie and querying all values costs <C>O(nW)</C>.
        </P>
        <CodeBlock title="max_xor.py" code={`
          class BitNode:
              def __init__(self) -> None:
                  self.child: list[BitNode | None] = [None, None]

          def maximum_pair_xor(nums: list[int], width: int = 32) -> int:
              root = BitNode()
              for value in nums:
                  node = root
                  for bit_index in range(width - 1, -1, -1):
                      bit = (value >> bit_index) & 1
                      if node.child[bit] is None:
                          node.child[bit] = BitNode()
                      node = node.child[bit]

              best = 0
              for value in nums:
                  node = root
                  candidate = 0
                  for bit_index in range(width - 1, -1, -1):
                      bit = (value >> bit_index) & 1
                      preferred = 1 - bit
                      if node.child[preferred] is not None:
                          candidate |= 1 << bit_index
                          node = node.child[preferred]
                      else:
                          node = node.child[bit]
                  best = max(best, candidate)
              return best
        `} />
      </Section>

      <Section title="Complexity and When to Use a Trie">
        <ComplexityTable rows={[
          { operation: <C>insert(word)</C>, time: "O(L)", space: "O(L)", note: "L is word length; may add up to L nodes" },
          { operation: <C>search(word)</C>, time: "O(L)", space: "O(1)" },
          { operation: <C>starts_with(prefix)</C>, time: "O(L)", space: "O(1)" },
          { operation: <C>delete(word)</C>, time: "O(L)", space: "O(L)", note: "Recursive call stack" },
          { operation: <C>count prefix / autocomplete</C>, time: "O(P + S)", space: "O(S)", note: "P prefix length; S visited or output subtree size" },
        ]} />
        <P>
          Space is proportional to the total number of distinct prefixes, not merely the total number of characters;
          shared prefixes save nodes, while a dictionary child map has per-node overhead.
        </P>
        <ProsCons pros={["Prefix queries and autocomplete are direct", "Common prefixes share storage", "Operations depend on key length, not number of stored keys"]} cons={["Can use much more memory than a hash set", "Hash sets are usually simpler and faster for exact lookup only", "Alphabet and normalization rules need careful definition"]} />
        <Callout type="tip" title="Choose the index to match the query">
          Use a trie when prefix search, lexicographic traversal, or character-by-character pruning is central. For a
          collection used only for exact membership, Python's <C>set[str]</C> is usually smaller and simpler.
        </Callout>
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Implement Trie (Prefix Tree)", difficulty: "Medium", hint: "Distinguish a path from a complete word." },
          { name: "Design Add and Search Words Data Structure", difficulty: "Medium", hint: "Wildcard search branches over child nodes." },
          { name: "Word Search II", difficulty: "Hard", hint: "Share prefixes across searches with one trie." },
          { name: "Replace Words", difficulty: "Medium", hint: "Stop at the first terminal prefix." },
          { name: "Longest Word in Dictionary", difficulty: "Medium", hint: "Build only words whose immediate prefix is present." },
          { name: "Maximum XOR of Two Numbers", difficulty: "Medium", hint: "Prefer the opposite bit from most significant to least." },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>A trie shares prefixes in a tree; terminal markers distinguish words from mere prefixes.</>,
        <>Insertion, exact lookup, and prefix lookup take <C>O(L)</C> for a key of length <C>L</C>.</>,
        <>Autocomplete locates the prefix node, then enumerates terminal descendants with DFS.</>,
        <>Pruning during delete reclaims branches that no longer belong to any word.</>,
        <>Tries power multiword search, root replacement, and bitwise maximum-XOR queries.</>,
      ]} />
    </article>
  );
}