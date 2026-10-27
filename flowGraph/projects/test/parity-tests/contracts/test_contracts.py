"""协议契约校验：序列化示例必须符合 graph.schema.json。"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _paths import ASSETS_SRC  # noqa: E402

from jsonschema import Draft7Validator  # noqa: E402

CONTRACTS_DIR = Path(__file__).parent


def test_example_graph_valid():
    schema = json.loads((ASSETS_SRC / "graph.schema.json").read_text(encoding="utf-8"))
    example = json.loads((CONTRACTS_DIR / "graph.example.json").read_text(encoding="utf-8"))
    errors = list(Draft7Validator(schema).iter_errors(example))
    assert not errors, [e.message for e in errors]


def test_unknown_node_shape_rejected():
    schema = json.loads((ASSETS_SRC / "graph.schema.json").read_text(encoding="utf-8"))
    bad = {
        "version": 1,
        "nodes": [
            {"id": "n", "type": "hexagon", "label": "x", "x": 0, "y": 0, "width": 1, "height": 1}
        ],
        "edges": [],
        "viewport": {"x": 0, "y": 0, "zoom": 1},
    }
    errors = list(Draft7Validator(schema).iter_errors(bad))
    assert errors, "非法形状应被拒绝"


def test_missing_required_field_rejected():
    schema = json.loads((ASSETS_SRC / "graph.schema.json").read_text(encoding="utf-8"))
    bad = {
        "version": 1,
        "nodes": [],
        "edges": [],
        # 缺 viewport
    }
    errors = list(Draft7Validator(schema).iter_errors(bad))
    assert errors, "缺 viewport 应被拒绝"
