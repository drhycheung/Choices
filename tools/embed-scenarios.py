#!/usr/bin/env python3
"""
把 scenarios/ 下的题材与共享结局注入 index.html 的内嵌块，
用于 file:// 直接双击打开（浏览器禁止 fetch 本地 JSON）。

用法：python3 tools/embed-scenarios.py
约定：改完 scenarios/*.json 后跑一次本脚本，再提交 index.html。

幂等性（重要）：脚本按 id 逐块替换 <script data-scenario-id="…"> 的内容，
而不是替换一次性占位符——占位符在第一次运行后就被消费掉，会导致后续
每次运行都「看似成功、实则没有更新」（这个坑真实发生过）。脚本最后会把
内嵌块重新解析并与源文件逐一比对，任何不一致都直接报错退出。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCEN = ROOT / "scenarios"
INDEX = ROOT / "index.html"


def load(rel):
    return json.loads((SCEN / rel).read_text(encoding="utf-8"))


def sub_once(html, pattern, repl, label):
    """re.sub 且必须恰好命中一次，否则报错退出（防止静默失效）。"""
    html, n = re.subn(pattern, repl, html, flags=re.S)
    if n != 1:
        sys.exit(f"ERROR: {label} 命中 {n} 次（应为 1），index.html 结构可能已变化。")
    return html


def main():
    manifest = load("manifest.json")
    endings = load(manifest["endings"])

    scenario_data = {}
    for meta in manifest["scenarios"]:
        scenario_data[meta["id"]] = load(meta["file"])

    html = INDEX.read_text(encoding="utf-8")

    # ---- manifest / endings：按 id 替换块内容 ----
    html = sub_once(
        html,
        r'(<script type="application/json" id="embedded-manifest">)(.*?)(</script>)',
        lambda m: m.group(1) + "\n" + json.dumps(manifest, ensure_ascii=False, indent=2) + "\n  " + m.group(3),
        "embedded-manifest",
    )
    html = sub_once(
        html,
        r'(<script type="application/json" id="embedded-endings">)(.*?)(</script>)',
        lambda m: m.group(1) + "\n" + json.dumps(endings, ensure_ascii=False, indent=2) + "\n  " + m.group(3),
        "embedded-endings",
    )

    # ---- 场景：逐 id 替换；全新模板则使用 __SCENARIOS__ 占位符 ----
    if "__SCENARIOS__" in html:
        blocks = []
        for meta in manifest["scenarios"]:
            body = json.dumps(scenario_data[meta["id"]], ensure_ascii=False, indent=2)
            blocks.append(f'  <script type="application/json" data-scenario-id="{meta["id"]}">\n{body}\n  </script>')
        html = html.replace("__SCENARIOS__", "\n".join(blocks))
    else:
        for meta in manifest["scenarios"]:
            sid = meta["id"]
            body = json.dumps(scenario_data[sid], ensure_ascii=False, indent=2)
            html = sub_once(
                html,
                r'(<script type="application/json" data-scenario-id="' + re.escape(sid) + r'">)(.*?)(</script>)',
                lambda m, b=body: m.group(1) + "\n" + b + "\n  " + m.group(3),
                f'scenario "{sid}"',
            )
            print(f"  embedded: {sid} ({meta['file']})")

    INDEX.write_text(html, encoding="utf-8")

    # ---- 事后校验：内嵌块必须与源文件完全一致 ----
    final = INDEX.read_text(encoding="utf-8")
    def embedded(sid):
        m = re.search(
            r'<script type="application/json" data-scenario-id="' + re.escape(sid) + r'">(.*?)</script>',
            final, flags=re.S)
        return json.loads(m.group(1)) if m else None

    problems = []
    for meta in manifest["scenarios"]:
        emb = embedded(meta["id"])
        if emb != scenario_data[meta["id"]]:
            problems.append(meta["id"])
    emb_manifest = json.loads(re.search(
        r'<script type="application/json" id="embedded-manifest">(.*?)</script>', final, flags=re.S).group(1))
    emb_endings = json.loads(re.search(
        r'<script type="application/json" id="embedded-endings">(.*?)</script>', final, flags=re.S).group(1))
    if emb_manifest != manifest:
        problems.append("embedded-manifest")
    if emb_endings != endings:
        problems.append("embedded-endings")

    if problems:
        sys.exit("ERROR: 以下内嵌块与源文件不一致: " + ", ".join(problems))

    print(f"done: {INDEX.relative_to(ROOT)} ({len(final) // 1024} KB) — 内嵌块已与源文件逐字节核对一致")


if __name__ == "__main__":
    main()
