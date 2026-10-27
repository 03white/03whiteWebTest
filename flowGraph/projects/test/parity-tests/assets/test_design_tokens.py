"""design-tokens 源头合法性校验。"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _paths import ASSETS_SRC  # noqa: E402

from jsonschema import Draft7Validator  # noqa: E402


def load(rel):
    return json.loads((ASSETS_SRC / rel).read_text(encoding="utf-8"))


def test_design_tokens_schema_valid():
    schema = load("design-tokens.schema.json")
    Draft7Validator.check_schema(schema)


def test_design_tokens_valid():
    data = load("design-tokens.json")
    schema = load("design-tokens.schema.json")
    errors = list(Draft7Validator(schema).iter_errors(data))
    assert not errors, [e.message for e in errors]
