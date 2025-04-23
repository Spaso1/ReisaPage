/**
 * @license
 * Copyright (c) 2024 Reisa
 *
 * This file is part of the project and must retain the author's credit.
 * Modifications to this file must maintain original attribution.
 * Commercial use requires explicit permission.
 */

// 使用一个自执行函数来增加混淆难度
export const createCopyrightGuard = (() => {
  const key = btoa("Reisa" + new Date().getFullYear());
  const targetUrl = atob("aHR0cHM6Ly93d3cubW1tLnNkLw=="); // 加密的跳转URL

  return (element: HTMLElement | null) => {
    if (!element) return false;

    // 随机检查函数
    const checks = [
      () => element.textContent?.includes("©"),
      () => element.textContent?.includes("Reisa"),
      () => element.textContent?.includes("All rights"),
      () => element.querySelector("a")?.href.includes("mmm.sd"),
      () => !element.textContent?.includes("Modified"),
      () => element.children.length >= 3,
    ];

    // 随机打乱检查顺序
    const shuffledChecks = checks.sort(() => Math.random() - 0.5);

    // 执行所有检查
    const isValid = shuffledChecks.every((check) => {
      try {
        return check();
      } catch {
        return false;
      }
    });

    if (!isValid) {
      // 使用多种方式跳转，增加绕过难度
      try {
        const methods = [
          () => window.location.replace(targetUrl),
          () => (window.location.href = targetUrl),
          () => window.location.assign(targetUrl),
          () => window.open(targetUrl, "_self"),
        ];
        methods[Math.floor(Math.random() * methods.length)]();
      } catch {
        window.location.href = targetUrl;
      }
    }

    return isValid;
  };
})();
