#!/usr/bin/env python3

from pathlib import Path
import importlib.util
import json

ROOT = Path(__file__).resolve().parents[2]
CONFIG_DIR = ROOT / "printable-configs"

OUTPUT_JSON = (
    ROOT /
    "instructional-material-families.json"
)

OUTPUT_JS = (
    ROOT /
    "instructional-material-families.js"
)


def load_config(path):
    name = (
        "first_volo_material_"
        + path.stem.replace("-", "_")
    )

    spec = importlib.util.spec_from_file_location(
        name,
        path
    )

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return module


def clean_cards(cards, section):
    result = []

    for index, card in enumerate(cards or []):
        item = {
            "id": (
                f"{section}-"
                f"{index + 1}"
            ),
            "section": section,
            "label": card.get("label"),
            "meaning": card.get("meaning"),
            "image": card.get("image"),
        }

        if card.get("note"):
            item["note"] = card["note"]

        image = item.get("image")

        if image:
            image_path = ROOT / image

            if not image_path.exists():
                raise SystemExit(
                    "Missing configured material image: "
                    + str(image)
                )

        result.append(item)

    return result


def family_record(module, source_path):
    family = str(
        getattr(module, "FAMILY")
    ).upper()

    layout = getattr(
        module,
        "LAYOUT",
        "root"
    )

    root_label = getattr(
        module,
        "ROOT_SECTION_LABEL",
        "ROOT"
    )

    mat_a_title = getattr(
        module,
        "MAT_A_TITLE",
        "MAT A - one prefix"
    )

    mat_a_prefix_label = getattr(
        module,
        "MAT_A_PREFIX_LABEL",
        "PREFIX"
    )

    prefixes = clean_cards(
        getattr(module, "PREFIXES", []),
        "prefix"
    )

    roots = clean_cards(
        getattr(module, "ROOTS", []),
        "center"
    )

    suffixes = clean_cards(
        getattr(module, "SUFFIXES", []),
        "suffix"
    )

    extensions = clean_cards(
        getattr(module, "EXTENSIONS", []),
        "extension"
    )

    return {
        "family": family,
        "flight": getattr(
            module,
            "FLIGHT",
            None
        ),
        "layout": layout,
        "sourceConfig": str(
            source_path.relative_to(ROOT)
        ),

        "labels": {
            "rootSection": root_label,
            "matATitle": mat_a_title,
            "matAPrefix": mat_a_prefix_label,
        },

        "tiles": {
            "prefixes": prefixes,
            "centers": roots,
            "suffixes": suffixes,
            "extensions": extensions,
        },

        "prompts": {
            "wordLevel": list(
                getattr(
                    module,
                    "WORD_LEVEL_CLUES",
                    []
                )
            ),
            "context": list(
                getattr(
                    module,
                    "CONTEXT_CLUES",
                    []
                )
            ),
            "extension": list(
                getattr(
                    module,
                    "EXTENSION_PROMPTS",
                    []
                )
            ),
        },

        "notes": {
            "cards": getattr(
                module,
                "CARD_NOTE",
                None
            ),
            "mat": getattr(
                module,
                "MAT_NOTE",
                None
            ),
            "clues": getattr(
                module,
                "CLUE_NOTE",
                None
            ),
            "recording": getattr(
                module,
                "RECORD_NOTE",
                None
            ),
        },
    }


def main():
    families = {}

    for path in sorted(
        CONFIG_DIR.glob("*.py")
    ):
        if path.name.startswith("_"):
            continue

        module = load_config(path)

        if not hasattr(module, "FAMILY"):
            continue

        record = family_record(
            module,
            path
        )

        families[
            record["family"]
        ] = record

    payload = {
        "version":
            "shared-material-families-v1",

        "principle":
            (
                "Family content is exported from "
                "the existing printable configs so "
                "interactive and print materials "
                "use the same source content."
            ),

        "families": families,
    }

    OUTPUT_JSON.write_text(
        json.dumps(
            payload,
            indent=2,
            ensure_ascii=False
        )
        + "\n"
    )

    js_payload = json.dumps(
        payload,
        indent=2,
        ensure_ascii=False
    )

    OUTPUT_JS.write_text(
        '"use strict";\n\n'
        "window.FirstVoloInstructionalMaterialFamilies = "
        + js_payload
        + ";\n"
    )

    print(
        "✓ Exported families:",
        ", ".join(
            sorted(families)
        )
    )

    print(
        "✓ Wrote",
        OUTPUT_JSON.name
    )

    print(
        "✓ Wrote",
        OUTPUT_JS.name
    )


if __name__ == "__main__":
    main()
