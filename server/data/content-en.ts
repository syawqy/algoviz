// English translations of the problem corpus, keyed by slug. Indonesian is the
// source language, so any slug missing here falls back to the stored Indonesian
// text rather than disappearing: a partially translated corpus still renders.
//
// Solution code is intentionally NOT translated. It is Python source, and
// identifiers like `kiri`/`kanan` are the algorithm's vocabulary; translating
// them would make the snippets disagree with every other Python solution a
// learner will meet.

export interface ProblemTranslation {
  title: string;
  statement: string;
  hint: string;
  walkthrough: string;
  // Optional: only problems whose code or complexity notation embeds Indonesian
  // identifiers need these. Most solutions are language-neutral already.
  solution?: string;
  time_complexity?: string;
  space_complexity?: string;
}

export const PROBLEM_EN: Record<string, ProblemTranslation> = {
  'two-sum-ii': {
    title: 'Two Sum II (Sorted Array)',
    statement:
      'Given an array of integers already sorted in ascending order and a target. Return the indices of the two numbers whose sum equals the target. Each input has exactly one solution and no element may be used twice.',
    hint: 'Because the array is sorted, the smallest sum is on the left and the largest on the right. How can that discard half the candidates?',
    walkthrough:
      'Start with left at index 0 and right at the last index. Add them together. If the sum is too small, the only way to increase it is to move left to the right, since right already holds the largest value. If the sum is too large, move right to the left. Each step discards one candidate for certain, so the total number of steps is at most the length of the array.',
    solution: `def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return [left, right]
        if total < target:
            left += 1
        else:
            right -= 1
    return []`,
  },
  'valid-palindrome': {
    title: 'Valid Palindrome',
    statement:
      'Given a string. Check whether it is a palindrome, considering only letters and digits and ignoring differences between upper and lower case.',
    hint: 'Compare characters from both ends. Which characters may be skipped when you meet them?',
    walkthrough:
      'Place two pointers at the ends of the string. Skip characters that are not letters or digits, then compare. If they differ, the string is not a palindrome. If the two pointers meet or cross, every pair has matched and the string is a palindrome. Each character is examined at most once.',
    solution: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True`,
  },
  'container-with-most-water': {
    title: 'Container With Most Water',
    statement:
      'Given an array of heights, where each element is the height of a wall at that position. Choose two walls that together with the base form the largest water container. Return the maximum volume.',
    hint: 'The volume is limited by the shorter wall. If we move the taller wall, can the volume grow?',
    walkthrough:
      'Start from both ends, because that gives the widest base. Volume is base times the shortest wall. At each step, move the shorter wall inward. The base always shrinks, so the only hope of increasing the volume is to find a taller wall. For that reason each step is safe to discard and a single pass suffices.',
    solution: `def max_area(heights):
    left, right = 0, len(heights) - 1
    best = 0
    while left < right:
        height = min(heights[left], heights[right])
        best = max(best, height * (right - left))
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    return best`,
  },
  'longest-substring-no-repeat': {
    title: 'Longest Substring Without Repeating Characters',
    statement: 'Given a string. Find the length of the longest substring that contains no repeated characters.',
    hint: 'When you meet a character already inside the window, what must happen to the left boundary?',
    walkthrough:
      'Widen the window to the right by one character each step. If that character is already inside the window, move the left boundary to just past its previous occurrence, because any window containing a duplicate is invalid. Record the largest window length seen. Each index enters and leaves the window once, so the total work is linear.',
    solution: `def longest_unique_substring(s):
    last_seen = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best`,
  },
  'maximum-average-subarray': {
    title: 'Maximum Average Subarray',
    statement:
      'Given an array of integers and a number k. Find the contiguous subarray of exactly length k with the largest average, and return that average.',
    hint: 'When the window shifts by one step, do you need to re-add everything inside it?',
    walkthrough:
      'Compute the sum of the first window of length k. For each shift, add the element entering and subtract the element leaving. Because the window length is fixed, the maximum sum immediately gives the maximum average. The total number of additions is linear, not quadratic.',
    solution: `def max_average(nums, k):
    total = sum(nums[:k])
    best = total / k
    for i in range(k, len(nums)):
        total += nums[i] - nums[i - k]
        best = max(best, total / k)
    return best`,
  },
  'two-sum': {
    title: 'Two Sum',
    statement:
      'Given an array of integers and a target. Return the indices of the two numbers whose sum equals the target. Each input has exactly one solution and no element may be used twice.',
    hint: 'For each number, its partner can already be computed. What needs to be remembered from earlier steps?',
    walkthrough:
      'Because the array is not sorted, two pointers do not apply. Instead, for each number x we need to know whether target minus x has appeared before. Store every number already passed along with its index in a hash map, then look up the partner in constant time. One pass is enough because the pair is always found when its second element is read.',
    solution: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []`,
  },
  'contains-duplicate': {
    title: 'Contains Duplicate',
    statement:
      'Given an array of integers. Return true if any value appears more than once, and false if every value is unique.',
    hint: 'How much history of values must be kept before the answer is certain?',
    walkthrough:
      'It suffices to record every value already seen in a set. When reading a value, first check whether it is already in the set. If it is, the answer is immediately true and the rest of the array need not be read. If the whole array is read without a repeat, the answer is false. No re-scanning is needed, so the time stays linear.',
    solution: `def has_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
  },
  'group-anagrams': {
    title: 'Group Anagrams',
    statement:
      'Given a list of strings. Group the strings that are anagrams of one another. Anagrams are words with the same letters in a different order.',
    hint: 'Two anagrams look identical once their letters are sorted. What can serve as the grouping key?',
    walkthrough:
      'Two words are anagrams if and only if the same letters appear with the same frequencies. Therefore, sort the letters of each word into a stable key, then place that word in the group for that key. Each word is processed once, so the time follows the total number of characters.',
    solution: `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        key = ''.join(sorted(word))
        groups[key].append(word)
    return list(groups.values())`,
  },
  'binary-search-classic': {
    title: 'Classic Binary Search',
    statement:
      'Given an array of integers sorted in ascending order and a target. If the target is found, return its index. If not, return negative one.',
    hint: 'After checking the midpoint, which part of the array certainly does not contain the target?',
    walkthrough:
      'Compare the target with the midpoint value. If they are equal, the target is found. If the target is larger, everything to the left including the midpoint is certainly too small, so the search space becomes the right half. If the target is smaller, the reverse applies. The search space halves each step, so at most a logarithmic number of steps relative to the element count is performed.',
    solution: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  },
  'search-rotated': {
    title: 'Search in Rotated Sorted Array',
    statement:
      'A sorted array has been rotated at an unknown point. Given a target, return its index or negative one if it is not found.',
    hint: 'After rotation, at least one of the two halves is always sorted. How do you check that quickly?',
    walkthrough:
      'Compare the leftmost value with the midpoint value. If the left is not greater than the midpoint, the left half is sorted, so the target can easily be tested for lying inside that range or not. If it is not sorted, then the right half is the sorted one and the same test is applied there. Each step still discards half the search space, so it remains logarithmic.',
    solution: `def search_rotated(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1`,
  },
  'climbing-stairs': {
    title: 'Climbing Stairs',
    statement:
      'A staircase has n steps. Each move can cover one or two steps. How many distinct ways are there to reach the top?',
    hint: 'To reach step n, from which steps are you able to move?',
    walkthrough:
      'The number of ways to reach step n is the sum of the ways to reach step n-1 and step n-2, because the final move can only be one or two steps. This recursion produces the same values repeatedly, so subproblem results are stored in an array. The computation runs bottom-up, and since only the last two values are needed, the space can be compacted to constant.',
  },
  'house-robber': {
    title: 'House Robber',
    statement:
      'Given an array of the amount of money in each house in a row. The robber may not rob two adjacent houses because the alarm would sound. Compute the maximum amount that can be taken.',
    hint: 'At each house there are two choices: take this house or skip it. How do you express both as two states?',
    walkthrough:
      'For each house, compute two values: the best total if that house is taken, and the best total if it is not. If the house is taken, the previous house must be skipped. If it is not taken, the best total so far still applies. The two values are updated in order, so only two variables are needed. Each house is processed once.',
    solution: `def rob(nums):
    take, skip = 0, 0
    for x in nums:
        take, skip = skip + x, max(skip, take)
    return max(take, skip)`,
  },
  'number-of-islands': {
    title: 'Number of Islands',
    statement:
      'Given a two-dimensional grid of ones for land and zeros for water. An island is a group of land connected horizontally or vertically. Count the islands.',
    hint: 'Each time you find land you have not visited, how many new islands does that reveal?',
    walkthrough:
      'Scan every cell of the grid. When you find land you have not visited, increment the island counter, then traverse all the connected land by any means, whether using a queue for layer-by-layer traversal or a stack for depth-first traversal. Every visited cell is marked so it is not counted twice. The total work follows the number of cells.',
    solution: `from collections import deque

def count_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    total = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                total += 1
                grid[r][c] = '0'
                queue = deque([(r, c)])
                while queue:
                    cr, cc = queue.popleft()
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':
                            grid[nr][nc] = '0'
                            queue.append((nr, nc))
    return total`,
    time_complexity: 'O(rows * cols)',
    space_complexity: 'O(rows * cols)',
  },
  'shortest-path-grid': {
    title: 'Shortest Path in a Grid',
    statement:
      'Given a grid of empty cells and obstacles, plus a start point and a destination. Find the fewest number of moves to get from start to destination using four-directional movement, or return negative one if no path exists.',
    hint: 'Which traversal strategy guarantees the shortest distance is found first?',
    walkthrough:
      'Layer-by-layer traversal visits all cells one move away, then two moves away, and so on. Therefore the destination cell reached first is certainly reached by the shortest path. Store each cell distance together with its position in the queue, and mark cells already entered so they are not processed again.',
    solution: `from collections import deque

def shortest_path(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    queue = deque([(start[0], start[1], 0)])
    seen = {tuple(start)}
    while queue:
        r, c, dist = queue.popleft()
        if [r, c] == list(goal):
            return dist
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc, dist + 1))
    return -1`,
    time_complexity: 'O(rows * cols)',
    space_complexity: 'O(rows * cols)',
  },
  'valid-parentheses': {
    title: 'Valid Parentheses',
    statement:
      'Given a string containing only bracket characters. Determine whether it is valid, that is, every opening bracket is closed by a bracket of the same type and in the correct order.',
    hint: 'A closing bracket must pair with the most recent unclosed opening bracket. Which data structure fits?',
    walkthrough:
      'When reading an opening bracket, push it onto the stack. When reading a closing bracket, the stack must contain a matching partner on top, and that partner is then removed. If the stack is empty when a closing bracket appears, or the type does not match, the string is immediately invalid. At the end of the scan, the stack must be empty. Each character is processed once.',
  },
  'daily-temperatures': {
    title: 'Daily Temperatures',
    statement:
      'Given a list of daily temperatures. For each day, compute how many days until a warmer temperature appears. If none exists, fill in zero.',
    hint: 'Keep the days that have not yet found a warmer temperature. When can a day be resolved?',
    walkthrough:
      'Scan temperatures from left to right and keep the indices of days still waiting on the stack, with temperatures decreasing from bottom to top. When today is warmer than the temperature at the top index, that day has found its answer, namely the index difference. Pop and repeat while the condition still holds, then push today. Each index enters and leaves the stack once, so the total work is linear.',
    solution: `def daily_temperatures(temps):
    result = [0] * len(temps)
    stack = []
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result`,
  },
  'merge-intervals': {
    title: 'Merge Intervals',
    statement:
      'Given a list of intervals. Merge all intervals that overlap and return the list of non-overlapping intervals.',
    hint: 'If the list is sorted by start point, when do two intervals certainly overlap?',
    walkthrough:
      'Sort the intervals by start point. After that, overlapping intervals are always adjacent, so a single pass suffices. Compare the start of the next interval with the end of the last merged interval. If it does not exceed it, the two overlap and the end is extended if needed. If it exceeds it, a new interval begins. The sorting dominates the running time.',
  },
  'meeting-rooms': {
    title: 'Minimum Meeting Rooms',
    statement:
      'Given a list of meeting schedules with start and end times. Compute the fewest rooms needed for all meetings to take place.',
    hint: 'A room can only be reused once the previous meeting has ended. When may a room be freed?',
    walkthrough:
      'Sort the start times and end times separately, then run two pointers. When the next start time is smaller than the earliest end time still active, a new room is needed. Otherwise, the room that ends earliest can be reused immediately. The maximum counter during the process is the answer. Sorting dominates the running time.',
    solution: `def min_rooms(schedule):
    starts = sorted(s[0] for s in schedule)
    ends = sorted(s[1] for s in schedule)
    i = j = 0
    rooms = best = 0
    while i < len(schedule):
        if starts[i] < ends[j]:
            rooms += 1
            best = max(best, rooms)
            i += 1
        else:
            rooms -= 1
            j += 1
    return best`,
  },
  'min-window-substring': {
    title: 'Minimum Window Substring',
    statement:
      'Given a source string and a target string. Find the shortest slice of the source that contains all characters of the target with their occurrence counts. If none exists, return an empty string.',
    hint: 'The window is valid once every requirement is met. Once it is valid, what is the point of moving the left boundary?',
    walkthrough:
      'Widen the right boundary while tracking each character requirement. When every requirement is met, the window is declared valid. While it remains valid, record its length if shorter than the best so far, then move the left boundary to look for a tighter window. This repeats until the right boundary reaches the end of the string. Each character enters and leaves the window once.',
    solution: `from collections import Counter

def min_window(source, target):
    need = Counter(target)
    missing = len(target)
    left = best_left = 0
    best_len = len(source) + 1
    for right, ch in enumerate(source):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_left = left
            if need[source[left]] == 0:
                missing += 1
            need[source[left]] += 1
            left += 1
    if best_len > len(source):
        return ''
    return source[best_left:best_left + best_len]`,
  },
  'coin-change': {
    title: 'Coin Change',
    statement:
      'Given a list of coin values and an amount of money. Return the fewest coins needed to form that amount, or negative one if it is impossible.',
    hint: 'For each amount, the last coin used could come from any coin value. What is the best previous value?',
    walkthrough:
      'Build a table where each cell states the minimum number of coins to form that amount. For each amount from one up to the target, try every coin value as the last coin, then take the best value from the remaining amount. The initial value is filled with an infinity marker so impossible combinations are not treated as valid. The answer sits in the last cell.',
    // The stored solution and complexity notation use Indonesian identifiers
    // (koin, jumlah, nilai, tabel), so they are translated here as well.
    solution: `def min_coins(coins, amount):
    IMPOSSIBLE = float('inf')
    table = [0] + [IMPOSSIBLE] * amount
    for value in range(1, amount + 1):
        for c in coins:
            if c <= value and table[value - c] + 1 < table[value]:
                table[value] = table[value - c] + 1
    return -1 if table[amount] == IMPOSSIBLE else table[amount]`,
    time_complexity: 'O(amount * len(coins))',
    space_complexity: 'O(amount)',
  },
};

export interface PatternTranslation {
  name: string;
  blurb: string;
  recognition: string;
  complexity: string;
}

export const PATTERN_EN: Record<string, PatternTranslation> = {
  'two-pointer': {
    name: 'Two Pointer',
    blurb: 'Two indices moving from opposite ends or in the same direction to discard nested searching.',
    recognition: 'A sorted array with a request to find a pair or a particular condition.',
    complexity: 'O(n) time, O(1) space',
  },
  'sliding-window': {
    name: 'Sliding Window',
    blurb: 'A window that widens and narrows to keep a subset valid.',
    recognition: 'A request for the longest or shortest subarray or substring that satisfies a condition.',
    complexity: 'O(n) time, O(k) space',
  },
  'hash-map': {
    name: 'Hash Map',
    blurb: 'Store what has already been seen so an O(1) lookup replaces a repeated scan.',
    recognition: 'A need to ask "has this value appeared before" repeatedly.',
    complexity: 'O(n) time, O(n) space',
  },
  'binary-search': {
    name: 'Binary Search',
    blurb: 'Half the search space is discarded each step by comparing against the midpoint.',
    recognition: 'Sorted data, or a monotonic answer space that can be tested at the middle.',
    complexity: 'O(log n) time, O(1) space',
  },
  'dynamic-programming': {
    name: 'Dynamic Programming',
    blurb: 'Subproblem answers are stored so they are not recomputed.',
    recognition: 'Overlapping repeated choices, where a large answer is built from smaller answers.',
    complexity: 'O(n) to O(n^2) time, O(n) space',
  },
  'bfs-dfs': {
    name: 'BFS & DFS',
    blurb: 'Traverse a graph or grid layer by layer (BFS) or by diving as deep as possible (DFS).',
    recognition: 'A grid, tree, or graph structure, with a request for shortest distance or exhaustive exploration.',
    complexity: 'O(V + E) time, O(V) space',
  },
  stack: {
    name: 'Stack',
    blurb: 'Hold unresolved items, then match them when their counterpart appears.',
    recognition: 'Matching open and close pairs, or a need for the next greater element.',
    complexity: 'O(n) time, O(n) space',
  },
  'greedy-interval': {
    name: 'Greedy & Interval',
    blurb: 'Sort by a boundary, then take the decision that is optimal for the current step.',
    recognition: 'Overlapping time intervals or colliding schedules.',
    complexity: 'O(n log n) time, O(1) space',
  },
};
