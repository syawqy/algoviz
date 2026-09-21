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
      'You have a sorted array of numbers and a target. Find two numbers that add up exactly to the target and return their positions. Each problem has exactly one answer, and you cannot use the same element twice.',
    hint: 'Since the array is sorted, the smallest number is on the left and the largest on the right. If the sum is too small, you must move the left pointer. If too large, move the right. How many candidates can you eliminate per step?',
    walkthrough:
      'Try this with numbers: [2, 7, 11, 15, 19] and target 26.\n\nStart: left at 2, right at 19. Sum = 21, less than 26, so move left right.\nNow: left at 7, right at 19. Sum = 26. Found!\n\nKey insight: since the array is sorted, if the sum is too low, the only way to increase it is to drop the smallest number (move left). If too high, drop the largest (move right). Each step eliminates exactly one candidate, so at most array length steps.',
    solution: `def two_sum_sorted(nums, target):\n    left, right = 0, len(nums) - 1\n    while left < right:\n        total = nums[left] + nums[right]\n        if total == target:\n            return [left, right]\n        if total < target:\n            left += 1\n        else:\n            right -= 1\n    return []`,
  },
  'valid-palindrome': {
    title: 'Valid Palindrome',
    statement:
      'Determine if a string reads the same forwards and backwards (palindrome). Uppercase and lowercase are considered the same, and non-alphanumeric characters (spaces, punctuation) are ignored.',
    hint: 'Start from both ends of the string, then move inward. If you encounter a space or punctuation, skip it before comparing. Try the example: A man a plan a canal Panama - is it a palindrome?',
    walkthrough:
      'Try with A man, a plan, a canal, Panama.\n\nRewrite without spaces/punctuation: amanaplanacanalpanama.\n\nNow place two fingers: one at the start (a), one at the end (a). Match? Move inward.\nSecond: m and m. Match. Move again.\nKeep going until both fingers meet in the middle. No differences? It is a palindrome.\n\nThe trick: you do not need to reverse the whole string. Just compare pairs from outside in. If all match, it is a palindrome. If even one differs, stop immediately.',
    solution: `def is_palindrome(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        while left < right and not s[left].isalnum():\n            left += 1\n        while left < right and not s[right].isalnum():\n            right -= 1\n        if s[left].lower() != s[right].lower():\n            return False\n        left += 1\n        right -= 1\n    return True`,
  },
  'container-with-most-water': {
    title: 'Container With Most Water',
    statement:
      'You have several walls of different heights. Choose two walls that, when placed facing each other, can hold the most water. Return the maximum water volume.',
    hint: 'Water volume = distance between walls x height of the shorter wall. If you move the taller wall, can the volume increase? Think about: which wall should you move?',
    walkthrough:
      'Example wall heights: [1, 8, 6, 2, 5, 4, 8, 3, 7].\n\nStart at the widest apart: left=1, right=7. Volume = min(1,7) x 8 = 8.\nMove left (shorter one) to 8. Volume = min(8,7) x 7 = 49. Bigger!\nMove right to 3. Volume = min(8,3) x 6 = 18. Smaller.\n...and so on.\n\nLogic: start from the widest apart. Each step, move the SHORTER wall, because the taller wall does not block. This way every step safely eliminates one wall, and you only need one pass.',
    solution: `def max_area(heights):\n    left, right = 0, len(heights) - 1\n    best = 0\n    while left < right:\n        height = min(heights[left], heights[right])\n        best = max(best, height * (right - left))\n        if heights[left] < heights[right]:\n            left += 1\n        else:\n            right -= 1\n    return best`,
  },
  'longest-substring-no-repeat': {
    title: 'Longest Substring Without Repeating Characters',
    statement:
      'Find the length of the longest substring with no duplicate characters. Substring = a contiguous portion of a string (can be anywhere).',
    hint: 'Imagine a window that can expand to the right. If the new character is already in the window, slide the left boundary until the old character exits. The largest window length is the answer.',
    walkthrough:
      'Example string: abcabcbb.\n\nStart with empty window, expand right one character at a time:\na (0): window = a, length 1\nb (1): window = ab, length 2\nc (2): window = abc, length 3\na (3): a already exists! Slide left until old a exits. Window = bca, length 3\nb (4): b already exists! Slide left. Window = cab, length 3\nc (5): c already exists! Slide left. Window = abc, length 3\nb (6): b already exists! Slide left. Window = cb, length 2\nb (7): b already exists! Slide left. Window = b, length 1\n\nAnswer: 3.\n\nKey insight: the window is always valid (no duplicates), and each character enters and exits the window exactly once.',
    solution: `def longest_unique_substring(s):\n    last_seen = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last_seen and last_seen[ch] >= left:\n            left = last_seen[ch] + 1\n        last_seen[ch] = right\n        best = max(best, right - left + 1)\n    return best`,
  },
  'maximum-average-subarray': {
    title: 'Maximum Average Subarray',
    statement:
      'Given an array of numbers and a number k, find the contiguous subarray of length exactly k with the largest average. Return the average value.',
    hint: 'When the window length is fixed at k, you do not need to re-sum all elements each time it slides. Just add the incoming element and subtract the outgoing one.',
    walkthrough:
      'Example array [1, 12, -5, -6, 50, 3] and k=4.\n\nFirst window: [1, 12, -5, -6]. Sum = 2. Average = 0.5.\nSlide right: exit 1, enter 50. Sum = 2 - 1 + 50 = 51. Average = 12.75.\nSlide right again: exit 12, enter 3. Sum = 51 - 12 + 3 = 42. Average = 10.5.\n\nAnswer: 12.75.\n\nKey insight: do not re-sum from scratch! Just compute the delta: current sum - outgoing + incoming. This makes the solution fast (linear, not quadratic).',
    solution: `def max_average(nums, k):\n    total = sum(nums[:k])\n    best = total / k\n    for i in range(k, len(nums)):\n        total += nums[i] - nums[i - k]\n        best = max(best, total / k)\n    return best`,
  },
  'two-sum': {
    title: 'Two Sum',
    statement:
      'Given an array of numbers and a target, find two numbers that add up to the target and return their positions. Each problem has exactly one answer.',
    hint: 'If the current number is x, then its partner must be target - x. The question is: has that partner appeared before?',
    walkthrough:
      'Example array [3, 8, 11, 2, 7] and target = 9.\n\nSee 3: partner = 9 - 3 = 6. Never appeared. Save 3 in notebook.\nSee 8: partner = 9 - 8 = 1. Not there. Save 8.\nSee 11: partner = 9 - 11 = -2. Not there. Save 11.\nSee 2: partner = 9 - 2 = 7. Not there. Save 2.\nSee 7: partner = 9 - 7 = 2. There! 2 is in the notebook. Answer: positions 3 and 4.\n\nKey insight: use a hash map (notebook) so you can check if the partner exists in constant time. Just one pass.',
    solution: `def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []`,
  },
  'contains-duplicate': {
    title: 'Contains Duplicate',
    statement:
      'Check if any number appears more than once in the array. If yes, return true. If all numbers are unique, return false.',
    hint: 'You do not need to compare every pair of numbers (that is slow). Just save the numbers you have seen, then check if the next number is already in the record.',
    walkthrough:
      'Example array [4, 9, 2, 7, 4, 1].\n\nSee 4: record is empty. Save 4.\nSee 9: not in record. Save 9.\nSee 2: not there. Save 2.\nSee 7: not there. Save 7.\nSee 4: IS in record! Immediately answer true.\n\nNo need to check the rest. One find, done.\nIf all checked and no duplicates, answer false.',
    solution: `def has_duplicate(nums):\n    seen = set()\n    for x in nums:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False`,
  },
  'group-anagrams': {
    title: 'Group Anagrams',
    statement:
      'Given a list of words, group words that are anagrams (same letters, different order). Example: eat, tea, ate are anagrams.',
    hint: 'If you sort the letters of each word, anagrams will have exactly the same form. For example eat becomes aet, tea also becomes aet. What can serve as a grouping key?',
    walkthrough:
      'Example words: [eat, tea, tan, ate, nat, bat].\n\nSort letters of each word:\neat -> aet\ntea -> aet\ntan -> ant\nate -> aet\nnat -> ant\nbat -> abt\n\nNow group by sorted form:\naet -> [eat, tea, ate]\nant -> [tan, nat]\nabt -> [bat]\n\nKey insight: same sorted letters = anagram. Use the sorted form as a key in a hash map, then put each word into the matching group.',
    solution: `from collections import defaultdict\n\ndef group_anagrams(words):\n    groups = defaultdict(list)\n    for word in words:\n        key = ''.join(sorted(word))\n        groups[key].append(word)\n    return list(groups.values())`,
  },
  'binary-search-classic': {
    title: 'Classic Binary Search',
    statement:
      'Array is sorted from smallest to largest. Find the target position. If found, return its index. If not, return -1.',
    hint: 'Imagine a phone book: if you look for name M, go straight to the middle. If M is bigger than middle, search right. If smaller, search left. How many times can you divide in half?',
    walkthrough:
      'Example array [3, 9, 14, 21, 27, 33, 41, 56, 68, 75] and target = 41.\n\nStep 1: middle = 27. 41 > 27, search right.\nStep 2: middle = 56. 41 < 56, search left.\nStep 3: middle = 41. Found! Return index.\n\nIf target = 50:\nStep 1: middle = 27. Search right.\nStep 2: middle = 56. Search left.\nStep 3: middle = 41. Search right.\nStep 4: middle = 68. Search left.\nSpace exhausted. Return -1.\n\nKey insight: each step eliminates HALF the remaining search. From 10 numbers, just 4 steps. From 1000, just 10 steps.',
    solution: `def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1`,
  },
  'search-rotated': {
    title: 'Search in Rotated Sorted Array',
    statement:
      'Array was originally sorted but has been rotated at some point. For example [4, 5, 6, 7, 0, 1, 2] is a rotation of [0, 1, 2, 4, 5, 6, 7]. Find the target in this rotated array.',
    hint: 'After rotation, there is always at least one half that is still sorted (left or right). If the left half is sorted, you can check: is the target in the left range? If not, it must be on the right.',
    walkthrough:
      'Example array [27, 33, 41, 56, 68, 3, 9, 14, 21] and target = 9.\n\nStep 1: left=27, mid=56. Left <= Mid? Yes. So left [27..56] is sorted. Is 9 there? No (9 < 27). Search right.\nStep 2: left=3, mid=9. Left <= Mid? Yes. Is 9 in [3..9]? Yes! Search left.\nStep 3: found at middle index!\n\nKey insight: each step, first figure out which half is sorted, then check if the target could be in that half.',
    solution: `def search_rotated(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[left] <= nums[mid]:\n            if nums[left] <= target < nums[mid]:\n                right = mid - 1\n            else:\n                left = mid + 1\n        else:\n            if nums[mid] < target <= nums[right]:\n                left = mid + 1\n            else:\n                right = mid - 1\n    return -1`,
  },
  'climbing-stairs': {
    title: 'Climbing Stairs',
    statement:
      'You have a staircase with n steps. Each step, you can climb 1 or 2 steps. How many different ways are there to reach the top?',
    hint: 'To reach step 6, you must have come from step 5 (1 step) or step 4 (2 steps). So: ways to 6 = ways to 5 + ways to 4.',
    walkthrough:
      'Count manually for n = 6:\nStep 1: 1 way (just climb 1)\nStep 2: 2 ways (1+1 or just 2)\nStep 3: 3 ways (1+1+1, 1+2, 2+1)\n\nPattern: 1, 2, 3, 5, 8, 13...\nThis is Fibonacci!\n\nHow: just keep the last two numbers.\nprev=1, curr=2\nStep 3: new = 1+2 = 3\nStep 4: new = 2+3 = 5\nStep 5: new = 3+5 = 8\nStep 6: new = 5+8 = 13\n\nAnswer: 13 ways.\nKey insight: you do not need to count all possibilities from scratch. Just add the two previous steps.',
  },
  'house-robber': {
    title: 'House Robber',
    statement:
      'There is a row of houses, each containing some money. The rule: you cannot rob two adjacent houses (alarm goes off). Calculate the maximum amount of money you can take.',
    hint: 'At each house, you only have two choices: take this house or skip it. If you take it, the previous house must be skipped. If you skip, take the best from before. Try computing two values at each step.',
    walkthrough:
      'Example money in houses: [2, 7, 9, 3, 1].\n\nHouse 1 (2): take=2, skip=0\nHouse 2 (7): take=0+7=7, skip=max(2,0)=2\nHouse 3 (9): take=2+9=11, skip=max(7,2)=7\nHouse 4 (3): take=7+3=10, skip=max(11,7)=11\nHouse 5 (1): take=11+1=12, skip=max(10,11)=11\n\nAnswer: max(12, 11) = 12. (Take houses 1 + 3 + 5 = 2+9+1 = 12)\n\nKey insight: at each house, compute two values: if you take this house and if you skip. Moving to the next house, these two values update.',
    solution: `def rob(nums):\n    take, skip = 0, 0\n    for x in nums:\n        take, skip = skip + x, max(skip, take)\n    return max(take, skip)`,
  },
  'number-of-islands': {
    title: 'Number of Islands',
    statement:
      'A grid contains 1 (land) and 0 (water). An island = a group of land connected horizontally or vertically. Count the number of islands.',
    hint: 'Each time you find a 1 that has not been visited, that is the start of a new island. Then mark all connected land so it is not counted again.',
    walkthrough:
      'Example grid:\n1 1 0 0 0\n1 0 0 1 1\n0 0 0 1 0\n0 1 0 0 0\n0 1 0 1 1\n\nStart from top left:\nFound (0,0) = 1. New island! Mark all connected: (0,0), (0,1), (1,0) = 3 cells.\nFound (1,3) = 1. New island! Mark: (1,3), (1,4), (2,3) = 3 cells.\nFound (3,1) = 1. New island! Mark: (3,1), (4,1) = 2 cells.\nFound (4,3) = 1. New island! Mark: (4,3), (4,4) = 2 cells.\n\nAnswer: 4 islands.\n\nKey insight: scan all cells. If you find land, increment count, then color the entire island so it is not counted twice.',
    solution: `from collections import deque\n\ndef count_islands(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    total = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                total += 1\n                grid[r][c] = '0'\n                queue = deque([(r, c)])\n                while queue:\n                    cr, cc = queue.popleft()\n                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                        nr, nc = cr + dr, cc + dc\n                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':\n                            grid[nr][nc] = '0'\n                            queue.append((nr, nc))\n    return total`,
    time_complexity: 'O(rows * cols)',
    space_complexity: 'O(rows * cols)',
  },
  'shortest-path-grid': {
    title: 'Shortest Path in a Grid',
    statement:
      'Grid contains 0 (passable) and 1 (obstacle). Start at top-left corner, aim for bottom-right. Find the fewest steps (moves: up, down, left, right). If no path exists, return -1.',
    hint: 'BFS (breadth-first search) always finds the shortest path first. Why? Because all distance-1 cells are visited first, then distance-2, and so on.',
    walkthrough:
      'Example grid:\n0 0 0 0 0\n1 1 0 1 0\n0 0 0 1 0\n0 1 1 1 0\n0 0 0 0 0\n\nStart at (0,0). Mark as visited.\nDistance 1: all reachable neighbors.\nDistance 2: neighbors of distance-1 cells.\n...and so on.\nUntil (4,4) is reached.\n\nShortest path: 8 steps.\n\nKey insight: with BFS, the first time you reach the destination, it is GUARANTEED to be the shortest path. No need to check all possible paths.',
    solution: `from collections import deque\n\ndef shortest_path(grid, start, goal):\n    rows, cols = len(grid), len(grid[0])\n    queue = deque([(start[0], start[1], 0)])\n    seen = {tuple(start)}\n    while queue:\n        r, c, dist = queue.popleft()\n        if [r, c] == list(goal):\n            return dist\n        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:\n                seen.add((nr, nc))\n                queue.append((nr, nc, dist + 1))\n    return -1`,
    time_complexity: 'O(rows * cols)',
    space_complexity: 'O(rows * cols)',
  },
  'valid-parentheses': {
    title: 'Valid Parentheses',
    statement:
      'Determine if a string of brackets is valid. Valid means: every opening bracket must be closed by the same type, and in the correct order. Valid example: ([{}]). Invalid example: ([)].',
    hint: 'When you open a bracket {, the matching closing bracket must come AFTER all brackets inside it are closed first. What data structure is good for waiting?',
    walkthrough:
      'Example string: ([{}]).\n\nRead (: stack empty. Push (. Stack: [(]\nRead [: match. Push [. Stack: [(,[]\nRead {: match. Push {. Stack: [(,[,{]\nRead }: matches { on top. Pop. Stack: [(,[]\nRead ]: matches [ on top. Pop. Stack: [(]\nRead ): matches ( on top. Pop. Stack: []\n\nDone, stack is empty = valid!\n\nInvalid example ([)]:\nRead (: stack [(]\nRead [: stack [(,[]\nRead ): should match [, but found ). NOT VALID!\n\nKey insight: the stack always holds opening brackets that are still waiting for their match.',
  },
  'daily-temperatures': {
    title: 'Daily Temperatures',
    statement:
      'Given a list of daily temperatures, for each day calculate: how many days until a warmer temperature? If none exists, fill in 0.',
    hint: 'If today\'s temperature is warmer than several days ago, then those past days already have their answer. Save the days still waiting in a stack.',
    walkthrough:
      'Example temperatures: [71, 69, 72, 76, 73].\n\nDay 0 (71): stack empty, push 0. Stack: [0]\nDay 1 (69): 69 < 71, nothing finished. Push 1. Stack: [0, 1]\nDay 2 (72): 72 > 69! Day 1 done: 2-1 = 1 day away. Pop 1.\n       72 > 71! Day 0 done: 2-0 = 2 days away. Pop 0.\n       Push 2. Stack: [2]\nDay 3 (76): 76 > 72! Day 2 done: 3-2 = 1. Pop 2.\n       Push 3. Stack: [3]\nDay 4 (73): 73 < 76, not done. Push 4. Stack: [3, 4]\n\nRemaining in stack [3, 4] have no warmer temperature = 0.\nAnswer: [2, 1, 1, 0, 0]\n\nKey insight: the stack saves indices of days that have not found a warmer temperature. When today is warmer, the waiting days get their answer immediately.',
    solution: `def daily_temperatures(temps):\n    result = [0] * len(temps)\n    stack = []\n    for i, t in enumerate(temps):\n        while stack and temps[stack[-1]] < t:\n            j = stack.pop()\n            result[j] = i - j\n        stack.append(i)\n    return result`,
  },
  'merge-intervals': {
    title: 'Merge Intervals',
    statement:
      'Given a list of intervals (start-end time pairs). Merge all overlapping intervals. For example [1,3] and [2,6] overlap to become [1,6].',
    hint: 'If intervals are sorted by start time, you only need to compare one by one from left to right. When do two intervals definitely overlap?',
    walkthrough:
      'Example intervals: [[1,3], [2,6], [8,10], [9,12], [15,18]].\n\nSort (already sorted): [1,3], [2,6], [8,10], [9,12], [15,18]\n\nTake [1,3] as start.\n[2,6]: start 2 <= end 3? Yes! Overlap. Merge: [1, max(3,6)] = [1,6].\n[8,10]: start 8 <= end 6? No. New interval: [8,10].\n[9,12]: start 9 <= end 10? Yes! Merge: [8, max(10,12)] = [8,12].\n[15,18]: start 15 <= end 12? No. New interval: [15,18].\n\nAnswer: [[1,6], [8,12], [15,18]]\n\nKey insight: sort by start first, then check one by one: still overlapping? Merge. Separated? Start a new interval.',
  },
  'meeting-rooms': {
    title: 'Minimum Meeting Rooms',
    statement:
      'You have a list of meeting schedules (start time, end time). Calculate the minimum number of rooms needed so all meetings can run without conflict.',
    hint: 'Each time a new meeting starts before another ends, you need a new room. When one ends, that room can be reused. Try sorting start times and end times separately.',
    walkthrough:
      'Example meetings: [[9,10], [9,11], [10,12], [11,13], [14,15]].\n\nSort start times: [9, 9, 10, 11, 14]\nSort end times: [10, 11, 12, 13, 15]\n\nUse 2 pointers:\n9 < 10: meeting starts, need new room. Rooms = 1.\n9 < 10: another meeting starts, need new room. Rooms = 2. (MAX)\n10 >= 10: first meeting ends. Rooms = 1.\n11 >= 11: second meeting ends. Rooms = 0.\n11 < 12: meeting starts. Rooms = 1.\n14 >= 13: meeting ends. Rooms = 0.\n14 < 15: meeting starts. Rooms = 1.\n\nAnswer: 2 rooms.\n\nKey insight: count how many meetings are active at the busiest time. That is the minimum number of rooms.',
    solution: `def min_rooms(schedule):\n    starts = sorted(s[0] for s in schedule)\n    ends = sorted(s[1] for s in schedule)\n    i = j = 0\n    rooms = best = 0\n    while i < len(schedule):\n        if starts[i] < ends[j]:\n            rooms += 1\n            best = max(best, rooms)\n            i += 1\n        else:\n            rooms -= 1\n            j += 1\n    return best`,
  },
  'min-window-substring': {
    title: 'Minimum Window Substring',
    statement:
      'Given two strings: source and target. Find the shortest substring of source that contains all characters from target (including their counts). If none exists, return an empty string.',
    hint: 'Expand the window to the right until all target characters are covered. Once covered, try shrinking from the left to find a shorter one. When can the window be shrunk?',
    walkthrough:
      'Example source = ADOBECODEBANC, target = ABC.\n\nFind A, B, C in source:\nExpand window from left:\nA (0): has A. Needs: A=0, B=1, C=1\nD (1): not target.\nO (2): not target.\nB (3): has B. Needs: A=0, B=0, C=1\nC (4): has C. Needs: A=0, B=0, C=0\n\nAll covered! Current window = ADOBEC, length 6.\nNow shrink from left:\nRemove A: needs A=1, window invalid. Record length 6.\nStart from D, expand again until all covered...\n...Finally window BANC (length 4) is the shortest.\n\nKey insight: expand until valid, then shrink until almost invalid. Repeat.',
    solution: `from collections import Counter\n\ndef min_window(source, target):\n    need = Counter(target)\n    missing = len(target)\n    left = best_left = 0\n    best_len = len(source) + 1\n    for right, ch in enumerate(source):\n        if need[ch] > 0:\n            missing -= 1\n        need[ch] -= 1\n        while missing == 0:\n            if right - left + 1 < best_len:\n                best_len = right - left + 1\n                best_left = left\n            if need[source[left]] == 0:\n                missing += 1\n            need[source[left]] += 1\n            left += 1\n    if best_len > len(source):\n        return ''\n    return source[best_left:best_left + best_len]`,
  },
  'coin-change': {
    title: 'Coin Change',
    statement:
      'You have several coin denominations (e.g. 1, 3, 4) and a target amount. Find the fewest coins needed to make that amount. If impossible, return -1.',
    hint: 'For amount N, the last coin used could be 1, 3, or 4. So: minimum coins for N = 1 + minimum for (N - coin value). Try counting from smallest amount upward.',
    walkthrough:
      'Example coins [1, 3, 4] and target = 6.\n\nBuild table from 0 to 6:\nAmount 0: 0 coins (starting point)\nAmount 1: use coin 1. Remainder 0. Total = 1.\nAmount 2: use coin 1, remainder 1 (need 1 more). Total = 2.\nAmount 3: use coin 3, remainder 0. Total = 1. (Better than 3x coin 1)\nAmount 4: use coin 4, remainder 0. Total = 1.\nAmount 5: coin 1 + remainder 4 (total 2) OR coin 3 + remainder 2 (total 3). Take 2.\nAmount 6: coin 1 + remainder 5 (total 3) OR coin 3 + remainder 3 (total 2) OR coin 4 + remainder 2 (total 3). Take 2.\n\nAnswer: 2 coins (3+3).\n\nKey insight: count from bottom up. For each amount, try all coin types, take the fewest.',
    // The stored solution and complexity notation use Indonesian identifiers
    // (koin, jumlah, nilai, tabel), so they are translated here as well.
    solution: `def min_coins(coins, amount):\n    IMPOSSIBLE = float('inf')\n    table = [0] + [IMPOSSIBLE] * amount\n    for value in range(1, amount + 1):\n        for c in coins:\n            if c <= value and table[value - c] + 1 < table[value]:\n                table[value] = table[value - c] + 1\n    return -1 if table[amount] == IMPOSSIBLE else table[amount]`,
    time_complexity: 'O(amount * len(coins))',
    space_complexity: 'O(amount)',
  },
  'rate-limiter': {
    title: 'API Rate Limiter',
    statement:
      'You are building an API rate limiter. The server logs the time of each incoming request within a window (e.g. 1 second). Determine whether a new request should be accepted or rejected based on the maximum number of requests per window.',
    hint: 'Imagine a moving window that covers the last N seconds. If the request count inside the window is still below the limit, the request is accepted. If full, it is rejected.',
    walkthrough:
      'Example: limit = 3 requests per second.\n\nRequest at second 1: window empty. Accept.\nRequest at second 1: count is 1. Accept.\nRequest at second 1: count is 2. Accept.\nRequest at second 1: count is 3, LIMIT REACHED! Reject.\nRequest at second 2: second 1 exits window. Count 0. Accept.\n\nKey insight: any request older than N seconds is evicted from the window. As long as remaining count is below the limit, new requests are accepted.',
    solution: `from collections import deque\n\ndef is_allowed(requests, limit, window):\n    queue = deque()\n    for t in requests:\n        while queue and queue[0] <= t - window:\n            queue.popleft()\n        if len(queue) < limit:\n            queue.append(t)\n        else:\n            print(f"Request at {t}: REJECTED")`,
  },
  'uptime-tracker': {
    title: 'Server Uptime Tracker',
    statement:
      'You are monitoring server status over N minutes. The server can be UP (1) or DOWN (0). Find the longest duration the server stays active, allowing at most k minutes of downtime within that window.',
    hint: 'This is a sliding window variant: expand the window right, count zeros (downtime) inside. If zeros exceed k, slide the left boundary until zeros are valid again.',
    walkthrough:
      'Example status: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1] and k=1.\n\nWindow [1,1,0] zeros=1 <= k. Length 3.\nExpand: [1,1,0,1] zeros=1. Length 4.\nExpand: [1,1,0,1,1] zeros=1. Length 5.\nExpand: [1,1,0,1,1,1] zeros=1. Length 6.\nExpand: [1,1,0,1,1,1,0] zeros=2 > k! Slide left.\n...etc.\n\nKey insight: window always stays valid with at most k zeros. Each element enters and exits the window exactly once.',
    solution: `def max_uptime(status, k):\n    left = 0\n    zeros = 0\n    best = 0\n    for right in range(len(status)):\n        if status[right] == 0:\n            zeros += 1\n        while zeros > k:\n            if status[left] == 0:\n                zeros -= 1\n            left += 1\n        best = max(best, right - left + 1)\n    return best`,
  },
  'first-unique-char': {
    title: 'First Unique Log Level',
    statement:
      'Given a string of characters (e.g. log level: "aabbc"), find the index of the first character that appears only once. If none exists, return -1.',
    hint: 'First, count how many times each character appears using a hash map. Then scan the string from the beginning: the first character with a count of 1 is the answer.',
    walkthrough:
      'Example string: "aabbcdc".\n\nCount occurrences: a=2, b=2, c=2, d=1.\nScan from left: a (2 times, skip), a (skip), b (skip), b (skip), c (skip), d (1 time!).\nAnswer: index 5.\n\nKey insight: two passes. First pass fills the frequency table. Second pass finds the character with frequency exactly 1.',
    solution: `def first_unique_char(s):\n    freq = {}\n    for ch in s:\n        freq[ch] = freq.get(ch, 0) + 1\n    for i, ch in enumerate(s):\n        if freq[ch] == 1:\n            return i\n    return -1`,
  },
  'encoding-validator': {
    title: 'Encoding Validator',
    statement:
      'Given two strings, determine if they are isomorphic (can be mapped one-to-one from the first character set to the second). For example, "egg" and "add" are isomorphic because e->a, g->d.',
    hint: 'For each character pair at the same position, ensure the mapping is consistent. If e is already mapped to a, then e cannot map to anything else.',
    walkthrough:
      'Example s = "egg", t = "add".\n\ne -> a: save mapping e->a.\ng -> d: save mapping g->d.\ng -> d: mapping g->d already exists, match!\n\nAll consistent, answer: isomorphic.\n\nKey insight: two hash maps are needed: one for s->t mapping, one for t->s mapping.',
    solution: `def is_isomorphic(s, t):\n    if len(s) != len(t):\n        return False\n    s_to_t = {}\n    t_to_s = {}\n    for cs, ct in zip(s, t):\n        if cs in s_to_t and s_to_t[cs] != ct:\n            return False\n        if ct in t_to_s and t_to_s[ct] != cs:\n            return False\n        s_to_t[cs] = ct\n        t_to_s[ct] = cs\n    return True`,
  },
  'peak-element': {
    title: 'Peak Traffic Detector',
    statement:
      'You have traffic-per-hour data as an array. The array is "mountain-shaped" — it rises then falls. Find the index of the peak (largest value) using binary search.',
    hint: 'At the middle position, if the middle element is smaller than its right neighbor, the peak must be on the right. If larger than both neighbors, that IS the peak!',
    walkthrough:
      'Example traffic: [1, 3, 5, 7, 6, 4, 2].\n\nStep 1: left=0, right=6, mid=3 (value 7).\n7 > left neighbor (5) AND 7 > right neighbor (6)? Yes! 7 is the peak.\n\nFor array [1, 3, 5, 4, 3, 2, 1]\nStep 1: mid=3 (value 4). 4 < 5 (left), search left.\nStep 2: mid=1 (value 3). 3 < 5 (left), search left.\nStep 3: mid=0 (value 1). 1 < 3 (right), search right.\nStep 4: mid=1 (value 3). Peak found!\n\nKey insight: search direction is determined by comparing with neighbors, not a fixed target.',
    solution: `def find_peak(traffic):\n    left, right = 0, len(traffic) - 1\n    while left < right:\n        mid = (left + right) // 2\n        if traffic[mid] < traffic[mid + 1]:\n            left = mid + 1\n        else:\n            right = mid\n    return left`,
  },
  'budget-optimizer': {
    title: 'Budget Optimizer',
    statement:
      'You have projects with different profits. Choose projects to maximize profit, but you cannot pick two adjacent projects (conflict of interest). Find the maximum profit.',
    hint: 'At each project, you have two choices: take it or skip it. If you take it, the previous project must be skipped. If you skip, take the best from before.',
    walkthrough:
      'Example profit: [5, 10, 8, 3, 7, 4].\n\nProject 1 (5): take=5, skip=0\nProject 2 (10): take=0+10=10, skip=max(5,0)=5\nProject 3 (8): take=5+8=13, skip=max(10,5)=10\nProject 4 (3): take=10+3=13, skip=max(13,10)=13\nProject 5 (7): take=13+7=20, skip=max(13,13)=13\nProject 6 (4): take=13+4=17, skip=max(20,13)=20\n\nAnswer: max(17, 20) = 20.\n\nKey insight: at each step, compute two values: profit if this project is taken and if it is skipped.',
    solution: `def max_profit(projects):\n    take, skip = 0, 0\n    for p in projects:\n        take, skip = skip + p, max(skip, take)\n    return max(take, skip)`,
  },
  'min-coin-change': {
    title: 'Minimum Coins for Payment',
    statement:
      'You have several coin denominations (e.g. 1, 5, 10, 25). Find the fewest coins needed to make a given amount. This is like a vending machine that must give optimal change.',
    hint: 'Build a table from amount 0 up to the target. For each amount, try each denomination as the last coin used. Pick the combination with the fewest coins.',
    walkthrough:
      'Example coins [1, 5, 10, 25] and target = 30.\n\nBuild table:\n0: 0 coins\n1: coin 1 -> 1 coin\n5: coin 5 -> 1 coin\n10: coin 10 -> 1 coin\n15: coin 10 + coin 5 -> 2 coins\n20: coin 10 + coin 10 -> 2 coins\n25: coin 25 -> 1 coin\n30: coin 25 + coin 5 -> 2 coins\n\nAnswer: 2 coins (25 + 5).\n\nKey insight: for each amount, try all denominations. Pick the one that yields the fewest coins.',
    solution: `def min_coins(denom, amount):\n    IMPOSSIBLE = float("inf")\n    table = [0] + [IMPOSSIBLE] * amount\n    for value in range(1, amount + 1):\n        for c in denom:\n            if c <= value and table[value - c] + 1 < table[value]:\n                table[value] = table[value - c] + 1\n    return -1 if table[amount] == IMPOSSIBLE else table[amount]`,
    time_complexity: 'O(amount * len(denom))',
    space_complexity: 'O(amount)',
  },
  'min-cost-tracker': {
    title: 'Min Cost Tracker',
    statement:
      'You have daily operational cost logs. For each day, determine how many days until there is a higher cost. If none exists, fill in 0.',
    hint: 'Use a stack to store indices of days still waiting for a higher cost.',
    walkthrough:
      'Example costs: [100, 80, 120, 150, 90].\n\nDay 0 (100): stack empty, push 0.\nDay 1 (80): 80 < 100, push 1.\nDay 2 (120): 120 > 80! Day 1 done: 2-1 = 1 day. Pop 1.\n       120 > 100! Day 0 done: 2-0 = 2 days. Pop 0.\nDay 3 (150): 150 > 120! Day 2 done: 3-2 = 1. Pop 2.\nDay 4 (90): 90 < 150, push 4.\n\nRemaining in stack have no higher cost = 0.\nAnswer: [2, 1, 1, 0, 0]\n\nKey insight: the stack stores indices of days that have not found a higher cost yet.',
    solution: `def next_higher(costs):\n    result = [0] * len(costs)\n    stack = []\n    for i, c in enumerate(costs):\n        while stack and costs[stack[-1]] < c:\n            j = stack.pop()\n            result[j] = i - j\n        stack.append(i)\n    return result`,
  },
  'expression-calculator': {
    title: 'Expression Calculator',
    statement:
      'You are building a calculator that accepts input in Reverse Polish Notation (postfix). Example: "3 4 + 2 *" = (3+4)*2 = 14. Compute the result.',
    hint: 'Read tokens left to right. If it is a number, push onto the stack. If it is an operator, pop the top two numbers, compute the result, and push it back.',
    walkthrough:
      'Expression: 3 4 + 2 *\n\nRead 3: number. Push. Stack: [3]\nRead 4: number. Push. Stack: [3, 4]\nRead +: operator. Pop 4 and 3. 3 + 4 = 7. Push 7. Stack: [7]\nRead 2: number. Push. Stack: [7, 2]\nRead *: operator. Pop 2 and 7. 7 * 2 = 14. Push 14. Stack: [14]\n\nDone, stack contains [14]. Answer: 14.\n\nKey insight: the stack holds operands that have not been processed yet.',
    solution: `def eval_postfix(tokens):\n    stack = []\n    for token in tokens:\n        if token in "+-*/":\n            b = stack.pop()\n            a = stack.pop()\n            if token == "+": stack.append(a + b)\n            elif token == "-": stack.append(a - b)\n            elif token == "*": stack.append(a * b)\n            elif token == "/": stack.append(int(a / b))\n        else:\n            stack.append(int(token))\n    return stack[0]`,
  },
  'task-scheduler': {
    title: 'Task Batch Scheduler',
    statement:
      'You have a list of tasks with start and end times. Merge overlapping tasks into batches. Each batch can run several tasks simultaneously. Find the minimum number of batches needed.',
    hint: 'Sort tasks by start time. If the next task starts before the previous one ends, they can be merged into one batch. If separated, start a new batch.',
    walkthrough:
      'Example tasks: [[1, 4], [2, 3], [5, 7], [6, 8], [9, 10]].\n\nSorted: [1,4], [2,3], [5,7], [6,8], [9,10]\n\nTake [1,4] as start of batch 1.\n[2,3]: start 2 <= end 4? Yes! Merge.\n[5,7]: start 5 <= end 4? No. New batch: [5,7].\n[6,8]: start 6 <= end 7? Yes! Merge.\n[9,10]: start 9 <= end 8? No. New batch: [9,10].\n\nAnswer: 3 batches.\n\nKey insight: sort by start first, then merge overlapping ones.',
    solution: `def batch_minimum(tasks):\n    tasks.sort(key=lambda x: x[0])\n    result = []\n    for start, end in tasks:\n        if result and start <= result[-1][1]:\n            result[-1][1] = max(result[-1][1], end)\n        else:\n            result.append([start, end])\n    return result`,
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
    blurb: 'Two fingers moving from opposite ends or same direction. Best for: sorted arrays, finding pairs. Each step eliminates candidates.',
    recognition: 'A sorted array with a request to find a pair or a particular condition.',
    complexity: 'O(n) time, O(1) space',
  },
  'sliding-window': {
    name: 'Sliding Window',
    blurb: 'A window that widens and shrinks to keep a valid subset. Best for: substrings/subarrays, fixed or variable length.',
    recognition: 'A request for the longest or shortest subarray or substring that satisfies a condition.',
    complexity: 'O(n) time, O(k) space',
  },
  'hash-map': {
    name: 'Hash Map',
    blurb: 'Save what you have seen in a notebook. Best for: checking duplicates, finding partners. See once, find instantly.',
    recognition: 'A need to ask "has this value appeared before" repeatedly.',
    complexity: 'O(n) time, O(n) space',
  },
  'binary-search': {
    name: 'Binary Search',
    blurb: 'Discard half the search space each step. Best for: sorted arrays, finding one value. From 1000 numbers, just 10 steps.',
    recognition: 'Sorted data, or a monotonic answer space that can be tested at the middle.',
    complexity: 'O(log n) time, O(1) space',
  },
  'dynamic-programming': {
    name: 'Dynamic Programming',
    blurb: 'Count from small to large, save each answer. Best for: repeated choices, optimal substructure.',
    recognition: 'Overlapping repeated choices, where a large answer is built from smaller answers.',
    complexity: 'O(n) to O(n^2) time, O(n) space',
  },
  'bfs-dfs': {
    name: 'BFS & DFS',
    blurb: 'Traverse layer by layer (BFS) or dive as deep as possible (DFS). Best for: grids/graphs, shortest path, connected components.',
    recognition: 'A grid, tree, or graph structure, with a request for shortest distance or exhaustive exploration.',
    complexity: 'O(V + E) time, O(V) space',
  },
  stack: {
    name: 'Stack',
    blurb: 'Stack waits for a match. Best for: balanced brackets, next greater element, expression evaluation.',
    recognition: 'Matching open and close pairs, or a need for the next greater element.',
    complexity: 'O(n) time, O(n) space',
  },
  'greedy-interval': {
    name: 'Greedy & Interval',
    blurb: 'Take the best decision for the current step. Best for: intervals, scheduling, greedy is always optimal.',
    recognition: 'Overlapping time intervals or colliding schedules.',
    complexity: 'O(n log n) time, O(1) space',
  },
};
