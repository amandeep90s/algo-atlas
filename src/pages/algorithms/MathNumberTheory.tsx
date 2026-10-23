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
  Section,
  Steps,
  SubSection,
  Table,
} from "../../components/doc";

export default function MathNumberTheory() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="Math & Number Theory"
        description="Build reliable tools for divisibility, primes, modular arithmetic, counting, randomized selection, and geometric predicates."
        tags={["GCD & LCM", "Modular arithmetic", "Primes", "Combinatorics"]}
      />

      <Section title="Divisibility, GCD, and LCM">
        <P>An integer <C>a</C> divides <C>b</C> when <C>b = ka</C> for some integer <C>k</C>. The greatest common divisor is the largest positive integer dividing both. Euclid’s algorithm follows from <C>gcd(a, b) = gcd(b, a mod b)</C>.</P>
        <Diagram caption="Remainders shrink quickly until the final nonzero value is the gcd.">{`
             gcd(252, 105)
                  |
             gcd(105, 42)    252 = 2·105 + 42
                  |
              gcd(42, 21)    105 = 2·42 + 21
                  |
              gcd(21, 0) = 21
`}</Diagram>
        <CodeBlock title="Euclid, extended Euclid, and LCM" code={`
          from math import gcd

          def gcd_iterative(a: int, b: int) -> int:
              a, b = abs(a), abs(b)
              while b:
                  a, b = b, a % b
              return a

          def gcd_recursive(a: int, b: int) -> int:
              return abs(a) if b == 0 else gcd_recursive(b, a % b)

          def lcm(a: int, b: int) -> int:
              return 0 if a == 0 or b == 0 else abs(a // gcd(a, b) * b)

          def extended_gcd(a: int, b: int) -> tuple[int, int, int]:
              """Return (g, x, y) such that a*x + b*y == g == gcd(a, b)."""
              if b == 0:
                  return abs(a), (1 if a >= 0 else -1), 0
              g, x1, y1 = extended_gcd(b, a % b)
              return g, y1, x1 - (a // b) * y1
        `} />
        <P>Extended Euclid finds coefficients <C>x, y</C> with <C>ax + by = gcd(a,b)</C>. Those coefficients yield a modular inverse when the gcd is one.</P>
        <ComplexityTable rows={[
          { operation: <C>gcd(a, b)</C>, time: "O(log min(a,b))", space: "O(1) iterative" },
          { operation: <C>lcm(a, b)</C>, time: "O(log min(a,b))", note: "Uses gcd" },
          { operation: <C>Extended Euclid</C>, time: "O(log min(a,b))", space: "O(log n) recursive" },
        ]} />
      </Section>

      <Section title="Modular Arithmetic and Exponentiation">
        <P>For modulus <C>m &gt; 0</C>, reduce values to their remainders. Addition, subtraction, and multiplication preserve congruence, so reduce intermediate values to keep numbers small.</P>
        <Table headers={["Operation", "Rule modulo m"]} rows={[
          ["Addition", <C>(a + b) % m</C>],
          ["Subtraction", <><C>(a - b) % m</C> (normalize with <C>+ m</C> if needed)</>],
          ["Multiplication", <C>(a * b) % m</C>],
          ["Exponent", <><C>(a ** b) % m</C> (use modular exponentiation for large b)</>],
          ["Division", "Not generally defined; multiply by a modular inverse when it exists"],
        ]} />
        <SubSection title="Fast modular exponentiation">
          <P>Binary exponentiation processes the exponent’s bits, squaring the base after each bit. Python’s built-in three-argument <C>pow(a, b, m)</C> already does this efficiently.</P>
          <CodeBlock code={`
            def mod_pow(base: int, exponent: int, modulus: int) -> int:
                if modulus <= 0 or exponent < 0:
                    raise ValueError("modulus must be positive and exponent nonnegative")
                result = 1 % modulus
                base %= modulus
                while exponent:
                    if exponent & 1:
                        result = result * base % modulus
                    base = base * base % modulus
                    exponent >>= 1
                return result

            print(pow(2, 10, 1000))
            print(mod_pow(2, 10, 1000))
          `} />
          <P>Both produce <C>24</C>. Repeated squaring reduces the number of multiplications from linear in the exponent to logarithmic.</P>
        </SubSection>
        <SubSection title="Modular inverse">
          <P>An inverse <C>a⁻¹ mod m</C> satisfies <C>a · a⁻¹ ≡ 1 (mod m)</C>, and exists exactly when <C>gcd(a,m) = 1</C>. For prime <C>p</C>, Fermat’s little theorem gives <C>a⁻¹ ≡ a^(p-2) mod p</C>.</P>
          <CodeBlock code={`
            def inverse_fermat(a: int, prime: int) -> int:
                if a % prime == 0:
                    raise ValueError("inverse does not exist")
                return pow(a, prime - 2, prime)

            # Python 3.8+: negative exponent asks for a modular inverse.
            inverse = pow(3, -1, 11)  # 4, because 3 * 4 == 1 (mod 11)

            def inverse_extended(a: int, modulus: int) -> int:
                g, x, _ = extended_gcd(a, modulus)
                if g != 1:
                    raise ValueError("inverse does not exist")
                return x % modulus
          `} />
          <Callout type="warning">Fermat’s formula requires a prime modulus and a nonzero residue. For a composite modulus, use extended Euclid and require coprimality.</Callout>
        </SubSection>
      </Section>

      <Section title="Primality, Sieves, and Factorization">
        <SubSection title="Trial division">
          <P>If <C>n</C> is composite, it has a factor no larger than <C>√n</C>. Test 2, then odd candidates only.</P>
          <CodeBlock code={`
            def is_prime(n: int) -> bool:
                if n < 2:
                    return False
                if n % 2 == 0:
                    return n == 2
                divisor = 3
                while divisor * divisor <= n:
                    if n % divisor == 0:
                        return False
                    divisor += 2
                return True
          `} />
        </SubSection>
        <SubSection title="Sieve of Eratosthenes">
          <P>Mark multiples of each prime starting at its square; smaller multiples already have a smaller prime factor.</P>
          <CodeBlock code={`
            def primes_up_to(limit: int) -> list[int]:
                if limit < 2:
                    return []
                prime = bytearray(b"\\x01") * (limit + 1)
                prime[0:2] = b"\\x00\\x00"
                for value in range(2, int(limit ** 0.5) + 1):
                    if prime[value]:
                        start = value * value
                        count = (limit - start) // value + 1
                        prime[start:limit + 1:value] = b"\\x00" * count
                return [value for value in range(limit + 1) if prime[value]]
          `} />
        </SubSection>
        <SubSection title="Smallest prime factor sieve and factorization">
          <P>Store the smallest prime factor (SPF) for every value. Factoring a number then takes one division per prime factor, with repetition.</P>
          <CodeBlock code={`
            def smallest_prime_factors(limit: int) -> list[int]:
                spf = list(range(limit + 1))
                if limit >= 1:
                    spf[1] = 1
                for p in range(2, int(limit ** 0.5) + 1):
                    if spf[p] == p:
                        for multiple in range(p * p, limit + 1, p):
                            if spf[multiple] == multiple:
                                spf[multiple] = p
                return spf

            def factorize(value: int, spf: list[int]) -> dict[int, int]:
                factors: dict[int, int] = {}
                while value > 1:
                    prime = spf[value]
                    factors[prime] = factors.get(prime, 0) + 1
                    value //= prime
                return factors
          `} />
        </SubSection>
        <ComplexityTable rows={[
          { operation: <C>Trial primality</C>, time: "O(√n)", space: "O(1)" },
          { operation: <C>Sieve up to N</C>, time: "O(N log log N)", space: "O(N)" },
          { operation: <C>SPF sieve</C>, time: "O(N log log N)", space: "O(N)" },
          { operation: <C>Factor using SPF</C>, time: "O(log n)", note: "Number of prime factors with multiplicity" },
        ]} />
      </Section>

      <Section title="Divisors, Totient, and Combinatorics">
        <SubSection title="Counting divisors and Euler’s totient">
          <P>From prime factorization <C>n = ∏ pᵢ^eᵢ</C>, the divisor count is <C>∏(eᵢ + 1)</C>. Euler’s totient counts integers from 1 through n coprime to n: <C>φ(n) = n ∏(1 - 1/p)</C> over distinct prime factors.</P>
          <CodeBlock code={`
            def divisor_count(n: int) -> int:
                count = 0
                d = 1
                while d * d <= n:
                    if n % d == 0:
                        count += 1 if d * d == n else 2
                    d += 1
                return count

            def euler_phi(n: int) -> int:
                result = n
                p = 2
                while p * p <= n:
                    if n % p == 0:
                        while n % p == 0:
                            n //= p
                        result -= result // p
                    p += 1
                if n > 1:
                    result -= result // n
                return result
          `} />
        </SubSection>
        <SubSection title="nCr: built-in, Pascal, and modulo prime">
          <P>Python’s <C>math.comb(n, r)</C> computes the exact binomial coefficient. Pascal’s identity is useful when building many coefficients; factorials and modular inverses handle many queries modulo a prime.</P>
          <CodeBlock code={`
            from math import comb

            exact = comb(10, 3)

            def pascal_row(n: int) -> list[int]:
                row = [1]
                for _ in range(n):
                    row = [1] + [row[i] + row[i + 1] for i in range(len(row) - 1)] + [1]
                return row

            def factorial_tables(n: int, prime: int) -> tuple[list[int], list[int]]:
                fact = [1] * (n + 1)
                for i in range(1, n + 1):
                    fact[i] = fact[i - 1] * i % prime
                inverse_fact = [1] * (n + 1)
                inverse_fact[n] = pow(fact[n], prime - 2, prime)
                for i in range(n, 0, -1):
                    inverse_fact[i - 1] = inverse_fact[i] * i % prime
                return fact, inverse_fact

            def n_choose_r_mod(n: int, r: int, prime: int, fact: list[int], inverse_fact: list[int]) -> int:
                if r < 0 or r > n:
                    return 0
                return fact[n] * inverse_fact[r] % prime * inverse_fact[n - r] % prime
          `} />
          <Callout type="note">The factorial/inverse-factorial method assumes a prime modulus and typically requires <C>n &lt; prime</C>. Larger ranges or composite moduli need other techniques.</Callout>
        </SubSection>
        <SubSection title="Catalan numbers">
          <P>Catalan numbers count balanced parenthesis strings, binary tree shapes, and other recursively split structures. <C>Cₙ = comb(2n,n)/(n+1)</C>.</P>
          <CodeBlock code={`
            from math import comb

            def catalan(n: int) -> int:
                return comb(2 * n, n) // (n + 1)

            def catalan_mod(n: int, prime: int) -> int:
                # Valid when the required modular inverses exist (for example 2n < prime).
                return comb(2 * n, n) % prime * pow(n + 1, -1, prime) % prime
          `} />
        </SubSection>
      </Section>

      <Section title="Fast Fibonacci and Integer Size">
        <P>Matrix exponentiation raises <C>[[1,1],[1,0]]</C> to power n; its top-right value is Fibonacci number Fₙ. Repeated squaring takes logarithmically many matrix multiplications.</P>
        <CodeBlock title="2×2 matrix exponentiation" code={`
          def fibonacci(n: int, mod: int | None = None) -> int:
              def multiply(a: tuple[tuple[int, int], tuple[int, int]],
                           b: tuple[tuple[int, int], tuple[int, int]]):
                  values = (
                      (a[0][0] * b[0][0] + a[0][1] * b[1][0],
                       a[0][0] * b[0][1] + a[0][1] * b[1][1]),
                      (a[1][0] * b[0][0] + a[1][1] * b[1][0],
                       a[1][0] * b[0][1] + a[1][1] * b[1][1]),
                  )
                  if mod is not None:
                      return tuple(tuple(value % mod for value in row) for row in values)
                  return values

              result = ((1, 0), (0, 1))
              base = ((1, 1), (1, 0))
              while n:
                  if n & 1:
                      result = multiply(result, base)
                  base = multiply(base, base)
                  n >>= 1
              return result[0][1]
        `} />
        <P>Python integers do not overflow, but their arithmetic cost grows with operand size. Programming contests often ask for answers modulo <C>10⁹ + 7</C> to bound output size and keep arithmetic manageable.</P>
        <ComplexityTable rows={[
          { operation: <C>Matrix Fibonacci</C>, time: "O(log n)", space: "O(1)", note: "Fixed-size matrices; big-integer cost grows" },
          { operation: <C>Exact comb(n, r)</C>, time: "Input dependent", note: "Output can have Θ(n) digits" },
        ]} />
      </Section>

      <Section title="Randomized Algorithms and Geometry">
        <SubSection title="Reservoir sampling">
          <P>Select one item uniformly from a stream of unknown length. When the ith item arrives, replace the selected item with probability <C>1/i</C>.</P>
          <CodeBlock code={`
            import random
            from collections.abc import Iterable

            def reservoir_sample(items: Iterable[int]) -> int:
                chosen = None
                for count, item in enumerate(items, start=1):
                    if random.randrange(count) == 0:
                        chosen = item
                if chosen is None:
                    raise ValueError("cannot sample an empty stream")
                return chosen
          `} />
        </SubSection>
        <SubSection title="Fisher–Yates shuffle">
          <P>Walk backward and swap each position with a uniformly chosen position among the still-unshuffled prefix. This produces a uniform permutation in linear time.</P>
          <CodeBlock code={`
            import random

            def fisher_yates(values: list[int]) -> None:
                for i in range(len(values) - 1, 0, -1):
                    j = random.randrange(i + 1)
                    values[i], values[j] = values[j], values[i]
          `} />
        </SubSection>
        <SubSection title="2D cross product and orientation">
          <P>For points A, B, C, the signed cross product <C>(B-A) × (C-A)</C> is positive for a counterclockwise turn, negative for clockwise, and zero for collinear points.</P>
          <CodeBlock code={`
            def orientation(a: tuple[int, int], b: tuple[int, int], c: tuple[int, int]) -> int:
                cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
                return (cross > 0) - (cross < 0)
          `} />
          <Callout type="warning">Floating-point geometry needs an epsilon policy; exact integer coordinates can use the integer cross product directly without precision loss.</Callout>
        </SubSection>
      </Section>

      <Section title="Complexity Guide and Practice">
        <Table headers={["Technique", "Time", "Typical use"]} rows={[
          ["Euclid gcd", "O(log n)", "Simplifying ratios, coprimality, inverses"],
          ["Trial division", "O(√n)", "One primality test or factorization"],
          ["Sieve", "O(N log log N)", "Many prime queries up to a bound"],
          ["Fast modular power", "O(log exponent)", "Large exponents under a modulus"],
          ["Factorial nCr tables", "O(N) precompute, O(1) query", "Many binomial queries modulo prime"],
          ["Matrix Fibonacci", "O(log n)", "Very large Fibonacci index"],
          ["Reservoir sample", "O(n) time, O(1) space", "Uniform sample from a stream"],
          ["Fisher–Yates", "O(n)", "Uniform in-place shuffle"],
        ]} />
        <Steps steps={[
          { title: "Check assumptions", body: <>Confirm sign, bounds, primality of modulus, and whether inverse/division is valid.</> },
          { title: "Pick the right preprocessing", body: <>One query can use trial division; many bounded queries favor a sieve or SPF table.</> },
          { title: "Control arithmetic", body: <>Reduce modulo m during multiplication, or use Python big integers when exact output is needed.</> },
        ]} />
        <Practice problems={[
          { name: "Greatest Common Divisor", difficulty: "Easy", hint: "Apply Euclid’s remainder identity" },
          { name: "Count Primes", difficulty: "Medium", hint: "Sieve from each prime’s square" },
          { name: "Pow(x, n)", difficulty: "Medium", hint: "Binary exponentiation" },
          { name: "N Choose K", difficulty: "Medium", hint: "Use Pascal or factorial inverses depending on query count" },
          { name: "Factorization Queries", difficulty: "Medium", hint: "Precompute smallest prime factors" },
          { name: "Random Pick Index", difficulty: "Medium", hint: "Reservoir sampling handles a stream" },
          { name: "Convex Hull Orientation", difficulty: "Medium", hint: "Sign of the 2D cross product" },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>Euclid’s algorithm computes gcd in logarithmic time; LCM can safely divide by gcd before multiplying.</>,
        <>Use Python’s three-argument <C>pow(base, exp, mod)</C> for modular exponentiation.</>,
        <>An inverse exists only for coprime values; Fermat’s inverse shortcut requires prime modulus.</>,
        <>Sieve for many prime queries, SPF for repeated factorization, and trial division for one small input.</>,
        <>Python integers do not overflow, but modulo arithmetic is a common output and efficiency convention.</>,
        <>Reservoir sampling and Fisher–Yates give uniform random choices with linear total work.</>,
      ]} />
    </article>
  );
}