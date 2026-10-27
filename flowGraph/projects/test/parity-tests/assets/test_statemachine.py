"""statemachine 源头合法性 + 语义校验。"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _paths import ASSETS_SRC  # noqa: E402

from jsonschema import Draft7Validator  # noqa: E402


def load(rel):
    return json.loads((ASSETS_SRC / rel).read_text(encoding="utf-8"))


def test_statemachine_schema_valid():
    schema = load("statemachine.schema.json")
    Draft7Validator.check_schema(schema)


def test_statemachine_valid():
    data = load("statemachine.json")
    schema = load("statemachine.schema.json")
    errors = list(Draft7Validator(schema).iter_errors(data))
    assert not errors, [e.message for e in errors]


def test_initial_state_exists():
    data = load("statemachine.json")
    ids = {s["id"] for s in data["states"]}
    assert data["initial"] in ids


def test_transitions_reference_valid_states():
    data = load("statemachine.json")
    ids = {s["id"] for s in data["states"]}
    for t in data["transitions"]:
        assert t["from"] in ids, f"from 状态不存在: {t['from']}"
        assert t["to"] in ids, f"to 状态不存在: {t['to']}"
