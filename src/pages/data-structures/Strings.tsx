import { Callout, C, CodeBlock, ComplexityTable, KeyTakeaways, List, P, PageHeader, Practice, Section, SubSection, Table } from "../../components/doc";

export default function Strings() {
  return (
    <article>
      <PageHeader eyebrow="Linear Data Structures" title="Strings" description="Treat text as an immutable sequence of Unicode code points, and learn the costs and patterns behind common string problems." tags={["Immutability", "Unicode", "Pattern matching"]} />
      <Section title="Strings are immutable sequences">
        <P>Python's <C>str</C> stores Unicode text and is immutable: indexing reads a character, but an update creates a new string. Indexing and length are constant-time in CPython's representation; iteration is linear in the number of code points. Unlike a byte array, a Python string element is not necessarily one encoded byte.</P>
        <CodeBlock code={`
            word = "code"
            print(word[0], word[-1], len(word))
            # word[0] = "C"  # TypeError: strings cannot be changed in place
            word = "C" + word[1:]  # creates another string
          `} output="c e 4" />
        <P>Positive indexing begins at zero; negative indexes count from the end. A slice <C>text[start:stop]</C> excludes stop and creates a new string with the selected characters.</P>
        <Callout type="note">Python string indexing counts Unicode code points, not user-perceived grapheme clusters. An emoji plus a combining mark can look like one symbol while containing multiple code points.</Callout>
      </Section>
      <Section title="Unicode and character values">
        <P>Python <C>str</C> represents Unicode text. <C>ord(ch)</C> returns a code point and <C>chr(number)</C> constructs the corresponding character. For ASCII-only tasks, a fixed 26-entry frequency array can be faster and smaller than a dictionary; validate the alphabet before mapping.</P>
        <CodeBlock code={`
            character = "A"
            code_point = ord(character)
            print(code_point, chr(code_point + 32))

            def lowercase_letter_index(ch: str) -> int:
                if not "a" <= ch <= "z":
                    raise ValueError("expected lowercase ASCII letter")
                return ord(ch) - ord("a")
          `} output="65 a" />
        <P>Encode explicitly when bytes are required, such as network or file formats. UTF-8 uses a variable number of bytes per character, so byte length and string length need not match.</P>
      </Section>
      <Section title="Building, splitting, and formatting">
        <P>Repeated concatenation creates successive immutable strings and may repeatedly copy prior characters. Gather pieces in a list and join once for linear total work. <C>split</C> and <C>join</C> are common building blocks.</P>
        <CodeBlock code={`
            words = ["data", "structures", "and", "algorithms"]
            sentence = " ".join(words)
            pieces: list[str] = []
            for value in range(4):
                pieces.append(str(value))
            joined = ",".join(pieces)
            print(sentence)
            print(joined)
          `} output={`data structures and algorithms
0,1,2,3`} />
        <P>F-strings are convenient for readable formatting. Format specifications can control alignment, width, precision, and numeric bases.</P>
        <CodeBlock code={`
            name = "Ada"
            ratio = 2 / 3
            print(f"{name:>8}: {ratio:.2f}")
            print(f"{255:#x}")
          `} output={`     Ada: 0.67
0xff`} />
      </Section>
      <Section title="Common string operations and costs">
        <ComplexityTable rows={[
          { operation: <C>len(text), text[i]</C>, time: "O(1)", note: "Length / code-point index" },
          { operation: <C>text[a:b]</C>, time: "O(k)", space: "O(k)", note: "Copies k selected code points" },
          { operation: <C>text + other</C>, time: "O(n + m)", space: "O(n + m)", note: "Builds a new string" },
          { operation: <C>text.split(sep)</C>, time: "O(n)", space: "O(n)", note: "Produces strings and a list" },
          { operation: <C>sep.join(parts)</C>, time: "O(total length)", space: "O(total length)", note: "Single efficient build" },
          { operation: <C>text.lower(), strip()</C>, time: "O(n)", space: "O(n)", note: "Returns normalized text" },
          { operation: <C>pattern in text</C>, time: "Input-dependent", note: "Substring-search implementation and data affect cost" },
        ]} />
        <Table headers={["Method", "Typical use"]} rows={[
          [<C>startswith / endswith</C>, "Test a prefix or suffix"], [<C>find / index</C>, "Locate a substring; index raises when missing"],
          [<C>replace</C>, "Create text with occurrences substituted"], [<C>isalpha / isdigit / isspace</C>, "Unicode-aware character classification"],
          [<C>partition</C>, "Split once around the first separator"],
        ]} />
      </Section>
      <Section title="Frequency, anagrams, and palindromes">
        <SubSection title="Count characters"><CodeBlock code={`
            from collections import Counter

            def frequencies(text: str) -> Counter[str]:
                return Counter(text)

            def lowercase_counts(text: str) -> list[int]:
                counts = [0] * 26
                for ch in text:
                    if not "a" <= ch <= "z":
                        raise ValueError("expected lowercase ASCII text")
                    counts[ord(ch) - ord("a")] += 1
                return counts
          `} /></SubSection>
        <SubSection title="Anagram check"><P>Two strings are anagrams when their character multisets match. Decide whether spaces, punctuation, and letter case should be normalized before comparing.</P><CodeBlock code={`
            from collections import Counter

            def are_anagrams(first: str, second: str) -> bool:
                return Counter(first) == Counter(second)

            print(are_anagrams("listen", "silent"))
          `} output="True" /></SubSection>
        <SubSection title="Palindrome checks"><P>A two-pointer scan avoids allocating a reversed copy. For normalized text, define normalization as part of the problem rather than assuming punctuation or case behavior.</P><CodeBlock code={`
def is_palindrome(text: str) -> bool:
    left, right = 0, len(text) - 1
    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1
    return True


def normalized_palindrome(text: str) -> bool:
    cleaned = "".join(ch.casefold() for ch in text if ch.isalnum())
    return cleaned == cleaned[::-1]
`} /></SubSection>
      </Section>
      <Section title="Classic string problems">
        <SubSection title="Reverse words"><P>To reverse word order while normalizing whitespace, split without an explicit separator and join the reversed words. This creates output storage proportional to text length.</P><CodeBlock code={`
def reverse_words(sentence: str) -> str:
    return " ".join(reversed(sentence.split()))

print(reverse_words("  learn   data structures  "))
`} output="structures data learn" /></SubSection>
        <SubSection title="Run-length compression"><CodeBlock code={`
def compress_runs(text: str) -> str:
    if not text:
        return ""
    parts: list[str] = []
    start = 0
    for index in range(1, len(text) + 1):
        if index == len(text) or text[index] != text[start]:
            parts.append(text[start] + str(index - start))
            start = index
    return "".join(parts)

print(compress_runs("aaabbc"))
`} output="a3b2c1" /><P>Whether compression is useful depends on the input and required output format. This simple encoding is not self-delimiting for arbitrary characters/count formats without additional rules.</P></SubSection>
        <SubSection title="Longest common prefix"><CodeBlock code={`
def longest_common_prefix(words: list[str]) -> str:
    if not words:
        return ""
    prefix = words[0]
    for word in words[1:]:
        while not word.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix

print(longest_common_prefix(["flower", "flow", "flight"]))
`} output="fl" /></SubSection>
        <SubSection title="Substring search"><P>The naive search checks each possible alignment and can take O(n·m) for text length n and pattern length m. Built-in containment is usually preferable unless the algorithm itself is the lesson.</P><CodeBlock code={`
def naive_find(text: str, pattern: str) -> int:
    if not pattern:
        return 0
    for start in range(len(text) - len(pattern) + 1):
        if text[start:start + len(pattern)] == pattern:
            return start
    return -1
`} /></SubSection>
      </Section>
      <Section title="Conversions, interning, and pattern matching">
        <List items={[
          <>Convert string to a list with <C>list(text)</C> when indexed mutation is needed; join it back with <C>''.join(chars)</C>.</>,
          <>Convert text to bytes with <C>text.encode('utf-8')</C>; decoding requires the matching encoding and valid data.</>,
          <>Python may intern some strings as an implementation optimization. Never rely on object identity (<C>is</C>) for value equality; use <C>==</C>.</>,
          <>Pattern matching asks whether text follows a structure. Prefix functions, KMP, Rabin–Karp, and tries are covered with string algorithms; choose based on one-off search, many queries, or streaming needs.</>,
        ]} />
        <Callout type="note" title="Related structure">A string of brackets is often validated with a stack because the most recent unmatched opening bracket must close first.</Callout>
      </Section>
      <Section title="Complexity, pitfalls, and practice">
        <List items={[
          <>Repeated <C>text += piece</C> can become quadratic; prefer <C>join</C>.</>, <>Slicing allocates a copy, so recursive slicing can add hidden time and memory.</>,
          <>A character is not always one byte or one displayed grapheme; clarify normalization and Unicode expectations.</>,
          <>Membership in a string searches for a substring, while membership in a list scans elements; their cost models differ.</>,
        ]} />
        <Practice problems={[
          { name: "Valid Palindrome", difficulty: "Easy", hint: "Normalize or use two pointers, per specification." },
          { name: "Valid Anagram", difficulty: "Easy", hint: "Compare frequencies." },
          { name: "Longest Common Prefix", difficulty: "Easy", hint: "Shrink a candidate prefix or scan columns." },
          { name: "String Compression", difficulty: "Medium", hint: "Track a run's start and length." },
          { name: "Find the Index of the First Occurrence", difficulty: "Easy", hint: "Compare naive search with built-in containment." },
        ]} />
        <KeyTakeaways items={[
          <>Python strings are immutable Unicode sequences; modifications build new values.</>, <>Use <C>join</C> to assemble many pieces efficiently.</>,
          <>Frequency maps and two pointers solve many counting and palindrome tasks.</>, <>Slicing and normalization create copies; include those costs in analysis.</>,
          <>Clarify case, punctuation, Unicode, and empty-pattern behavior before coding.</>,
        ]} />
      </Section>
    </article>
  );
}