"""graph 序列化 schema 源头校验。"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _paths import ASSETS_SRC  # noqa: E402

from jsonschema import Draft7Validator  # noqa: E402


def load(rel):
    return json.loads((ASSETS_SRC / rel).read_text(encoding="utf-8"))


def test_graph_schema_is_valid_draft7():
    schema = load("graph.schema.json")
    Draft7Validator.check_schema(schema)


def test_graph_schema_requires_core_fields():
    schema = load("graph.schema.json")
    assert set(schema["required"]) == {"version", "nodes", "edges", "viewport"}
