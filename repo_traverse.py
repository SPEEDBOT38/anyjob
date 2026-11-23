"""AnyJob repo graph traversal helper.

Loads repo_graph.json and provides BFS / DFS / shortest path / neighbors
for easy AI-agent traversal of the repository structure.
"""

from __future__ import annotations

import json
from collections import deque, defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Set

GRAPH_PATH = Path(__file__).resolve().parent / "repo_graph.json"


class RepoGraph:
    def __init__(self, graph_path: Path = GRAPH_PATH):
        with graph_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        self.nodes: Dict[str, dict] = {n["id"]: n for n in data.get("nodes", [])}
        self.edges: List[dict] = data.get("edges", [])
        self.adj: Dict[str, List[dict]] = defaultdict(list)
        self.reverse_adj: Dict[str, List[dict]] = defaultdict(list)
        for e in self.edges:
            self.adj[e["from"]].append(e)
            self.reverse_adj[e["to"]].append(e)

    def node(self, nid: str) -> Optional[dict]:
        return self.nodes.get(nid)

    def neighbors(self, nid: str, direction: str = "out") -> List[dict]:
        """Return adjacent edges. direction='out' (children) or 'in' (parents)."""
        if direction == "out":
            return self.adj.get(nid, [])
        return self.reverse_adj.get(nid, [])

    def neighbor_ids(self, nid: str, direction: str = "out") -> List[str]:
        if direction == "out":
            return [e["to"] for e in self.adj.get(nid, [])]
        return [e["from"] for e in self.reverse_adj.get(nid, [])]

    def bfs(self, start: str, max_depth: Optional[int] = None) -> List[str]:
        """Breadth-first traversal from start node. Returns visited node ids in order."""
        visited: List[str] = []
        seen: Set[str] = {start}
        queue: deque = deque([(start, 0)])
        while queue:
            nid, depth = queue.popleft()
            visited.append(nid)
            if max_depth is not None and depth >= max_depth:
                continue
            for nb in self.neighbor_ids(nid, "out"):
                if nb not in seen:
                    seen.add(nb)
                    queue.append((nb, depth + 1))
        return visited

    def dfs(self, start: str, max_depth: Optional[int] = None) -> List[str]:
        """Depth-first traversal from start node. Returns visited node ids in order."""
        visited: List[str] = []
        seen: Set[str] = set()
        stack: List[tuple] = [(start, 0)]
        while stack:
            nid, depth = stack.pop()
            if nid in seen:
                continue
            seen.add(nid)
            visited.append(nid)
            if max_depth is not None and depth >= max_depth:
                continue
            for nb in reversed(self.neighbor_ids(nid, "out")):
                if nb not in seen:
                    stack.append((nb, depth + 1))
        return visited

    def shortest_path(self, start: str, goal: str) -> Optional[List[str]]:
        """Return shortest path (list of node ids) from start to goal, or None."""
        if start == goal:
            return [start]
        seen: Set[str] = {start}
        queue: deque = deque([(start, [start])])
        while queue:
            nid, path = queue.popleft()
            for nb in self.neighbor_ids(nid, "out"):
                if nb == goal:
                    return path + [nb]
                if nb not in seen:
                    seen.add(nb)
                    queue.append((nb, path + [nb]))
        return None

    def find_by_type(self, ntype: str) -> List[str]:
        return [nid for nid, n in self.nodes.items() if n.get("type") == ntype]

    def find_by_label_contains(self, substring: str) -> List[str]:
        sub = substring.lower()
        return [nid for nid, n in self.nodes.items() if sub in n.get("label", "").lower()]

    def summarize(self) -> dict:
        return {
            "node_count": len(self.nodes),
            "edge_count": len(self.edges),
            "types": {t: len(self.find_by_type(t)) for t in set(n.get("type") for n in self.nodes.values())},
            "endpoints": len(self.nodes.get("endpoints", [])) if isinstance(self.nodes.get("endpoints"), list) else 0,
        }


if __name__ == "__main__":
    g = RepoGraph()
    print("=== AnyJob Repo Graph Summary ===")
    print(json.dumps(g.summarize(), indent=2))
    print("\n--- BFS from main (depth 2) ---")
    print(g.bfs("main", max_depth=2))
    print("\n--- Shortest path main -> pdf ---")
    print(g.shortest_path("main", "rr"))
    print("\n--- Routers ---")
    print(g.find_by_type("router"))
    print("\n--- SPA routes ---")
    print(g.find_by_type("spa_route"))
    print("\n--- External deps ---")
    print(g.find_by_type("external_dep"))
