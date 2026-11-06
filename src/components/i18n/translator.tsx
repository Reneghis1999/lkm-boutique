"use client";

import { useEffect } from "react";
import { translateEn } from "@/lib/i18n/en";
import { getLang } from "@/lib/i18n/lang";

const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;
const SKIP = "script,style,noscript,textarea,code,[data-no-translate]";

/**
 * Site en anglais : remplace les textes de l’interface par leur traduction,
 * y compris ceux qui apparaissent après coup (menus, panier, formulaires…).
 */
export function Translator() {
  useEffect(() => {
    const root = document.documentElement;
    if (getLang() !== "en") {
      root.classList.remove("i18n-pending");
      return;
    }
    root.lang = "en";
    const done = new WeakMap<Node, string>();

    const textNode = (n: Text) => {
      const v = n.nodeValue ?? "";
      if (done.get(n) === v || !/[A-Za-zÀ-ÿ]/.test(v)) return;
      if (n.parentElement?.closest(SKIP)) return;
      const t = translateEn(v);
      if (t != null) {
        const lead = v.match(/^\s*/)?.[0] ?? "";
        const trail = v.match(/\s*$/)?.[0] ?? "";
        const next = lead + t + trail;
        done.set(n, next);
        if (next !== v) n.nodeValue = next;
      } else {
        done.set(n, v);
      }
    };
    const element = (el: Element) => {
      if (el.closest(SKIP)) return;
      for (const a of ATTRS) {
        const v = el.getAttribute(a);
        if (!v) continue;
        const t = translateEn(v);
        if (t != null && t !== v) el.setAttribute(a, t);
      }
    };
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) return textNode(node as Text);
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      element(node as Element);
      const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let n: Node | null;
      while ((n = w.nextNode())) {
        if (n.nodeType === Node.TEXT_NODE) textNode(n as Text);
        else element(n as Element);
      }
    };

    walk(document.body);
    const title = translateEn(document.title.split(" | ")[0]);
    if (title) document.title = document.title.replace(document.title.split(" | ")[0], title);
    root.classList.remove("i18n-pending");

    const obs = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "characterData") textNode(m.target as Text);
        else if (m.type === "attributes") element(m.target as Element);
        else m.addedNodes.forEach(walk);
      }
    });
    obs.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });
    return () => obs.disconnect();
  }, []);

  return null;
}
