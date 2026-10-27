"""configs 源头合法性 + 语义校验。"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _paths import ASSETS_SRC  # noqa: E402

from jsonschema import Draft7Validator  # noqa: E402


def load(rel):
    return json.loads((ASSETS_SRC / rel).read_text(encoding="utf-8"))


def test_configs_schema_valid():
    schema = load("configs.schema.json")
    Draft7Validator.check_schema(schema)


def test_each_config_valid():
    schema = load("configs.schema.json")
    for p in sorted((ASSETS_SRC / "configs").glob("*.json")):
        data = json.loads(p.read_text(encoding="utf-8"))
        errors = list(Draft7Validator(schema).iter_errors(data))
        assert not errors, f"{p.name}: {[e.message for e in errors]}"


def test_default_node_shape_in_shapes():
    data = load("configs/editor.json")
    assert data["defaultNode"]["type"] in data["nodeShapes"]
