#!/usr/bin/env python3
"""
把 scenarios/ 下的题材与共享结局注入 index.html 的内嵌块，
用于 file:// 直接双击打开（浏览器禁止 fetch 本地 JSON）。

用法：python3 tools/embed-scenarios.py
约定：改完 scenarios/*.json 后跑一次本脚本，再提交 index.html。
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCEN = ROOT / "scenarios"
INDEX = ROOT / "index.html"


def load(rel):
    return json.loads((SCEN / rel).read_text(encoding="utf-8"))


def block(attrs, data):
    body = json.dumps(data, ensure_ascii=False, indent=2)
    return f'  <script type="application/json" {attrs}>\n{body}\n  </script>'


def main():
    manifest = load("manifest.json")
    endings = load(manifest["endings"])

    scenarios_html = []
    for meta in manifest["scenarios"]:
        data = load(meta["file"])
        scenarios_html.append(block(f'data-scenario-id="{meta["id"]}"', data))
        print(f"  embedded: {meta['id']} ({meta['file']})")

    html = INDEX.read_text(encoding="utf-8")

    html = re.sub(
        r'(<script type="application/json" id="embedded-manifest">)(.*?)(</script>)',
        lambda m: m.group(1) + "\n" + json.dumps(manifest, ensure_ascii=False, indent=2) + "\n  " + m.group(3),
        html,
        flags=re.S,
    )
    html = re.sub(
        r'(<script type="application/json" id="embedded-endings">)(.*?)(</script>)',
        lambda m: m.group(1) + "\n" + json.dumps(endings, ensure_ascii=False, indent=2) + "\n  " + m.group(3),
        html,
        flags=re.S,
    )

    # 替换 __SCENARIOS__.. 到 </script> 结束的旧内嵌块列表
    html = re.sub(r"__SCENARIOS__", "\n".join(scenarios_html), html)

    INDEX.write_text(html, encoding="utf-8")
    print(f"done: {INDEX.relative_to(ROOT)} ({len(html) // 1024} KB)")


if __name__ == "__main__":
    main()
